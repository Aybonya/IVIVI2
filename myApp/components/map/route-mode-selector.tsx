import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ROUTE_MODE_META, type RouteMode } from '@/components/map/mobility-data';

export function RouteModeSelector({
  selectedMode,
  onSelectMode,
}: {
  selectedMode: RouteMode | null;
  onSelectMode: (mode: RouteMode) => void;
}) {
  return (
    <View style={styles.container}>
      {(Object.keys(ROUTE_MODE_META) as RouteMode[]).map((mode) => {
        const meta = ROUTE_MODE_META[mode];
        const isActive = selectedMode === mode;

        return (
          <Pressable
            key={mode}
            style={[
              styles.card,
              isActive && { borderColor: meta.color, backgroundColor: `${meta.color}18` },
            ]}
            onPress={() => onSelectMode(mode)}>
            <View style={styles.header}>
              <View style={[styles.iconWrap, { backgroundColor: `${meta.color}22` }]}>
                <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={16} color={meta.color} />
              </View>
              <ThemedText style={styles.title}>{mode}</ThemedText>
            </View>
            <ThemedText style={styles.description}>{meta.description}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#F7F9FD',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '800',
  },
  description: {
    color: '#A7B0C7',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
});
