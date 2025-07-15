
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description: string;
  images: string[];
  video_url?: string;
  category: string;
  stock_quantity: number;
  rating?: number;
  reviews_count?: number;
}

export const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      // For now, we'll use mock data since we haven't set up the database yet
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "iPhone 15 Pro Max",
          price: 1200000,
          original_price: 1350000,
          description: "Latest iPhone with A17 Pro chip and titanium design",
          images: [
            "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
            "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400",
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
          ],
          category: "smartphones",
          stock_quantity: 15,
          rating: 4.8,
          reviews_count: 124
        },
        {
          id: "2",
          name: "MacBook Pro 14\"",
          price: 2500000,
          description: "Powerful laptop with M3 chip for professionals",
          images: [
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"
          ],
          category: "laptops",
          stock_quantity: 8,
          rating: 4.9,
          reviews_count: 89
        },
        {
          id: "3",
          name: "Sony WH-1000XM5",
          price: 450000,
          original_price: 520000,
          description: "Premium noise-canceling headphones",
          images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400"
          ],
          category: "audio",
          stock_quantity: 25,
          rating: 4.7,
          reviews_count: 203
        },
        {
          id: "4",
          name: "Apple Watch Series 9",
          price: 800000,
          description: "Advanced smartwatch with health monitoring",
          images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
            "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400"
          ],
          category: "wearables",
          stock_quantity: 20,
          rating: 4.6,
          reviews_count: 156
        }
      ];

      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]
    });
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of the latest and most popular electronics
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 group">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.original_price && product.original_price > product.price && (
                    <Badge className="bg-red-500 text-white">
                      {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                    </Badge>
                  )}
                  {product.stock_quantity < 10 && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      Low Stock
                    </Badge>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/products/${product.id}`}>
                    <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating!) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({product.reviews_count})
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  size="sm"
                  disabled={product.stock_quantity === 0}
                >
                  {product.stock_quantity === 0 ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Products Link */}
        <div className="text-center mt-8">
          <Link to="/products">
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
