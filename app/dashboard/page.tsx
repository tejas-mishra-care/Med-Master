// app/dashboard/page.tsx

import { createClient } from '@/lib/supabaseClient';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // Initialize Supabase client for server-side operations.
  const supabase = createClient();

  // Fetch the authenticated user.
  const { data: { user } } = await supabase.auth.getUser();

  // If no user is found, redirect to the login page. This protects the dashboard route.
  // In a real application, you might want to show a loading state or an error.
  if (!user) {
    redirect('/login'); // Redirect to login if not authenticated
  }

  // Fetch user profile and other dashboard data here
  // const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    // Main container for the dashboard page, providing padding and centering.
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Grid layout for quick action cards, responsive on different screen sizes. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Quick Action Card 1: Daily Quiz */}
        {/* This card provides a link to the daily quiz feature. */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Daily Quiz</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Test your knowledge with today's quiz.</p>
          <a href="/quiz/daily" className="inline-block bg-PRIMARY text-white py-2 px-4 rounded hover:bg-blue-700 transition">Start Quiz</a>
        </div>

        {/* Quick Action Card 2: SRS Review */}
        {/* This card provides a link to the spaced repetition system review feature. */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">SRS Review</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Review your spaced repetition cards.</p>
          <a href="/srs" className="inline-block bg-ACCENT text-white py-2 px-4 rounded hover:bg-teal-600 transition">Review Cards</a>
        </div>


        {/* Quick Action Card 3: AI Medical Assistant */}
        {/* This card provides a link to the AI chat assistant feature. */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">AI Medical Assistant</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Ask questions to the AI assistant.</p>
          <a href="/ai" className="inline-block bg-HIGHLIGHT text-white py-2 px-4 rounded hover:bg-yellow-600 transition">Chat with AI</a>
        </div>

        {/* Add more quick action cards as needed */}
      </div>

      {/* Placeholder for other dashboard sections */}
      {/* <div className="mt-8">
        {/* Example: Section for displaying recent user activity. */}
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        </div>
        <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Batches</h2>
      </div> */}
    </div>
  );
}