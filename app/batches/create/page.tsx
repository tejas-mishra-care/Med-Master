'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth'; // Assuming you have an auth hook
// This page is specifically for professors to create new study batches.
// It includes a form to input batch details like name and an optional expiry date.
// Upon successful creation, it displays the unique join code for students to join the batch.


import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast'; // Assuming a toast hook
import { Copy } from 'lucide-react';

export default function CreateBatchPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [batchName, setBatchName] = useState('');
  const [expiryDate, setExpiryDate] = useState(''); // Optional expiry
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if the currently logged-in user has the 'professor' role.
  // Basic check for professor role (replace with your actual logic)
  const isProfessor = profile?.role === 'professor';

  if (!user || !isProfessor) {
    // Redirect or show unauthorized message
    router.push('/'); // Or a dedicated unauthorized page
    return <p>Unauthorized access.</p>;
  }

  // Handle the submission of the batch creation form.
  // Sends a POST request to the backend API to create the batch.
  const handleCreateBatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!batchName.trim()) {
      toast({
        title: 'Error',
        description: 'Batch name is required.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setJoinCode(null);

    try {
      const response = await fetch('/api/batches/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: batchName, expiryDate }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setJoinCode(data.joinCode);
      toast({
        title: 'Success',
        description: 'Batch created successfully!',
      });
    } catch (error: any) {
      console.error('Failed to create batch:', error);
      toast({
        title: 'Error',
        description: `Failed to create batch: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to copy the generated join code to the clipboard.
  // Provides a toast notification upon successful copy.
  const copyJoinCode = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      toast({
        title: 'Copied!',
        description: 'Join code copied to clipboard.',
      });
    }
  };

  return (
    // Container for the batch creation form and join code display.
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create New Study Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateBatch} className="space-y-4">
            <div>
              {/* Input field for the batch name */}
              <Label htmlFor="batchName">Batch Name</Label>
              <Input
                id="batchName"
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                required
              />
            </div>
            {/* Input field for the optional expiry date */}
            <div>
              <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            {/* Button to submit the form and create the batch */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Batch'}
            </Button>
          </form>

          {/* Display the generated join code after successful batch creation */}
          {joinCode && (
            <div className="mt-6 p-4 border rounded-md flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Join Code:</p>
                <p className="text-lg font-bold">{joinCode}</p>
              </div>
              {/* Button to copy the join code to the clipboard */}
              {/* Visually hidden span for accessibility */}
              <Button variant="ghost" size="icon" onClick={copyJoinCode}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy join code</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}