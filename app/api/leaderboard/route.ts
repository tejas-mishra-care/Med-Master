import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabaseClient'; // Adjust import path as needed
import { type NextRequest } from 'next/server';

let cachedLeaderboard: any[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 60 * 1000; // 60 seconds
// Define a simple in-memory cache with a TTL (Time To Live).
// In a production environment, consider using a persistent caching solution like Redis.

export async function GET(req: NextRequest) {
  // Get the server-side Supabase client instance.
  const supabase = getServerSupabase(req);

  // Get the current authenticated user's ID.
  // This is used to find the user's rank in the leaderboard.
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // Check if a cached leaderboard exists and is still valid (within the CACHE_TTL).
  // If cached data is available and not expired, return it directly to reduce database load.
  // This is a simple in-memory cache and will reset when the server restarts.
  // Check cache
  if (cachedLeaderboard && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    console.log('Returning cached leaderboard');
    // Find user rank in cached data
    const userRank = userId ? cachedLeaderboard.findIndex(entry => entry.user_id === userId) + 1 : null;
    return NextResponse.json({ leaderboard: cachedLeaderboard.slice(0, 20), userRank });
  }

  // If no valid cache, fetch all quiz results from the database, ordered by score.
  // Fetch data from DB
  const { data: leaderboardData, error } = await supabase
    .from('quiz_results')
    .select('user_id, score')
    .order('score', { ascending: false });

  if (error) {
    // Log and return an error response if fetching fails.
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }

  // Aggregate scores per user (assuming quiz_results has multiple entries per user)
  // Sum up scores for each user as they might have taken multiple quizzes.
  const aggregatedScores: { [key: string]: number } = {};
  leaderboardData.forEach(result => {
    if (aggregatedScores[result.user_id]) {
      aggregatedScores[result.user_id] += result.score;
    } else {
      aggregatedScores[result.user_id] = result.score;
    }
  });

  // Convert the aggregated scores object into an array of objects and sort by total score in descending order.
  // Convert to array and sort
  const sortedLeaderboard = Object.entries(aggregatedScores)
    .map(([user_id, total_score]) => ({ user_id, total_score }))
    .sort((a, b) => b.total_score - a.total_score);

  // Store the newly fetched and aggregated leaderboard data in the in-memory cache with the current timestamp.
  // Cache the result
  cachedLeaderboard = sortedLeaderboard;
  cacheTimestamp = Date.now();

  // Find the rank of the current authenticated user in the sorted leaderboard.
  // If the user is not authenticated (userId is null), userRank will remain null.
  // Find user rank
  const userRank = userId ? sortedLeaderboard.findIndex(entry => entry.user_id === userId) + 1 : null;

  // Return the top 20 entries from the sorted leaderboard and the current user's rank.
  return NextResponse.json({ leaderboard: sortedLeaderboard.slice(0, 20), userRank });
}