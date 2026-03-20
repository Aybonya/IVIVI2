import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { CITY_ALERTS, type AlertState } from '@/lib/smart-city-mock';

const FILTERS: { id: 'all' | AlertState; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'active', label: 'Активные' },
  { id: 'resolved', label: 'Ликвидированные' },
];

const palette = {
  screen: '#F3F4F8',
  card: '#FFFFFF',
  text: '#111111',
  muted: '#8E99AB',
  border: 'rgba(16, 22, 40, 0.08)',
  primary: '#1677FF',
};

export default function RisksScreen() {
  const [filter, setFilter] = useState<'all' | AlertState>('all');

  const alerts = useMemo(
    () => CITY_ALERTS.filter((item) => (filter === 'all' ? true : item.state === filter)),
    [filter]
  );

  const activeAlertsCount = CITY_ALERTS.filter((item) => item.state === 'active').length;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>City Alerts</ThemedText>
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{activeAlertsCount}</ThemedText>
          </View>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.grid} />
          <View style={[styles.grid, styles.gridVertical]} />
          {CITY_ALERTS.slice(0, 4).map((alert) => (
            <View
              key={alert.id}
              style={[
                styles.marker,
                {
                  backgroundColor: alert.markerColor,
                  top: alert.markerPosition.top,
                  left: alert.markerPosition.left,
                },
              ]}>
              <Ionicons name={alert.icon as keyof typeof Ionicons.glyphMap} size={13} color="#FFFFFF" />
            </View>
          ))}
          <View style={styles.mapCaption}>
            <ThemedText style={styles.mapCaptionText}>Карта инцидентов</ThemedText>
          </View>
        </View>

        <View style={styles.filtersRow}>
          {FILTERS.map((item) => {
            const active = item.id === filter;

            return (
              <Pressable
                key={item.id}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilter(item.id)}>
                <ThemedText style={[styles.filterText, active && styles.filterTextActive]}>
                  {item.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.listCard}>
          {alerts.map((alert) => (
            <View key={alert.id} style={styles.alertRow}>
              <View style={[styles.alertIcon, { backgroundColor: alert.markerColor }]}>
                <Ionicons name={alert.icon as keyof typeof Ionicons.glyphMap} size={18} color="#FFFFFF" />
              </View>

              <View style={styles.alertCopy}>
                <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
                <ThemedText style={styles.alertAddress}>{alert.address}</ThemedText>
                <View
                  style={[
                    styles.stateBadge,
                    {
                      backgroundColor: alert.badgeBackground,
                    },
                  ]}>
                  <ThemedText style={[styles.stateBadgeText, { color: alert.badgeColor }]}>
                    {alert.badgeText}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={styles.alertTime}>{alert.timeText}</ThemedText>
            </View>
          ))}
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
  content: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  header: {
    paddingTop: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: palette.text,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '800',
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF453A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
  },
  mapCard: {
    height: 158,
    borderRadius: 22,
    backgroundColor: '#E8F0E4',
    overflow: 'hidden',
    position: 'relative',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  gridVertical: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  marker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mapCaption: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  mapCaptionText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#EEF1F7',
  },
  filterChipActive: {
    backgroundColor: palette.primary,
  },
  filterText: {
    color: '#111111',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listCard: {
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  alertRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCopy: {
    flex: 1,
  },
  alertTitle: {
    color: palette.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  alertAddress: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  stateBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stateBadgeText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  alertTime: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 16,
  },
});
