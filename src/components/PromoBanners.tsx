"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button.tsx";


const latestProducts = [
  {
    title: "Smartphones",
    subtitle: "Top Picks for 2025",
    description:
      "Browse our premium selection of smartphones with cutting-edge features and sleek design.",
    image: "/phone.jpeg",
    cta: "Shop Now",
    badge: "NEW",
    category: "smartphones",
  },
  {
    title: "Wireless Headphones",
    subtitle: "Built for Sound",
    description:
      "Explore noise-canceling wireless headphones engineered for immersive audio and comfort.",
    image: "/headphones.jpeg",
    cta: "Explore",
    badge: "SALE",
    category: "headphones",
  },
  {
    title: "Smart TVs",
    subtitle: "Home Entertainment",
    description:
      "Discover ultra HD smart TVs with crisp visuals, streaming apps, and voice control.",
    image: "/smarttv.jpeg",
    cta: "Discover",
    badge: "FEATURED",
    category: "smart-tvs",
  },
];

function PromoBanners() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === latestProducts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? latestProducts.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: React.SetStateAction<number>) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const autoSlide = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(autoSlide);
  }, [currentIndex]);

  const product = latestProducts[currentIndex];

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
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {product.badge}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {product.title}
                </h3>
                <p className="text-blue-600 font-medium text-xs">
                  {product.subtitle}
                </p>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                {product.description}
              </p>
              <a href={`/products?category=${product.category}`}>
                <Button
                  className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg transition-all duration-200 transform hover:scale-105"
                  size="sm"
                >
                  {product.cta}
                </Button>
              </a>
            </div>
          </div>

          {/* Image Section */}
          <div className="w-1/3 h-[100px] relative overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>

        {/* Navigation Buttons */}
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
        
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {latestProducts.map((product, index) => (
          <a href={`/products?category=${product.category}`} key={index}>
            <Button
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-blue-600 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          </a>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
        <div
          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / latestProducts.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export default PromoBanners;