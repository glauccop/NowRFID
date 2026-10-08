import { createContext, useContext } from 'react';

/** Screens pushed on top of the tab bar (Horizon stacked navigation). */
export type StackScreen = 'connect' | 'debug' | 'menu' | 'settings' | 'tools';

export interface Nav {
  push: (screen: StackScreen) => void;
  pop: () => void;
}

export const NavContext = createContext<Nav>({
  push: () => undefined,
  pop: () => undefined,
});

export function useNav(): Nav {
  return useContext(NavContext);
}
