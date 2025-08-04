import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PromoBanner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  cta_text: string;
  badge_text?: string;
  category_slug?: string;
  link_url?: string;
  is_active: boolean;
  sort_order: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

interface UsePromoBannersReturn {
  banners: PromoBanner[];
  loading: boolean;
  error: string | null;
  createBanner: (banner: Omit<PromoBanner, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBanner: (id: string, banner: Partial<PromoBanner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  toggleBannerStatus: (id: string, isActive: boolean) => Promise<void>;
  reorderBanners: (bannerIds: string[]) => Promise<void>;
  refresh: () => void;
}

// Cache for promo banners
const promoBannersCache = {
  data: null as PromoBanner[] | null,
  timestamp: 0,
  loading: false
};

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const usePromoBanners = (): UsePromoBannersReturn => {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    return promoBannersCache.data && 
           promoBannersCache.timestamp && 
           Date.now() - promoBannersCache.timestamp < CACHE_DURATION;
  }, []);

  // Fetch promo banners
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
      const { supabase } = await import('@/integrations/supabase/client');
      
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
  }, [toast, isCacheValid]);

  // Create banner
  const createBanner = useCallback(async (banner: Omit<PromoBanner, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Clean up the banner data - convert empty strings to null for date fields
      const cleanedBanner = {
        ...banner,
        start_date: banner.start_date && banner.start_date.trim() !== '' ? banner.start_date : null,
        end_date: banner.end_date && banner.end_date.trim() !== '' ? banner.end_date : null,
        badge_text: banner.badge_text && banner.badge_text.trim() !== '' ? banner.badge_text : null,
        category_slug: banner.category_slug && banner.category_slug.trim() !== '' ? banner.category_slug : null,
        link_url: banner.link_url && banner.link_url.trim() !== '' ? banner.link_url : null,
        subtitle: banner.subtitle && banner.subtitle.trim() !== '' ? banner.subtitle : null,
        description: banner.description && banner.description.trim() !== '' ? banner.description : null,
      };
      
      const { data, error } = await supabase
        .from('promo_banners')
        .insert([cleanedBanner])
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache
      promoBannersCache.data = null;
      promoBannersCache.timestamp = 0;
      
      // Refresh data
      await fetchBanners();

      toast({
        title: "Success",
        description: "Promo banner created successfully",
      });
    } catch (err: any) {
      console.error("Error creating promo banner:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create promo banner",
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchBanners, toast]);

  // Update banner
  const updateBanner = useCallback(async (id: string, banner: Partial<PromoBanner>) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Clean up the banner data - convert empty strings to null for date fields
      const cleanedBanner = {
        ...banner,
        start_date: banner.start_date && banner.start_date.trim() !== '' ? banner.start_date : null,
        end_date: banner.end_date && banner.end_date.trim() !== '' ? banner.end_date : null,
        badge_text: banner.badge_text && banner.badge_text.trim() !== '' ? banner.badge_text : null,
        category_slug: banner.category_slug && banner.category_slug.trim() !== '' ? banner.category_slug : null,
        link_url: banner.link_url && banner.link_url.trim() !== '' ? banner.link_url : null,
        subtitle: banner.subtitle && banner.subtitle.trim() !== '' ? banner.subtitle : null,
        description: banner.description && banner.description.trim() !== '' ? banner.description : null,
      };
      
      const { data, error } = await supabase
        .from('promo_banners')
        .update(cleanedBanner)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache
      promoBannersCache.data = null;
      promoBannersCache.timestamp = 0;
      
      // Refresh data
      await fetchBanners();

      toast({
        title: "Success",
        description: "Promo banner updated successfully",
      });
    } catch (err: any) {
      console.error("Error updating promo banner:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update promo banner",
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchBanners, toast]);

  // Delete banner
  const deleteBanner = useCallback(async (id: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('promo_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalidate cache
      promoBannersCache.data = null;
      promoBannersCache.timestamp = 0;
      
      // Refresh data
      await fetchBanners();

      toast({
        title: "Success",
        description: "Promo banner deleted successfully",
      });
    } catch (err: any) {
      console.error("Error deleting promo banner:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete promo banner",
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchBanners, toast]);

  // Toggle banner status
  const toggleBannerStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('promo_banners')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      // Update local state immediately for better UX
      setBanners(prev => prev.map(banner => 
        banner.id === id ? { ...banner, is_active: isActive } : banner
      ));

      toast({
        title: "Success",
        description: `Promo banner ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (err: any) {
      console.error("Error toggling banner status:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update banner status",
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  // Reorder banners
  const reorderBanners = useCallback(async (bannerIds: string[]) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Update sort_order for each banner
      const updates = bannerIds.map((id, index) => ({
        id,
        sort_order: index + 1
      }));

      const { error } = await supabase
        .from('promo_banners')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      // Invalidate cache
      promoBannersCache.data = null;
      promoBannersCache.timestamp = 0;
      
      // Refresh data
      await fetchBanners();

      toast({
        title: "Success",
        description: "Banner order updated successfully",
      });
    } catch (err: any) {
      console.error("Error reordering banners:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to reorder banners",
        variant: "destructive",
      });
      throw err;
    }
  }, [fetchBanners, toast]);

  // Refresh banners
  const refresh = useCallback(() => {
    // Invalidate cache
    promoBannersCache.data = null;
    promoBannersCache.timestamp = 0;
    fetchBanners();
  }, [fetchBanners]);

  // Initial load
  useEffect(() => {
    fetchBanners();

    // Cleanup function
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
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    reorderBanners,
    refresh,
  };
}; 