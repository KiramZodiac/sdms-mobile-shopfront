
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

export const CartButton = () => {
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate('/checkout')}
      className="relative not-sr-only bg-orange-300 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors duration-200"
    >
      <ShoppingCart className="w-3 h-3 mr-2" />
      Cart
      {itemCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
          {itemCount}
        </Badge>
      )}
    </Button>
  );
};
