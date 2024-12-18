import { useState, useCallback } from 'react';
import { handleUploadImage } from '@/utils/uploadImageFirebaseUtil';
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

interface ImageUploadTooltipProps {
  courseId: string;
  currentImageUrl: string;
  onUpdate: (newImageUrl: string) => void;
}

export function ImageUploadTooltip({ 
  courseId, 
  onUpdate 
}: ImageUploadTooltipProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedImages(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (selectedImages.length === 0) return;

    setIsUploading(true);
    try {
      const imageUrl = await handleUploadImage(selectedImages[0]);
      if (imageUrl) {
        const api = new LoadBalancerService();
        const response = await api.putPublic({
          endpoint: `/course/update?id=${courseId}`,
          reqBody: {
            key: 'image_url',
            value: imageUrl
          }
        });

        if (response) {
          onUpdate(imageUrl);
          toast.success('Image updated successfully');
        }
      }
    } catch (error) {
      toast.error('Failed to update image');
    } finally {
      setIsUploading(false);
      setSelectedImages([]);
    }
  };

  return (
    <div className="absolute z-10 bg-white p-6 rounded-lg shadow-lg border w-[400px]">
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-8 
          text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-3">
          <img 
            src="/path-to-upload-icon.svg" 
            alt="Upload" 
            className="w-12 h-12 text-blue-500"
          />
          <p className="text-gray-600">
            Drop your image here, or <span className="text-blue-500">browse</span>
          </p>
          <p className="text-sm text-gray-400">
            Supports: JPG, JPEG2000, PNG
          </p>
        </div>
      </div>

      {selectedImages.length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      )}
    </div>
  );
}