// This file patches Next.js navigation hooks to work in both server and client components

// Create a safe version of usePathname that works in server components
function safeUsePathname() {
  // In server components, return a default value
  if (typeof window === 'undefined') {
    return '/';
  }
  
  // In client components, return the actual pathname
  return window.location.pathname;
}

// Create a safe version of useRouter that works in server components
function safeUseRouter() {
  return {
    pathname: safeUsePathname(),
    push: () => {},
    replace: () => {},
    back: () => {},
    forward: () => {},
    prefetch: () => {}
  };
}

// Apply the patches when this file is imported
if (typeof window !== 'undefined') {
  // Only patch in the browser
  try {
    // Try to get the Next.js navigation module
    const nextNavigation = require('next/navigation');
    
    // Patch the usePathname hook
    if (nextNavigation.usePathname) {
      const originalUsePathname = nextNavigation.usePathname;
      nextNavigation.usePathname = function() {
        try {
          return originalUsePathname();
        } catch (error) {
          console.warn('Error in usePathname, using fallback', error);
          return safeUsePathname();
        }
      };
    }
    
    // Patch the useRouter hook
    if (nextNavigation.useRouter) {
      const originalUseRouter = nextNavigation.useRouter;
      nextNavigation.useRouter = function() {
        try {
          return originalUseRouter();
        } catch (error) {
          console.warn('Error in useRouter, using fallback', error);
          return safeUseRouter();
        }
      };
    }
    
    console.log('Next.js navigation hooks patched successfully');
  } catch (error) {
    console.error('Failed to patch Next.js navigation hooks', error);
  }
}