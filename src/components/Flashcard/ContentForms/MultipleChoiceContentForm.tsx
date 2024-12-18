import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Minus, Save, HelpCircle } from 'lucide-react';
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface MultipleChoiceContentFormProps {
  flashcardSequenceId: string;
  onSubmitSuccess: () => void;
}

export const MultipleChoiceContentForm = ({ flashcardSequenceId, onSubmitSuccess }: MultipleChoiceContentFormProps) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [correctOption, setCorrectOption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    } else {
      toast.error('Maximum 6 options allowed');
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctOption === options[index]) {
        setCorrectOption('');
      }
    } else {
      toast.error('Minimum 2 options required');
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('Please add at least 2 options');
      return;
    }

    if (!correctOption) {
      toast.error('Please select the correct answer');
      return;
    }

    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.postPublic({
        endpoint: '/multiple-choice-content',
        reqBody: {
          flashcardSequenceId,
          question,
          options: validOptions,
          correctOption
        }
      });
      toast.success('Multiple choice content added successfully');
      onSubmitSuccess();
    } catch (error) {
      console.error('Error adding multiple choice content:', error);
      toast.error('Failed to add multiple choice content');
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
        <HelpCircle className="w-5 h-5 text-indigo-500 animate-pulse" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Multiple Choice Question Editor
        </h3>
      </motion.div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Question</Label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            className="min-h-[100px] border-indigo-200 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">Options</Label>
          <RadioGroup value={correctOption} onValueChange={setCorrectOption}>
            <AnimatePresence>
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 group"
                >
                  <RadioGroupItem
                    value={option}
                    id={`option-${index}`}
                    className="border-2 border-indigo-200 text-indigo-600"
                    disabled={!option.trim()}
                  />
                  <div className="flex-1">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                        if (correctOption === options[index]) {
                          setCorrectOption(e.target.value);
                        }
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="border-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </RadioGroup>
        </div>
      </div>

      <motion.div 
        className="flex justify-between items-center pt-4 border-t"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="outline"
          onClick={handleAddOption}
          disabled={options.length >= 6}
          className="transition-all duration-200 hover:shadow-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>

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
              Save Question
            </>
          )}
        </Button>
      </motion.div>
    </Card>
  );
};