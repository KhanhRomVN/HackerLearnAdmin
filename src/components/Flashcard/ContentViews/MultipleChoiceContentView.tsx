import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MultipleChoiceContent {
  id: string;
  sequence: number;
  flashcardSequenceId: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface MultipleChoiceContentViewProps {
  content: MultipleChoiceContent;
}

export function MultipleChoiceContentView({ content }: MultipleChoiceContentViewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isChecked, setIsChecked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCheck = () => {
    setIsAnimating(true);
    setIsChecked(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleReset = () => {
    setSelectedAnswer("");
    setIsChecked(false);
  };

  const isCorrect = selectedAnswer === content.correctAnswer;

  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-dashed border-indigo-500/50 hover:border-indigo-500">
      <CardHeader className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
        <motion.h3 
          className="text-lg font-semibold text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {content.question}
        </motion.h3>
      </CardHeader>
      <CardContent className="p-6">
        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-4"
        >
          <AnimatePresence>
            {content.options.map((option, index) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative flex items-center space-x-3 p-4 rounded-lg transition-all duration-200",
                  isChecked && option === content.correctAnswer && "bg-green-50 border-2 border-green-200",
                  isChecked && selectedAnswer === option && option !== content.correctAnswer && "bg-red-50 border-2 border-red-200",
                  !isChecked && "hover:bg-indigo-50 border-2 border-transparent"
                )}
              >
                <RadioGroupItem
                  value={option}
                  id={`option-${index}`}
                  disabled={isChecked}
                  className="border-2 border-indigo-200 text-indigo-600"
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-grow cursor-pointer text-gray-700"
                >
                  {option}
                </Label>
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-4"
                  >
                    {option === content.correctAnswer ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      selectedAnswer === option && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </RadioGroup>

        <motion.div 
          className="flex justify-end mt-6 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!isChecked ? (
            <Button
              onClick={handleCheck}
              disabled={!selectedAnswer}
              className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200"
            >
              <Check className="h-4 w-4 mr-2" />
              Check Answer
            </Button>
          ) : (
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-indigo-200 hover:border-indigo-300 text-indigo-600 hover:text-indigo-700"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </motion.div>

        <AnimatePresence>
          {isChecked && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "mt-6 p-4 rounded-lg flex items-center gap-3",
                isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}
            >
              {isCorrect ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Correct! Well done!</span>
                </>
              ) : (
                <>
                  <X className="h-5 w-5" />
                  <span>Incorrect. The correct answer is: {content.correctAnswer}</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}