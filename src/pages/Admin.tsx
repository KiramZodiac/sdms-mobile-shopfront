import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Package, BarChart3, Users, ShoppingBag, LogOut, Image, Search, X, ExternalLink, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ErrorBoundary } from "react-error-boundary";

// Error Boundary Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
};

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
  const [productPage, setProductPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [bannerPage, setBannerPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Memoized data fetching functions
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, slug)
        `)
        .order('created_at', { ascending: false })
        .range((productPage - 1) * itemsPerPage, productPage * itemsPerPage - 1);

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
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
  }, [productPage, toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
        .range((categoryPage - 1) * itemsPerPage, categoryPage * itemsPerPage - 1);

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
  }, [categoryPage, toast]);

  const fetchBanners = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order')
        .range((bannerPage - 1) * itemsPerPage, bannerPage * itemsPerPage - 1);

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
  }, [bannerPage, toast]);

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categories?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery]);

  // Reset page when searching
  useEffect(() => {
    setProductPage(1);
  }, [searchQuery]);

  // Load data sequentially to avoid concurrent requests
  useEffect(() => {
    if (!admin) return;

    const loadData = async () => {
      setLoading(true);
      await fetchProducts();
      await fetchCategories();
      await fetchBanners();
      setLoading(false);
    };

    loadData();
  }, [admin, fetchProducts, fetchCategories, fetchBanners]);

  // Enhanced session management
  useEffect(() => {
    if (!admin || authLoading) return;

    const handleLogout = async () => {
      try {
        await signOut();
        localStorage.removeItem('sb-rvteqxtonbgjuhztnzpx-auth-token');
        sessionStorage.clear();
        localStorage.removeItem('admin-session');
        toast({
          title: 'Session Ended',
          description: 'You have been logged out for security.',
        });
        navigate('/admin/login');
      } catch (error) {
        console.error('Error during logout:', error);
      }
    };

    const isAdminRoute = location.pathname.startsWith('/admin');
    if (!isAdminRoute) {
      handleLogout();
    }
  }, [location.pathname, admin, authLoading, signOut, navigate, toast]);

  // Security event listeners
  useEffect(() => {
    if (!admin) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      localStorage.removeItem('sb-rvteqxtonbgjuhztnzpx-auth-token');
      sessionStorage.clear();
      localStorage.removeItem('admin-session');
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !location.pathname.startsWith('/admin')) {
        signOut();
        localStorage.removeItem('sb-rvteqxtonbgjuhztnzpx-auth-token');
        sessionStorage.clear();
        localStorage.removeItem('admin-session');
      }
    };

    const handlePopState = () => {
      if (!location.pathname.startsWith('/admin')) {
        signOut();
        localStorage.removeItem('sb-rvteqxtonbgjuhztnzpx-auth-token');
        sessionStorage.clear();
        localStorage.removeItem('admin-session');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [admin, location.pathname, signOut]);

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
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
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.id !== productId));
      setDeletingProduct(null);
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

  if (authLoading) {
    return (
      <div className="container mx-auto px-3 py-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-36 mb-4"></div>
          <div className="grid grid-cols-1 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-8">
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
            <p className="text-gray-600 text-xs sm:text-base">Welcome back, {admin.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10">
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards - More compact on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-6 mb-4 sm:mb-8">
          <Card className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2 sm:px-6 sm:pt-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Products</CardTitle>
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.filter(p => p.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2 sm:px-6 sm:pt-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Categories</CardTitle>
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                {categories.filter(c => c.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2 sm:px-6 sm:pt-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Banners</CardTitle>
              <Image className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{banners.length}</div>
              <p className="text-xs text-muted-foreground">
                {banners.filter(b => b.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2 sm:px-6 sm:pt-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Featured</CardTitle>
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">
                {products.filter(p => p.is_featured).length}
              </div>
              <p className="text-xs text-muted-foreground">
                On homepage
              </p>
            </CardContent>
          </Card>

          <Card className="p-0 col-span-2 sm:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2 sm:px-6 sm:pt-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Low Stock</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">
                {products.filter(p => p.stock_quantity < 10).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Below 10 units
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-3 sm:space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-8 sm:h-10">
            <TabsTrigger value="products" className="text-xs sm:text-sm">Products</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">Categories</TabsTrigger>
            <TabsTrigger value="banners" className="text-xs sm:text-sm">Banners</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-lg sm:text-2xl font-bold">Products</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Button onClick={() => setShowProductForm(true)} className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Add Product
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProductPage(prev => Math.max(1, prev - 1))}
                    disabled={productPage === 1}
                    className="text-xs h-7"
                  >
                    Prev
                  </Button>
                  <span className="text-xs">Page {productPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProductPage(prev => prev + 1)}
                    disabled={filteredProducts.length < itemsPerPage}
                    className="text-xs h-7"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products by name, description, category, or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="mt-2 text-xs text-gray-500">
                  Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} 
                  {searchQuery && ` matching "${searchQuery}"`}
                </div>
              )}
            </div>

            <div className="space-y-2 sm:space-y-4">
              {filteredProducts.length === 0 ? (
                <Card className="p-0">
                  <CardContent className="p-6 text-center">
                    <div className="text-gray-500">
                      {searchQuery ? (
                        <>
                          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No products found</p>
                          <p className="text-sm">Try adjusting your search terms or clear the search to see all products.</p>
                        </>
                      ) : (
                        <>
                          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No products yet</p>
                          <p className="text-sm">Get started by adding your first product.</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredProducts.map((product) => (
                <Card key={product.id} className="p-0">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex gap-3">
                      <img
                        src={product.images[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-sm sm:text-lg truncate pr-2">{product.name}</h3>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="font-bold text-sm sm:text-lg text-blue-600">
                              {formatPrice(product.price)}
                            </div>
                            {product.original_price && product.original_price > product.price && (
                              <div className="text-xs text-gray-400 line-through">
                                {formatPrice(product.original_price)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-xs sm:text-sm mb-1 line-clamp-1">
                          {product.short_description || product.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 mb-2">
                          <span>Stock: {product.stock_quantity}</span>
                          <span>•</span>
                          <span>{product.categories?.name || 'Uncategorized'}</span>
                          {product.video_url && (
                            <>
                              <span>•</span>
                              <span>📹</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1">
                            <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs px-1 py-0">
                              {product.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {product.is_featured && (
                              <Badge variant="outline" className="text-xs px-1 py-0">Featured</Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleProductStatus(product.id, product.is_active)}
                              className="h-6 w-6 p-0"
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
                              className="h-6 w-6 p-0 text-xs"
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
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteProduct(product.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-lg sm:text-2xl font-bold">Categories</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Button onClick={() => setShowCategoryForm(true)} className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Add Category
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCategoryPage(prev => Math.max(1, prev - 1))}
                    disabled={categoryPage === 1}
                    className="text-xs h-7"
                  >
                    Prev
                  </Button>
                  <span className="text-xs">Page {categoryPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCategoryPage(prev => prev + 1)}
                    disabled={categories.length < itemsPerPage}
                    className="text-xs h-7"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="p-0">
                  <CardContent className="p-3 sm:p-4">
                    {category.image_url && (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-20 sm:h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h3 className="font-semibold text-sm sm:text-lg truncate">{category.name}</h3>
                      <Badge variant={category.is_active ? "default" : "secondary"} className="text-xs px-1 py-0 flex-shrink-0">
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {category.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{category.description}</p>
                    )}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCategory(category);
                          setShowCategoryForm(true);
                        }}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleCategoryVisibility(category.id, category.is_active)}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                      >
                        {category.is_active ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteCategory(category.id)}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="banners" className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-lg sm:text-2xl font-bold">Banners</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Button onClick={() => setShowBannerForm(true)} className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Add Banner
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBannerPage(prev => Math.max(1, prev - 1))}
                    disabled={bannerPage === 1}
                    className="text-xs h-7"
                  >
                    Prev
                  </Button>
                  <span className="text-xs">Page {bannerPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBannerPage(prev => prev + 1)}
                    disabled={banners.length < itemsPerPage}
                    className="text-xs h-7"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-4">
              {banners.map((banner) => (
                <Card key={banner.id} className="p-0">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex gap-3">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-16 h-10 sm:w-20 sm:h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-sm sm:text-lg truncate pr-2">{banner.title}</h3>
                          <Badge variant={banner.is_active ? "default" : "secondary"} className="text-xs px-1 py-0 flex-shrink-0">
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        {banner.subtitle && (
                          <p className="text-gray-600 text-xs sm:text-sm mb-1 line-clamp-1">{banner.subtitle}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 mb-2">
                          <span>Order: {banner.display_order}</span>
                          {banner.cta_text && (
                            <>
                              <span>•</span>
                              <span>CTA: {banner.cta_text}</span>
                            </>
                          )}
                          {banner.video_url && (
                            <>
                              <span>•</span>
                              <span>📹</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleBannerStatus(banner.id, banner.is_active)}
                            className="h-6 w-6 p-0"
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
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteBanner(banner.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

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
    </ErrorBoundary>
  );
};

export default Admin;