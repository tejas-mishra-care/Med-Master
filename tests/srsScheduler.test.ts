import { computeNextReview } from '../lib/srsScheduler';

// Unit tests for the SuperMemo 2 (SM-2) scheduling algorithm implementation.
// These tests verify that the computeNextReview function correctly calculates
// the next review interval, easiness factor (efactor), and repetition count
// based on the user's rating (quality) of a flashcard.
describe('computeNextReview (SM-2)', () => {
  // Test case: Initial review with a good quality rating (4).
  // Initial review, quality 4 (good)
  test('should compute next review for first review with quality 4', () => {
    const result = computeNextReview({ efactor: 2.5, interval: 0, repetition: 0, quality: 4 });
    expect(result.nextInterval).toBe(1);
    expect(result.nextEfactor).toBe(2.5);
    expect(result.nextRepetition).toBe(1);
    expect(result.nextReviewDate instanceof Date).toBe(true);
  });

  // Test case: Second review with a perfect quality rating (5).
  // Second review, quality 5 (perfect)
  test('should compute next review for second review with quality 5', () => {
    const result = computeNextReview({ efactor: 2.5, interval: 1, repetition: 1, quality: 5 });
    expect(result.nextInterval).toBe(6);
    expect(result.nextEfactor).toBe(2.6); // Efactor increases: 2.5 + (0.1 - (5-3)*0.08 + (5-3)*0.02) = 2.5 + (0.1 - 0.16 + 0.04) = 2.5 + (-0.02) = 2.48 -> clamped to >= 1.3
    // SM-2 formula: new_ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    // new_ef = 2.5 + (0.1 - (5-5)*(0.08 + (5-5)*0.02)) = 2.5 + (0.1 - 0*...) = 2.6
    // The above comment had an error, the formula is `ef + (0.1 - (5-quality)*(0.08+(5-quality)*0.02))` simplified for >=3 quality
    // Let's re-calculate based on the actual SM-2 algorithm often cited:
    // If quality >= 3: new EF = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    // For quality = 5: new EF = 2.5 + (0.1 - (5-5)*(0.08 + (5-5)*0.02)) = 2.5 + (0.1 - 0 * ...) = 2.6
    expect(result.nextEfactor).toBeCloseTo(2.6); // Using toBeCloseTo for float comparisons
    expect(result.nextRepetition).toBe(2);
    expect(result.nextReviewDate instanceof Date).toBe(true);
  });


  // Test case: Review with a quality rating of 3 (difficult but correct).
  // Review with quality 3 (difficult but correct)
  test('should compute next review with quality 3', () => {
    const result = computeNextReview({ efactor: 2.5, interval: 6, repetition: 2, quality: 3 });
    // new EF = 2.5 + (0.1 - (5-3)*(0.08 + (5-3)*0.02)) = 2.5 + (0.1 - 2*(0.08 + 2*0.02)) = 2.5 + (0.1 - 2*(0.08 + 0.04)) = 2.5 + (0.1 - 2*0.12) = 2.5 + (0.1 - 0.24) = 2.5 - 0.14 = 2.36
    expect(result.nextEfactor).toBeCloseTo(2.36);
    // Next interval: previous_interval * new_efactor = 6 * 2.36 = 14.16 (rounded down typically in implementations)
    expect(result.nextInterval).toBe(14); // Or 15 depending on rounding, let's assume Math.round or similar
    expect(result.nextRepetition).toBe(3);
    expect(result.nextReviewDate instanceof Date).toBe(true);
  });

  // Test case: Review with a quality rating less than 3 (failure).
  // Review with quality < 3 (fail)
  test('should reset repetition and interval for quality less than 3', () => {
    const result = computeNextReview({ efactor: 2.5, interval: 14, repetition: 3, quality: 2 });
    expect(result.nextInterval).toBe(1);
    // EF should decrease: new_ef = ef + (0.1 - (5-quality)*(0.08 + (5-quality)*0.02))
    // For quality 2: new_ef = 2.5 + (0.1 - (5-2)*(0.08 + (5-2)*0.02)) = 2.5 + (0.1 - 3*(0.08 + 3*0.02)) = 2.5 + (0.1 - 3*(0.08 + 0.06)) = 2.5 + (0.1 - 3*0.14) = 2.5 + (0.1 - 0.42) = 2.5 - 0.32 = 2.18
    expect(result.nextEfactor).toBeCloseTo(2.18);
    expect(result.nextRepetition).toBe(0);
    expect(result.nextReviewDate instanceof Date).toBe(true);
  });

  // Test case: Verify that the easiness factor does not drop below the minimum threshold (1.3).
  // EFactor should not go below 1.3
  test('should enforce minimum efactor of 1.3', () => {
     // Start with low efactor and low quality
    const result = computeNextReview({ efactor: 1.4, interval: 1, repetition: 0, quality: 0 });
    // new EF = 1.4 + (0.1 - (5-0)*(0.08 + (5-0)*0.02)) = 1.4 + (0.1 - 5*(0.08 + 5*0.02)) = 1.4 + (0.1 - 5*(0.08 + 0.1)) = 1.4 + (0.1 - 5*0.18) = 1.4 + (0.1 - 0.9) = 1.4 - 0.8 = 0.6
    // Should be clamped to 1.3
    expect(result.nextEfactor).toBeCloseTo(1.3);
    expect(result.nextInterval).toBe(1);
    expect(result.nextRepetition).toBe(0);
  });

});