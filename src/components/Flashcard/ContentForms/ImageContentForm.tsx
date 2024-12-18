import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  AlertCircle
} from 'lucide-react';
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { handleUploadImage } from '@/utils/uploadImageFirebaseUtil';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface ImageContentFormProps {
  flashcardSequenceId: string;
  onSubmitSuccess: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
};

export const ImageContentForm = ({ flashcardSequenceId, onSubmitSuccess }: ImageContentFormProps) => {
  const [text, setText] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [uploadingStates, setUploadingStates] = useState<boolean[]>([false]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(['']);
  const [uploadProgress, setUploadProgress] = useState<number[]>([0]);
  const [uploadQueue, setUploadQueue] = useState<number[]>([]);
  const [errors, setErrors] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cleanup function for preview URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  const handleAddImage = () => {
    setImageUrls(prev => [...prev, '']);
    setUploadingStates(prev => [...prev, false]);
    setPreviewUrls(prev => [...prev, '']);
    setUploadProgress(prev => [...prev, 0]);
    setErrors(prev => [...prev, '']);
  };

  const handleRemoveImage = (index: number) => {
    if (uploadingStates[index]) {
      toast.error('Cannot remove while uploading');
      return;
    }

    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setUploadingStates(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      if (prev[index]?.startsWith('blob:')) {
        URL.revokeObjectURL(prev[index]);
      }
      return newPreviews;
    });
    setUploadProgress(prev => prev.filter((_, i) => i !== index));
    setErrors(prev => prev.filter((_, i) => i !== index));
  };

  const validateImageUrl = (url: string): boolean => {
    const pattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i;
    return pattern.test(url);
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);

    // Validate URL
    if (value && !validateImageUrl(value)) {
      const newErrors = [...errors];
      newErrors[index] = 'Invalid image URL format';
      setErrors(newErrors);
      return;
    }

    // Clear error if valid
    const newErrors = [...errors];
    newErrors[index] = '';
    setErrors(newErrors);

    // Update preview if URL is valid
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls[index] = value;
    setPreviewUrls(newPreviewUrls);
  };

  const simulateProgress = (index: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 90) {
        clearInterval(interval);
        return;
      }
      setUploadProgress(prev => {
        const newProgress = [...prev];
        newProgress[index] = Math.min(progress, 90);
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  };

  const handleImageUpload = async (index: number, file: File) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size should not exceed 5MB');
      return;
    }

    if (uploadQueue.includes(index)) {
      toast.error('An upload is already in progress for this image');
      return;
    }

    const newUploadingStates = [...uploadingStates];
    const newPreviewUrls = [...previewUrls];
    const newImageUrls = [...imageUrls];
    const newErrors = [...errors];

    try {
      setUploadQueue(prev => [...prev, index]);
      newUploadingStates[index] = true;
      setUploadingStates(newUploadingStates);

      // Create and set preview URL
      const previewUrl = URL.createObjectURL(file);
      newPreviewUrls[index] = previewUrl;
      setPreviewUrls(newPreviewUrls);

      // Start progress simulation
      const stopProgress = simulateProgress(index);

      // Upload image
      const imageUrl = await handleUploadImage(file);
      
      if (imageUrl) {
        newImageUrls[index] = imageUrl;
        setImageUrls(newImageUrls);
        setUploadProgress(prev => {
          const newProgress = [...prev];
          newProgress[index] = 100;
          return newProgress;
        });
        newErrors[index] = '';
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('Upload failed');
      }

      stopProgress();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      newPreviewUrls[index] = '';
      newErrors[index] = 'Failed to upload image';
      setUploadProgress(prev => {
        const newProgress = [...prev];
        newProgress[index] = 0;
        return newProgress;
      });
    } finally {
      newUploadingStates[index] = false;
      setUploadingStates(newUploadingStates);
      setErrors(newErrors);
      setUploadQueue(prev => prev.filter(i => i !== index));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], index: number) => {
    if (acceptedFiles.length > 0) {
      handleImageUpload(index, acceptedFiles[0]);
    }
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('Please enter a description');
      return;
    }

    const validImageUrls = imageUrls.filter(url => url.trim() !== '');
    if (validImageUrls.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    // Check for any remaining errors
    if (errors.some(error => error)) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.postPublic({
        endpoint: '/image-content',
        reqBody: {
          flashcardSequenceId,
          text: text.trim(),
          imageUrls: validImageUrls
        }
      });
      toast.success('Image content added successfully');
      onSubmitSuccess();
    } catch (error) {
      console.error('Error adding image content:', error);
      toast.error('Failed to add image content');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter description text"
            className="min-h-[100px] resize-none transition-all duration-300 focus:shadow-lg"
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {text.length} characters
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {imageUrls.map((url, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="relative"
            >
              <Card className="p-4 space-y-4 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="relative">
                      <Input
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        placeholder="Enter image URL or drop an image"
                        disabled={uploadingStates[index]}
                        className={errors[index] ? 'border-red-500' : ''}
                      />
                      {errors[index] && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-xs mt-1 flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {errors[index]}
                        </motion.div>
                      )}
                    </div>

                    <ImageDropzone
                      onDrop={(files) => onDrop(files, index)}
                      isUploading={uploadingStates[index]}
                      previewUrl={previewUrls[index]}
                      progress={uploadProgress[index]}
                    />
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveImage(index)}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={uploadingStates[index]}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Remove image</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div 
          className="flex justify-between pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Button
            variant="outline"
            onClick={handleAddImage}
            disabled={uploadingStates.some(state => state) || isSubmitting}
            className="transition-all duration-300 hover:shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={
              uploadingStates.some(state => state) || 
              !text.trim() || 
              !imageUrls.some(url => url.trim()) ||
              errors.some(error => error) ||
              isSubmitting
            }
            className="transition-all duration-300 hover:shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Save Content
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </Card>
  );
};

interface ImageDropzoneProps {
  onDrop: (files: File[]) => void;
  isUploading: boolean;
  previewUrl: string;
  progress: number;
}

const ImageDropzone = ({ onDrop, isUploading, previewUrl, progress }: ImageDropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_IMAGE_TYPES,
    multiple: false,
    onDrop: (acceptedFiles) => onDrop(acceptedFiles),
    maxSize: MAX_FILE_SIZE
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-lg p-4
        transition-all duration-300 cursor-pointer
        ${isDragActive 
          ? 'border-primary bg-primary/5 scale-102' 
          : 'border-gray-200 hover:border-primary hover:shadow-md'
        }
        ${isUploading ? 'opacity-70' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-2">
        {previewUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full"
          >
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-48 object-contain rounded-md"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                <div className="text-white text-sm font-medium">
                  {Math.round(progress)}%
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            animate={{ scale: isDragActive ? 1.1 : 1 }}
            className="p-4"
          >
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </motion.div>
        )}
        
        <div className="text-center">
          {isUploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
              <Progress value={progress} className="w-full h-1" />
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                Drop image here or click to upload
              </p>
              <p className="text-xs text-gray-400">
                Supports: JPG, PNG, GIF, WEBP (max 5MB)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};