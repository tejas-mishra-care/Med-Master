import moment from 'moment';

// Interfaces to define the structure of review results and input arguments

interface ReviewResult {
  nextInterval: number;
  nextEfactor: number;
  nextRepetition: number;
  nextReviewDate: string; // ISO 8601 string
}

interface ComputeNextReviewArgs {
  efactor: number;
  interval: number;
  repetition: number;
  quality: number; // Rating from 0 to 5
}


/**
 * Computes the next review interval and parameters based on the SM-2 algorithm.
 * @param {ComputeNextReviewArgs} args - Arguments for the computation.
 * @returns {ReviewResult} - The computed next review parameters and date.
 */
export function computeNextReview({
  efactor,
  interval,
  repetition,
  quality,
}: ComputeNextReviewArgs): ReviewResult {
  let nextEfactor = efactor;
  let nextInterval = interval;
  let nextRepetition = repetition;
  

  if (quality < 3) {
    // Incorrect answer or difficult recall
    nextRepetition = 0;
    nextInterval = 1;

  } else {
    // Correct answer
    if (nextRepetition === 0) {
      nextInterval = 1;
    } else if (nextRepetition === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(nextInterval * nextEfactor);
    }


    nextRepetition++;

    // Update efactor
    nextEfactor = nextEfactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Enforce minimum efactor

    if (nextEfactor < 1.3) {
      nextEfactor = 1.3;
    }
  }


  // Ensure interval is at least 1
  if (nextInterval < 1) {
      nextInterval = 1;
  }

  // Calculate next review date
  const nextReviewDate = moment().add(nextInterval, 'days').toISOString();


  return {
    nextInterval,
    nextEfactor,
    nextRepetition,
    nextReviewDate,
  };
}

// Example cases to test the SM-2 implementation
/*
// Example cases:

// Case 1: First review, quality 5
const result1 = computeNextReview({ efactor: 2.5, interval: 0, repetition: 0, quality: 5 });
console.log("Case 1 (First review, quality 5):", result1);
// Expected: { nextInterval: 1, nextEfactor: 2.6, nextRepetition: 1, nextReviewDate: ... }

// Case 2: Second review, quality 4
const result2 = computeNextReview({ efactor: 2.6, interval: 1, repetition: 1, quality: 4 });
console.log("Case 2 (Second review, quality 4):", result2);
// Expected: { nextInterval: 6, nextEfactor: 2.52, nextRepetition: 2, nextReviewDate: ... }

// Case 3: Third review, quality 3
const result3 = computeNextReview({ efactor: 2.52, interval: 6, repetition: 2, quality: 3 });
console.log("Case 3 (Third review, quality 3):", result3);
// Expected: { nextInterval: Math.round(6 * 2.52) = 15, nextEfactor: 2.34, nextRepetition: 3, nextReviewDate: ... }

// Case 4: Review with quality 2 (incorrect recall)
const result4 = computeNextReview({ efactor: 2.34, interval: 15, repetition: 3, quality: 2 });
console.log("Case 4 (Incorrect recall, quality 2):", result4);
// Expected: { nextInterval: 1, nextEfactor: 2.34, nextRepetition: 0, nextReviewDate: ... }

// Case 5: Review with quality 0 (completely incorrect)
const result5 = computeNextReview({ efactor: 2.34, interval: 1, repetition: 0, quality: 0 });
console.log("Case 5 (Completely incorrect, quality 0):", result5);
// Expected: { nextInterval: 1, nextEfactor: 2.34, nextRepetition: 0, nextReviewDate: ... }

// Case 6: Review with quality 5 after a few repetitions
const result6 = computeNextReview({ efactor: 2.8, interval: 30, repetition: 5, quality: 5 });
console.log("Case 6 (Quality 5 after repetitions):", result6);
// Expected: { nextInterval: Math.round(30 * 2.8) = 84, nextEfactor: 2.9, nextRepetition: 6, nextReviewDate: ... }
*/