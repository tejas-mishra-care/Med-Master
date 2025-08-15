'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Clock, CheckCircle, XCircle, RotateCcw, Calendar } from 'lucide-react';

interface SRSCard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview: Date;
  interval: number;
  repetitions: number;
  easeFactor: number;
}

const mockCards: SRSCard[] = [
  {
    id: '1',
    question: 'What is the mechanism of action of beta-blockers?',
    answer: 'Beta-blockers work by blocking beta-adrenergic receptors, reducing heart rate, blood pressure, and cardiac contractility.',
    difficulty: 'medium',
    nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    interval: 1,
    repetitions: 3,
    easeFactor: 2.5
  },
  {
    id: '2',
    question: 'What are the key ECG findings in atrial fibrillation?',
    answer: 'Irregularly irregular rhythm, no discernible P waves, and variable ventricular rate.',
    difficulty: 'easy',
    nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    interval: 3,
    repetitions: 5,
    easeFactor: 2.8
  },
  {
    id: '3',
    question: 'What is the first-line treatment for asthma?',
    answer: 'Inhaled corticosteroids (ICS) for long-term control and short-acting beta-agonists (SABA) for acute symptom relief.',
    difficulty: 'hard',
    nextReview: new Date(Date.now() - 24 * 60 * 60 * 1000), // Overdue
    interval: 7,
    repetitions: 2,
    easeFactor: 2.2
  }
];

export default function SrsPage() {
  const [cards, setCards] = useState<SRSCard[]>(mockCards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const dueCards = cards.filter(card => card.nextReview <= new Date());
  const totalCards = cards.length;
  const completedCards = cards.filter(card => card.nextReview > new Date()).length;

  const currentCard = dueCards[currentCardIndex];

  const handleDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!currentCard) return;

    const updatedCards = [...cards];
    const cardIndex = updatedCards.findIndex(c => c.id === currentCard.id);
    
    if (cardIndex !== -1) {
      const card = updatedCards[cardIndex];
      let newInterval = card.interval;
      let newEaseFactor = card.easeFactor;

      switch (difficulty) {
        case 'easy':
          newInterval = Math.max(card.interval * 2, 1);
          newEaseFactor = Math.min(card.easeFactor + 0.15, 2.5);
          break;
        case 'medium':
          newInterval = Math.max(card.interval * 1.5, 1);
          break;
        case 'hard':
          newInterval = Math.max(card.interval * 0.5, 1);
          newEaseFactor = Math.max(card.easeFactor - 0.2, 1.3);
          break;
      }

      updatedCards[cardIndex] = {
        ...card,
        interval: newInterval,
        repetitions: card.repetitions + 1,
        easeFactor: newEaseFactor,
        nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000)
      };

      setCards(updatedCards);
    }

    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      setReviewMode(false);
      setCurrentCardIndex(0);
      setShowAnswer(false);
    }
  };

  const startReview = () => {
    if (dueCards.length > 0) {
      setReviewMode(true);
      setCurrentCardIndex(0);
      setShowAnswer(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (reviewMode && currentCard) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-8 h-8" />
            SRS Review
          </h1>
          <Badge variant="outline">
            {currentCardIndex + 1} of {dueCards.length}
          </Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question</CardTitle>
              <Badge className={getDifficultyColor(currentCard.difficulty)}>
                {currentCard.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">{currentCard.question}</p>
            {showAnswer && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Answer:</h3>
                <p>{currentCard.answer}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          {!showAnswer ? (
            <Button onClick={() => setShowAnswer(true)} size="lg">
              Show Answer
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => handleDifficulty('hard')} 
                variant="destructive" 
                size="lg"
                className="gap-2"
              >
                <XCircle className="w-4 h-4" />
                Hard
              </Button>
              <Button 
                onClick={() => handleDifficulty('medium')} 
                variant="outline" 
                size="lg"
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                Medium
              </Button>
              <Button 
                onClick={() => handleDifficulty('easy')} 
                size="lg"
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Easy
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BrainCircuit className="w-8 h-8" />
          SRS Review
        </h1>
        <Button onClick={startReview} disabled={dueCards.length === 0} size="lg">
          Start Review ({dueCards.length} due)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Total Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCards}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedCards}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Due Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dueCards.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(completedCards / totalCards) * 100} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {completedCards} of {totalCards} cards completed ({Math.round((completedCards / totalCards) * 100)}%)
          </p>
        </CardContent>
      </Card>

      {dueCards.length === 0 && (
        <Card className="mt-6">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">No cards are due for review today.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
