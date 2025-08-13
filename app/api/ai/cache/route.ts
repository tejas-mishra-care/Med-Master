import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/types'; // Adjust based on your types file location
import { clearCache, getCacheStatus } from '@/lib/openai'; // Assume lib/openai.ts has these functions
import { CACHE_TTL_SECONDS } from '@/lib/constants'; // Assuming CACHE_TTL_SECONDS is in constants.ts

// Helper function to determine if user is a professor (example - replace with actual logic)
// In a real application, this logic should be robust and potentially use roles stored in the database
async function isProfessor(userId: string): Promise<boolean> {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
  return profile?.role === 'professor'; // Adjust role check based on your schema
}

// GET handler for checking cache status by hash
// This endpoint allows checking if a specific prompt/context combination is cached
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hash = searchParams.get('hash');

  if (!hash) {
    return NextResponse.json({ error: 'Missing hash parameter' }, { status: 400 });
  }

  // Use the getCacheStatus function from the openai library
  const cachedData = getCacheStatus(hash); // Use the function from lib/openai

  // Check if data exists in cache and is still within the TTL
  if (cachedData && (Date.now() - cachedData.timestamp) / 1000 < CACHE_TTL_SECONDS) {
    return NextResponse.json({ status: 'cached', data: cachedData });
  } else {
    // If data is not in cache or has expired
    return NextResponse.json({ status: 'miss' });
  }
}

// POST handler for cache actions (currently only 'clear')
// This endpoint allows authorized users to clear the AI cache
export async function POST(req: NextRequest) {
  const { action, hash } = await req.json();
  // Get the authenticated user
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (action === 'clear') {
    // Check if user is authorized to clear cache (e.g., professor)
    // This authorization check is crucial for security
    const userIsProfessor = await isProfessor(user.id);
    if (!userIsProfessor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Call the clearCache function from the openai library
    clearCache(); // Use the function from lib/openai
    // TODO: Documentation for migrating to a persistent cache like Redis for production
    return NextResponse.json({ success: true, message: 'Cache cleared' });
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}