'use client';

// This file patches Next.js navigation context to prevent the useContext error
// It should be imported in the root layout.tsx file

// Store the original React.createContext
const originalCreateContext = React.createContext;

// Override React.createContext to provide a default value for all contexts
React.createContext = function patchedCreateContext(defaultValue) {
  // Ensure defaultValue is not undefined or null
  const safeDefaultValue = defaultValue === undefined || defaultValue === null 
    ? {} 
    : defaultValue;
  
  return originalCreateContext(safeDefaultValue);
};

// Patch for usePathname and useRouter
const originalUsePathname = window.next?.router?.usePathname;
const originalUseRouter = window.next?.router?.useRouter;

if (typeof window !== 'undefined' && window.next && window.next.router) {
  // Patch usePathname
  window.next.router.usePathname = function patchedUsePathname() {
    try {
      return originalUsePathname ? originalUsePathname() : window.location.pathname;
    } catch (error) {
      console.warn('Error in usePathname, using fallback:', error);
      return window.location.pathname;
    }
  };
  
  // Patch useRouter
  window.next.router.useRouter = function patchedUseRouter() {
    try {
      return originalUseRouter ? originalUseRouter() : {
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
        pathname: window.location.pathname
      };
    } catch (error) {
      console.warn('Error in useRouter, using fallback:', error);
      return {
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
        pathname: window.location.pathname
      };
    }
  };
}