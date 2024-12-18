import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LoadBalancerService } from "@/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ReactPlayer from 'react-player';

interface VideoContent {
  id: string;
  sequence: number;
  flashcardSequenceId: string;
  text: string;
  videoUrls: string[];
}

interface VideoContentViewProps {
  content: VideoContent;
}

export function VideoContentView({ content }: VideoContentViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content.text);
  const [videoUrls, setVideoUrls] = useState(content.videoUrls);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.putPublic({
        endpoint: '/video-content/update',
        reqBody: {
          id: content.id,
          flashcardSequenceId: content.flashcardSequenceId,
          text,
          videoUrls: videoUrls.filter(url => url.trim() !== '')
        }
      });
      toast.success('Content updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVideo = () => {
    setVideoUrls([...videoUrls, '']);
  };

  const handleRemoveVideo = (index: number) => {
    const newUrls = videoUrls.filter((_, i) => i !== index);
    setVideoUrls(newUrls);
    if (activeIndex >= newUrls.length) {
      setActiveIndex(Math.max(0, newUrls.length - 1));
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-dashed border-orange-500/50 hover:border-orange-500">
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            Video Content ({videoUrls.length} videos)
          </span>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="hover:bg-orange-100"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="hover:bg-red-100"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="hover:bg-green-100"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 bg-orange-50 p-4 rounded-lg"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="bg-white border-orange-200 focus:border-orange-500"
                  placeholder="Video description"
                />
              </div>

              <div className="space-y-4">
                {videoUrls.map((url, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative p-4 bg-white rounded-lg border border-orange-200"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...videoUrls];
                            newUrls[index] = e.target.value;
                            setVideoUrls(newUrls);
                          }}
                          className="flex-1 border-orange-200 focus:border-orange-500"
                          placeholder={`Video URL ${index + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVideo(index)}
                          className="hover:bg-red-100"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
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
                  </motion.div>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddVideo}
                  className="w-full hover:bg-orange-100"
                >
                  Add Video
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{text}</h3>
              {videoUrls.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative aspect-video rounded-lg overflow-hidden bg-gray-100"
                >
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}