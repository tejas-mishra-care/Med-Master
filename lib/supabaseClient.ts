// lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let browserSupabase: SupabaseClient | null = null;
 // Keep a single instance in the browser to avoid re-creating the client

/**
 * Get a Supabase client instance for use in the browser.
 * This client uses the public anon key and handles user authentication.
 */
export function getBrowserSupabase(): SupabaseClient {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  if (!browserSupabase) {
  browserSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return browserSupabase;
}

/**
 * Get a Supabase client instance for use on the server with the service role key.
 * This should only be used in secure server-side environments (e.g., API routes, serverless functions).
 * Avoid exposing the service role key directly in client-side code.
 * The service role key bypasses Row Level Security (RLS).
 *
 * @param req - The incoming request object (optional, for context/headers)
 * @param res - The outgoing response object (optional, for cookies)
 */
export function getServerSupabase(req?: any, res?: any): SupabaseClient {
  // Safety: ensure this helper is only called on the server. Calling it in the
  // browser risks leaking the service role key.
  if (typeof window !== 'undefined') {
    throw new Error('getServerSupabase() must only be called on the server (Node/Server Components / API routes).');
  }

  // In production/dev server environments, require the service role key and URL.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in server environment. Set these in your server .env.');
  }

  // You might configure cookie handling here for auth on serverless functions
  // const options = res ? { global: { headers: { cookie: req.headers.cookie } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, cookieOptions: { domain: '.yourdomain.com', path: '/', sameSite: 'Lax', secure: true } } : {};

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
    // options
  );
}

// -- Typed Helper Examples --

/**
 * Example typed helper: Fetch a user's profile.
 * @param userId - The ID of the user.
 * @returns The user's profile or null if not found.
 */
export async function fetchProfile(userId: string) {
  const supabase = getBrowserSupabase(); // or getServerSupabase depending on context
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data as any;
}

/**
 * Example helper: Upsert a user's profile.
 * @param profile - The profile data to upsert.
 */
export async function upsertProfile(profile: any) {
  const supabase = getBrowserSupabase(); // or getServerSupabase depending on context
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile:', error);
    // Handle error appropriately
  }
  return data as any;
}

/**
 * Helper snippet for theme persistence.
 * Assumes you have a 'theme' column in your 'profiles' table.
 */
export async function updateProfileTheme(userId: string, theme: string) {
  const supabase = getBrowserSupabase(); // or getServerSupabase depending on context
  const { error } = await supabase
    .from('profiles')
    .update({ theme: theme })
    .eq('id', userId);

  if (error) {
    console.error('Error updating theme:', error);
    // Handle error appropriately
  }
  // No return value needed for update operations
}


/*
// Example Usage - Client Side:
import { getBrowserSupabase } from '../lib/supabaseClient';

const supabase = getBrowserSupabase();

async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  console.log('User:', data.user);
}

// Example Usage - Server Side (in an API route / serverless function):
import { getServerSupabase } from '../../lib/supabaseClient';

export async function GET(req: Request) {
  const supabase = getServerSupabase(); // Pass req, res if using auth helpers

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(profiles), { status: 200 });
}

*/