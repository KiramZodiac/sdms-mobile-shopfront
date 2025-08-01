
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  video_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  display_order: number;
}

const defaultSlides: BannerSlide[] = [
  {
    id: "1",
    title: "Latest iPhone 15 Pro",
    subtitle: "Experience the future of smartphones with A17 Pro chip",
    image_url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800",
    video_url: null,
    cta_text: "Shop Now",
    cta_link: "/products/?category=smartphones",
    display_order: 0
  },
  {
    id: "2",
    title: "Gaming Laptops",
    subtitle: "Unleash your potential with high-performance gaming",
    image_url: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800",
    video_url: null,
    cta_text: "Explore",
    cta_link: "/products?category=laptops",
    display_order: 1
  },
  {
    id: "3",
    title: "Premium Audio",
    subtitle: "Immerse yourself in crystal-clear sound quality",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    video_url: null,
    cta_text: "Listen Now",
    cta_link: "/products?category=audio",
    display_order: 2
  }
];

export const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<BannerSlide[]>(defaultSlides);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [slides.length]);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSlides(data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: "Error",
        description: "Failed to load banners, using default slides",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return (
      <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden bg-gray-900 animate-pulse">
        <div className="absolute inset-0 bg-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden bg-gray-900">
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
            {slide.video_url ? (
              <video
                className="w-full h-full object-cover"
                src={slide.video_url}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.image_url})` }}
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl text-white">
                  <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 animate-fade-in">
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p className="text-lg md:text-xl mb-6 animate-fade-in">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.cta_text && slide.cta_link && (
                    <Button 
                      size="lg" 
                      className="bg-orange-500 hover:bg-orange-600 text-white animate-fade-in"
                      onClick={() => window.location.href = slide.cta_link}
                    >
                      {slide.cta_text}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
            onClick={nextSlide}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
