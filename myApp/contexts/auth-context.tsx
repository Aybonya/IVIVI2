import { Redirect } from 'expo-router';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { loginUser, logoutUser, registerUser, subscribeToAuthChanges } from '@/firebase';
import { ThemedText } from '@/components/themed-text';

const AuthContext = createContext(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      signIn: loginUser,
      signUp: registerUser,
      signOut: logoutUser,
    }),
    [authLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

export function AuthGate({ children }: PropsWithChildren) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#5D77FF" />
        <ThemedText style={styles.loadingText}>Checking your secure session...</ThemedText>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return children;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#08111F',
    gap: 14,
  },
  loadingText: {
    color: '#E9EEFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
});
