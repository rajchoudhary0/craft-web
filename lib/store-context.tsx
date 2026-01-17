'use client';

import React, { createContext, useContext } from 'react';
import type { StoreSettings } from './get-store-settings';

const StoreContext = createContext<StoreSettings | null>(null);

export function StoreProvider({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: StoreSettings | null;
}) {
  return (
    <StoreContext.Provider value={settings}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(StoreContext);
  // Return null or default/fallback values if context is missing for some reason
  return context;
}
