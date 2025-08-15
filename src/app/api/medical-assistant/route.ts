import { NextResponse } from 'next/server';
import { getMedicalExplanation } from '@/ai/flows/medical-assistant';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, contextText, userRole } = body || {};

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Invalid input. Expected { prompt: string, contextText?: string, userRole?: string }' },
        { status: 400 }
      );
    }

    const result = await getMedicalExplanation({ prompt, contextText, userRole });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to generate medical explanation' },
      { status: 500 }
    );
  }
}
