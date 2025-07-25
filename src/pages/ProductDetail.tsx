import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Heart, Share2, Eye, Phone, Zap, ImageIcon, VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description: string;
  short_description?: string;
  images: string[];
  video_url?: string;
  features?: string[];
  specifications?: Record<string, any>;
  stock_quantity: number;
  rating?: number;
  reviews_count?: number;
  slug: string;
  sku?: string;
  view_count?: number;
  is_preorder?: boolean;
  preorder_availability_date?: string;
  categories?: {
    name: string;
    slug: string;
  };
}

// Media thumbnail component
const MediaThumbnail = ({ 
  type, 
  src, 
  alt, 
  isSelected, 
  onClick 
}: {
  type: 'image' | 'video';
  src: string;
  alt: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`relative aspect-square overflow-hidden rounded border-2 transition-all duration-200 hover:opacity-80 ${
      isSelected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
    }`}
    aria-label={`View ${type}: ${alt}`}
  >
    {type === 'video' ? (
      <>
        <video
          src={src}
          className="w-full h-full object-cover"
          preload="metadata"
          muted
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <VideoIcon className="w-6 h-6 text-white" />
        </div>
      </>
    ) : (
      <>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
        </div>
      </>
    )}
  </button>
);

// Stock status component
const StockStatus = ({ product }: { product: Product }) => {
  const stockInfo = useMemo(() => {
    if (product.is_preorder) {
      return {
        icon: <Zap className="w-3 h-3" />,
        text: product.preorder_availability_date
          ? `Pre-order - Available ${new Date(product.preorder_availability_date).toLocaleDateString()}`
          : 'Pre-order Available',
        className: 'text-blue-600',
        bgColor: 'bg-blue-500'
      };
    }
    
    if (product.stock_quantity > 0) {
      return {
        icon: <div className="w-3 h-3 bg-green-500 rounded-full" />,
        text: product.stock_quantity < 10
          ? `Only ${product.stock_quantity} left in stock!`
          : 'In Stock',
        className: 'text-green-600',
        bgColor: 'bg-green-500'
      };
    }
    
    return {
      icon: <div className="w-3 h-3 bg-red-500 rounded-full" />,
      text: 'Out of Stock',
      className: 'text-red-600',
      bgColor: 'bg-red-500'
    };
  }, [product.stock_quantity, product.is_preorder, product.preorder_availability_date]);

  return (
    <div className="flex items-center gap-2">
      {stockInfo.icon}
      <span className={`font-medium ${stockInfo.className}`}>
        {stockInfo.text}
      </span>
    </div>
  );
};

