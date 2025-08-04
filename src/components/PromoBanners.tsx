"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button.tsx";

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
  sort_order: number;
}

// Cache for promo banners
const promoBannersCache = {
  data: null as PromoBanner[] | null,
  timestamp: 0,
  loading: false
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function PromoBanners() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .rpc('get_active_promo_banners');

      if (error) throw error;

      const transformedBanners = data || [];
      
      // Update cache
      promoBannersCache.data = transformedBanners;
      promoBannersCache.timestamp = Date.now();
      
      setBanners(transformedBanners);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching promo banners:", err);
      setError(err.message || 'Failed to load promo banners');
      
      // Fallback to empty array
      setBanners([]);
    } finally {
      setLoading(false);
      promoBannersCache.loading = false;
    }
  }, [isCacheValid]);

  // Load banners on mount
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const nextSlide = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < banners.length) {
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    if (banners.length === 0) return;
    
    const autoSlide = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(autoSlide);
  }, [banners.length]);

  // Reset current index when banners change
  useEffect(() => {
    setCurrentIndex(0);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-blue-500 w-6 h-6" />
            Featured Promotions
          </h2>
          <p className="text-gray-600 text-sm">
            Loading promotional content...
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || banners.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-blue-500 w-6 h-6" />
            Featured Promotions
          </h2>
          <p className="text-gray-600 text-sm">
            {error ? 'Unable to load promotions' : 'No promotions available'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">
            {error || 'Check back later for exciting promotions!'}
          </p>
        </div>
      </div>
    );
  }

  const banner = banners[currentIndex];
  const bannerLink = banner.link_url || `/products?category=${banner.category_slug}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-blue-500 w-6 h-6" />
          Featured Promotions
        </h2>
        <p className="text-gray-600 text-sm">
          Discover our latest deals and premium products
        </p>
      </div>

      <div
        className="relative overflow-hidden rounded-xl bg-white shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center min-h-[100px]">
          {/* Text Section */}
          <div className="p-4 w-2/3 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {banner.badge_text && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    {banner.badge_text}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-blue-600 font-medium text-xs">
                    {banner.subtitle}
                  </p>
                )}
              </div>
              {banner.description && (
                <p className="text-gray-600 text-xs leading-relaxed">
                  {banner.description}
                </p>
              )}
              <a href={bannerLink}>
                <Button
                  className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg transition-all duration-200 transform hover:scale-105"
                  size="sm"
                >
                  {banner.cta_text}
                </Button>
              </a>
            </div>
          </div>
          
          {/* Image Section */}
          <div className="w-1/3 h-[100px] relative overflow-hidden">
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {banners.length > 1 && (
          <>
            <Button
              onClick={prevSlide}
              className="absolute top-1/2 left-2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={nextSlide}
              className="absolute top-1/2 right-2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {banners.map((banner, index) => (
            <Button
              key={banner.id}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-blue-600 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {banners.length > 1 && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / banners.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default PromoBanners;