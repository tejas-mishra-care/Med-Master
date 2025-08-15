'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for pathname
type NavigationContextType = {
  pathname: string;
};

const NavigationContext = createContext<NavigationContextType>({ pathname: '/' });

// Export a hook to use the navigation context
export function useNavigation() {
  return useContext(NavigationContext);
}

// Provider component
export function NavigationContextProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>('/');
  
  useEffect(() => {
    // Set initial pathname
    setPathname(window.location.pathname);
    
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
    <NavigationContext.Provider value={{ pathname }}>
      {children}
    </NavigationContext.Provider>
  );
}