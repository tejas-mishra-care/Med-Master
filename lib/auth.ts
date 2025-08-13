// lib/auth.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Helper to get Supabase client for server-side operations (API routes, etc.)
// This client is typically used within Next.js API routes or server components
export function createServerSupabaseClient(
  req: NextRequest | { cookies: ReadonlyRequestCookies },
  res?: NextResponse
) {
  const cookieStore = 'cookies' in req ? req.cookies : undefined;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore?.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (res) {
            res.cookies.set({
              name,
              value,
              ...options,
            });
          }
        },
        remove(name: string, options: CookieOptions) {
          if (res) {
            res.cookies.set({
              name,
              value: '',
              ...options,
            });
          }
        },
      },
    }
  );
}

// Middleware-like function to protect server routes (API routes, server components)
// This function checks if a user is authenticated using the server-side Supabase client.
export async function requireAuthServer(req: NextRequest) {
  // Get the server-side Supabase client configured to read and write cookies.
  const supabase = createServerSupabaseClient(req);

  // Fetch the authenticated user from Supabase Auth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user is found, the request is unauthenticated.
  // In a Next.js environment, it's common to redirect to a login page.
  // Note: For Route Handlers, throwing an error and catching it might be a more idiomatic approach.
  if (!user) {
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Attach user to request or pass it along
  // In an actual app, you might attach it to context or similar depending on framework
  // For Next.js route handlers, you'd typically just return user data or throw an error
  return user; // Return user if authenticated
}

// Helper to get Supabase client for client-side operations (React components, etc.)
// This client interacts directly with the browser's local storage and cookies for authentication.
export function getBrowserSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Example: set headers for better logging/tracing
        headers: { 'x-application-name': 'medmaster-web' },
      },
    }
  );
}

// React hook for managing client-side authentication state within components.
// It provides the current user object and a loading state.
export function useAuthClient() {
  // State to hold the authenticated user and loading status.
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  // Get the client-side Supabase instance.
  const supabase = getBrowserSupabase();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null); // Update user state when auth state changes.
      setLoading(false);
    });

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user || null);
      setLoading(false);
    });


    // Clean up the subscription on component unmount.
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return { user, loading };
}

// Example usage in a Next.js API route:
/*
import { type NextRequest, NextResponse } from 'next/server';
import { requireAuthServer } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthServer(req);
    // If requireAuthServer redirects, the code below won't run
    // If it returns a user, the user is authenticated
    return NextResponse.json({ message: 'Authenticated route', user });
  } catch (error) {
    // Handle errors, though requireAuthServer should handle redirects
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
*/

// Example usage in a React component:
/*
import { useAuthClient } from '@/lib/auth';

function MyComponent() {
  const { user, loading } = useAuthClient();

  if (loading) {
    return <div>Loading auth state...</div>;
  }

  if (!user) {
    return <div>Please log in.</div>;
  }

  return <div>Welcome, {user.email}!</div>;
}
*/