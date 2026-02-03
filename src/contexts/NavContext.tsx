import { createContext, useContext, useState, type ReactNode } from 'react';

interface NavContextType {
  isNavVisible: boolean;
  hideNav: () => void;
  showNav: () => void;
}

const NavContext = createContext<NavContextType | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [isNavVisible, setIsNavVisible] = useState(true);

  const hideNav = () => setIsNavVisible(false);
  const showNav = () => setIsNavVisible(true);

  return (
    <NavContext.Provider value={{ isNavVisible, hideNav, showNav }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error('useNav must be used within a NavProvider');
  }
  return context;
}
