import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { LoadBalancerService } from "@/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface TextContent {
  id: string;
  sequence: number;
  flashcardSequenceId: string;
  texts: string[];
}

interface TextContentViewProps {
  content: TextContent;
}

export function TextContentView({ content }: TextContentViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [texts, setTexts] = useState(content.texts);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTextChange = (index: number, value: string) => {
    const newTexts = [...texts];
    newTexts[index] = value;
    setTexts(newTexts);
  };

  const formatText = (text: string) => {
    return text
      .replace(/<B>(.*?)<\/B>/g, '<strong>$1</strong>')
      .replace(/<U>(.*?)<\/U>/g, '<u>$1</u>')
      .replace(/<C>(.*?)<\/C>/g, '<span class="text-blue-500">$1</span>');
  };

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.putPublic({
        endpoint: '/text-content/update',
        reqBody: {
          id: content.id,
          flashcardSequenceId: content.flashcardSequenceId,
          texts
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


  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-dashed border-blue-500/50 hover:border-blue-500">
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            Text Content
          </span>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="hover:bg-blue-100"
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
              className="space-y-4"
            >
              {texts.map((text, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Textarea
                    value={text}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    className="min-h-[100px] transition-all duration-200 focus:shadow-lg"
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {texts.map((text, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="prose max-w-none"
                >
                  <p 
                    className="text-gray-700 leading-relaxed text-lg"
                    dangerouslySetInnerHTML={{ __html: formatText(text) }}
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