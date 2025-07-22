import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Package, BarChart3, Users, ShoppingBag, LogOut, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm } from "@/components/admin/ProductForm";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { BannerForm } from "@/components/admin/BannerForm";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLocation, useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description: string;
  short_description?: string;
  images: string[];
  video_url?: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  rating?: number;
  reviews_count?: number;
  slug: string;
  sku?: string;
  categories?: {
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  video_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  is_active: boolean;
  display_order: number;
}

const Admin = () => {
  const { admin, loading: authLoading, signOut } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Enhanced session management - logout when leaving admin pages
  useEffect(() => {
    // Only run if admin is logged in
    if (!admin || authLoading) return;

    // Function to handle logout
    const handleLogout = async () => {
      try {
        await signOut();
        
        // Clear all possible session storage
        localStorage.removeItem('sb-rvteqxtonbgjuhztnzpx-auth-token');
        sessionStorage.clear();
        
        // Clear any other admin-related data
        localStorage.removeItem('admin-session');
        
        toast({
          title: 'Session Ended',
          description: 'You have been logged out for security.',
          variant: 'default'
        });
        
        // Redirect to login or home page
        navigate('/admin/login');
        
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };

    // Check if current path is NOT an admin route
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    if (!isAdminRoute) {
      handleLogout();
    }
  }, [location.pathname, admin, authLoading, signOut, navigate, toast]);

  // Additional security: Handle browser navigation events
  useEffect(() => {
    if (!admin) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // This will trigger when user tries to close tab/browser
      // Clear session data immediately
      localStorage.removeItem('sb-rvteqxtonbgjuhztnzpx-auth-token');
      sessionStorage.clear();
      localStorage.removeItem('admin-session');
    };

    const handleVisibilityChange = () => {
      // When tab becomes hidden and user is on non-admin page
      if (document.hidden && !location.pathname.startsWith('/admin')) {
        signOut();
        localStorage.removeItem('sb-rvteqxtonbgjuhztnzpx-auth-token');
        sessionStorage.clear();
        localStorage.removeItem('admin-session');
        console.log('session ended');
        
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      // Handle back/forward button navigation
      if (!location.pathname.startsWith('/admin')) {
        signOut();
        localStorage.removeItem('sb-rvteqxtonbgjuhztnzpx-auth-token');
        sessionStorage.clear();
        localStorage.removeItem('admin-session');
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [admin, location.pathname, signOut]);

  // Load data when admin is authenticated
  useEffect(() => {
    if (admin) {
      fetchProducts();
      fetchCategories();
      fetchBanners();
    }
  }, [admin]);

  // Enhanced sign out function
  const handleSignOut = async () => {
    try {
      await signOut();
      
      // Clear all session data
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      
      // Navigate to login page
      navigate('/admin/login');
      
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Error signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin />;
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: "Error",
        description: "Failed to load banners",
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, is_active: !currentStatus }
          : product
      ));

      toast({
        title: "Success",
        description: `Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const toggleProductFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, is_featured: !currentStatus }
          : product
      ));

      toast({
        title: "Success",
        description: `Product ${!currentStatus ? 'featured' : 'unfeatured'} successfully`,
      });
    } catch (error) {
      console.error('Error updating product featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update product featured status",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const toggleBannerStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentStatus })
        .eq('id', bannerId);

      if (error) throw error;

      setBanners(prev => prev.map(banner => 
        banner.id === bannerId 
          ? { ...banner, is_active: !currentStatus }
          : banner
      ));

      toast({
        title: "Success",
        description: `Banner ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating banner status:', error);
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive",
      });
    }
  };

  const deleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', bannerId);

      if (error) throw error;

      setBanners(prev => prev.filter(banner => banner.id !== bannerId));
      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      });
    }
  };

  const toggleCategoryVisibility = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.map(category => 
        category.id === categoryId 
          ? { ...category, is_active: !currentStatus }
          : category
      ));

      toast({
        title: "Success",
        description: `Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating category visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update category visibility",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.filter(category => category.id !== categoryId));
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {admin.email}</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {products.filter(p => p.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              {categories.filter(c => c.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banners</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banners.length}</div>
            <p className="text-xs text-muted-foreground">
              {banners.filter(b => b.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.is_featured).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Products on homepage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.stock_quantity < 10).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Products below 10 units
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Products</h2>
            <Button onClick={() => setShowProductForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <img
                        src={product.images[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {product.short_description || product.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>SKU: {product.sku || 'N/A'}</span>
                          <span>Stock: {product.stock_quantity}</span>
                          <span>Category: {product.categories?.name || 'Uncategorized'}</span>
                          {product.video_url && <span>📹 Video</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-4">
                        <div className="font-bold text-lg text-blue-600">
                          {formatPrice(product.price)}
                        </div>
                        {product.original_price && product.original_price > product.price && (
                          <div className="text-sm text-gray-400 line-through">
                            {formatPrice(product.original_price)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-1">
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {product.is_featured && (
                            <Badge variant="outline">Featured</Badge>
                          )}
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleProductStatus(product.id, product.is_active)}
                          >
                            {product.is_active ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleProductFeatured(product.id, product.is_featured)}
                          >
                            ⭐
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Categories</h2>
            <Button onClick={() => setShowCategoryForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  {category.image_url && (
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}
                  <div className="flex space-x-2">
                    {/* Edit Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(category);
                        setShowCategoryForm(true);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>

                    {/* Toggle Visibility Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleCategoryVisibility(category.id, category.is_active)}
                    >
                      {category.is_active ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </Button>

                    {/* Delete Button */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="banners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Banners</h2>
            <Button onClick={() => setShowBannerForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </Button>
          </div>

          <div className="grid gap-4">
            {banners.map((banner) => (
              <Card key={banner.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-20 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{banner.title}</h3>
                        {banner.subtitle && (
                          <p className="text-gray-600 text-sm mb-2">{banner.subtitle}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Order: {banner.display_order}</span>
                          {banner.cta_text && <span>CTA: {banner.cta_text}</span>}
                          {banner.video_url && <span>📹 Video</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col space-y-2">
                        <Badge variant={banner.is_active ? "default" : "secondary"}>
                          {banner.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleBannerStatus(banner.id, banner.is_active)}
                          >
                            {banner.is_active ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingBanner(banner);
                              setShowBannerForm(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteBanner(banner.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            fetchProducts();
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          onSave={() => {
            fetchCategories();
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Banner Form Modal */}
      {showBannerForm && (
        <BannerForm
          banner={editingBanner}
          onClose={() => {
            setShowBannerForm(false);
            setEditingBanner(null);
          }}
          onSave={() => {
            fetchBanners();
            setShowBannerForm(false);
            setEditingBanner(null);
          }}
        />
      )}
    </div>
  );
};
export default Admin