import { Ionicons } from '@expo/vector-icons';
import { Link, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';

const palette = {
  screen: '#08111F',
  card: '#0C1728',
  softCard: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.08)',
  text: '#F7F9FD',
  muted: '#8DA0BD',
  faint: '#6F82A3',
  primary: '#5D77FF',
  primarySoft: 'rgba(93, 119, 255, 0.14)',
  dangerSoft: 'rgba(234, 87, 87, 0.14)',
  dangerText: '#FFB2B2',
};

export default function LoginScreen() {
  const { signIn, user, authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authLoading && user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#C9D6FF" />
            <ThemedText style={styles.heroBadgeText}>Smart city access</ThemedText>
          </View>
          <ThemedText style={styles.title}>Welcome back</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in to sync your live map and your personal profile across devices.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldBlock}>
            <ThemedText style={styles.fieldLabel}>Email</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={palette.faint}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldBlock}>
            <ThemedText style={styles.fieldLabel}>Password</ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor={palette.faint}
              style={styles.input}
            />
          </View>

          {errorMessage ? (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={18} color={palette.dangerText} />
              <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
            </View>
          ) : null}

          <Pressable style={styles.primaryButton} onPress={() => void handleLogin()} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#F8FAFF" />
            ) : (
              <Ionicons name="log-in-outline" size={18} color="#F8FAFF" />
            )}
            <ThemedText style={styles.primaryButtonText}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </ThemedText>
          </Pressable>

          <Link href="/register" asChild>
            <Pressable style={styles.secondaryButton}>
              <ThemedText style={styles.secondaryButtonText}>Create an account</ThemedText>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.screen,
    paddingHorizontal: 18,
  },
  hero: {
    paddingTop: 36,
    paddingBottom: 28,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.primarySoft,
    marginBottom: 20,
  },
  heroBadgeText: {
    color: '#C9D6FF',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  title: {
    color: palette.text,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  card: {
    borderRadius: 30,
    padding: 18,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 14,
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    color: '#AFC0DA',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  input: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: palette.softCard,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
    fontSize: 15,
  },
  errorCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: palette.dangerSoft,
  },
  errorText: {
    flex: 1,
    color: palette.dangerText,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 6,
    borderRadius: 18,
    paddingVertical: 15,
    backgroundColor: palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#F8FAFF',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softCard,
    borderWidth: 1,
    borderColor: palette.border,
  },
  secondaryButtonText: {
    color: '#D7E3FF',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
});
