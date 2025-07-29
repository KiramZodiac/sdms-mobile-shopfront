import { useState, useEffect, useCallback, useMemo } from "react";
import { useRef } from "react";
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
import { ShopImageCarouselForm } from "@/components/admin/ShopImageCarouselForm";
import { ShopImageCarouselList } from "@/components/admin/ShopImageCarouselList";

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

interface ShopImageCarousel {
  id: string;
  title: string;
  alt_text: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

// Custom hook for managing pagination
const usePagination = (initialPage = 1) => {
  const [page, setPage] = useState(initialPage);
  
  const nextPage = useCallback(() => setPage(prev => prev + 1), []);
  const prevPage = useCallback(() => setPage(prev => Math.max(1, prev - 1)), []);
  const resetPage = useCallback(() => setPage(1), []);
  
  return { page, nextPage, prevPage, resetPage, setPage };
};

// Custom hook for search functionality
const useSearch = (items: Product[], searchFields: (keyof Product)[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (field === 'categories' && item.categories) {
          return item.categories.name.toLowerCase().includes(query);
        }
        return false;
      })
    );
  }, [items, searchQuery, searchFields]);
  
  return { searchQuery, setSearchQuery, filteredItems };
};

const Admin = () => {
  const { admin, loading: authLoading, signOut } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [carouselItems, setCarouselItems] = useState<ShopImageCarousel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state management
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [showCarouselForm, setShowCarouselForm] = useState(false);
  
  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editingCarouselItem, setEditingCarouselItem] = useState<ShopImageCarousel | null>(null);
  
  // Pagination hooks
  const productPagination = usePagination();
  const categoryPagination = usePagination();
  const bannerPagination = usePagination();
  const carouselPagination = usePagination();
  
  // Search functionality
  const productSearch = useSearch(products, ['name', 'description', 'short_description', 'sku']);
  
  const itemsPerPage = 10;
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const dataLoadedRef = useRef(false);

  // Reset product page when searching
  useEffect(() => {
    productPagination.resetPage();
  }, [productSearch.searchQuery]);

  // Memoized stats calculations
  const stats = useMemo(() => ({
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active).length,
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.is_active).length,
    totalBanners: banners.length,
    activeBanners: banners.filter(b => b.is_active).length,
    featuredProducts: products.filter(p => p.is_featured).length,
    lowStockProducts: products.filter(p => p.stock_quantity < 10).length,
  }), [products, categories, banners]);

  // Optimized data fetching function
  const fetchAllAdminData = useCallback(async () => {
    console.log('fetchAllAdminData called');
    try {
      setLoading(true);
      
      const [productsResult, categoriesResult, bannersResult, carouselResult] = await Promise.all([
        supabase
          .from('products')
          .select(`*, categories(name, slug)`)
          .order('created_at', { ascending: false })
          .range((productPagination.page - 1) * itemsPerPage, productPagination.page * itemsPerPage - 1),
        
        supabase
          .from('categories')
          .select('*')
          .order('name')
          .range((categoryPagination.page - 1) * itemsPerPage, categoryPagination.page * itemsPerPage - 1),
        
        supabase
          .from('banners')
          .select('*')
          .order('display_order')
          .range((bannerPagination.page - 1) * itemsPerPage, bannerPagination.page * itemsPerPage - 1),
        
        supabase
          .from('carousel_images')
          .select('*')
          .order('display_order')
          .range((carouselPagination.page - 1) * itemsPerPage, carouselPagination.page * itemsPerPage - 1)
      ]);

      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (bannersResult.error) throw bannersResult.error;
      if (carouselResult.error) throw carouselResult.error;

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
      setBanners(bannersResult.data || []);
      setCarouselItems(carouselResult.data || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    productPagination.page, 
    categoryPagination.page, 
    bannerPagination.page, 
    carouselPagination.page,
    toast
  ]);

  // Generic toggle function for better code reuse
  const createToggleFunction = useCallback((
    table: string,
    field: string,
    setState: React.Dispatch<React.SetStateAction<any[]>>,
    successMessage: string
  ) => {
    return async (id: string, currentStatus: boolean) => {
      try {
        const { error } = await supabase
          .from(table)
          .update({ [field]: !currentStatus })
          .eq('id', id);

        if (error) throw error;

        setState(prev => prev.map(item => 
          item.id === id ? { ...item, [field]: !currentStatus } : item
        ));

        toast({
          title: "Success",
          description: `${successMessage} ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        });
      } catch (error) {
        console.error(`Error updating ${table} ${field}:`, error);
        toast({
          title: "Error",
          description: `Failed to update ${table} ${field}`,
          variant: "destructive",
        });
      }
    };
  }, [toast]);

  // Generic delete function
  const createDeleteFunction = useCallback((
    table: string,
    setState: React.Dispatch<React.SetStateAction<any[]>>,
    confirmMessage: string
  ) => {
    return async (id: string) => {
      if (!confirm(confirmMessage)) return;

      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);

        if (error) throw error;

        setState(prev => prev.filter(item => item.id !== id));
        toast({
          title: "Success",
          description: `${table.slice(0, -1)} deleted successfully`,
        });
      } catch (error) {
        console.error(`Error deleting ${table}:`, error);
        toast({
          title: "Error",
          description: `Failed to delete ${table.slice(0, -1)}`,
          variant: "destructive",
        });
      }
    };
  }, [toast]);

  // Specific toggle and delete functions using the generic ones
  const toggleProductStatus = createToggleFunction('products', 'is_active', setProducts, 'Product');
  const toggleProductFeatured = createToggleFunction('products', 'is_featured', setProducts, 'Product');
  const toggleCategoryVisibility = createToggleFunction('categories', 'is_active', setCategories, 'Category');
  const toggleBannerStatus = createToggleFunction('banners', 'is_active', setBanners, 'Banner');
  const toggleCarouselActive = createToggleFunction('carousel_images', 'is_active', setCarouselItems, 'Carousel image');

  const deleteProduct = createDeleteFunction('products', setProducts, 'Are you sure you want to delete this product?');
  const deleteCategory = createDeleteFunction('categories', setCategories, 'Are you sure you want to delete this category?');
  const deleteBanner = createDeleteFunction('banners', setBanners, 'Are you sure you want to delete this banner?');
  const deleteCarouselItem = createDeleteFunction('carousel_images', setCarouselItems, 'Are you sure you want to delete this carousel image?');

  // Price formatting utility
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  }, []);

  // Form handlers
  const handleCloseForm = useCallback((formType: 'product' | 'category' | 'banner' | 'carousel') => {
    switch (formType) {
      case 'product':
        setShowProductForm(false);
        setEditingProduct(null);
        break;
      case 'category':
        setShowCategoryForm(false);
        setEditingCategory(null);
        break;
      case 'banner':
        setShowBannerForm(false);
        setEditingBanner(null);
        break;
      case 'carousel':
        setShowCarouselForm(false);
        setEditingCarouselItem(null);
        break;
    }
  }, []);

  const handleSaveForm = useCallback((formType: 'product' | 'category' | 'banner' | 'carousel') => {
    fetchAllAdminData();
    handleCloseForm(formType);
  }, [fetchAllAdminData, handleCloseForm]);

  // Load data effect
  useEffect(() => {
    console.log('Admin useEffect triggered:', { admin, authLoading });
    if (!admin || dataLoadedRef.current) return;

    const loadData = async () => {
      dataLoadedRef.current = true;
      await fetchAllAdminData();
    };

    loadData();
  }, [admin, fetchAllAdminData]);

  // Session management effects (keeping the original logic)
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
  }, [location.pathname, admin, authLoading, signOut, toast, navigate]);

  // Security event listeners
  useEffect(() => {
    if (!admin) return;

    const handleBeforeUnload = () => {
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

  // Loading state
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-6 mb-4 sm:mb-8">
          <Card className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2 sm:px-6 sm:pt-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Products</CardTitle>
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">{stats.activeProducts} active</p>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2 sm:px-6 sm:pt-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Categories</CardTitle>
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalCategories}</div>
              <p className="text-xs text-muted-foreground">{stats.activeCategories} active</p>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2 sm:px-6 sm:pt-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Banners</CardTitle>
              <Image className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalBanners}</div>
              <p className="text-xs text-muted-foreground">{stats.activeBanners} active</p>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2 sm:px-6 sm:pt-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Featured</CardTitle>
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{stats.featuredProducts}</div>
              <p className="text-xs text-muted-foreground">On homepage</p>
            </CardContent>
          </Card>

          <Card className="p-0 col-span-2 sm:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 pt-2 sm:px-6 sm:pt-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Low Stock</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-2 pb-2 sm:px-6 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{stats.lowStockProducts}</div>
              <p className="text-xs text-muted-foreground">Below 10 units</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-3 sm:space-y-4">
          <TabsList className="grid w-full grid-cols-4 h-8 sm:h-10">
            <TabsTrigger value="products" className="text-xs sm:text-sm">Products</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">Categories</TabsTrigger>
            <TabsTrigger value="banners" className="text-xs sm:text-sm">Banners</TabsTrigger>
            <TabsTrigger value="carousel" className="text-xs sm:text-sm">Shop Carousel</TabsTrigger>
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
                    onClick={productPagination.prevPage}
                    disabled={productPagination.page === 1}
                    className="text-xs h-7"
                  >
                    Prev
                  </Button>
                  <span className="text-xs">Page {productPagination.page}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={productPagination.nextPage}
                    disabled={productSearch.filteredItems.length < itemsPerPage}
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
                  value={productSearch.searchQuery}
                  onChange={(e) => productSearch.setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {productSearch.searchQuery && (
                  <button
                    onClick={() => productSearch.setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {productSearch.searchQuery && (
                <div className="mt-2 text-xs text-gray-500">
                  Found {productSearch.filteredItems.length} product{productSearch.filteredItems.length !== 1 ? 's' : ''} 
                  {productSearch.searchQuery && ` matching "${productSearch.searchQuery}"`}
                </div>
              )}
            </div>

            <div className="space-y-2 sm:space-y-4">
              {productSearch.filteredItems.length === 0 ? (
                <Card className="p-0">
                  <CardContent className="p-6 text-center">
                    <div className="text-gray-500">
                      {productSearch.searchQuery ? (
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
                productSearch.filteredItems.map((product) => (
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
                    onClick={categoryPagination.prevPage}
                    disabled={categoryPagination.page === 1}
                    className="text-xs h-7"
                  >
                    Prev
                  </Button>
                  <span className="text-xs">Page {categoryPagination.page}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={categoryPagination.nextPage}
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
                    onClick={bannerPagination.prevPage}
                    disabled={bannerPagination.page === 1}
                    className="text-xs h-7"
                  >
                    Prev
                  </Button>
                  <span className="text-xs">Page {bannerPagination.page}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={bannerPagination.nextPage}
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

          <TabsContent value="carousel" className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-lg sm:text-2xl font-bold">Shop Image Carousel</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Button onClick={() => setShowCarouselForm(true)} className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Add Carousel Image
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={carouselPagination.prevPage}
                    disabled={carouselPagination.page === 1}
                    className="text-xs h-7"
                  >
                    Prev
                  </Button>
                  <span className="text-xs">Page {carouselPagination.page}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={carouselPagination.nextPage}
                    disabled={carouselItems.length < itemsPerPage}
                    className="text-xs h-7"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
            <ShopImageCarouselList
              items={carouselItems}
              onEdit={(item) => {
                setEditingCarouselItem(item);
                setShowCarouselForm(true);
              }}
              onDelete={deleteCarouselItem}
              onToggleActive={toggleCarouselActive}
            />
          </TabsContent>
        </Tabs>

        {/* Form Modals */}
        {showProductForm && (
          <ProductForm
            product={editingProduct}
            categories={categories}
            onClose={() => handleCloseForm('product')}
            onSave={() => handleSaveForm('product')}
          />
        )}

        {showCategoryForm && (
          <CategoryForm
            category={editingCategory}
            onClose={() => handleCloseForm('category')}
            onSave={() => handleSaveForm('category')}
          />
        )}

        {showBannerForm && (
          <BannerForm
            banner={editingBanner}
            onClose={() => handleCloseForm('banner')}
            onSave={() => handleSaveForm('banner')}
          />
        )}

        {showCarouselForm && (
          <ShopImageCarouselForm
            carouselItem={editingCarouselItem}
            onClose={() => handleCloseForm('carousel')}
            onSave={() => handleSaveForm('carousel')}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Admin;