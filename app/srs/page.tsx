"use client";

import { useState, useEffect } from 'react';
import { useAuthClient } from '@/lib/auth'; // Assuming you have this hook
import SRSCard from '@/components/SRSCard'; // Assuming you will create this component
import { SRSReview } from '@/lib/types'; // Assuming you have this type
import { Button } from '@/components/ui/button'; // Assuming you use shadcn/ui or similar
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast'; // Assuming you use shadcn/ui or similar

interface DueCard {
  id: string;
  front: string;
  back: string;
}

export default function SRSPage() {
  const { user } = useAuthClient();
  const [dueCards, setDueCards] = useState<DueCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showingBack, setShowingBack] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchDueCards(user.id);
    }
  }, [user]);

  const fetchDueCards = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/srs/due?user_id=${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch due cards');
      }
      const data: DueCard[] = await res.json();
      setDueCards(data);
      setCurrentCardIndex(0);
      setShowingBack(false);
    } catch (error: any) {
      toast({
        title: 'Error fetching cards',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = () => {
    setShowingBack(true);
  };

  const handleRating = async (quality: number) => {
    if (!user?.id || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/srs/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          card_id: dueCards[currentCardIndex].id,
          quality,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      const result: SRSReview = await res.json();
      console.log('Review submitted:', result);

      // Move to next card or finish
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowingBack(false);
      } else {
        setDueCards([]); // Clear cards to show completion state
        setCurrentCardIndex(0);
        setShowingBack(false);
        toast({
          title: 'Daily reviews complete!',
          description: 'Great job completing your spaced repetition sessions.',
        });
      }

    } catch (error: any) {
      toast({
        title: 'Error submitting review',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <div className="container mx-auto p-4">Please log in to access SRS.</div>;
  }

  if (loading) {
    return <div className="container mx-auto p-4">Loading due cards...</div>;
  }

  if (dueCards.length === 0) {
    return <div className="container mx-auto p-4">No cards due for review today!</div>;
  }

  const currentCard = dueCards[currentCardIndex];
  const progressValue = ((currentCardIndex + 1) / dueCards.length) * 100;

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Spaced Repetition Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Progress value={progressValue} aria-label={`Review progress: ${currentCardIndex + 1} of ${dueCards.length}`} />
            <p className="text-center text-sm mt-2">{currentCardIndex + 1} / {dueCards.length} due today</p>
          </div>
          {currentCard && (
            <SRSCard
              front={currentCard.front}
              back={currentCard.back}
              showBack={showingBack}
            />
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {!showingBack ? (
            <Button onClick={handleReveal} className="w-full text-lg py-6">
              Reveal Answer
            </Button>
          ) : (
            <div className="flex flex-col items-center w-full">
              <p className="mb-2 text-center">How well did you remember?</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {[0, 1, 2, 3, 4, 5].map(quality => (
                  <Button
                    key={quality}
                    onClick={() => handleRating(quality)}
                    disabled={submitting}
                    className={`text-lg px-4 py-4 w-14 h-14 rounded-full ${quality >= 3 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} ${quality === 0 ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
                    aria-label={`Rate answer quality: ${quality}`}
                  >
                    {quality}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}