'use client';

import { useEffect, useState } from 'react';

/**
 * A safe version of usePathname that works in both client and server components
 * and handles the "Cannot read properties of null (reading 'useContext')" error
 */
export function useSafePathname(): string {
  const [pathname, setPathname] = useState<string>('/');
  
  useEffect(() => {
    // Only run in the browser
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
      
      // Update pathname when it changes
      const handleRouteChange = () => {
        setPathname(window.location.pathname);
      };
      
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, []);
  
  return pathname;
}