'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for pathname
export const PathnameContext = createContext<string | null>('/');

// Provider component
export function Providers({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>('/');
  
  useEffect(() => {
    // Update pathname on client-side navigation
    const updatePathname = () => {
      setPathname(window.location.pathname);
    };
    
    // Set initial pathname
    updatePathname();
    
    // Listen for pathname changes
    window.addEventListener('popstate', updatePathname);
    
    return () => {
      window.removeEventListener('popstate', updatePathname);
    };
  }, []);
  
  return (
    <PathnameContext.Provider value={pathname}>
      {children}
    </PathnameContext.Provider>
  );
}