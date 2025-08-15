'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create contexts for navigation
type RouterContextType = {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  forward: () => void;
  prefetch: (href: string) => void;
  pathname: string;
};

export const RouterContext = createContext<RouterContextType>({
  push: () => {},
  replace: () => {},
  back: () => {},
  forward: () => {},
  prefetch: () => {},
  pathname: '/'
});

// Custom hooks that can be used in place of Next.js hooks
export function useRouter() {
  return useContext(RouterContext);
}

export function usePathname() {
  return useContext(RouterContext).pathname;
}

// Provider component
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  
  // Router implementation
  const router = {
    push: (href: string) => {
      window.history.pushState({}, '', href);
      setPathname(href);
    },
    replace: (href: string) => {
      window.history.replaceState({}, '', href);
      setPathname(href);
    },
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    prefetch: () => {}, // No-op for now
    pathname
  };
  
  useEffect(() => {
    // Update pathname on navigation
    const handleRouteChange = () => {
      setPathname(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  
  return (
    <RouterContext.Provider value={router}>
      {children}
    </RouterContext.Provider>
  );
}