// Rating component
const RatingDisplay = ({ rating, reviewsCount }: { rating: number; reviewsCount: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex" role="img" aria-label={`Rating: ${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
    <span className="text-sm text-gray-600">
      {rating.toFixed(1)} ({reviewsCount} review{reviewsCount !== 1 ? 's' : ''})
    </span>
  </div>
);

// Loading skeleton component
const ProductSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-10 w-24 mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-12 w-12" />
        </div>
      </div>
    </div>
  </div>
);

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<number | 'video'>(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Format functions
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  }, []);

  const formatViewCount = useCallback((count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }, []);

  // Memoized calculations
  const discountPercentage = useMemo(() => {
    if (!product?.original_price || product.original_price <= product.price) return 0;
    return Math.round(((product.original_price - product.price) / product.original_price) * 100);
  }, [product?.original_price, product?.price]);

  const mediaItems = useMemo(() => {
    if (!product) return [];
    
    const items = [];
    if (product.video_url) {
      items.push({ type: 'video' as const, src: product.video_url, alt: `${product.name} video` });
    }
    if (product.images) {
      product.images.forEach((image, index) => {
        items.push({ type: 'image' as const, src: image, alt: `${product.name} image ${index + 1}` });
      });
    }
    return items;
  }, [product]);

  const incrementViewCount = useCallback(async (productId: string) => {
    try {
      const { error } = await supabase.rpc('increment_product_view', {
        product_id: productId
      });

      if (error) {
        console.error('Error incrementing view count:', error);
        return;
      }

      // Update the local state to reflect the new view count
      setProduct(prev => prev ? { 
        ...prev, 
        view_count: (prev.view_count || 0) + 1 
      } : null);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }, []);

  const fetchProduct = useCallback(async (productSlug: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, slug)
        `)
        .eq('slug', productSlug)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (data) {
        const productData = {
          ...data,
          specifications: typeof data.specifications === 'string' 
            ? JSON.parse(data.specifications) 
            : data.specifications,
          rating: data.rating || 4.0,
          reviews_count: data.reviews_count || 0,
          view_count: data.view_count || 0
        };
        
        setProduct(productData);
        
        // Increment view count
        await incrementViewCount(data.id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Error',
        description: 'Product not found',
        variant: 'destructive',
      });
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [incrementViewCount, toast, navigate]);

  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
    }
  }, [slug, fetchProduct]);

  useEffect(() => {
    if (product) {
      setSelectedMedia(product.video_url ? 'video' : 0);
    }
  }, [product]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images || [],
    });

    const actionText = product.is_preorder ? "Pre-ordered" : "Added to Cart";
    const descriptionText = product.is_preorder 
      ? `${product.name} has been added to your pre-orders`
      : `${product.name} has been added to your cart`;
    
    toast({
      title: actionText,
      description: descriptionText,
    });
  }, [product, addToCart, toast]);

  const handleShare = useCallback(async () => {
    if (!product) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description || product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link Copied',
          description: 'Product link has been copied to clipboard',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to copy link to clipboard',
          variant: 'destructive',
        });
      }
    }
  }, [product, toast]);

  const toggleWishlist = useCallback(() => {
    setIsWishlisted(prev => !prev);
    toast({
      title: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
      description: isWishlisted 
        ? `${product?.name} has been removed from your wishlist`
        : `${product?.name} has been added to your wishlist`,
    });
  }, [isWishlisted, product?.name, toast]);

  const handleMediaSelect = useCallback((index: number | 'video') => {
    setSelectedMedia(index);
    setImageLoading(true);
  }, []);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const currentMedia = selectedMedia === 'video' 
    ? { type: 'video' as const, src: product.video_url!, alt: `${product.name} video` }
    : { type: 'image' as const, src: product.images?.[selectedMedia as number] || '/placeholder.svg', alt: product.name };

  const isOutOfStock = product.stock_quantity === 0 && !product.is_preorder;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {product.categories && (
          <div className="text-sm text-gray-500">
            <span>Products</span> / <span>{product.categories.name}</span> / <span className="text-gray-900">{product.name}</span>
          </div>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media Gallery */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {currentMedia.type === 'video' ? (
              <video 
                controls 
                autoPlay={true}
                loop 
                muted 
                className="w-full h-full object-cover"
                src={currentMedia.src}
                onLoadedData={() => setImageLoading(false)}
                poster={product.images?.[0]}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={currentMedia.src}
                alt={currentMedia.alt}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            )}
            
            {/* View count badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {formatViewCount(product.view_count || 0)} views
              </div>
            </div>

            {/* Discount badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-500 text-white">
                  {discountPercentage}% OFF
                </Badge>
              </div>
            )}

            {/* Pre-order badge */}
            {product.is_preorder && (
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  PRE-ORDER
                </Badge>
              </div>
            )}
          </div>

          {/* Media thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {mediaItems.map((media, index) => (
              <MediaThumbnail
                key={`${media.type}-${index}`}
                type={media.type}
                src={media.src}
                alt={media.alt}
                isSelected={
                  (media.type === 'video' && selectedMedia === 'video') ||
                  (media.type === 'image' && selectedMedia === (media.type === 'video' ? index - 1 : index))
                }
                onClick={() => handleMediaSelect(media.type === 'video' ? 'video' : (product.video_url ? index - 1 : index))}
              />
            ))}
          </div>
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              {product.categories && (
                <Badge variant="outline">
                  {product.categories.name}
                </Badge>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                {formatViewCount(product.view_count || 0)} views
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            {product.sku && (
              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            )}
          </div>

          {/* Rating */}
          <RatingDisplay 
            rating={product.rating || 4.0} 
            reviewsCount={product.reviews_count || 0} 
          />

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-3xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
              {product.original_price && discountPercentage > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <Badge className="bg-red-500 text-white">
                    {discountPercentage}% OFF
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <StockStatus product={product} />

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description || product.short_description}
            </p>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Features</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              className={`flex-1 ${
                product.is_preorder 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-orange-500 hover:bg-orange-600'
              } text-white`}
              size="lg"
              disabled={isOutOfStock}
            >
              {isOutOfStock ? (
                'Out of Stock'
              ) : product.is_preorder ? (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Pre-order Now
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
            
            {/* <Button 
              variant="outline" 
              size="lg"
              onClick={toggleWishlist}
              className={isWishlisted ? 'text-red-500 border-red-500' : ''}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button> */}
            <a href='tel:+256755869853'>
            <Button 
          
              variant="outline" 
              size="lg"
              aria-label="Contact seller"
            >
           
              <Phone className="w-5 h-5" />
            </Button> </a>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleShare}
              aria-label="Share product"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b pb-2 last:border-b-0">
                  <span className="font-medium text-gray-900 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-gray-600">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}