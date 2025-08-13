"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"; 

// app/batches/join/page.tsx
// This page allows students to join a batch using a provided join code.
export default function JoinBatchPage() {
  const [joinCode, setJoinCode] = useState('');
  // Loading state for the button to prevent multiple submissions
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Basic validation

    if (!joinCode) {
      setError('Please enter a join code.');
      setLoading(false);
      return;
    }

    // Send the join code to the backend API

    try {
      const response = await fetch('/api/batches/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ joinCode }),
      });

      const data = await response.json();

      // Handle API errors
      if (!response.ok) {
        setError(data.error || 'Failed to join batch.');
        toast({
          title: 'Error',
          description: data.error || 'Failed to join batch.',
          variant: 'destructive',
        });
        return;
      }

      // Show success message and redirect
      toast({
        title: 'Success',
        description: 'Successfully joined the batch!',
      });

      // Redirect to batch page or dashboard
      router.push(`/batches/${data.batchId}`);

    } catch (err) {
      // Handle unexpected errors
      console.error(err);
      setError('An unexpected error occurred.');
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Join a Batch</h1>
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <Label htmlFor="joinCode">Join Code</Label>
            <Input
              id="joinCode"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter join code"
              required
              disabled={loading}
              className="mt-1"
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Joining...' : 'Join Batch'}
          </Button>
        </form>
      </div>
    </div>
  );
}