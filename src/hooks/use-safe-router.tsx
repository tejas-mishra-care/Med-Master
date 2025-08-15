'use client';

import { useCallback } from 'react';
import { useSafePathname } from './use-safe-pathname';

/**
 * A safe version of useRouter that works in both client and server components
 * and handles the "Cannot read properties of null (reading 'useContext')" error
 */
export function useSafeRouter() {
  const pathname = useSafePathname();
  
  const push = useCallback((href: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, []);
  
  const replace = useCallback((href: string) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, []);
  
  const back = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, []);
  
  const forward = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.forward();
    }
  }, []);
  
  const prefetch = useCallback((href: string) => {
    // No-op for now, as we can't easily replicate Next.js's prefetching
    console.log('Prefetch not implemented in safe router:', href);
  }, []);
  
  return {
    pathname,
    push,
    replace,
    back,
    forward,
    prefetch
  };
}