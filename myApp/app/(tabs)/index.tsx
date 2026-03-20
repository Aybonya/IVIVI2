import { Redirect } from 'expo-router';

import { useAccessibility } from '@/contexts/accessibility-context';

export default function TabIndexRedirect() {
  const { blindModeEnabled, isReady } = useAccessibility();

  if (!isReady) {
    return null;
  }

  return <Redirect href={blindModeEnabled ? '/(tabs)/vision' : '/(tabs)/routes'} />;
}
