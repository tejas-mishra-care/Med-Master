'use client';

// This file provides a polyfill for Next.js navigation hooks
// It should be imported in the root layout.tsx file

if (typeof window !== 'undefined') {
  // Create a mock context for Next.js navigation
  const createMockContext = () => {
    return {
      pathname: window.location.pathname,
      query: {},
      asPath: window.location.pathname,
      push: (href) => {
        window.history.pushState({}, '', href);
        window.dispatchEvent(new PopStateEvent('popstate'));
        return Promise.resolve(true);
      },
      replace: (href) => {
        window.history.replaceState({}, '', href);
        window.dispatchEvent(new PopStateEvent('popstate'));
        return Promise.resolve(true);
      },
      back: () => window.history.back(),
      forward: () => window.history.forward(),
      prefetch: () => Promise.resolve(),
      reload: () => window.location.reload(),
      events: {
        on: () => {},
        off: () => {},
        emit: () => {}
      }
    };
  };

  // Store original React.createContext
  const originalCreateContext = React.createContext;

  // Override React.createContext to provide default values
  React.createContext = function patchedCreateContext(defaultValue) {
    // Ensure defaultValue is not undefined or null
    const safeDefaultValue = defaultValue === undefined || defaultValue === null 
      ? {} 
      : defaultValue;
    
    return originalCreateContext(safeDefaultValue);
  };

  // Patch Next.js navigation hooks
  if (window.next && window.next.router) {
    // Create a mock context for navigation
    const mockContext = createMockContext();

    // Patch usePathname
    const originalUsePathname = window.next.router.usePathname;
    window.next.router.usePathname = function patchedUsePathname() {
      try {
        return originalUsePathname ? originalUsePathname() : window.location.pathname;
      } catch (error) {
        console.warn('Error in usePathname, using fallback:', error);
        return window.location.pathname;
      }
    };
    
    // Patch useRouter
    const originalUseRouter = window.next.router.useRouter;
    window.next.router.useRouter = function patchedUseRouter() {
      try {
        return originalUseRouter ? originalUseRouter() : mockContext;
      } catch (error) {
        console.warn('Error in useRouter, using fallback:', error);
        return mockContext;
      }
    };

    // Patch useSearchParams
    const originalUseSearchParams = window.next.router.useSearchParams;
    window.next.router.useSearchParams = function patchedUseSearchParams() {
      try {
        return originalUseSearchParams ? originalUseSearchParams() : new URLSearchParams(window.location.search);
      } catch (error) {
        console.warn('Error in useSearchParams, using fallback:', error);
        return new URLSearchParams(window.location.search);
      }
    };
  }

  // Patch React's useContext to handle null contexts
  const originalUseContext = React.useContext;
  React.useContext = function patchedUseContext(Context) {
    try {
      return originalUseContext(Context);
    } catch (error) {
      console.warn('Error in useContext, returning empty object:', error);
      return {};
    }
  };
}