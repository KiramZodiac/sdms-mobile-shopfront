
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileUpload } from './FileUpload';

interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
}

interface CategoryFormProps {
  category: Category | null;
  onClose: () => void;
  onSave: () => void;
}

export const CategoryForm = ({ category, onClose, onSave }: CategoryFormProps) => {
  const [formData, setFormData] = useState<Category>({
    name: '',
    slug: '',
    is_active: true,
  });
  const [imageUrl, setImageUrl] = useState('');
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (category) {
      setFormData(category);
      if (category.image_url) {
        setImageUrl(category.image_url);
      }
    }
  }, [category]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (field: keyof Category, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name') {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const removeImage = () => {
    setImageUrl('');
    setFormData(prev => ({ ...prev, image_url: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categoryData = {
        ...formData,
        image_url: imageUrl || null,
      };

      if (category?.id) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }

      onSave();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="auto-generated"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Category Image */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label>Category Image</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use_url"
                  checked={useUrlInput}
                  onCheckedChange={setUseUrlInput}
                />
                <Label htmlFor="use_url" className="text-sm">Use URL instead</Label>
              </div>
            </div>

            {useUrlInput ? (
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {imageUrl && (
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={() => {
                        toast({
                          title: "Invalid URL",
                          description: "The image URL is not valid",
                          variant: "destructive",
                        });
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <FileUpload
                onUpload={handleImageUpload}
                bucket="category-images"
                accept="image/*"
                type="image"
                label=""
                currentFile={imageUrl}
                onRemove={removeImage}
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
