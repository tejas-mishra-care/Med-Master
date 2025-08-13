// lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types'; // Assuming you have a types.ts generated from your schema

let browserSupabase: SupabaseClient<Database> | null = null;
 // Keep a single instance in the browser to avoid re-creating the client

/**
 * Get a Supabase client instance for use in the browser.
 * This client uses the public anon key and handles user authentication.
 */
export function getBrowserSupabase(): SupabaseClient<Database> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  if (!browserSupabase) {
    browserSupabase = createClient<Database>(
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
export function getServerSupabase(req?: any, res?: any): SupabaseClient<Database> {
  // Pseudocode: In a real application, you would securely pass the service role key
  // This example assumes it's available via environment variable on the server.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing Supabase service role key or URL');
    // Fallback or throw an error depending on your desired behavior
    return getBrowserSupabase(); // Or throw new Error('Missing service role key');
  }

  // You might configure cookie handling here for auth on serverless functions
  // const options = res ? { global: { headers: { cookie: req.headers.cookie } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, cookieOptions: { domain: '.yourdomain.com', path: '/', sameSite: 'Lax', secure: true } } : {};

  return createClient<Database>(
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
  // Explicitly cast to Profile type if needed and not handled by Database type
  return data;
}

/**
 * Example typed helper: Upsert a user's profile.
 * @param profile - The profile data to upsert.
 */
export async function upsertProfile(profile: Database['public']['Tables']['profiles']['Insert']) {
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
  // Explicitly cast to Profile type if needed
  return data;
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