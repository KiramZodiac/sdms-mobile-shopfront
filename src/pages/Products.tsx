import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, Grid, List, Star, ShoppingCart, Eye, Heart, Phone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description: string;
  short_description?: string;
  images: string[];
  category: string;
  stock_quantity: number;
  rating?: number;
  reviews_count?: number;
  slug: string;
  sku?: string;
  view_count?: number;
  is_preorder: boolean;
  preorder_availability_date?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const PRODUCTS_PER_PAGE = 12;

// Loading skeleton component
const ProductSkeleton = ({ viewMode }: { viewMode: 'grid' | 'list' }) => (
  <div className={`bg-white rounded-xl shadow-sm animate-pulse ${
    viewMode === 'list' ? 'flex gap-4 p-4' : 'overflow-hidden'
  }`}>
    <div className={`bg-gray-200 ${
      viewMode === 'list' ? 'w-24 h-24 rounded-lg flex-shrink-0' : 'h-40 md:h-48 rounded-t-xl'
    }`}></div>
    <div className={viewMode === 'list' ? 'flex-1' : 'p-3'}>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Product card component
const ProductCard = ({ product, viewMode, onAddToCart }: {
  product: Product;
  viewMode: 'grid' | 'list';
  onAddToCart: (product: Product) => void;
}) => {
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  }, []);

  const formatViewCount = useCallback((count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }, []);

  const formatAvailabilityDate = useCallback((dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-UG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }, []);

  const discountPercentage = useMemo(() => {
    if (!product.original_price || product.original_price <= product.price) return 0;
    return Math.round(((product.original_price - product.price) / product.original_price) * 100);
  }, [product.original_price, product.price]);

  const stockStatus = useMemo(() => {
    if (product.is_preorder) {
      return {
        text: product.preorder_availability_date
          ? `Available ${formatAvailabilityDate(product.preorder_availability_date)}`
          : 'Pre-order Available',
        className: 'text-blue-600'
      };
    }
    
    if (product.stock_quantity > 0) {
      return {
        text: product.stock_quantity < 10 
          ? `Only ${product.stock_quantity} left!` 
          : 'In Stock',
        className: 'text-green-600'
      };
    }
    
    return {
      text: 'Out of Stock',
      className: 'text-red-600'
    };
  }, [product.stock_quantity, product.is_preorder, product.preorder_availability_date, formatAvailabilityDate]);

  const isOutOfStock = product.stock_quantity === 0 && !product.is_preorder;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group ${
        viewMode === 'list' ? 'flex gap-4 p-4' : 'overflow-hidden'
      }`}
    >
      {/* Product Image */}
      <div className={`relative ${
        viewMode === 'list' ? 'w-24 h-24 rounded-lg flex-shrink-0' : 'aspect-square'
      }`}>
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        
        {/* Badges and Icons */}
        <div className="absolute top-2 left-2">
          {product.is_preorder ? (
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-2 py-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                PRE-ORDER
              </span>
            </Badge>
          ) : (
            discountPercentage > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                -{discountPercentage}%
              </Badge>
            )
          )}
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatViewCount(product.view_count || 0)}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className={`p-3 flex-1 ${viewMode === 'list' ? 'p-0' : ''}`}>
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors mb-1 text-sm line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex" role="img" aria-label={`Rating: ${product.rating || 4} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating || 4) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviews_count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
            {product.original_price && discountPercentage > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Stock Status / Pre-order Info */}
        <div className="mb-3">
          <span className={`text-xs font-medium ${stockStatus.className}`}>
            {stockStatus.text}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onAddToCart(product)}
            className={`flex-1 text-xs py-2 ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : product.is_preorder
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
            size="sm"
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? 'Out of stock' : product.is_preorder ? 'Pre-order item' : 'Add to cart'}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : product.is_preorder ? (
              <>
                <ShoppingCart className="w-3 h-3 mr-1" />
                Pre-order
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 mr-1" />
                Add to Cart
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="px-2"
            aria-label="Contact seller"
          >
            <Phone className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Memoized search parameters
  const searchState = useMemo(() => ({
    category: searchParams.get('category') || 'all',
    sortBy: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
    searchQuery: searchParams.get('search') || '',
  }), [searchParams]);

  useEffect(() => {
    setCurrentPage(searchState.page);
  }, [searchState.page]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      const allCategories = [{ id: 'all', name: 'All Categories', slug: 'all' }, ...(data || [])];
      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          description,
          short_description,
          images,
          stock_quantity,
          rating,
          reviews_count,
          slug,
          sku,
          view_count,
          is_preorder,
          preorder_availability_date,
          categories!inner(name, slug)
        `, { count: 'exact' })
        .eq('is_active', true);

      if (searchState.category && searchState.category !== 'all') {
        query = query.eq('categories.slug', searchState.category);
      }
      if (searchState.searchQuery) {
        query = query.ilike('name', `%${searchState.searchQuery}%`);
      }

      if (priceRange.min) {
        query = query.gte('price', parseInt(priceRange.min));
      }
      if (priceRange.max) {
        query = query.lte('price', parseInt(priceRange.max));
      }

      // Apply sorting
      switch (searchState.sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'popular':
          query = query.order('view_count', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const transformedProducts = data?.map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        original_price: product.original_price,
        description: product.description || product.short_description || '',
        short_description: product.short_description,
        images: product.images || [],
        category: product.categories?.slug || '',
        stock_quantity: product.stock_quantity || 0,
        rating: product.rating || 4.0,
        reviews_count: product.reviews_count || 0,
        slug: product.slug,
        sku: product.sku,
        view_count: product.view_count || 0,
        is_preorder: product.is_preorder || false,
        preorder_availability_date: product.preorder_availability_date,
      })) || [];

      setProducts(transformedProducts);
      setTotalProducts(count || 0);
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
  }, [searchState, priceRange, currentPage, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = useCallback((product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images || []
    });

    const actionText = product.is_preorder ? "Pre-ordered" : "Added to Cart";
    const descriptionText = product.is_preorder 
      ? `${product.name} has been added to your pre-orders`
      : `${product.name} has been added to your cart`;
    
    toast({
      title: actionText,
      description: descriptionText,
    });
  }, [addToCart, toast]);

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleSearchParamChange = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to first page when filters change
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setPriceRange({ min: '', max: '' });
    setSearchParams({});
  }, [setSearchParams]);

  // Memoized calculations
  const totalPages = useMemo(() => Math.ceil(totalProducts / PRODUCTS_PER_PAGE), [totalProducts]);
  
  const currentCategory = useMemo(() => {
    return searchState.category && searchState.category !== 'all' 
      ? categories.find(c => c.slug === searchState.category)?.name || 'Products'
      : 'All Products';
  }, [searchState.category, categories]);

  const renderPaginationItems = useCallback(() => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(<PaginationEllipsis key="ellipsis1" />);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          items.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => handlePageChange(i)}
                isActive={currentPage === i}
                className="cursor-pointer"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
      }

      if (currentPage < totalPages - 2) {
        items.push(<PaginationEllipsis key="ellipsis2" />);
      }

      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  }, [totalPages, currentPage, handlePageChange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
              : "space-y-4"
          }>
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {currentCategory}
          </h1>
          <p className="text-sm text-gray-600">
            {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">CATEGORY</h3>
              <Select
                value={searchState.category}
                onValueChange={(value) => handleSearchParamChange('category', value)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">PRICE RANGE</h3>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="text-sm"
                  min="0"
                />
                <Input
                  type="number"
                  placeholder="Max price"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="text-sm"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <Select
                value={searchState.sortBy}
                onValueChange={(value) => handleSearchParamChange('sort', value)}
              >
                <SelectTrigger className="w-48 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
                : "space-y-4"
            }>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {renderPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* No Products Found */}
            {products.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl">
                <div className="text-gray-400 mb-4">
                  <Filter className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;