
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  link: string;
}

const defaultSlides: BannerSlide[] = [
  {
    id: "1",
    title: "Latest iPhone 15 Pro",
    subtitle: "Experience the future of smartphones with A17 Pro chip",
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800",
    cta: "Shop Now",
    link: "/products/iphone-15-pro"
  },
  {
    id: "2",
    title: "Gaming Laptops",
    subtitle: "Unleash your potential with high-performance gaming",
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800",
    cta: "Explore",
    link: "/products?category=laptops"
  },
  {
    id: "3",
    title: "Premium Audio",
    subtitle: "Immerse yourself in crystal-clear sound quality",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    cta: "Listen Now",
    link: "/products?category=audio"
  }
];

export const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides] = useState(defaultSlides);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden bg-gray-900">
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl text-white">
                    <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 animate-fade-in">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl mb-6 animate-fade-in">
                      {slide.subtitle}
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-orange-500 hover:bg-orange-600 text-white animate-fade-in"
                    >
                      {slide.cta}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
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

      {/* Indicators */}
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
    </div>
  );
};
