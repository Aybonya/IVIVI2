import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AccessibilityProvider } from '@/contexts/accessibility-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { user } = useAuth();

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: user ? 'default' : 'none' }} />
        <Stack.Screen name="guess-alatau" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <RootNavigator />
      </AccessibilityProvider>
    </AuthProvider>
  );
}
