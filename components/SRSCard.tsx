'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Assuming you have this type defined
import { SRSReview } from '@/lib/types'; // Assuming you have this type defined

interface SRSCardProps {
  card: {
    id: string;
    front: string;
    back: string;
  };
  onReview: (cardId: string, quality: number) => Promise<SRSReview | null>;
  isLoading?: boolean;
}

// SRSCard component for displaying and reviewing individual Spaced Repetition System cards.
// It shows the front of the card first, allows revealing the back, and then provides
// buttons for the user to rate their recall quality.
export const SRSCard = ({ card, onReview, isLoading }: SRSCardProps) => {
  // State to manage whether the back of the card is revealed.
  const [revealed, setRevealed] = useState(false);
  // State to manage the loading state while submitting a review.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler for revealing the answer (the back of the card).
  const handleReveal = () => {
    setRevealed(true);
  };

  // Handler for rating the card's recall quality.
  // Takes the quality score (0-5) as input.
  const handleRate = async (quality: number) => {
    setIsSubmitting(true);
    // Call the parent's onReview function with the card ID and quality.
    await onReview(card.id, quality);
    // Reset states after the review is submitted.
    setIsSubmitting(false);
    setRevealed(false); // Reset for next card
  };

  return (
    <Card className="w-full max-w-md mx-auto flex flex-col">
      <CardHeader>
        {/* Display "Front" or "Back" based on the revealed state. */}
        <CardTitle>{revealed ? 'Back' : 'Front'}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Display the card content (front or back). */}
        <p>{revealed ? card.back : card.front}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {/* Show the "Reveal Answer" button only when the card is not revealed. */}
        {!revealed && (
          <Button onClick={handleReveal} disabled={isLoading || isSubmitting} className="w-full">
            Reveal Answer
          </Button>
        )}
        {/* Show the rating buttons when the card is revealed. */}
        {revealed && (
          <div className="flex flex-col items-center gap-2 w-full">
            <p className="text-sm text-muted-foreground mb-2">How well did you remember?</p>
            <div className="grid grid-cols-3 gap-2 w-full">
              {[0, 1, 2, 3, 4, 5].map((quality) => (
                // Button for each rating option (0-5).
                <Button
                  key={quality}
                  onClick={() => handleRate(quality)}
                  disabled={isLoading || isSubmitting}
                  className={`w-full ${
                    quality >= 3
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : quality === 0
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : ''
                  }`}
                  aria-label={`Rate ${quality} out of 5`}
                >
                  {quality}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};