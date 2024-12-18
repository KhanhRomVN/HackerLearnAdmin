import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LoadBalancerService } from '@/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { HelpCircle, Save } from 'lucide-react';

interface TrueFalseContentFormProps {
  flashcardSequenceId: string;
  onSubmitSuccess: () => void;
}

export const TrueFalseContentForm = ({ flashcardSequenceId, onSubmitSuccess }: TrueFalseContentFormProps) => {
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (correctAnswer === null) {
      toast.error('Please select the correct answer');
      return;
    }

    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.postPublic({
        endpoint: '/true-false-content',
        reqBody: {
          flashcardSequenceId,
          question,
          correctAnswer
        }
      });
      toast.success('True/False content added successfully');
      onSubmitSuccess();
    } catch (error) {
      console.error('Error adding true/false content:', error);
      toast.error('Failed to add true/false content');
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
          True/False Question Editor
        </h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
          className="min-h-[100px] border-indigo-200 focus:border-indigo-500"
        />

        <RadioGroup
          value={correctAnswer?.toString()}
          onValueChange={(value) => setCorrectAnswer(value === 'true')}
          className="space-y-2 p-4 bg-indigo-50 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="true" />
            <Label htmlFor="true">True</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="false" />
            <Label htmlFor="false">False</Label>
          </div>
        </RadioGroup>

        <motion.div 
          className="flex justify-end pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={!question.trim() || correctAnswer === null || isSubmitting}
            className="min-w-[120px] transition-all duration-200 hover:shadow-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
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
      </motion.div>
    </Card>
  );
};