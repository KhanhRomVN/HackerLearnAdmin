import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, Save, Plus, Minus } from 'lucide-react';
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface ShortAnswerContentFormProps {
  flashcardSequenceId: string;
  onSubmitSuccess: () => void;
}

export const ShortAnswerContentForm = ({ flashcardSequenceId, onSubmitSuccess }: ShortAnswerContentFormProps) => {
  const [question, setQuestion] = useState('');
  const [suggestedAnswers, setSuggestedAnswers] = useState<string[]>(['']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSuggestedAnswer = () => {
    setSuggestedAnswers([...suggestedAnswers, '']);
  };

  const handleRemoveSuggestedAnswer = (index: number) => {
    const newAnswers = suggestedAnswers.filter((_, i) => i !== index);
    setSuggestedAnswers(newAnswers);
  };

  const handleSuggestedAnswerChange = (index: number, value: string) => {
    const newAnswers = [...suggestedAnswers];
    newAnswers[index] = value;
    setSuggestedAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!correctAnswer.trim()) {
      toast.error('Please enter a correct answer');
      return;
    }

    const validSuggestedAnswers = suggestedAnswers.filter(answer => answer.trim() !== '');
    if (validSuggestedAnswers.length === 0) {
      toast.error('Please add at least one suggested answer');
      return;
    }

    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.postPublic({
        endpoint: '/short-answer-content',
        reqBody: {
          flashcardSequenceId,
          question,
          suggestedAnswers: validSuggestedAnswers.join(', '), // Convert array to string
          correctAnswer
        }
      });
      toast.success('Content created successfully');
      onSubmitSuccess();
    } catch (error) {
      toast.error('Failed to create content');
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
        <HelpCircle className="w-5 h-5 text-orange-500 animate-pulse" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Short Answer Question Editor
        </h3>
      </motion.div>

      <div className="space-y-4">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
          className="border-orange-200 focus:border-orange-500"
        />

        <AnimatePresence>
          {suggestedAnswers.map((answer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-2"
            >
              <Input
                value={answer}
                onChange={(e) => handleSuggestedAnswerChange(index, e.target.value)}
                placeholder={`Suggested answer ${index + 1}`}
                className="border-orange-200 focus:border-orange-500"
              />
              {suggestedAnswers.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSuggestedAnswer(index)}
                  className="hover:bg-red-100"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <Input
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="Enter the correct answer"
          className="border-orange-200 focus:border-orange-500"
        />
      </div>

      <motion.div 
        className="flex justify-between items-center pt-4 border-t"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="outline"
          onClick={handleAddSuggestedAnswer}
          className="transition-all duration-200 hover:shadow-md bg-gradient-to-r from-orange-500 to-yellow-600 text-white hover:from-orange-600 hover:to-yellow-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Suggested Answer
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
              Save Content
            </>
          )}
        </Button>
      </motion.div>
    </Card>
  );
};