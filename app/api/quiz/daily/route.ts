import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseClient'; // Adjust the import path as necessary

export async function POST(req: NextRequest) {
  // API route to fetch the daily quiz for the current user (authenticated or anonymous).
  // Accepts a POST request with an optional temporary ID for anonymous users.
  // Returns the daily quiz date and the list of questions (without correct answers).
  try {
    // Get the server-side Supabase client. This client can read cookies for authentication.
    const supabase = getServerSupabase(req); // Pass req to get server-side Supabase client

    // Attempt to get the authenticated user's session.
    const { data: user } = await supabase.auth.getUser();
    const isAuthenticated = !!user?.user;

    let userId: string | null = null;
    // Determine the user ID based on authentication status.
    // If authenticated, use the user's ID.
    if (isAuthenticated) {
      userId = user.user.id;
    } else {
      // If anonymous allowed, require a client-generated temp ID
      const { tempId } = await req.json();
      if (!tempId) {
        return NextResponse.json({ error: 'Authentication required or temporary ID missing' }, { status: 401 });
      }
      userId = tempId; // Use temporary ID for anonymous users
      // Note: Further logic might be needed here or client-side
      // to handle persistence/mapping of temporary IDs for anonymous users
      // across sessions if required.
    }

    // If no user ID could be determined, return an authentication error.
    if (!userId) {
      return NextResponse.json({ error: 'Could not determine user identity' }, { status: 401 });
    }

    // Fetch the daily quiz for the current date
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    // Query the 'daily_quiz' table for today's entry.
    const { data: dailyQuiz, error: dailyQuizError } = await supabase
      .from('daily_quiz')
      .select('date, question_ids')
      .eq('date', today)
      .single();

    // If there's an error or no daily quiz found for today, return a 500 error.
    if (dailyQuizError || !dailyQuiz) {
      // Log the error for server-side debugging.
      console.error('Error fetching daily quiz:', dailyQuizError);
      return NextResponse.json({ error: 'Could not fetch daily quiz for today' }, { status: 500 });
    }

    // Fetch the questions based on the question_ids from the daily quiz
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      // Select relevant question fields. Crucially, DO NOT select 'correct_option'.
      .select('id, subject, question_text, options, tags, created_at') 
      .in('id', dailyQuiz.question_ids);

    if (questionsError || !questions) {
      // Log the error for server-side debugging.
      console.error('Error fetching questions for daily quiz:', questionsError);
      return NextResponse.json({ error: 'Could not fetch questions for the daily quiz' }, { status: 500 });
    }

    // Ensure questions are in the order specified by dailyQuiz.question_ids
    const orderedQuestions = dailyQuiz.question_ids
      .map((id: string) => questions.find(q => q.id === id))
      .filter((q: any) => q !== undefined); // Filter out any questions not found (shouldn't happen if daily_quiz is correct)

    // Return the daily quiz data and the ordered list of questions.
    // The response format includes the date and an array of question objects.
    return NextResponse.json({
      date: dailyQuiz.date,
      questions: orderedQuestions,
    });

  } catch (error) {
    // Catch any unexpected errors during the process and return a generic 500 error.
    console.error('Unexpected error in daily quiz fetch API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// Helper function to get Supabase client (assuming this exists in lib/supabaseClient.ts)
// export function getServerSupabase(req: any) {
//   // Implement your server-side Supabase client logic here
//   // This typically involves using a service role key or cookies
//   // Example (simplified):
//   const { createMiddlewareClient } = require('@supabase/auth-helpers-nextjs');
//   const res = new NextResponse(); // Create a dummy response object if not available
//   const supabase = createMiddlewareClient({ req, res });
//   return supabase;
// }