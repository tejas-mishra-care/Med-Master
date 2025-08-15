'use client';

import { useEffect, useState } from 'react';

/**
 * A safe version of usePathname that works in both client and server components
 */
export function usePathname(): string {
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

/**
 * A safe version of useRouter that works in both client and server components
 */
export function useRouter() {
  const pathname = usePathname();
  
  const push = (href: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };
  
  const replace = (href: string) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', href);
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
  
  return {
    pathname,
    push,
    replace,
    back,
    forward
  };
}