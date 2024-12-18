import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Video, Save, Trash2 } from 'lucide-react';
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import ReactPlayer from 'react-player';

interface VideoContentFormProps {
  flashcardSequenceId: string;
  onSubmitSuccess: () => void;
}

export const VideoContentForm = ({ flashcardSequenceId, onSubmitSuccess }: VideoContentFormProps) => {
  const [text, setText] = useState('');
  const [videoUrls, setVideoUrls] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddVideo = () => {
    setVideoUrls([...videoUrls, '']);
  };

  const handleRemoveVideo = (index: number) => {
    const newUrls = videoUrls.filter((_, i) => i !== index);
    setVideoUrls(newUrls);
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...videoUrls];
    newUrls[index] = value;
    setVideoUrls(newUrls);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all videos?')) {
      setText('');
      setVideoUrls(['']);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('Please enter a description');
      return;
    }

    const validVideoUrls = videoUrls.filter(url => url.trim() !== '');
    if (validVideoUrls.length === 0) {
      toast.error('Please add at least one video URL');
      return;
    }

    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.postPublic({
        endpoint: '/video-content',
        reqBody: {
          flashcardSequenceId,
          text: text.trim(),
          videoUrls: validVideoUrls
        }
      });
      toast.success('Video content added successfully');
      onSubmitSuccess();
    } catch (error) {
      console.error('Error adding video content:', error);
      toast.error('Failed to add video content');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4"
      >
        <Video className="w-5 h-5 text-orange-500 animate-pulse" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Video Content Editor
        </h3>
      </motion.div>

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

        <AnimatePresence>
          {videoUrls.map((url, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="flex gap-3 items-start">
                <div className="flex-grow space-y-4">
                  <Input
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                    className="transition-all duration-300 focus:shadow-lg"
                  />
                  {url && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <ReactPlayer
                        url={url}
                        width="100%"
                        height="100%"
                        controls
                        config={{
                          youtube: {
                            playerVars: { showinfo: 1 }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                {videoUrls.length > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveVideo(index)}
                    className="p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Minus className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div 
        className="flex justify-between items-center pt-4 border-t"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleAddVideo}
            className="transition-all duration-200 hover:shadow-md bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </Button>
          
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="transition-all duration-200 hover:shadow-md bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-w-[120px] transition-all duration-200 hover:shadow-md bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Saving...
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Content
            </>
          )}
        </Button>
      </motion.div>
    </Card>
  );
};