import { useCart } from "@/hooks/useCart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Clock, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const RecentProducts = () => {
  const { recentProducts, addToCart } = useCart();
  const { toast } = useToast();

  if (recentProducts.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images
    });
  };

  const handleClearRecentProducts = () => {
    localStorage.removeItem('sdms_recent_products');
    window.location.reload(); // Simple way to refresh the component
    toast({
      title: "Recent Products Cleared",
      description: "Your recent products have been cleared",
    });
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2 w-full flex-wrap">
              <span className="flex items-center justify-center rounded-full bg-orange-100 p-2">
                <Clock className="h-5 w-5 text-orange-500" />
              </span>
              <h2 className="text-base sm:text-2xl font-bold text-gray-900">
                Recently Purchased
              </h2>
            
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearRecentProducts}
            className="text-gray-600 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear History
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {recentProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.images?.[0] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                
                {/* Purchase time badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700">
                    {formatDistanceToNow(new Date(product.purchasedAt), { addSuffix: true })}
                  </Badge>
                </div>

                {/* Add to cart button */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-3">
                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-orange-600">
                  {formatPrice(product.price)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {recentProducts.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Click the cart icon to quickly re-add items to your cart
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentProducts; 