import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseClient'; // Adjust the import path as necessary
import { QuizResult } from '@/lib/types'; // Adjust the import path as necessary

// This route handles the submission of quiz results, specifically for the daily quiz in Stage 1.
// It receives the user's answers, grades them, saves the result to the database, and returns the score and details.

// Helper function to determine if the user is authenticated or has a temp ID
async function authenticateUser(req: NextRequest): Promise<string | null> {
  // Authenticates the user. Attempts to get the authenticated user from Supabase first.
  // If no authenticated user is found, it checks for a temporary client-generated ID in the request body.
  // In a production environment, the temporary ID handling should be more robust and secure.
  const supabase = getServerSupabase(req); // Assuming getServerSupabase takes req for cookies/headers
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return user.id;
  }

  // Check for a temporary client-generated ID in the request body
  // This is a simplified example; a real implementation might use a cookie or query param
  // This allows unauthenticated users to take the daily quiz, but their results won't be linked to a persistent profile initially.
  const body = await req.json().catch(() => null);
  if (body?.tempUserId) {
    // Basic validation for temp ID format if needed.
    // For Stage 1 MVP, we trust the client-provided temp ID, but this should be reviewed for production.
    return body.tempUserId;
  }

  return null; // No valid authentication or temp ID
}

// POST /api/quiz/submit
// Handles the quiz submission logic.

export async function POST(req: NextRequest): Promise<NextResponse> {
  const userId = await authenticateUser(req);

  if (!userId) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    // Parse the request body containing the quiz ID and user's answers.
    const { quizId, answers, tempUserId } = await req.json();

    // Validate the request payload.
    if (!quizId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ message: 'Invalid request payload' }, { status: 400 });
    }

    const supabase = getServerSupabase(req);


    // Fetch the correct answers for the quiz questions
    // This is a simplified fetch; in a real app, join daily_quiz with questions
    const { data: dailyQuizData, error: dailyQuizError } = await supabase
      .from('daily_quiz')
      .select('question_ids')
      .eq('id', quizId) // Assuming quizId is the daily_quiz row id
      .single();

    if (dailyQuizError || !dailyQuizData) {
      console.error('Error fetching daily quiz:', dailyQuizError);
      return NextResponse.json({ message: 'Could not retrieve quiz data' }, { status: 500 });
    }

    // Fetch the actual questions based on the IDs from the daily quiz data to get correct options.
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_option')
      .in('id', dailyQuizData.question_ids);

    if (questionsError || !questionsData) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json({ message: 'Could not retrieve question data' }, { status: 500 });
    }

    // Create a map of question IDs to their correct answers for quick lookup.
    const correctAnswersMap = questionsData.reduce((acc, question) => {
      acc[question.id] = question.correct_option;
      return acc;
    }, {} as Record<string, string>);

    let score = 0;
    // Determine the total number of questions from the daily quiz data.
    const total = dailyQuizData.question_ids.length;
    const details: { questionId: string; userAnswer: string; correctAnswer: string | null; correct: boolean }[] = [];

    for (const answer of answers) {
      const questionId = answer.questionId;
      const userAnswer = answer.selectedOption;
      const correctAnswer = correctAnswersMap[questionId];
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        score++;
      }

      details.push({
        questionId,
        userAnswer,
        correctAnswer,
        correct: isCorrect,
      });
    }

    // Prepare the quiz result data to be saved to the 'quiz_results' table.
    const quizResult: Omit<QuizResult, 'id' | 'created_at'> = {
      user_id: userId,
      quiz_type: 'daily', // Or determine dynamically
      quiz_date: new Date().toISOString().split('T')[0], // Assuming daily quiz for today
      score,
      total,
      details,
    };

    // Insert the quiz result into the database.
    const { data: savedResult, error: saveError } = await supabase
      .from('quiz_results')
      .insert([quizResult])
      .select()
      .single(); // Use select().single() to get the inserted row

    if (saveError || !savedResult) {
      console.error('Error saving quiz results:', saveError);
      return NextResponse.json({ message: 'Could not save quiz results' }, { status: 500 });
    }

    // Return the saved result details to the client.
    return NextResponse.json({
      score: savedResult.score,
      total: savedResult.total,
      details: savedResult.details,
      timestamp: savedResult.created_at,
    }, { status: 200 });

  } catch (error) {
    // Catch any unexpected errors and return a generic internal server error response.
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}