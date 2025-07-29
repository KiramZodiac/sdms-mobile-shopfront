import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface ShopImageCarousel {
  id: string;
  title: string;
  alt_text: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

interface ShopImageCarouselListProps {
  items: ShopImageCarousel[];
  onEdit: (item: ShopImageCarousel) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}

export const ShopImageCarouselList = ({ items, onEdit, onDelete, onToggleActive }: ShopImageCarouselListProps) => {
  if (!items.length) {
    return (
      <Card className="p-0">
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No carousel images yet</p>
            <p className="text-sm">Get started by adding your first carousel image.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-2 sm:space-y-4">
      {items.map(item => (
        <Card key={item.id} className="p-0">
          <CardContent className="p-3 sm:p-6">
            <div className="flex gap-3">
              <img
                src={item.image_url || '/placeholder.svg'}
                alt={item.alt_text || item.title}
                className="w-16 h-10 sm:w-20 sm:h-12 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-sm sm:text-lg truncate pr-2">{item.title}</h3>
                  <Badge variant={item.is_active ? 'default' : 'secondary'} className="text-xs px-1 py-0 flex-shrink-0">
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {item.alt_text && (
                  <p className="text-gray-600 text-xs sm:text-sm mb-1 line-clamp-1">{item.alt_text}</p>
                )}
                <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 mb-2">
                  <span>Order: {item.display_order}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleActive(item.id, item.is_active)}
                    className="h-6 w-6 p-0"
                  >
                    {item.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(item)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 