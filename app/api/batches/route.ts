import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseClient'; // Adjust import path as needed
import { v4 as uuidv4 } from 'uuid';
import { generateJoinCode } from '@/lib/utils'; // Assume a utility to generate join codes
import { enforceRateLimit } from '@/lib/rateLimit'; // Assume a rate limit utility

// Placeholder for professor authorization logic
const isProfessor = (userId: string) => {
  // Implement actual check, e.g., based on user profile or email domain
  console.warn('Professor authorization check is a placeholder.');
  return true; // TEMPORARY: Always allow for now
};

// Placeholder for batch membership check
const isBatchMember = async (userId: string, batchId: string) => {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('batch_members')
    .select('id')
    .eq('batch_id', batchId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error('Error checking batch membership:', error);
    return false;
  }

  return !!data;
};


export async function POST(request: Request) {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, ...payload } = await request.json();

  try {
    switch (action) {
      case 'create': {
        if (!isProfessor(user.id)) {
          return NextResponse.json({ error: 'Forbidden: Professor role required' }, { status: 403 });
        }
        const { name, expiry_date } = payload;
        const joinCode = generateJoinCode(); // Implement this utility

        const { data, error } = await supabase
          .from('batches')
          .insert({
            id: uuidv4(),
            name,
            join_code: joinCode,
            created_by: user.id,
            expiry_date: expiry_date || null,
          })
          .select('id, join_code')
          .single();

        if (error) throw error;

        // Automatically add creator as a member
        await supabase
          .from('batch_members')
          .insert({
            id: uuidv4(),
            batch_id: data.id,
            user_id: user.id,
            joined_at: new Date().toISOString(),
          });


        return NextResponse.json(data, { status: 201 });
      }

      case 'join': {
        // Apply rate limit per IP/user to join attempts
        const rateLimitResult = await enforceRateLimit({ userId: user.id, key: 'batch_join', limit: 5, window: 60 * 60 }); // 5 attempts per hour
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
        }

        const { joinCode } = payload;
        if (!joinCode) {
          return NextResponse.json({ error: 'Join code is required' }, { status: 400 });
        }

        const { data: batchData, error: batchError } = await supabase
          .from('batches')
          .select('id')
          .eq('join_code', joinCode)
          .is('expiry_date', null) // Consider expiry logic here
          .single();

        if (batchError) {
          if (batchError.code === 'PGRST116') { // No rows found
             return NextResponse.json({ error: 'Invalid or expired join code' }, { status: 404 });
          }
          throw batchError;
        }

        const batchId = batchData.id;

        // Check if already a member
        const alreadyMember = await isBatchMember(user.id, batchId);
        if (alreadyMember) {
             return NextResponse.json({ batchId, joined: false, message: 'Already a member' }, { status: 200 });
        }

        const { error: memberError } = await supabase
          .from('batch_members')
          .insert({
            id: uuidv4(),
            batch_id: batchId,
            user_id: user.id,
            joined_at: new Date().toISOString(),
          });

        if (memberError) throw memberError;

        return NextResponse.json({ batchId, joined: true }, { status: 200 });
      }

       case 'post': {
        if (!isProfessor(user.id)) {
          return NextResponse.json({ error: 'Forbidden: Professor role required' }, { status: 403 });
        }
        const { batchId, content, file_urls } = payload;
         if (!batchId || !content) {
           return NextResponse.json({ error: 'Batch ID and content are required' }, { status: 400 });
         }

         // Optional: Verify batch exists
         const { data: batchExists, error: batchError } = await supabase
           .from('batches')
           .select('id')
           .eq('id', batchId)
           .single();

         if (batchError) {
           return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
         }

        const { data, error } = await supabase
          .from('batch_posts')
          .insert({
            id: uuidv4(),
            batch_id: batchId,
            created_by: user.id,
            content,
            file_urls: file_urls || [], // Assuming file_urls is an array of strings
          })
          .select('*')
          .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
    const supabase = getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('id');

    if (!batchId) {
        return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    // Ensure user is a member of the batch to view content
    const isMember = await isBatchMember(user.id, batchId);
     if (!isMember) {
         return NextResponse.json({ error: 'Forbidden: Not a member of this batch' }, { status: 403 });
     }


    try {
        // Fetch posts
        const { data: posts, error: postsError } = await supabase
            .from('batch_posts')
            .select('*')
            .eq('batch_id', batchId)
            .order('created_at', { ascending: true });

        if (postsError) throw postsError;

        // Fetch members summary (minimal info)
        const { data: members, error: membersError } = await supabase
            .from('batch_members')
            .select('user_id, profiles(username)') // Assuming profiles table linked by user_id
            .eq('batch_id', batchId);

         if (membersError) throw membersError;

        // Fetch files summary (assuming file metadata is stored with posts or elsewhere)
        // This is a placeholder - actual file handling/listing depends on your storage strategy
        const files = posts
          .filter(post => post.file_urls && post.file_urls.length > 0)
          .flatMap(post => post.file_urls.map((url: string) => ({ filename: url.split('/').pop(), url }))); // Basic extraction


        return NextResponse.json({
            posts,
            members: members.map(m => ({ userId: m.user_id, username: m.profiles?.username || 'Unknown' })), // Flatten and handle potential null
            files,
            summary: {
              totalPosts: posts.length,
              totalMembers: members.length,
              totalFiles: files.length,
            }
        }, { status: 200 });

    } catch (error: any) {
         console.error('API Error fetching batch content:', error);
         return NextResponse.json({ error: error.message }, { status: 500 });
    }
}