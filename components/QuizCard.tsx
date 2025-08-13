'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { motion } from 'framer-motion';
// Import the Question type
import { Question } from '@/lib/types';

interface QuizCardProps {
  question: Question;
  index: number;
  selectedAnswer: string | null;
  onAnswerSelect: (questionId: string, answer: string) => void;
  showFeedback: boolean;
  correctAnswer: string | null; // Null before submission
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  // Index of the question in the quiz
  index,
  selectedAnswer,
  onAnswerSelect,
  showFeedback,
  correctAnswer,
}) => {
  const isCorrect = selectedAnswer === correctAnswer;
  // Determine feedback color based on whether feedback is shown and if the answer is correct
  const feedbackColor = showFeedback ? (isCorrect ? 'text-green-600' : 'text-red-600') : '';

  return (
    // Use Framer Motion for a subtle reveal animation
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      // Animate to full opacity and normal position
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Question {index + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Display the question text */}
          <p>{question.text}</p>
          {/* Radio group for answer selection */}
          <RadioGroup
            onValueChange={(value) => onAnswerSelect(question.id, value)}
            value={selectedAnswer || ''}
            // Disable interaction after feedback is shown
            // Apply margin top
            disabled={showFeedback}
            className="mt-4"
          >
            {Object.entries(question.options || {}).map(([key, value]) => (
              <div
                key={key}
                className={`flex items-center space-x-2 p-2 rounded-md ${
                  showFeedback && selectedAnswer === key
                    // Highlight selected answer based on correctness
                    ? isCorrect
                      ? 'bg-green-100 border border-green-500'
                      : 'bg-red-100 border border-red-500'
                    : showFeedback && key === correctAnswer
                    ? 'bg-green-100 border border-green-500'
                    : ''
                }`}
                // Keyboard navigation is handled by the RadioGroup component
              >
                <RadioGroupItem value={key} id={`${question.id}-${key}`} />
                {/* Label for the radio item, displaying option key and value */}
                <Label htmlFor={`${question.id}-${key}`}>{`${key.toUpperCase()}. ${value}`}</Label>
              </div>
            ))}
          </RadioGroup>
          {/* Display feedback message after submission */}
          {/* Apply margin top and feedback color */}
          {showFeedback && correctAnswer && (
            <p className={`mt-2 ${feedbackColor}`}>
              {isCorrect ? 'Correct!' : `Incorrect. The correct answer was ${correctAnswer.toUpperCase()}.`}
            </p>
          )}
        </CardContent>
        {/* Optional: Add CardFooter for hints or explanations later */}
        {/* <CardFooter>
          {showFeedback && question.explanation && (
            <p className="text-sm text-gray-700">{question.explanation}</p>
          )}
        </CardFooter> */}
      </Card>
    </motion.div>
  );
};