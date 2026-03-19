import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { defaultProfile, loadUserProfile, saveUserProfile, uploadAvatarAsync } from '@/firebase';

type ProfileData = typeof defaultProfile;

const palette = {
  screen: '#EEF3F9',
  card: '#FFFFFF',
  softCard: 'rgba(15, 25, 40, 0.04)',
  border: 'rgba(14, 28, 45, 0.10)',
  text: '#132238',
  muted: '#66788F',
  faint: '#7A8CA3',
  primary: '#365DFF',
  primarySoft: 'rgba(54, 93, 255, 0.08)',
  primarySoftBorder: 'rgba(54, 93, 255, 0.14)',
  dangerSoft: 'rgba(234, 87, 87, 0.08)',
  dangerBorder: 'rgba(234, 87, 87, 0.16)',
  dangerText: '#A53B3B',
};

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldBlock}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.faint}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    ...defaultProfile,
    email: user?.email ?? '',
  });
  const [savedProfile, setSavedProfile] = useState<ProfileData>({
    ...defaultProfile,
    email: user?.email ?? '',
  });
  const [statusMessage, setStatusMessage] = useState('Profile sync is ready.');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const profileData = await loadUserProfile(user.uid, user.email ?? '');
        setProfile(profileData);
        setSavedProfile(profileData);
        setStatusMessage('Profile loaded from Firebase.');
        setIsEditing(false);
      } catch (error) {
        setProfile({
          ...defaultProfile,
          email: user.email ?? '',
        });
        setSavedProfile({
          ...defaultProfile,
          email: user.email ?? '',
        });
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load profile from Firestore.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, [user]);

  const fullName = useMemo(() => {
    const value = `${profile.firstName} ${profile.lastName}`.trim();
    return value || 'Your profile';
  }, [profile.firstName, profile.lastName]);

  const initials = useMemo(() => {
    const first = profile.firstName.trim().charAt(0);
    const last = profile.lastName.trim().charAt(0);
    const value = `${first}${last}`.toUpperCase();
    return value || 'U';
  }, [profile.firstName, profile.lastName]);

  const publicAccessibilitySummary =
    savedProfile.disabilities.trim().length === 0
      ? 'Not provided'
      : savedProfile.hideDisabilities
        ? 'Hidden from profile view'
        : savedProfile.disabilities;

  const updateField = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) {
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const nextProfile = {
        ...profile,
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        gender: profile.gender.trim(),
        disabilities: profile.disabilities.trim(),
        occupation: profile.occupation.trim(),
        email: user.email ?? profile.email,
      };

      await saveUserProfile(user.uid, nextProfile);
      const freshProfile = await loadUserProfile(user.uid, user.email ?? '');
      setProfile(freshProfile);
      setSavedProfile(freshProfile);
      setStatusMessage('Profile saved to Firestore successfully.');
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save profile to Firestore.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarPress = async () => {
    if (!user || !isEditing) {
      return;
    }

    setErrorMessage('');

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setErrorMessage('Photo library access is needed to choose an avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      setIsUploadingAvatar(true);

      const downloadUrl = await uploadAvatarAsync(user.uid, result.assets[0].uri);
      const nextProfile = {
        ...profile,
        avatarUrl: downloadUrl,
        email: user.email ?? profile.email,
      };

      await saveUserProfile(user.uid, nextProfile);
      setProfile(nextProfile);
      setSavedProfile(nextProfile);
      setStatusMessage('Avatar uploaded and profile updated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to sign out.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const startEditing = () => {
    setProfile(savedProfile);
    setErrorMessage('');
    setStatusMessage('Editing profile locally. Save when you are ready.');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setProfile(savedProfile);
    setErrorMessage('');
    setStatusMessage('Changes discarded.');
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroToolbar}>
            <View style={styles.heroToolbarSpacer} />
            {isEditing ? (
              <Pressable style={styles.editGhostButton} onPress={cancelEditing}>
                <ThemedText style={styles.editGhostButtonText}>Cancel</ThemedText>
              </Pressable>
            ) : (
              <Pressable style={styles.editButton} onPress={startEditing}>
                <Ionicons name="create-outline" size={16} color="#365DFF" />
                <ThemedText style={styles.editButtonText}>Edit</ThemedText>
              </Pressable>
            )}
          </View>

          <View style={styles.heroTop}>
            <Pressable style={styles.avatarWrap} onPress={() => void handleAvatarPress()}>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <View style={styles.avatar}>
                  <ThemedText style={styles.avatarText}>{initials}</ThemedText>
                </View>
              )}

              {isEditing ? (
                <View style={styles.avatarBadge}>
                  {isUploadingAvatar ? (
                    <ActivityIndicator size="small" color="#F8FAFF" />
                  ) : (
                    <Ionicons name="camera-outline" size={14} color="#F8FAFF" />
                  )}
                </View>
              ) : null}
            </Pressable>

            <View style={styles.heroText}>
              <ThemedText style={styles.eyebrow}>Profile</ThemedText>
              <ThemedText style={styles.name}>{fullName}</ThemedText>
              <ThemedText style={styles.subtitle}>
                Manage your personal details and accessibility preferences.
              </ThemedText>
              <ThemedText style={styles.emailText}>{user?.email ?? 'No email found'}</ThemedText>
            </View>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.statPill}>
              <ThemedText style={styles.statLabel}>Occupation</ThemedText>
              <ThemedText style={styles.statValue}>
                {savedProfile.occupation || 'Not provided'}
              </ThemedText>
            </View>
            <View style={styles.statPill}>
              <ThemedText style={styles.statLabel}>Privacy</ThemedText>
              <ThemedText style={styles.statValue}>
                {savedProfile.hideDisabilities ? 'Protected' : 'Visible'}
              </ThemedText>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.feedbackCard}>
            <ActivityIndicator size="small" color={palette.primary} />
            <ThemedText style={styles.feedbackText}>Loading profile...</ThemedText>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View style={[styles.feedbackCard, styles.errorCard]}>
            <Ionicons name="alert-circle-outline" size={18} color={palette.dangerText} />
            <ThemedText style={[styles.feedbackText, styles.errorText]}>{errorMessage}</ThemedText>
          </View>
        ) : null}

        {!isLoading && !errorMessage ? (
          <View style={styles.feedbackCard}>
            <Ionicons name="checkmark-circle-outline" size={18} color={palette.primary} />
            <ThemedText style={styles.feedbackText}>{statusMessage}</ThemedText>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              {isEditing ? 'Edit profile' : 'Profile details'}
            </ThemedText>
            <ThemedText style={styles.sectionCaption}>
              {isEditing
                ? 'Update your fields and save changes when you are ready.'
                : 'Your saved information lives here. Tap Edit in the top-right corner to make changes.'}
            </ThemedText>
          </View>

          {isEditing ? (
            <>
              <FormField
                label="First name"
                placeholder="Enter first name"
                value={profile.firstName}
                onChangeText={(value) => updateField('firstName', value)}
              />
              <FormField
                label="Last name"
                placeholder="Enter last name"
                value={profile.lastName}
                onChangeText={(value) => updateField('lastName', value)}
              />
              <FormField
                label="Gender"
                placeholder="How would you like to describe your gender?"
                value={profile.gender}
                onChangeText={(value) => updateField('gender', value)}
              />
              <FormField
                label="Accessibility needs or disabilities (optional)"
                placeholder="Add anything helpful for support, access, or comfort"
                value={profile.disabilities}
                onChangeText={(value) => updateField('disabilities', value)}
                multiline
              />

              <View style={styles.toggleCard}>
                <View style={styles.toggleText}>
                  <ThemedText style={styles.toggleTitle}>
                    Hide this information from profile view
                  </ThemedText>
                  <ThemedText style={styles.toggleCaption}>
                    Keep accessibility details private in the public summary while still storing
                    them in Firebase.
                  </ThemedText>
                </View>
                <Switch
                  value={profile.hideDisabilities}
                  onValueChange={(value) => updateField('hideDisabilities', value)}
                  trackColor={{ false: '#C9D3E1', true: '#365DFF' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <FormField
                label="Occupation / work"
                placeholder="What do you do?"
                value={profile.occupation}
                onChangeText={(value) => updateField('occupation', value)}
              />

              <Pressable
                style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
                onPress={() => void handleSaveProfile()}
                disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#F8FAFF" />
                ) : (
                  <Ionicons name="save-outline" size={18} color="#F8FAFF" />
                )}
                <ThemedText style={styles.primaryButtonText}>
                  {isSaving ? 'Saving...' : 'Save profile'}
                </ThemedText>
              </Pressable>
            </>
          ) : (
            <View style={styles.viewModeCard}>
              <View style={styles.viewModeRow}>
                <ThemedText style={styles.viewModeLabel}>First name</ThemedText>
                <ThemedText style={styles.viewModeValue}>{savedProfile.firstName || 'Not provided'}</ThemedText>
              </View>
              <View style={styles.viewModeRow}>
                <ThemedText style={styles.viewModeLabel}>Last name</ThemedText>
                <ThemedText style={styles.viewModeValue}>{savedProfile.lastName || 'Not provided'}</ThemedText>
              </View>
              <View style={styles.viewModeRow}>
                <ThemedText style={styles.viewModeLabel}>Gender</ThemedText>
                <ThemedText style={styles.viewModeValue}>{savedProfile.gender || 'Not provided'}</ThemedText>
              </View>
              <View style={styles.viewModeRow}>
                <ThemedText style={styles.viewModeLabel}>Occupation</ThemedText>
                <ThemedText style={styles.viewModeValue}>
                  {savedProfile.occupation || 'Not provided'}
                </ThemedText>
              </View>
              <View style={styles.viewModeRow}>
                <ThemedText style={styles.viewModeLabel}>Accessibility</ThemedText>
                <ThemedText style={styles.viewModeValue}>{publicAccessibilitySummary}</ThemedText>
              </View>
            </View>
          )}

          <Pressable
            style={[styles.secondaryButton, isSigningOut && styles.buttonDisabled]}
            onPress={() => void handleLogout()}
            disabled={isSigningOut}>
            {isSigningOut ? (
              <ActivityIndicator size="small" color="#F8FAFF" />
            ) : (
              <Ionicons name="log-out-outline" size={18} color="#F8FAFF" />
            )}
            <ThemedText style={styles.secondaryButtonText}>
              {isSigningOut ? 'Signing out...' : 'Logout'}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.screen,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 16,
  },
  heroCard: {
    borderRadius: 30,
    padding: 18,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#0F1A2B',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 6,
  },
  heroToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroToolbarSpacer: {
    width: 1,
    height: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.primarySoft,
    borderWidth: 1,
    borderColor: palette.primarySoftBorder,
  },
  editButtonText: {
    color: palette.primary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  editGhostButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F8FC',
    borderWidth: 1,
    borderColor: palette.border,
  },
  editGhostButtonText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  heroTop: {
    flexDirection: 'row',
    gap: 16,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: '#DDE7F6',
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 82,
    height: 82,
    borderRadius: 28,
  },
  avatarText: {
    color: palette.text,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '800',
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    borderWidth: 2,
    borderColor: palette.card,
  },
  heroText: {
    flex: 1,
    paddingTop: 4,
  },
  eyebrow: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    color: palette.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  emailText: {
    color: '#556A86',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    fontWeight: '600',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  statPill: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: palette.softCard,
  },
  statLabel: {
    color: palette.faint,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  feedbackCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.primarySoftBorder,
  },
  feedbackText: {
    flex: 1,
    color: palette.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  errorCard: {
    borderColor: palette.dangerBorder,
    backgroundColor: palette.dangerSoft,
  },
  errorText: {
    color: palette.dangerText,
  },
  sectionCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },
  sectionCaption: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F7FAFD',
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
  },
  toggleCard: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    backgroundColor: palette.softCard,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  toggleCaption: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  viewModeCard: {
    borderRadius: 22,
    padding: 14,
    backgroundColor: palette.softCard,
    gap: 12,
  },
  viewModeRow: {
    gap: 6,
  },
  viewModeLabel: {
    color: palette.faint,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  viewModeValue: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: palette.primary,
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#18263C',
    borderWidth: 1,
    borderColor: '#18263C',
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  primaryButtonText: {
    color: '#F8FAFF',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  secondaryButtonText: {
    color: '#F8FAFF',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
});
