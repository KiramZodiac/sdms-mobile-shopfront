
import { Link } from "react-router-dom";
import { Smartphone, Laptop, Headphones, Watch, Camera, Gamepad2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  {
    id: "smartphones",
    name: "Smartphones",
    icon: Smartphone,
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
    count: "50+ Products"
  },
  {
    id: "laptops",
    name: "Laptops",
    icon: Laptop,
    image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300",
    count: "30+ Products"
  },
  {
    id: "audio",
    name: "Audio Devices",
    icon: Headphones,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
    count: "40+ Products"
  },
  {
    id: "wearables",
    name: "Wearables",
    icon: Watch,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
    count: "25+ Products"
  },
  {
    id: "cameras",
    name: "Cameras",
    icon: Camera,
    image_url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300",
    count: "20+ Products"
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: Gamepad2,
    image_url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=300",
    count: "35+ Products"
  }
];

export const FeaturedCategories = () => {

  // const [categories, setCategories] = useState([]);

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       const { data, error } = await supabase
  //         .from("categories")
  //         .select("id, name, image_url, is_active,count");

  //       if (error) throw error;

  //       // Filter only active categories
  //       const activeCategories = data.filter((category) => category.is_active);
  //       setCategories(activeCategories);
  //     } catch (error) {
  //       console.error("Error fetching categories:", error);
  //     }
  //   };

  //   fetchCategories();
  // }, []);



  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our extensive range of electronics and gadgets across various categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-200"
            >
              <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                <img
                  src={category.image_url || "/placeholder.svg"} // Fallback image
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <category.icon className="w-6 h-6 text-blue-600 group-hover:text-orange-500 transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500">{category.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
