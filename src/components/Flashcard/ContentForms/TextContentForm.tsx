import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Type, Save, Trash2, Bold, Underline } from 'lucide-react';
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface TextContentFormProps {
  flashcardSequenceId: string;
  onSubmitSuccess: () => void;
}

export const TextContentForm = ({ flashcardSequenceId, onSubmitSuccess }: TextContentFormProps) => {
  const [texts, setTexts] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddText = () => {
    setTexts([...texts, '']);
  };

  const handleRemoveText = (index: number) => {
    const newTexts = texts.filter((_, i) => i !== index);
    setTexts(newTexts);
  };

  const handleTextChange = (index: number, value: string) => {
    const newTexts = [...texts];
    newTexts[index] = value;
    setTexts(newTexts);
  };

  const applyFormatting = (index: number, tag: string) => {
    const textarea = document.querySelector(`#textarea-${index}`) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
      const newValue = 
        textarea.value.substring(0, start) +
        `<${tag}>${selectedText}</${tag}>` +
        textarea.value.substring(end);
      
      handleTextChange(index, newValue);
      
      // Restore cursor position after formatting
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + tag.length + 2,
          end + tag.length + 2
        );
      }, 0);
    }
  };

  const handleSubmit = async () => {
    if (texts.every(text => text.trim() === '')) {
      toast.error('Please enter at least one paragraph');
      return;
    }

    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.postPublic({
        endpoint: '/text-content',
        reqBody: {
          flashcardSequenceId,
          texts: texts.filter(text => text.trim() !== '')
        }
      });
      toast.success('Text content added successfully');
      onSubmitSuccess();
    } catch (error) {
      console.error('Error adding text content:', error);
      toast.error('Failed to add text content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all paragraphs?')) {
      setTexts(['']);
    }
  };

  return (
    <Card className="p-6 space-y-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4"
      >
        <Type className="w-5 h-5 text-primary animate-pulse" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Text Content Editor
        </h3>
      </motion.div>

      <AnimatePresence>
        {texts.map((text, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group relative"
          >
            <div className="flex gap-3 items-start">
              <div className="flex-grow">
                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <span className="font-medium">Paragraph {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting(index, 'B')}
                    className="h-8 px-2 hover:bg-blue-100 transition-colors"
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting(index, 'U')}
                    className="h-8 px-2 hover:bg-blue-100 transition-colors"
                    title="Underline"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormatting(index, 'C')}
                    className="h-8 px-2 hover:bg-blue-100 transition-colors"
                    title="Color"
                  >
                    <span className="text-xs font-bold">C</span>
                  </Button>
                </div>
                <Textarea
                  id={`textarea-${index}`}
                  value={text}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  placeholder="Enter your content here..."
                  className="min-h-[100px] transition-all duration-300 focus:shadow-lg focus:border-blue-500 resize-y"
                />
              </div>
              {texts.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveText(index)}
                  className="p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <Minus className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div 
        className="flex justify-between items-center pt-4 border-t"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleAddText}
            className="transition-all duration-200 hover:shadow-md bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Paragraph
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