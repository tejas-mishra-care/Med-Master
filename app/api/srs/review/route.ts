import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { computeNextReview } from '@/lib/srsScheduler';
import { Database } from '@/lib/database.types'; // Assuming you have your Supabase types here

export async function POST(req: NextRequest) {
  // Extract necessary data from the request body: user_id, card_id, and quality rating.
  const { user_id, card_id, quality } = await req.json();

  // Create a Supabase client configured for server-side use within a Route Handler.
  // This client uses the user's cookies to authenticate.
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Get the authenticated user's session information.
  const { data: { user } } = await supabase.auth.getUser();

  // Validate authentication and user ID
  // Check if a user is logged in and if the user_id in the request matches the authenticated user's ID.
  // This prevents users from submitting reviews for other users.
  if (!user || user.id !== user_id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Fetch existing SRS review or initialize
  // Try to retrieve an existing review record for this user and card from the database.
  const { data: existingReview, error: fetchError } = await supabase
    .from('srs_reviews')
    .select('*')
    .eq('user_id', user_id)
    .eq('card_id', card_id)
    .single();

  // Handle errors during the fetch process, specifically ignoring the 'no rows found' error (PGRST116).
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means 'no rows found'
    console.error('Error fetching SRS review:', fetchError);
    return NextResponse.json({ message: 'Error fetching review' }, { status: 500 });
  }

  // Initialize SRS parameters (efactor, interval, repetition) based on whether an existing review was found.
  // These are the starting values for the SM-2 algorithm calculation.
  let initialEfactor = 2.5;
  let initialInterval = 0; // Days
  let initialRepetition = 0;

  if (existingReview) {
    // If an existing review is found, use its current parameters.
    initialEfactor = existingReview.efactor;
    initialInterval = existingReview.interval;
    initialRepetition = existingReview.repetition;
  }

  // Compute next schedule
  // Use the imported computeNextReview function (SM-2 algorithm) to calculate the next review date
  // and updated SRS parameters based on the user's quality rating and the current state.
  const { nextInterval, nextEfactor, nextRepetition, nextReviewDate } = computeNextReview({
    efactor: initialEfactor,
    interval: initialInterval,
    repetition: initialRepetition,
    quality: quality
  });

  // Upsert the SRS review
  // Insert or update the SRS review record in the database with the newly computed schedule.
  // `onConflict: 'user_id, card_id'` ensures that if a record for this user and card already exists, it's updated instead of inserting a new one.
  const { data, error: upsertError } = await supabase
    .from('srs_reviews')
    .upsert(
      {
        user_id: user_id,
        card_id: card_id,
        quality: quality,
        efactor: nextEfactor,
        interval: nextInterval,
        repetition: nextRepetition,
        next_review: nextReviewDate.toISOString(),
        last_reviewed: new Date().toISOString(),
      },
      { onConflict: 'user_id, card_id' }
    )
    .select()
    .single(); // Select the updated/inserted row.

  // Handle any errors during the upsert process.
  if (upsertError) {
    console.error('Error upserting SRS review:', upsertError);
    return NextResponse.json({ message: 'Error saving review' }, { status: 500 });
  }

  // Return the updated SRS parameters to the client.
  // This allows the client-side UI to reflect the new schedule or update its state accordingly.
  return NextResponse.json({
    next_review: data.next_review,
    efactor: data.efactor,
    interval: data.interval,
  });
}