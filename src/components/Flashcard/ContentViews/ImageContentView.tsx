import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ChevronLeft, ChevronRight, Pencil, Save, X, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { LoadBalancerService } from "@/api";
import { toast } from "react-hot-toast";

interface ImageContent {
  id: string;
  sequence: number;
  flashcardSequenceId: string;
  text: string;
  imageUrls: string[];
}

interface ImageContentViewProps {
  content: ImageContent;
}

export function ImageContentView({ content }: ImageContentViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [text, setText] = useState(content.text);
  const [imageUrls, setImageUrls] = useState(content.imageUrls);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (isDialogOpen) {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setIsDialogOpen(false);
    }
  };

  const handleAddImage = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    if (activeIndex >= newUrls.length) {
      setActiveIndex(Math.max(0, newUrls.length - 1));
    }
  };

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.putPublic({
        endpoint: '/image-content/update',
        reqBody: {
          id: content.id,
          flashcardSequenceId: content.flashcardSequenceId,
          text,
          imageUrls: imageUrls.filter(url => url.trim() !== '')
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

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isDialogOpen]);

  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-dashed border-green-500/50 hover:border-green-500">
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            Image Content ({imageUrls.length} images)
          </span>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="hover:bg-green-100"
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
              className="space-y-4 bg-green-50 p-4 rounded-lg"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="bg-white border-green-200 focus:border-green-500"
                  placeholder="Image description"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Images</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddImage}
                    className="hover:bg-green-100"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                </div>

                {imageUrls.map((url, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative p-4 bg-white rounded-lg border border-green-200"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...imageUrls];
                            newUrls[index] = e.target.value;
                            setImageUrls(newUrls);
                          }}
                          className="flex-1 border-green-200 focus:border-green-500"
                          placeholder={`Image URL ${index + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          className="hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      {url && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'placeholder-image-url';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{text}</h3>
              
              <Tabs 
                value={activeIndex.toString()} 
                onValueChange={(value) => setActiveIndex(parseInt(value))}
                className="relative"
              >
                <TabsList className="mb-4 flex justify-center gap-2">
                  {imageUrls.map((_, index) => (
                    <TabsTrigger
                      key={index}
                      value={index.toString()}
                      className="w-2 h-2 rounded-full bg-gray-300 data-[state=active]:bg-green-500"
                    />
                  ))}
                </TabsList>

                <AnimatePresence mode="wait">
                  {imageUrls.map((imageUrl, index) => (
                    <TabsContent 
                      key={index} 
                      value={index.toString()}
                      className="relative group"
                    >
                      {activeIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="relative rounded-lg overflow-hidden aspect-video bg-gray-100">
                            <img
                              src={imageUrl}
                              alt={`${text} - Image ${index + 1}`}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                            
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 
                                           transition-opacity duration-200 bg-black/50 hover:bg-black/70"
                                >
                                  <ZoomIn className="h-4 w-4 text-white" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                                <div className="relative">
                                  <img
                                    src={imageUrl}
                                    alt={`${text} - Image ${index + 1} (Full Size)`}
                                    className="w-full h-auto"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-between p-4">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={handlePrevious}
                                      className="bg-black/50 hover:bg-black/70 text-white"
                                    >
                                      <ChevronLeft className="h-6 w-6" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={handleNext}
                                      className="bg-black/50 hover:bg-black/70 text-white"
                                    >
                                      <ChevronRight className="h-6 w-6" />
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </motion.div>
                      )}
                    </TabsContent>
                  ))}
                </AnimatePresence>

                {imageUrls.length > 1 && (
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevious}
                      className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNext}
                      className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                )}
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}