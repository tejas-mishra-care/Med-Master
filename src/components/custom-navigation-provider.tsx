'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type RouterContextType = {
  pathname: string;
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  forward: () => void;
  prefetch: (href: string) => Promise<void>;
};

// Create a context with default values
const RouterContext = createContext<RouterContextType>({
  pathname: '/',
  push: () => {},
  replace: () => {},
  back: () => {},
  forward: () => {},
  prefetch: async () => {}
});

export function CustomNavigationProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>('/');
  
  useEffect(() => {
    // Set initial pathname
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
    
    // Update pathname on navigation
    const handleRouteChange = () => {
      if (typeof window !== 'undefined') {
        setPathname(window.location.pathname);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChange);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handleRouteChange);
      }
    };
  }, []);
  
  const push = (href: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', href);
      setPathname(href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };
  
  const replace = (href: string) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', href);
      setPathname(href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };
  
  const back = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };
  
  const forward = () => {
    if (typeof window !== 'undefined') {
      window.history.forward();
    }
  };
  
  const prefetch = async (href: string) => {
    // This is a mock implementation
    return Promise.resolve();
  };
  
  return (
    <RouterContext.Provider value={{ pathname, push, replace, back, forward, prefetch }}>
      {children}
    </RouterContext.Provider>
  );
}

// Custom hooks that replace Next.js navigation hooks
export function usePathname(): string {
  const { pathname } = useContext(RouterContext);
  return pathname;
}

export function useRouter() {
  const context = useContext(RouterContext);
  return context;
}

export function useSearchParams() {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(new URLSearchParams());
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search));
      
      const handleRouteChange = () => {
        setSearchParams(new URLSearchParams(window.location.search));
      };
      
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, []);
  
  return searchParams;
}