
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUpload: (url: string) => void;
  bucket: string;
  accept: string;
  type: 'image' | 'video';
  label: string;
  currentFile?: string;
  onRemove?: () => void;
}

export const FileUpload = ({ 
  onUpload, 
  bucket, 
  accept, 
  type, 
  label, 
  currentFile,
  onRemove 
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(data.publicUrl);
      
      toast({
        title: "Success",
        description: `${type} uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${type}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {currentFile ? (
        <div className="relative">
          {type === 'image' ? (
            <img 
              src={currentFile} 
              alt="Preview" 
              className="w-full h-32 object-cover rounded-lg border"
            />
          ) : (
            <video 
              src={currentFile} 
              className="w-full h-32 object-cover rounded-lg border"
              controls
            />
          )}
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={onRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {type === 'image' ? (
            <Image className="mx-auto h-12 w-12 text-gray-400" />
          ) : (
            <Video className="mx-auto h-12 w-12 text-gray-400" />
          )}
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mb-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : `Upload ${type}`}
            </Button>
            <p className="text-sm text-gray-500">
              or drag and drop {type} here
            </p>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
