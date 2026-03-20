import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type AccessibilityContextValue = {
  blindModeEnabled: boolean;
  isReady: boolean;
  setBlindModeEnabled: (enabled: boolean) => Promise<void>;
};

const STORAGE_KEY = 'alatau-blind-mode-enabled';

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [blindModeEnabled, setBlindModeEnabledState] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!isMounted) {
          return;
        }

        setBlindModeEnabledState(value === 'true');
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setBlindModeEnabled = async (enabled: boolean) => {
    setBlindModeEnabledState(enabled);
    await AsyncStorage.setItem(STORAGE_KEY, String(enabled));
  };

  const value = useMemo(
    () => ({
      blindModeEnabled,
      isReady,
      setBlindModeEnabled,
    }),
    [blindModeEnabled, isReady]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }

  return context;
}
