import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil, Save, HelpCircle } from "lucide-react";
import { LoadBalancerService } from "@/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ShortAnswerContent {
  id: string;
  sequence: number;
  flashcardSequenceId: string;
  question: string;
  suggestedAnswers: string; // Changed from string[] to string
  correctAnswer: string;
}

interface ShortAnswerContentViewProps {
  content: ShortAnswerContent;
}

export function ShortAnswerContentView({ content }: ShortAnswerContentViewProps) {
  const [answer, setAnswer] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheck = () => {
    setIsChecked(true);
  };

  const handleReset = () => {
    setAnswer("");
    setIsChecked(false);
    setShowHint(false);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const api = new LoadBalancerService();
      await api.putPublic({
        endpoint: '/short-answer-content',
        reqBody: {
          id: content.id,
          question: editedContent.question,
          suggestedAnswers: editedContent.suggestedAnswers,
          correctAnswer: editedContent.correctAnswer
        }
      });
      toast.success('Content updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCorrect = answer.toLowerCase().trim() === content.correctAnswer.toLowerCase().trim();

  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-dashed border-orange-500/50 hover:border-orange-500">
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-500">
              Short Answer Question
            </span>
          </div>
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
            <div className="flex gap-2">
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
                onClick={handleSave}
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
              <Input
                value={editedContent.question}
                onChange={(e) => setEditedContent({ ...editedContent, question: e.target.value })}
                placeholder="Enter question"
                className="border-orange-200 focus:border-orange-500"
              />
              <Input
                value={editedContent.suggestedAnswers}
                onChange={(e) => setEditedContent({ 
                  ...editedContent, 
                  suggestedAnswers: e.target.value
                })}
                placeholder="Enter suggested answers (comma-separated)"
                className="border-orange-200 focus:border-orange-500"
              />
              <Input
                value={editedContent.correctAnswer}
                onChange={(e) => setEditedContent({ ...editedContent, correctAnswer: e.target.value })}
                placeholder="Enter correct answer"
                className="border-orange-200 focus:border-orange-500"
              />
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
              <div className="space-y-2">
                <Input
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={isChecked}
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>

              <div className="space-y-4">
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
                        <span>Incorrect. Try again!</span>
                      </>
                    )}
                  </motion.div>
                )}

                <div className="flex space-x-2">
                  {!isChecked ? (
                    <>
                      <Button onClick={handleCheck} variant="outline" className="hover:bg-orange-100">
                        Check Answer
                      </Button>
                      <Button
                        onClick={() => setShowHint(true)}
                        variant="outline"
                        className="hover:bg-orange-100"
                        disabled={showHint}
                      >
                        Show Hint
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleReset} variant="outline" className="hover:bg-orange-100">
                      Try Again
                    </Button>
                  )}
                </div>

                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-gray-600"
                  >
                    <span className="font-medium">Suggested answers: </span>
                    {content.suggestedAnswers}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}