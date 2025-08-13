import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseClient'; // Adjust the import path as necessary
import { Profile } from '@/lib/types'; // Adjust the import path as necessary

// This API route handles fetching and updating user profile information.
// It is designed to be used from the client-side of the Next.js application.

export async function GET(req: NextRequest) {
  const { supabase, response } = getServerSupabase(req);

  // Ensure the user is authenticated
  // getServerSupabase handles setting up the cookie for auth

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.user.id;

  // Fetch the profile data for the authenticated user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  // This route handles updating the user's profile.
  // It supports updating the username and theme preference.
  const { supabase, response } = getServerSupabase(req);
  const body = await req.json();
  const { username, theme } = body;

  // Ensure the user is authenticated before allowing updates
  // getServerSupabase handles setting up the cookie for auth

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.user.id;

  // Validate that the username is not empty if it's being updated
  if (username !== undefined && (!username || username.trim() === '')) {
    return NextResponse.json({ error: 'Username cannot be empty' }, { status: 400 });
  }

  const updateData: Partial<Profile> = {};
  // Only include fields in the update if they were provided in the request body
  if (username !== undefined) {
    updateData.username = username;
  }
  if (theme !== undefined) {
    updateData.theme = theme;
  }

  // If no fields are provided for update, return a success message indicating no changes were made
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ message: 'No changes requested' }, { status: 200 });
  }

  const { data, error } = await supabase
    // Perform the update on the 'profiles' table for the authenticated user's ID
    .from('profiles')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }

  // Return a success message upon successful update
  return NextResponse.json({ message: 'Profile updated successfully' });
}