import { Suspense, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Crown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { useFeaturedProducts } from "@/hooks/useFeaturedProducts";

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
  is_preorder: boolean;
  preorder_availability_date?: string;
  condition?: 'new' | 'used' | 'like_new' | 'refurbished' | 'open_box';
  categories?: { name: string; slug: string };
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 }, // Reduced delay for faster animation
  }),
};

export const FeaturedProducts = () => {
  const { products, loading, loadingMore, hasMore, loadMore, refresh } = useFeaturedProducts();
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Memoized utility functions
  const formatPrice = useCallback((price: number): string =>
    new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(price), []);

  const formatViewCount = useCallback((count: number): string =>
    count >= 1_000_000
      ? `${(count / 1_000_000).toFixed(1)}M`
      : count >= 1000
      ? `${(count / 1000).toFixed(1)}k`
      : count.toString(), []);

  const getDiscountPercentage = useCallback((original: number, current: number): number =>
    Math.round(((original - current) / original) * 100), []);

  const formatAvailabilityDate = useCallback((dateString?: string): string | null =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-UG", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null, []);

  const incrementViewCount = useCallback(async (productId: string): Promise<void> => {
    const viewedKey = `viewed-${productId}`;
    if (sessionStorage.getItem(viewedKey)) return;

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.rpc("increment_product_view", {
        product_id: productId,
      });
      if (error) throw error;
      sessionStorage.setItem(viewedKey, "true");
    } catch (error) {
      console.error("Failed to increment view count:", error);
    }
  }, []);

  // Memoized loading skeleton
  const loadingSkeleton = useMemo(() => (
    <section className="py-8 bg-gradient-to-br from-orange-500/50 to-indigo-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="h-6 bg-white/20 rounded w-48 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-white/10 rounded w-32 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white/10 rounded-lg h-64 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </section>
  ), []);

  if (loading) {
    return loadingSkeleton;
  }

  return (
    <section className="py-8 bg-gradient-to-r from-white/50 to-orange-600/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400/80 to-orange-500/80 text-black px-4 py-1 rounded-full text-sm">
            <Crown className="w-4 h-4" />
            LIMITED TIME OFFERS
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-xl md:text-3xl font-bold text-black">
              Best Value, All Day
            </h2>
            <Button
              onClick={refresh}
              disabled={loading}
              variant="ghost"
              size="sm"
              className="bg-white/20 text-orange-500 hover:bg-white/30"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <Link to="/products">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-orange-500 border-white/30 hover:bg-white/20"
            >
              View All Products
              <TrendingUp className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence>
            <Suspense fallback={<div>Loading...</div>}>
              {products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  formatPrice={formatPrice}
                  formatViewCount={formatViewCount}
                  incrementViewCount={incrementViewCount}
                  addToCart={addToCart}
                  toast={toast}
                  getDiscountPercentage={getDiscountPercentage}
                  formatAvailabilityDate={formatAvailabilityDate}
                />
              ))}
            </Suspense>
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              variant="outline"
              className="bg-white/10 text-orange-500 border-white/30 hover:bg-white/20"
            >
              {loadingMore ? "Loading..." : "Load More Products"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};