import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseClient'; // Adjust the import path as necessary
import { SRSCard } from '@/lib/types'; // Adjust the import path as necessary

// --- Professor Authorization Check ---
// This is a placeholder authorization check. In a real application,
// you would implement a robust method to verify a user's role (e.g., 'professor')
// based on data stored in your profiles table or a dedicated roles system.
// Example: Check if the user's email domain matches a known list of professor domains,
// or query the database to see if the user's profile has a 'role' field set to 'professor'.
const isProfessor = (email: string | undefined): boolean => {
  // Example: authorize if email domain is '@medschool.edu'
  return email?.endsWith('@medschool.edu') || false;
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = getServerSupabase(req);
  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // --- GET Endpoint: List SRS Cards ---
  // This endpoint fetches SRS cards. The implementation here fetches all cards,
  // but you would typically want to filter this based on user, subject, tags, etc.
  // Add authorization if only professors can list all cards, or filter by user if fetching user's cards
  const { data: cards, error } = await supabase.from('srs_cards').select('*');

  if (error) {
    console.error('Error fetching SRS cards:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(cards);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // --- POST Endpoint: Create New SRS Card ---
  // This endpoint handles the creation of new SRS cards.
  const supabase = getServerSupabase(req);
  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.user.email) {
    // Ensure the user is authenticated before proceeding
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Authorization check: Only professors can create SRS cards
  if (!isProfessor(user.user.email)) {
    // Apply the professor authorization check
    return NextResponse.json({ error: 'Unauthorized: Only professors can create SRS cards' }, { status: 403 });
  }

  const cardData: Partial<SRSCard> = await req.json();

  // Validate required fields
  if (!cardData.front || !cardData.back || !cardData.subject) {
    // Ensure necessary fields are provided in the request body
    return NextResponse.json({ error: 'Missing required fields: front, back, subject' }, { status: 400 });
  }

  // Add the user_id of the creator (professor)
  // This links the created card to the professor who created it.
  cardData.user_id = user.user.id;

  // Insert the new SRS card into the 'srs_cards' table
  const { data: newCard, error } = await supabase
    .from('srs_cards')
    .insert([cardData])
    .select('*')
    // Select the newly created card data and return a single object
    .single();

  if (error) {
    console.error('Error creating SRS card:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the created card with a 201 Created status code
  return NextResponse.json(newCard, { status: 201 });
}