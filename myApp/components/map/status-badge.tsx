import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type Props = {
  label: string;
  tone: 'safe' | 'moderate' | 'alert';
};

const tones = {
  safe: {
    backgroundColor: 'rgba(42, 166, 123, 0.16)',
    borderColor: 'rgba(78, 217, 164, 0.28)',
    color: '#8CF0C6',
  },
  moderate: {
    backgroundColor: 'rgba(247, 181, 57, 0.14)',
    borderColor: 'rgba(247, 181, 57, 0.3)',
    color: '#FFD580',
  },
  alert: {
    backgroundColor: 'rgba(255, 106, 106, 0.14)',
    borderColor: 'rgba(255, 106, 106, 0.28)',
    color: '#FFB0B0',
  },
};

export function StatusBadge({ label, tone }: Props) {
  const colors = tones[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
      ]}>
      <ThemedText style={[styles.text, { color: colors.color }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
