'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-mobile";

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error(`Error fetching leaderboard: ${response.statusText}`);
        }
        const data = await response.json();
        setLeaderboard(data.leaderboard);
        setMyRank(data.myRank || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading Leaderboard...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Leaderboard</h1>

      {isMobile && myRank && (
        <Card className="mb-4 border-2 border-accent">
          <CardHeader>
            <CardTitle>My Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="font-semibold">{myRank.rank}. {myRank.username}</span>
              <span className="text-lg font-bold text-primary">{myRank.score} pts</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {leaderboard.length === 0 ? (
              <p className="text-center text-gray-500">No scores yet.</p>
            ) : (
              leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex justify-between items-center py-3 px-4 border-b last:border-b-0 ${entry.isCurrentUser && !isMobile ? 'bg-yellow-100 dark:bg-yellow-900' : ''}`}
                >
                  <span className="font-medium">{entry.rank}. {entry.username}</span>
                  <span className="font-semibold">{entry.score} pts</span>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}