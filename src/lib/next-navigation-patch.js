'use client';

// This file directly patches Next.js's navigation hooks to prevent the useContext error

// Wait for Next.js to load
if (typeof window !== 'undefined') {
  // Execute after the window is fully loaded
  window.addEventListener('load', () => {
    try {
      // Get the original React module
      const React = window.React || require('react');
      
      // Store the original useContext
      const originalUseContext = React.useContext;
      
      // Override React's useContext to handle null contexts
      React.useContext = function patchedUseContext(Context) {
        try {
          return originalUseContext(Context);
        } catch (error) {
          console.warn('Error in useContext, returning empty object:', error);
          return {};
        }
      };
      
      console.log('Successfully patched React.useContext');
      
      // Try to patch Next.js navigation hooks if they exist
      if (window.next && window.next.router) {
        const originalUsePathname = window.next.router.usePathname;
        const originalUseRouter = window.next.router.useRouter;
        const originalUseSearchParams = window.next.router.useSearchParams;
        
        // Create fallback implementations
        const getPathname = () => window.location.pathname;
        const getRouter = () => ({
          pathname: window.location.pathname,
          push: (href) => {
            window.history.pushState({}, '', href);
            window.dispatchEvent(new PopStateEvent('popstate'));
          },
          replace: (href) => {
            window.history.replaceState({}, '', href);
            window.dispatchEvent(new PopStateEvent('popstate'));
          },
          back: () => window.history.back(),
          forward: () => window.history.forward(),
          prefetch: () => Promise.resolve(),
        });
        const getSearchParams = () => new URLSearchParams(window.location.search);
        
        // Patch usePathname
        if (originalUsePathname) {
          window.next.router.usePathname = function patchedUsePathname() {
            try {
              return originalUsePathname();
            } catch (error) {
              console.warn('Error in usePathname, using fallback:', error);
              return getPathname();
            }
          };
        }
        
        // Patch useRouter
        if (originalUseRouter) {
          window.next.router.useRouter = function patchedUseRouter() {
            try {
              return originalUseRouter();
            } catch (error) {
              console.warn('Error in useRouter, using fallback:', error);
              return getRouter();
            }
          };
        }
        
        // Patch useSearchParams
        if (originalUseSearchParams) {
          window.next.router.useSearchParams = function patchedUseSearchParams() {
            try {
              return originalUseSearchParams();
            } catch (error) {
              console.warn('Error in useSearchParams, using fallback:', error);
              return getSearchParams();
            }
          };
        }
        
        console.log('Successfully patched Next.js navigation hooks');
      }
    } catch (error) {
      console.error('Failed to patch React or Next.js:', error);
    }
  });
}