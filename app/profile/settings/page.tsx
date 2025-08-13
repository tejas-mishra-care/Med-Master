'use client';

// Import necessary hooks and components
import { useState } from 'react';
import { useAuth } from '@/lib/auth'; // Assuming useAuth hook exists
import { useTheme } from '@/lib/theme'; // Assuming useTheme hook exists
import { useToast } from '@/hooks/use-toast'; // Assuming useToast hook exists
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui
import { Input } from '@/components/ui/input'; // Assuming shadcn/ui
import { Label } from '@/components/ui/label'; // Assuming shadcn/ui
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming shadcn/ui

export default function ProfileSettingsPage() {
  // Use authentication and theme hooks
  // useAuth is expected to provide the current user and profile data,
  // along with a function to mutate (update) the local profile state after saving.
  // useTheme is expected to provide the current theme and a function to set the theme.
  const { user, profile, mutateProfile } = useAuth(); // Assuming useAuth provides user and profile, and mutateProfile for updating
  const { theme, setTheme } = useTheme(); // Assuming useTheme provides theme and setTheme
  const { toast } = useToast();

  const [username, setUsername] = useState(profile?.username || '');
  const [isLoading, setIsLoading] = useState(false);

  // Handler for username input changes
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  // Handler for theme selection changes
  const handleThemeChange = (value: string) => {
    setTheme(value);
    // Optionally persist theme to profile here or in the useTheme hook
    // if (user) {
    //   mutateProfile({ ...profile, theme: value });
    // }
    // Note: The theme is currently being saved to the backend in the handleSaveSettings function.
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    // Send a PATCH request to the profile API to update settings
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, theme }), // Include theme to be saved if not done in useTheme
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        mutateProfile(updatedProfile); // Update local profile state
        // Show a success toast notification
        toast({
          title: 'Success!',
          description: 'Profile updated.',
        });
      } else {
        const errorData = await response.json();
        toast({
          // Show an error toast notification with details from the backend
          title: 'Error',
          description: errorData.error || 'Failed to update profile.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Show a generic error toast for unexpected errors
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main container for the profile settings page
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      {/* Form for editing profile settings */}
      <form onSubmit={handleSaveSettings} className="max-w-md space-y-6">
        {/* Username input field */}
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            required
            disabled={isLoading}
          />
        </div>
        {/* Theme preference select input */}
        <div>
          <Label htmlFor="theme">Theme Preference</Label>
          <Select id="theme" value={theme} onValueChange={handleThemeChange} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Save settings button */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </div>
  );
}