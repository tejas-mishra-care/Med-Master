// app/admin/srs/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/router'; // Consider app router navigation alternatives
import { useAuth } from '@/lib/auth'; // Assuming useAuth hook exists
import { toast } from '@/hooks/use-toast'; // Assuming useToast hook exists

const AdminSRSPage = () => {
  const { user, profile } = useAuth(); // Assuming profile contains role information
  const router = useRouter();

  // Basic authorization check - replace with robust server-side check
  // This is a client-side check for UI presentation
  const isProfessor = profile?.role === 'professor'; // Adjust based on your profile structure

  const [formData, setFormData] = useState({
    front: '',
    back: '',
    subject: '',
    tags: '', // Comma-separated string
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isProfessor) {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to create SRS cards.',
        variant: 'destructive',
      });
      return;
    }

    // Basic validation
    if (!formData.front || !formData.back || !formData.subject) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in front, back, and subject.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/srs/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'SRS card created successfully!',
        });
        setFormData({ front: '', back: '', subject: '', tags: '' }); // Clear form
        // Optionally redirect or show list of created cards
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error Creating Card',
          description: errorData.message || 'Something went wrong.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating SRS card:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return <div>Loading or Please log in...</div>; // Or redirect to login
  }

  if (!isProfessor) {
    return (
      <div className="container mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have the necessary permissions to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Create New SRS Card</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="front" className="block text-sm font-medium text-gray-700">Card Front</label>
          <textarea
            id="front"
            name="front"
            rows={4}
            value={formData.front}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="back" className="block text-sm font-medium text-gray-700">Card Back</label>
          <textarea
            id="back"
            name="back"
            rows={4}
            value={formData.back}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Create Card
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSRSPage;