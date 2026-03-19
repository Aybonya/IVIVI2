import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

type ProfileData = {
  avatar: string;
  firstName: string;
  lastName: string;
  gender: string;
  disabilities: string;
  hideDisabilities: boolean;
  occupation: string;
};

type ProfilePalette = {
  screen: string;
  card: string;
  softCard: string;
  border: string;
  text: string;
  muted: string;
  faint: string;
  input: string;
  primary: string;
  primarySoft: string;
  primarySoftBorder: string;
};

const initialProfile: ProfileData = {
  avatar: '',
  firstName: 'Aibek',
  lastName: 'Nurali',
  gender: 'Male',
  disabilities: 'Occasional low-vision support',
  hideDisabilities: true,
  occupation: 'Urban systems analyst',
};

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  palette,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  palette: ProfilePalette;
}) {
  return (
    <View style={styles.fieldBlock}>
      <ThemedText style={[styles.fieldLabel, { color: palette.muted }]}>{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.faint}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          {
            backgroundColor: palette.input,
            borderColor: palette.border,
            color: palette.text,
          },
          multiline && styles.textArea,
        ]}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [savedProfile, setSavedProfile] = useState<ProfileData>(initialProfile);
  const [saveMessage, setSaveMessage] = useState('Local profile ready for future cloud sync.');

  const palette: ProfilePalette = {
    screen: '#EEF3F9',
    card: '#FFFFFF',
    softCard: 'rgba(15, 25, 40, 0.04)',
    border: 'rgba(14, 28, 45, 0.10)',
    text: '#132238',
    muted: '#66788F',
    faint: '#7A8CA3',
    input: 'rgba(15, 25, 40, 0.04)',
    primary: '#365DFF',
    primarySoft: 'rgba(54, 93, 255, 0.08)',
    primarySoftBorder: 'rgba(54, 93, 255, 0.14)',
  };

  const fullName = useMemo(() => {
    const value = `${profile.firstName} ${profile.lastName}`.trim();
    return value || 'Your profile';
  }, [profile.firstName, profile.lastName]);

  const publicAccessibilitySummary =
    savedProfile.disabilities.trim().length === 0
      ? 'Not provided'
      : savedProfile.hideDisabilities
        ? 'Hidden from public profile'
        : savedProfile.disabilities;

  const initials = useMemo(() => {
    const first = profile.firstName.trim().charAt(0);
    const last = profile.lastName.trim().charAt(0);
    return `${first}${last}`.toUpperCase() || 'U';
  }, [profile.firstName, profile.lastName]);

  const updateField = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const saveProfile = () => {
    setSavedProfile(profile);
    setSaveMessage('Profile updated locally. Ready to wire into Firebase later.');
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.screen }]}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.heroTop}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, { backgroundColor: palette.softCard, borderColor: palette.border }]}>
                <ThemedText style={[styles.avatarText, { color: palette.text }]}>{initials}</ThemedText>
              </View>
              <View style={[styles.avatarBadge, { backgroundColor: palette.primary, borderColor: palette.card }]}>
                <Ionicons name="camera-outline" size={14} color="#F8FAFF" />
              </View>
            </View>

            <View style={styles.heroText}>
              <ThemedText style={[styles.eyebrow, { color: palette.muted }]}>Profile</ThemedText>
              <ThemedText style={[styles.name, { color: palette.text }]}>{fullName}</ThemedText>
              <ThemedText style={[styles.subtitle, { color: palette.muted }]}>
                Personal details for your smart city account and accessibility preferences.
              </ThemedText>
            </View>
          </View>

          <View style={styles.heroStats}>
            <View style={[styles.statPill, { backgroundColor: palette.softCard }]}>
              <ThemedText style={[styles.statLabel, { color: palette.faint }]}>Role</ThemedText>
              <ThemedText style={[styles.statValue, { color: palette.text }]}>
                {savedProfile.occupation || 'Add role'}
              </ThemedText>
            </View>
            <View style={[styles.statPill, { backgroundColor: palette.softCard }]}>
              <ThemedText style={[styles.statLabel, { color: palette.faint }]}>Privacy</ThemedText>
              <ThemedText style={[styles.statValue, { color: palette.text }]}>
                {savedProfile.hideDisabilities ? 'Protected' : 'Visible'}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Public summary</ThemedText>
            <ThemedText style={[styles.sectionCaption, { color: palette.muted }]}>
              What your profile currently shows
            </ThemedText>
          </View>

          <View style={styles.summaryGrid}>
            <View style={[styles.summaryItem, { backgroundColor: palette.softCard }]}>
              <ThemedText style={[styles.summaryLabel, { color: palette.faint }]}>Full name</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: palette.text }]}>
                {savedProfile.firstName} {savedProfile.lastName}
              </ThemedText>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: palette.softCard }]}>
              <ThemedText style={[styles.summaryLabel, { color: palette.faint }]}>Gender</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: palette.text }]}>
                {savedProfile.gender || 'Not provided'}
              </ThemedText>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: palette.softCard }]}>
              <ThemedText style={[styles.summaryLabel, { color: palette.faint }]}>Occupation</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: palette.text }]}>
                {savedProfile.occupation || 'Not provided'}
              </ThemedText>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: palette.softCard }]}>
              <ThemedText style={[styles.summaryLabel, { color: palette.faint }]}>Accessibility</ThemedText>
              <ThemedText
                style={[
                  styles.summaryValue,
                  { color: palette.text },
                  savedProfile.hideDisabilities && styles.privateValue,
                  savedProfile.hideDisabilities && { color: palette.muted },
                ]}>
                {publicAccessibilitySummary}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Edit details</ThemedText>
            <ThemedText style={[styles.sectionCaption, { color: palette.muted }]}>
              Local state for now, structured for a future Firebase sync.
            </ThemedText>
          </View>

          <FormField
            label="Avatar URL"
            placeholder="Add an image URL later if you want"
            value={profile.avatar}
            onChangeText={(value) => updateField('avatar', value)}
            palette={palette}
          />
          <FormField
            label="First name"
            placeholder="Enter first name"
            value={profile.firstName}
            onChangeText={(value) => updateField('firstName', value)}
            palette={palette}
          />
          <FormField
            label="Last name"
            placeholder="Enter last name"
            value={profile.lastName}
            onChangeText={(value) => updateField('lastName', value)}
            palette={palette}
          />
          <FormField
            label="Gender"
            placeholder="How would you like to describe your gender?"
            value={profile.gender}
            onChangeText={(value) => updateField('gender', value)}
            palette={palette}
          />
          <FormField
            label="Accessibility needs or disabilities (optional)"
            placeholder="Add anything helpful for support, access, or comfort"
            value={profile.disabilities}
            onChangeText={(value) => updateField('disabilities', value)}
            multiline
            palette={palette}
          />

          <View style={[styles.toggleCard, { backgroundColor: palette.input, borderColor: palette.border }]}>
            <View style={styles.toggleText}>
              <ThemedText style={[styles.toggleTitle, { color: palette.text }]}>
                Hide this information from profile view
              </ThemedText>
              <ThemedText style={[styles.toggleCaption, { color: palette.muted }]}>
                Keep accessibility details private in the public summary while still saving them to
                the profile.
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
            palette={palette}
          />

          <Pressable style={[styles.saveButton, { backgroundColor: palette.primary }]} onPress={saveProfile}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#F8FAFF" />
            <ThemedText style={styles.saveButtonText}>Save profile</ThemedText>
          </Pressable>

          <View
            style={[
              styles.messageCard,
              {
                backgroundColor: palette.primarySoft,
                borderColor: palette.primarySoftBorder,
              },
            ]}>
            <Ionicons name="sparkles-outline" size={16} color={palette.primary} />
            <ThemedText style={[styles.messageText, { color: '#27417E' }]}>
              {saveMessage}
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 12,
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
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
    borderWidth: 2,
  },
  heroText: {
    flex: 1,
    paddingTop: 4,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
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
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  sectionCard: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },
  sectionCaption: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  summaryGrid: {
    gap: 12,
  },
  summaryItem: {
    borderRadius: 20,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    marginTop: 8,
  },
  privateValue: {
    fontStyle: 'italic',
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
  },
  toggleCard: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  toggleCaption: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    color: '#F8FAFF',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  messageCard: {
    marginTop: 14,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
