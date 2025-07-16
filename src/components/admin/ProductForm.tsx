
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileUpload } from './FileUpload';
import { X } from 'lucide-react';

interface Product {
  id?: string;
  name: string;
  price: number;
  original_price?: number;
  description: string;
  short_description?: string;
  images: string[];
  video_url?: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  slug: string;
  sku?: string;
  category_id?: string;
  specifications?: any;
  features?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

export const ProductForm = ({ product, categories, onClose, onSave }: ProductFormProps) => {
  const [formData, setFormData] = useState<Product>({
    name: '',
    price: 0,
    description: '',
    images: [],
    stock_quantity: 0,
    is_active: true,
    is_featured: false,
    slug: '',
    features: [],
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name') {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleImageUpload = (url: string) => {
    if (formData.images.length < 3) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
    } else {
      toast({
        title: "Limit reached",
        description: "You can only upload up to 3 images per product",
        variant: "destructive",
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleVideoUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      video_url: url
    }));
  };

  const removeVideo = () => {
    setFormData(prev => ({
      ...prev,
      video_url: undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        stock_quantity: Number(formData.stock_quantity),
        category_id: formData.category_id || null,
      };

      if (product?.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      onSave();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku || ''}
                onChange={(e) => handleInputChange('sku', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (UGX) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="original_price">Original Price (UGX)</Label>
              <Input
                id="original_price"
                type="number"
                value={formData.original_price || ''}
                onChange={(e) => handleInputChange('original_price', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category_id || 'all'} 
                onValueChange={(value) => handleInputChange('category_id', value === 'all' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">No Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Input
              id="short_description"
              value={formData.short_description || ''}
              onChange={(e) => handleInputChange('short_description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>

          {/* Product Images */}
          <div className="space-y-4">
            <Label>Product Images (Max 3)</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={image} 
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {formData.images.length < 3 && (
                <FileUpload
                  onUpload={handleImageUpload}
                  bucket="product-images"
                  accept="image/*"
                  type="image"
                  label=""
                />
              )}
            </div>
          </div>

          {/* Product Video */}
          <FileUpload
            onUpload={handleVideoUpload}
            bucket="product-videos"
            accept="video/*"
            type="video"
            label="Product Video (Optional)"
            currentFile={formData.video_url}
            onRemove={removeVideo}
          />

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
