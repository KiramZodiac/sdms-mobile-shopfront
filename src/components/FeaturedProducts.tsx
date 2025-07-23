import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Eye, Heart, Zap, TrendingUp, Crown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  view_count: number;
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description: string;
  short_description?: string;
  images: string[];
  stock_quantity: number;
  rating?: number;
  reviews_count?: number;
  slug: string;
  categories?: {
    name: string;
    slug: string;
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};

export const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, price, original_price, description, short_description, 
          images, stock_quantity, rating, reviews_count, slug, view_count, 
          categories(name, slug)
        `)
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(12)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedProducts = data?.map((product: any) => ({
        ...product,
        description: product.description || product.short_description || "",
        images: product.images || [],
        view_count: product.view_count || 0,
      })) || [];

      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      toast({
        title: "Error",
        description: "Failed to load featured products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(price);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const formatViewCount = (count: number) =>
    count >= 1_000_000
      ? `${(count / 1_000_000).toFixed(1)}M`
      : count >= 1000
      ? `${(count / 1000).toFixed(1)}k`
      : count.toString();

  const incrementViewCount = async (productId: string) => {
    const viewedKey = `viewed-${productId}`;
    if (sessionStorage.getItem(viewedKey)) return;

    try {
      const { error } = await supabase.rpc("increment_product_view", {
        product_id: productId,
      });
      if (error) throw error;
      sessionStorage.setItem(viewedKey, "true");
    } catch (error) {
      console.error("Failed to increment view count:", error);
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const getDiscountPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-orange-500 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.3),transparent)] animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="h-8 bg-white/20 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-white/10 rounded-lg w-48 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-2xl h-80 animate-pulse backdrop-blur-sm"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-white-400 to-orange-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 transform transition-all duration-700 hover:scale-105"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full font-semibold text-sm mb-4 shadow-lg">
            <Crown className="w-4 h-4" />
            <span className="animate-pulse">LIMITED TIME OFFERS</span>
          </div>
          <h2 className="text-2xl md:text-5xl font-bold text-black mb-4 bg-gradient-to-r from-black via-blue-500 to-purple-200 bg-clip-text text-transparent">
            Best Value, All Day | Top Rated Deals
          </h2>
          <p className="text-xl text-blue-500 mb-6 max-w-2xl mx-auto">
            Discover premium products at unbeatable prices
          </p>
          <Link to="/products">
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 backdrop-blur-sm text-orange-500 border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <span className="flex items-center gap-2">
                View All Products
                <TrendingUp className="w-5 h-5" />
              </span>
            </Button>
          </Link>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <AnimatePresence>
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="group relative transform transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Card */}
                <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 border border-white/20 group-hover:border-purple-300/50">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    <Link
                      to={`/products/${product.slug}`}
                      onClick={() => incrementViewCount(product.id)}
                      className="block group"
                    >
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-32 sm:h-36 md:h-40 object-cover transition-transform duration-700 group-hover:scale-105 rounded-md"
                      />
                    </Link>
                    
                    {/* Image Overlay */}
                    <Link to={`/products/${product.slug}`} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </Link>
                    {/* Favorite Button */}
                    {/* <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white shadow-lg"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors duration-300 ${
                          favorites.has(product.id) 
                            ? 'text-red-500 fill-current' 
                            : 'text-gray-600 hover:text-red-500'
                        }`}
                      />
                    </button> */}

                    {/* Discount Badge */}
                    {product.original_price && product.original_price > product.price && (
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-pulse">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {getDiscountPercentage(product.original_price, product.price)}% OFF
                        </span>
                      </Badge>
                    )}

                    {/* View Count */}
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <Eye className="w-3 h-3" />
                      {formatViewCount(product.view_count)}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4 relative z-10">
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-800 transition-colors duration-300">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              product.rating && i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {product.reviews_count! > 0 && (
                        <span className="text-xs text-gray-600">({product.reviews_count})</span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-2 sm:mb-3">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-2 sm:mb-3">
                      <div className="flex items-center justify-between text-xs font-medium px-2 py-1 rounded-md shadow-sm border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 ease-in-out hover:shadow-md">
                        <span className={`
                          transition-colors duration-300
                          ${product.stock_quantity > 10 
                            ? 'text-green-600' 
                            : product.stock_quantity > 5 
                            ? 'text-yellow-600' 
                            : 'text-red-600'}
                        `}>
                          {product.stock_quantity > 10
                            ? 'In Stock'
                            : product.stock_quantity > 0
                            ? `Only ${product.stock_quantity} left!`
                            : 'Out of Stock'}
                        </span>

                        <motion.a 
                          href="tel:+256000000000" 
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                          title="Call us"
                          animate={{ 
                            y: [0, -4, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            repeat: Infinity,
                            duration: 0.8,
                            ease: "easeInOut"
                          }}
                        >
                          <Phone className="w-4 h-4 text-orange-500 hover:text-blue-600 transition-colors duration-300" />
                        </motion.a>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock_quantity === 0}
                      className={`w-full py-2 px-2 sm:px-4 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 ${
                        product.stock_quantity === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1 sm:gap-2">
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </span>
                      </span>
                    </button>
                  </div>

                  {/* Hover Effect Shine */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 1s ease-in-out infinite;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};