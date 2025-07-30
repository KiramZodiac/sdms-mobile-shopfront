
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

// Helper function to compress images for Samsung phones
const compressImage = (file: File, maxSizeMB: number = 5): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      const maxWidth = 1920;
      const maxHeight = 1080;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Start with high quality, reduce if file is still too large
      let quality = 0.8;
      const compress = () => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              if (compressedFile.size / 1024 / 1024 > maxSizeMB && quality > 0.3) {
                quality -= 0.1;
                compress();
              } else {
                resolve(compressedFile);
              }
            } else {
              resolve(file); // Fallback to original file
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      compress();
    };
    
    img.onerror = () => resolve(file); // Fallback to original file
    img.src = URL.createObjectURL(file);
  });
};

// Helper function to convert HEIC to JPEG for Samsung phones
const convertHeicToJpeg = async (file: File): Promise<File> => {
  // Check if the file is HEIC/HEIF
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || 
                 file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
  
  if (!isHeic) {
    return file;
  }
  
  try {
    // Try to load the image directly - modern browsers may support HEIC
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const convertedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(convertedFile);
          } else {
            reject(new Error('Failed to convert HEIC image'));
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.onerror = () => {
        reject(new Error('HEIC format not supported on this device. Please use JPG or PNG format.'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  } catch (error) {
    throw new Error('HEIC format not supported on this device. Please use JPG or PNG format.');
  }
};

// Helper function to validate file
const validateFile = (file: File, type: 'image' | 'video'): string | null => {
  const maxSizeMB = type === 'image' ? 15 : 50; // 15MB for images, 50MB for videos
  const fileSizeMB = file.size / 1024 / 1024;
  
  if (fileSizeMB > maxSizeMB) {
    return `File size too large. Maximum ${maxSizeMB}MB allowed.`;
  }
  
  if (type === 'image') {
    const validImageTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'image/heic', 'image/heif' // Samsung formats
    ];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
    
    const isValidType = validImageTypes.includes(file.type) || 
                       validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      return 'Invalid image format. Please use JPG, PNG, GIF, WebP, or HEIC formats.';
    }
  } else if (type === 'video') {
    const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
    const validExtensions = ['.mp4', '.mpeg', '.mov', '.avi'];
    
    const isValidType = validVideoTypes.includes(file.type) || 
                       validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      return 'Invalid video format. Please use MP4, MPEG, MOV, or AVI.';
    }
  }
  
  return null;
};

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
  const [processingFile, setProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setProcessingFile(true);
    
    try {
      // Validate file first
      const validationError = validateFile(file, type);
      if (validationError) {
        throw new Error(validationError);
      }

      let processedFile = file;
      
      // Process images (convert HEIC and compress if needed) - Samsung phone fixes
      if (type === 'image') {
        try {
          // Convert HEIC to JPEG if needed (Samsung phones)
          processedFile = await convertHeicToJpeg(file);
          
          // Compress if file is too large (Samsung cameras produce large files)
          if (processedFile.size / 1024 / 1024 > 5) {
            toast({
              title: "Processing",
              description: "Compressing large image...",
            });
            processedFile = await compressImage(processedFile);
          }
        } catch (conversionError) {
          throw new Error(`Image processing failed: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`);
        }
      }
      
      setProcessingFile(false);
      
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      // Upload with retry mechanism for better reliability
      let uploadError: any = null;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, processedFile);

        if (!error) {
          uploadError = null;
          break;
        }

        uploadError = error;
        retryCount++;

        // Retry for any error (since storage is public)
        if (retryCount <= maxRetries) {
          console.log(`Upload failed, retrying... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        } else {
          break; // No more retries
        }
      }

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        console.error('Upload error details:', {
          message: uploadError.message,
          name: uploadError.name
        });
        
        if (uploadError.message.includes('size') || uploadError.message.includes('413')) {
          throw new Error('File size too large for upload.');
        } else if (uploadError.message.includes('type') || uploadError.message.includes('415')) {
          throw new Error('File type not supported.');
        } else if (uploadError.message.includes('network') || uploadError.message.includes('fetch')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else {
          throw new Error(`Upload failed: ${uploadError.message || 'Unknown error occurred'}`);
        }
      }

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
      const errorMessage = error instanceof Error ? error.message : `Failed to upload ${type}`;
      
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProcessingFile(false);
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

  const isProcessing = uploading || processingFile;

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
              disabled={isProcessing}
              className="mb-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              {processingFile ? 'Processing...' : 
               uploading ? 'Uploading...' : 
               `Upload ${type}`}
            </Button>
            <p className="text-sm text-gray-500">
              or drag and drop {type} here
            </p>
            {type === 'image' && (
              <p className="text-xs text-gray-400 mt-1">
                Supports JPG, PNG, GIF, WebP, HEIC formats (max 15MB)
              </p>
            )}
            {type === 'video' && (
              <p className="text-xs text-gray-400 mt-1">
                Supports MP4, MPEG, MOV, AVI formats (max 50MB)
              </p>
            )}
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            capture={type === 'image' ? 'environment' : undefined}
          />
        </div>
      )}
    </div>
  );
};
