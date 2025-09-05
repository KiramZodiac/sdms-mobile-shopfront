import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, ensureConnection } from "@/integrations/supabase/client";
import { generateProductRatings } from "@/lib/ratingUtils";

const INITIAL_LOAD_COUNT = 6;
const LOAD_MORE_COUNT = 6;

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const fetchProducts = useCallback(async (limit = INITIAL_LOAD_COUNT, offset = 0, isRefresh = false) => {
    // Prevent multiple simultaneous requests
    if (isLoadingRef.current && !isRefresh) return;
    isLoadingRef.current = true;

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setError(null);

    try {
      // Ensure Supabase connection is ready
      const isConnected = await ensureConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to database');
      }

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

      // Generate random ratings for products
      const ratingsMap = generateProductRatings(transformedProducts);
      
      // Apply ratings to products
      const productsWithRatings = transformedProducts.map(product => {
        const rating = ratingsMap.get(product.id);
        return {
          ...product,
          rating: rating?.rating || 4.0,
          reviews_count: rating?.reviews_count || 50,
        };
      });

      console.log('Transformed products:', { transformedLength: productsWithRatings.length, limit });

      if (offset === 0 || isRefresh) {
        setProducts(productsWithRatings);
      } else {
        setProducts(prev => [...prev, ...productsWithRatings]);
      }

      // Determine if there are more products
      const newHasMore = productsWithRatings.length === limit;
      console.log('Setting hasMore:', { newHasMore, transformedLength: productsWithRatings.length, limit });
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