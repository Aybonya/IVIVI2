import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ROUTE_MODE_META, type RouteMode } from '@/components/map/mobility-data';
import { ThemedText } from '@/components/themed-text';
import type { MobilityRouteOption } from '@/lib/mobility-routing';

const CARD_WIDTH = 224;
const CARD_GAP = 12;
const SNAP_SIZE = CARD_WIDTH + CARD_GAP;

export function RouteOptionsCarousel({
  options,
  selectedMode,
  onSelectMode,
}: {
  options: MobilityRouteOption[];
  selectedMode: RouteMode;
  onSelectMode: (mode: RouteMode) => void;
}) {
  const scrollRef = useRef<ScrollView | null>(null);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SNAP_SIZE);
    const option = options[index];

    if (option) {
      onSelectMode(option.mode);
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={SNAP_SIZE}
      decelerationRate="fast"
      contentContainerStyle={styles.content}
      onMomentumScrollEnd={handleScrollEnd}>
      {options.map((option, index) => {
        const meta = ROUTE_MODE_META[option.mode];
        const isActive = option.mode === selectedMode;

        return (
          <Pressable
            key={option.mode}
            style={[
              styles.card,
              index === options.length - 1 && styles.lastCard,
              isActive && { borderColor: meta.color, backgroundColor: `${meta.color}18` },
            ]}
            onPress={() => {
              onSelectMode(option.mode);
              scrollRef.current?.scrollTo({ x: index * SNAP_SIZE, animated: true });
            }}>
            <View style={styles.header}>
              <View style={[styles.iconWrap, { backgroundColor: `${meta.color}22` }]}>
                <Ionicons
                  name={meta.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={meta.color}
                />
              </View>
              <View style={styles.headerText}>
                <ThemedText style={styles.modeTitle}>{option.mode}</ThemedText>
                <ThemedText style={styles.modeSubtitle}>{option.modeTag}</ThemedText>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View>
                <ThemedText style={styles.metricLabel}>ETA</ThemedText>
                <ThemedText style={styles.metricValue}>{option.durationText}</ThemedText>
              </View>
              <View>
                <ThemedText style={styles.metricLabel}>Arrival</ThemedText>
                <ThemedText style={styles.metricValue}>{option.arrivalTimeText}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.hint}>{option.summaryHint}</ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingRight: 2,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    borderRadius: 20,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  lastCard: {
    marginRight: 0,
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  modeTitle: {
    color: '#F7F9FD',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '800',
  },
  modeSubtitle: {
    color: '#8F9BB5',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  metricLabel: {
    color: '#8F9BB5',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  metricValue: {
    color: '#F7F9FD',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  hint: {
    color: '#A7B0C7',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 14,
  },
});
