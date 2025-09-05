import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, ensureConnection } from "@/integrations/supabase/client";

// Cache for promo banners
const promoBannersCache = {
  data: null,
  timestamp: null,
  loading: false,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const isCacheValid = () => {
  return (
    promoBannersCache.data &&
    promoBannersCache.timestamp &&
    Date.now() - promoBannersCache.timestamp < CACHE_DURATION
  );
};

export const usePromoBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  const abortControllerRef = useRef(null);

  const fetchBanners = useCallback(async () => {
    // Check cache first
    if (isCacheValid()) {
      setBanners(promoBannersCache.data!);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests
    if (promoBannersCache.loading) return;
    promoBannersCache.loading = true;

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
        .from('promo_banners')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .abortSignal(abortControllerRef.current.signal);

      if (error) throw error;

      const transformedBanners = data || [];
      
      // Update cache
      promoBannersCache.data = transformedBanners;
      promoBannersCache.timestamp = Date.now();
      
      setBanners(transformedBanners);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      console.error("Error fetching promo banners:", err);
      setError(err.message || 'Failed to load promo banners');
      
      toast({
        title: "Error",
        description: "Failed to load promo banners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      promoBannersCache.loading = false;
      abortControllerRef.current = null;
    }
  }, [toast]);

  useEffect(() => {
    fetchBanners();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchBanners]);

  return {
    banners,
    loading,
    error,
    refresh: fetchBanners,
  };
}; 