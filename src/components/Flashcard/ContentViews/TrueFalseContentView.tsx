import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil, Save, HelpCircle } from "lucide-react";
import { LoadBalancerService } from "@/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TrueFalseContent {
  id: string;
  sequence: number;
  flashcardSequenceId: string;
  question: string;
  correctAnswer: boolean;
}

interface TrueFalseContentViewProps {
  content: TrueFalseContent;
}

export function TrueFalseContentView({ content }: TrueFalseContentViewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
  };

  const handleCheck = () => {
    setIsChecked(true);
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setIsChecked(false);
  };

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.putPublic({
        endpoint: '/true-false-content/update',
        reqBody: {
          id: content.id,
          flashcardSequenceId: content.flashcardSequenceId,
          question: editedContent.question,
          correctAnswer: editedContent.correctAnswer
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

  const isCorrect = selectedAnswer === content.correctAnswer;

  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-dashed border-indigo-500/50 hover:border-indigo-500">
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-500" />
            <span className="text-sm font-medium text-gray-500">
              True/False Question
            </span>
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="hover:bg-indigo-100"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(content);
                }}
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
              <Textarea
                value={editedContent.question}
                onChange={(e) => setEditedContent({ ...editedContent, question: e.target.value })}
                placeholder="Enter your question"
                className="min-h-[100px] border-indigo-200 focus:border-indigo-500"
              />
              <RadioGroup
                value={editedContent.correctAnswer.toString()}
                onValueChange={(value) => setEditedContent({ ...editedContent, correctAnswer: value === 'true' })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="edit-true" />
                  <Label htmlFor="edit-true">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="edit-false" />
                  <Label htmlFor="edit-false">False</Label>
                </div>
              </RadioGroup>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {content.question}
              </h3>

              <div className="flex space-x-4">
                <Button
                  variant={selectedAnswer === true ? "default" : "outline"}
                  onClick={() => handleAnswer(true)}
                  disabled={isChecked}
                  className={`flex-1 ${
                    isChecked && content.correctAnswer
                      ? "bg-green-500 hover:bg-green-600"
                      : isChecked && selectedAnswer === true
                      ? "bg-red-500 hover:bg-red-600"
                      : "hover:bg-indigo-100"
                  }`}
                >
                  True
                </Button>
                <Button
                  variant={selectedAnswer === false ? "default" : "outline"}
                  onClick={() => handleAnswer(false)}
                  disabled={isChecked}
                  className={`flex-1 ${
                    isChecked && !content.correctAnswer
                      ? "bg-green-500 hover:bg-green-600"
                      : isChecked && selectedAnswer === false
                      ? "bg-red-500 hover:bg-red-600"
                      : "hover:bg-indigo-100"
                  }`}
                >
                  False
                </Button>
              </div>

              {isChecked && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center space-x-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                >
                  {isCorrect ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5" />
                      <span>Incorrect. The correct answer is: {content.correctAnswer ? 'True' : 'False'}</span>
                    </>
                  )}
                </motion.div>
              )}

              <div className="flex space-x-2">
                {!isChecked ? (
                  <Button 
                    onClick={handleCheck} 
                    disabled={selectedAnswer === null}
                    className="hover:bg-indigo-100"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button 
                    onClick={handleReset}
                    variant="outline"
                    className="hover:bg-indigo-100"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}