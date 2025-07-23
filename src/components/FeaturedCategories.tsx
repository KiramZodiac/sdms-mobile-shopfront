import { Link } from "react-router-dom";
import { 
  Smartphone, 
  Tv, 
  Wrench, 
  Monitor, 
  Tablet,
  Headphones,
  Camera,
  Gamepad2,
  Laptop,
  Watch
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Icon mapping for categories
const iconMap = {
  "phones": Smartphone,
  "televisions": Tv,
  "repair": Wrench,
  "systems": Monitor,
  "tablets": Tablet,
  "audio": Headphones,
  "cameras": Camera,
  "gaming": Gamepad2,
  "laptops": Laptop,
  "wearables": Watch,
  // Add more mappings as needed
};

export const FeaturedCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, image_url, is_active, count");

        if (error) throw error;

        // Filter only active categories
        const activeCategories = data.filter((category) => category.is_active);
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const getIconForCategory = (categoryName) => {
    const key = categoryName.toLowerCase().replace(/\s+/g, '');
    return iconMap[key] || Monitor; // Default icon
  };

  return (
    <section className="py-4 bg-gray-50">
      <h2 className="text-2xl font-semibold text-center mb-6">Featured Categories</h2>
      <div className="container mx-auto px-4">
        <p className="text-center text-gray-600 mb-4">
          Explore our wide range of categories to find the perfect products for you.
        </p>
      </div>
      <div className="px-4">
        {/* Horizontal scrollable container */}
        <div className="flex overflow-x-auto scrollbar-hide space-x-4 pb-2 md:justify-center md:space-x-8 lg:space-x-12">
          {categories.map((category) => {
            const IconComponent = getIconForCategory(category.name);
            
            return (
              <Link
                key={category.id}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="flex-shrink-0 flex flex-col items-center group"
              >
                {/* Icon container with circular background */}
                <div className="w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <IconComponent className="w-8 h-8 md:w-12 md:h-12 lg:w-14  text-gray-600 group-hover:text-blue-600 transition-colors" />
                  )}
                </div>
                
                {/* Category name */}
                <span className="text-xs md:text-sm lg:text-base font-medium text-gray-700 text-center max-w-16 md:max-w-24 lg:max-w-28 leading-tight group-hover:text-blue-600 transition-colors">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};