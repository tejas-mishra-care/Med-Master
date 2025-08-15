import { NextResponse } from 'next/server';
import { generateQuizQuestions } from '@/ai/flows/generate-quiz-questions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { notes, numQuestions } = body || {};

    if (typeof notes !== 'string' || typeof numQuestions !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input. Expected { notes: string, numQuestions: number }' },
        { status: 400 }
      );
    }

    const result = await generateQuizQuestions({ notes, numQuestions });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to generate quiz questions' },
      { status: 500 }
    );
  }
}
