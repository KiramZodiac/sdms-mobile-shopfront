import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Heart, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  categories?: {
    name: string;
    slug: string;
  };
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | 'video'>(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
    }
  }, [slug]);

  useEffect(() => {
    setSelectedImage(product?.video_url ? 'video' : 0);
  }, [product]);

  const fetchProduct = async (productSlug: string) => {
    try {
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
          specifications: typeof data.specifications === 'string' ? JSON.parse(data.specifications) : data.specifications,
          rating: data.rating || 4.0, // Default rating of 4.0 stars
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
  };

  const incrementViewCount = async (productId: string) => {
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
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images || [],
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.short_description || product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Product link has been copied to clipboard',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative">
            {selectedImage === 'video' && product.video_url ? (
              <video controls autoPlay loop muted className="w-full h-full object-cover" src={product.video_url}>
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={product.images?.[selectedImage as number] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* View count badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {formatViewCount(product.view_count || 0)} views
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {product.video_url && (
              <button
                onClick={() => setSelectedImage('video')}
                className={`aspect-square overflow-hidden rounded border-2 ${
                  selectedImage === 'video' ? 'border-blue-600' : 'border-gray-200'
                }`}
              >
                <video
                  src={product.video_url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                  loop
                />
              </button>
            )}

            {product.images &&
              product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded border-2 ${
                    selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name || 'Product'} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
          </div>
        </div>

        <div className="space-y-6">
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
            {product.sku && <p className="text-sm text-gray-500">SKU: {product.sku}</p>}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {(product.rating || 4.0).toFixed(1)} ({product.reviews_count || 0} reviews)
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <Badge className="bg-red-500 text-white">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div>
            {product.stock_quantity > 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">
                  {product.stock_quantity < 10
                    ? `Only ${product.stock_quantity} left in stock!`
                    : 'In Stock'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-600 font-medium">Out of Stock</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description || product.short_description}
            </p>
          </div>

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

          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
              disabled={product.stock_quantity === 0}
            >
              {product.stock_quantity === 0 ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b pb-2">
                  <span className="font-medium text-gray-900">{key}:</span>
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