import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  view_count: number;
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description: string;
  short_description?: string;
  images: string[];
  stock_quantity: number;
  rating?: number;
  reviews_count?: number;
  slug: string;
  is_preorder: boolean;
  preorder_availability_date?: string;
  condition?: 'new' | 'used' | 'like_new' | 'refurbished' | 'open_box';
  categories?: { name: string; slug: string };
}

interface UseFeaturedProductsReturn {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
}

const INITIAL_LOAD_COUNT = 8;
const LOAD_MORE_COUNT = 8;

export const useFeaturedProducts = (): UseFeaturedProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false);

  // Fetch featured products
  const fetchProducts = useCallback(async (limit: number, offset: number, isRefresh = false) => {
    // Prevent multiple simultaneous requests
    if (isLoadingRef.current && !isRefresh) {
      console.log('Request blocked - already loading');
      return;
    }
    
    isLoadingRef.current = true;
    console.log('Fetching products:', { limit, offset, isRefresh });

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setError(null);

    try {
      // Dynamic import for Supabase to reduce initial bundle size
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, price, original_price, short_description, 
          images, stock_quantity, rating, reviews_count, slug, view_count,
          is_preorder, preorder_availability_date, condition,
          categories(name, slug)
        `)
        .eq("is_active", true)
        .eq("is_featured", true)
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false })
        .abortSignal(abortControllerRef.current.signal);

      if (error) throw error;

      console.log('Raw data received:', { dataLength: data?.length, limit, offset });

      const transformedProducts = data?.map((product: any) => ({
        ...product,
        description: product.short_description || "",
        images: product.images || [],
        view_count: product.view_count || 0,
        is_preorder: product.is_preorder || false,
        condition: product.condition,
      })) || [];

      console.log('Transformed products:', { transformedLength: transformedProducts.length, limit });

      if (offset === 0 || isRefresh) {
        setProducts(transformedProducts);
      } else {
        setProducts(prev => [...prev, ...transformedProducts]);
      }

      // Determine if there are more products
      const newHasMore = transformedProducts.length === limit;
      console.log('Setting hasMore:', { newHasMore, transformedLength: transformedProducts.length, limit });
      setHasMore(newHasMore);
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      console.error("Error fetching featured products:", err);
      setError(err.message || 'Failed to load products');
      
      if (!isRefresh) {
        toast({
          title: "Error",
          description: "Failed to load featured products",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [toast]);

  // Load more products
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) {
      console.log('Load more blocked:', { loadingMore, hasMore });
      return;
    }
    console.log('Loading more products:', { currentCount: products.length, loadingMore, hasMore });
    setLoadingMore(true);
    fetchProducts(LOAD_MORE_COUNT, products.length);
  }, [loadingMore, hasMore, products.length, fetchProducts]);

  // Refresh products
  const refresh = useCallback(() => {
    setLoading(true);
    fetchProducts(INITIAL_LOAD_COUNT, 0, true);
  }, [fetchProducts]);

  // Initial load
  useEffect(() => {
    fetchProducts(INITIAL_LOAD_COUNT, 0);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('State updated:', { 
      productsCount: products.length, 
      loading, 
      loadingMore, 
      hasMore, 
      error 
    });
  }, [products.length, loading, loadingMore, hasMore, error]);

  return {
    products,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}; 