// app/api/cron/generate_daily_quiz/route.ts

import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

// FILE: /app/api/cron/generate_daily_quiz/route.ts

/**
 * @file API route for generating the daily quiz.
 * This route is intended to be called by a cron job (e.g., GitHub Actions, Vercel Cron).
 * It programmatically selects questions and updates the 'daily_quiz' table.
 */

export async function GET() {
  try {
    // Initialize Supabase client for server-side operations.
    // This uses the 'cookies' method which is suitable for Server Components
    // or API routes that need access to request headers/cookies for auth context,
    // although for a cron job triggered externally, service role would be more typical.
    // TODO: For a truly secure cron, consider using the service role key directly
    // with proper authentication/secret token check in the API route itself.
    const supabase = createServerComponentClient<Database>({ cookies });

    // Fetch all questions to pick from
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, subject, difficulty'); // Include difficulty for potential future use in selection

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    if (!questions || questions.length === 0) {
      console.warn('No questions available to generate daily quiz.');
      return NextResponse.json({ message: 'No questions available' }, { status: 200 });
    }

    // Selection Logic: Pick balanced questions by subject
    const questionIds: string[] = [];
    const subjectCounts: { [key: string]: number } = {};
    // Using a map to group questions by subject for easier selection
    const questionsBySubject: { [key: string]: typeof questions } = {};

    // Group questions by subject
    questions.forEach(q => {
      // Ensure subject is treated as a string, handle potential null/undefined
      if (!q.subject) {
          console.warn(`Question ${q.id} has no subject and will be skipped for subject-based selection.`);
          return;
      }
      if (!questionsBySubject[q.subject!]) {
        questionsBySubject[q.subject!] = [];
      }
      questionsBySubject[q.subject!].push(q);
    });

    // Subjects to prioritize (can be defined elsewhere if needed)
    // For now, prioritize all subjects present in the question pool
    const prioritizedSubjects = Object.keys(questionsBySubject);

    // Try to pick one question from each prioritized subject
    for (const subject of prioritizedSubjects) {
      if (questionsBySubject[subject].length > 0 && questionIds.length < 5) {
        // Pick a random question from this subject
        const randomIndex = Math.floor(Math.random() * questionsBySubject[subject].length);
        // splice removes the question from the source array to prevent re-selection
        const [pickedQuestion] = questionsBySubject[subject].splice(randomIndex, 1);
        questionIds.push(pickedQuestion.id);
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      }
    }

    // Fill the remaining slots randomly from the remaining questions
    const remainingQuestions = Object.values(questionsBySubject).flat();
    // Ensure remaining questions from subjects already picked are included
    // (The splice above already handles this)
    while (questionIds.length < 5 && remainingQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
      const [pickedQuestion] = remainingQuestions.splice(randomIndex, 1);
      questionIds.push(pickedQuestion.id);
      subjectCounts[pickedQuestion.subject!] = (subjectCounts[pickedQuestion.subject!] || 0) + 1;
    }

    // Ensure we have exactly 5 questions (handle case with < 5 total questions)
    if (questionIds.length < 5) {
        console.warn(`Only ${questionIds.length} questions available to create daily quiz.`);
    }

    // Get the current date in YYYY-MM-DD format for the daily quiz entry key
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Upsert the daily_quiz entry
    // Upsert is used so if the cron runs multiple times for the same day, it updates the existing entry.
    const { data, error: upsertError } = await supabase
      .from('daily_quiz')
      .upsert(
        {
          date: today,
          question_ids: questionIds,
        },
        { onConflict: 'date' } // Update if an entry for today already exists
      );

    if (upsertError) {
      // Log the specific Supabase error
      console.error('Error upserting daily quiz:', upsertError);
      return NextResponse.json({ error: 'Failed to save daily quiz' }, { status: 500 });
    }

    console.log(`Daily quiz generated for ${today} with questions: ${questionIds.join(', ')}`);

    return NextResponse.json({ message: 'Daily quiz generated successfully', date: today, question_ids: questionIds }, { status: 200 });

  } catch (error) {
    // Catch any unexpected errors during execution
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/*
  DOCUMENTATION: GitHub Actions Workflow for Scheduling

  GitHub Actions Workflow for Scheduling (Example):

  # .github/workflows/daily_quiz_cron.yml
  name: Generate Daily Quiz

  on:
    schedule:
      # Runs every day at 02:00 IST (assuming server is UTC, need to adjust if needed)
      # Equivalent to 20:30 UTC the previous day.
      - cron: '30 20 * * *'

  jobs:
    generate:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout code
          uses: actions/checkout@v4

        - name: Set up Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '20' # Or your project's Node version
            cache: 'pnpm'

        - name: Install dependencies
          run: pnpm install --frozen-lockfile

        - name: Trigger Daily Quiz Generation API
          # This step calls the API route to generate the quiz.
          # Ensure NEXT_PUBLIC_APP_URL is configured as a Repository Secret in GitHub Actions.
          # It should be the URL of your deployed application (e.g., https://medmaster.vercel.app).
          # Add a secret token (CRON_JOB_TOKEN) for security and verify it in the API route.
          # The API route currently doesn't check for CRON_JOB_TOKEN, which should be added
          # before deploying this workflow in a production environment.
          run: |
            curl -X GET "${{ secrets.NEXT_PUBLIC_APP_URL }}/api/cron/generate_daily_quiz" \
            -H "Authorization: Bearer ${{ secrets.CRON_JOB_TOKEN }}" # Add token check in API
*/
