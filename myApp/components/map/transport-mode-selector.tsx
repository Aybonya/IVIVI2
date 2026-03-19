import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { TRANSPORT_MODE_META, type TransportMode } from '@/components/map/mobility-data';
import { ThemedText } from '@/components/themed-text';

export function TransportModeSelector({
  selectedTransport,
  onSelectTransport,
}: {
  selectedTransport: TransportMode;
  onSelectTransport: (mode: TransportMode) => void;
}) {
  return (
    <View style={styles.row}>
      {(Object.keys(TRANSPORT_MODE_META) as TransportMode[]).map((mode) => {
        const meta = TRANSPORT_MODE_META[mode];
        const active = mode === selectedTransport;

        return (
          <Pressable
            key={mode}
            style={[
              styles.button,
              active && { borderColor: meta.color, backgroundColor: `${meta.color}16` },
            ]}
            onPress={() => onSelectTransport(mode)}>
            <Ionicons
              name={meta.icon as keyof typeof Ionicons.glyphMap}
              size={18}
              color={active ? meta.color : '#8F9BB5'}
            />
            <ThemedText style={[styles.label, active && { color: meta.color }]}>{mode}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    color: '#F7F9FD',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
});
