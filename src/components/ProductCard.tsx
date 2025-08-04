import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Eye, Zap, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { memo } from "react";

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
    transition: { delay: i * 0.1 },
  }),
};

export const ProductCard = memo(
  ({
    product,
    index,
    formatPrice,
    formatViewCount,
    incrementViewCount,
    addToCart,
    toast,
    getDiscountPercentage,
    formatAvailabilityDate,
  }: {
    product: Product;
    index: number;
    formatPrice: (price: number) => string;
    formatViewCount: (count: number) => string;
    incrementViewCount: (productId: string) => void;
    addToCart: (item: {
      id: string;
      name: string;
      price: number;
      images: string[];
    }) => void;
    toast: (options: { title: string; description: string }) => void;
    getDiscountPercentage: (original: number, current: number) => number;
    formatAvailabilityDate: (dateString?: string) => string | null;
  }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const productUrl = `/products/${product.slug}`;

    return (
      <motion.div
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="group relative"
        role="region"
        aria-label={`Product: ${product.name}`}
        aria-describedby={`product-desc-${product.id}`}
      >
        <div className="bg-white/90 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300 border border-gray-100">
          <div className="relative overflow-hidden">
            <Link
              to={productUrl}
              onClick={() => incrementViewCount(product.id)}
              aria-label={`View ${product.name}`}
              className="block"
            >
              {/* Skeleton Placeholder */}
              {!isImageLoaded && (
                <div className="w-full h-40 sm:h-48 md:h-56 bg-gray-200 animate-pulse" />
              )}

              <img
                src={product.images?.[0] || "/placeholder.svg"}
                alt={product.name || "Product image"}
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                onLoad={() => setIsImageLoaded(true)}
                className={`w-full h-40 sm:h-48 md:h-56 object-cover transition-transform duration-300 ${
                  isImageLoaded ? "group-hover:scale-105 opacity-100" : "opacity-0"
                }`}
              />
            </Link>

            {/* Badges */}
            {product.is_preorder && (
              <Badge className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] px-2 py-0.5">
                <Zap className="w-3 h-3 mr-1" />
                PRE-ORDER
              </Badge>
            )}
            {product.original_price &&
              product.original_price > product.price &&
              !product.is_preorder && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5">
                  <Zap className="w-3 h-3 mr-1" />
                  {Math.floor(getDiscountPercentage(product.original_price, product.price))}% OFF
                </Badge>
              )}
            
            {/* Condition Badge */}
            {product.condition && (
              <Badge className={`absolute top-2 right-2 text-white text-[10px] px-2 py-0.5 ${
                product.condition === 'new' ? 'bg-blue-500' :
                product.condition === 'used' ? 'bg-gray-500' :
                product.condition === 'like_new' ? 'bg-green-500' :
                product.condition === 'refurbished' ? 'bg-purple-500' :
                product.condition === 'open_box' ? 'bg-orange-500' : 'bg-gray-500'
              }`}>
                {product.condition === 'like_new' ? 'LIKE NEW' :
                 product.condition === 'open_box' ? 'OPEN BOX' :
                 product.condition.toUpperCase()}
              </Badge>
            )}
          

            {/* View Count */}
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViewCount(product.view_count)}
            </div>
          </div>

          <div className="p-2 sm:p-3">
            <Link to={productUrl}>
              <h3
                id={`product-desc-${product.id}`}
                className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1 sm:line-clamp-2"
              >
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center gap-1 mb-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      product.rating && i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              {product.rating && (
                <span className="text-xs text-gray-600 ml-1">
                  {product.rating.toFixed(1)}
                </span>
              )}
              {product.reviews_count && product.reviews_count > 0 && (
                <span className="text-xs text-gray-500">
                  ({product.reviews_count.toLocaleString()})
                </span>
              )}
            </div>
            <div className="mb-1">
  <div className="flex flex-wrap items-center gap-x-2 text-sm font-bold text-gray-900">
    <span className="truncate">{formatPrice(product.price)}</span>
    {product.original_price && (
      <span className="text-xs text-gray-500 line-through truncate">
        {formatPrice(product.original_price)}
      </span>
    )}
  </div>
</div>

            <div className="mb-2">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`${
                    product.is_preorder
                      ? "text-blue-600"
                      : product.stock_quantity > 10
                      ? "text-green-600"
                      : product.stock_quantity > 5
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {product.is_preorder
                    ? product.preorder_availability_date
                      ? `Available ${formatAvailabilityDate(product.preorder_availability_date)}`
                      : "Pre-order Available"
                    : product.stock_quantity > 10
                    ? "In Stock"
                    : product.stock_quantity > 0
                    ? `Only ${product.stock_quantity} left!`
                    : "Out of Stock"}
                </span>
                <a
                  href="tel:+256755869853"
                  className="p-1 rounded-full hover:bg-gray-200"
                  aria-label="Call us"
                >
                  <Phone className="w-4 h-4 text-orange-500" />
                </a>
              </div>
            </div>

            <button
              onClick={() => {
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  images: product.images,
                });
                toast({
                  title: product.is_preorder ? "Pre-ordered" : "Added to Cart",
                  description: product.is_preorder
                    ? `${product.name} has been added to your pre-orders`
                    : `${product.name} has been added to your cart`,
                });
              }}
              disabled={product.stock_quantity === 0 && !product.is_preorder}
              className={`w-full py-2 rounded-md text-xs ${
                product.stock_quantity === 0 && !product.is_preorder
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : product.is_preorder
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
              aria-label={`${
                product.is_preorder ? "Pre-order" : "Add to Cart"
              } ${product.name}`}
            >
              <span className="flex items-center justify-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                {product.stock_quantity === 0 && !product.is_preorder
                  ? "Out of Stock"
                  : product.is_preorder
                  ? "Pre-order"
                  : "Add to Cart"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
);
