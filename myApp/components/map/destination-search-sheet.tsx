import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import type { DestinationSuggestion, RouteMode, TransportMode } from '@/components/map/mobility-data';
import { RouteOptionsCarousel } from '@/components/map/route-options-carousel';
import { TransportModeSelector } from '@/components/map/transport-mode-selector';
import { ThemedText } from '@/components/themed-text';
import type { MobilityRouteOption } from '@/lib/mobility-routing';

export type SheetState = 'collapsed' | 'search' | 'destination' | 'route';

function getSheetHeight(state: SheetState) {
  if (state === 'search') {
    return 320;
  }

  if (state === 'destination') {
    return 210;
  }

  if (state === 'route') {
    return 390;
  }

  return 84;
}

export function DestinationSearchSheet({
  state,
  isCollapsed,
  query,
  onQueryChange,
  onFocus,
  onClear,
  onToggleCollapse,
  suggestions,
  selectedDestination,
  selectedTransport,
  onSelectSuggestion,
  onSelectTransport,
  onBuildRoute,
  routeOptions,
  selectedMode,
  onSelectMode,
  isLoading,
  errorMessage,
}: {
  state: SheetState;
  isCollapsed: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onFocus: () => void;
  onClear: () => void;
  onToggleCollapse: () => void;
  suggestions: DestinationSuggestion[];
  selectedDestination: DestinationSuggestion | null;
  selectedTransport: TransportMode;
  onSelectSuggestion: (destination: DestinationSuggestion) => void;
  onSelectTransport: (mode: TransportMode) => void;
  onBuildRoute: () => void;
  routeOptions: MobilityRouteOption[];
  selectedMode: RouteMode | null;
  onSelectMode: (mode: RouteMode) => void;
  isLoading: boolean;
  errorMessage: string;
}) {
  const height = useRef(new Animated.Value(getSheetHeight(state))).current;

  useEffect(() => {
    Animated.timing(height, {
      toValue: getSheetHeight(state),
      duration: 240,
      useNativeDriver: false,
    }).start();
  }, [height, state]);

  const activeRoute = routeOptions.find((item) => item.mode === selectedMode) ?? null;

  return (
    <Animated.View style={[styles.sheet, { height }]}>
      <View style={styles.inputRow}>
        <Ionicons name="search-outline" size={18} color="#8F9BB5" />
        <TextInput
          value={query}
          onFocus={onFocus}
          onChangeText={onQueryChange}
          placeholder="Куда вы хотите добраться?"
          placeholderTextColor="#8F9BB5"
          style={styles.input}
        />
        {isLoading ? <ActivityIndicator size="small" color="#F7F9FD" /> : null}
        {query.length > 0 ? (
          <Pressable onPress={onClear}>
            <Ionicons name="close-circle" size={18} color="#8F9BB5" />
          </Pressable>
        ) : null}
        <Pressable style={styles.toggleButton} onPress={onToggleCollapse}>
          <Ionicons
            name={isCollapsed ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#8F9BB5"
          />
        </Pressable>
      </View>

      {errorMessage ? (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={16} color="#FF9A9A" />
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        </View>
      ) : null}

      {state === 'search' ? (
        <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
          {suggestions.map((item) => (
            <Pressable
              key={item.id}
              style={styles.resultItem}
              onPress={() => onSelectSuggestion(item)}>
              <View style={styles.resultIcon}>
                <Ionicons name="location-outline" size={18} color="#9FB3FF" />
              </View>
              <View style={styles.resultText}>
                <ThemedText style={styles.resultTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.resultSubtitle}>
                  {item.subtitle} · {item.hint}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {state === 'destination' && selectedDestination ? (
        <View style={styles.destinationState}>
          <View style={styles.destinationHeader}>
            <View style={styles.destinationIcon}>
              <Ionicons name="flag-outline" size={18} color="#A678FF" />
            </View>
            <View style={styles.destinationCopy}>
              <ThemedText style={styles.destinationTitle}>{selectedDestination.title}</ThemedText>
              <ThemedText style={styles.destinationSubtitle}>
                {selectedDestination.subtitle}
              </ThemedText>
            </View>
          </View>

          <TransportModeSelector
            selectedTransport={selectedTransport}
            onSelectTransport={onSelectTransport}
          />

          <Pressable style={styles.buildButton} onPress={onBuildRoute} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#F8FAFF" />
            ) : (
              <Ionicons name="git-network-outline" size={18} color="#F8FAFF" />
            )}
            <ThemedText style={styles.buildButtonText}>Build Route</ThemedText>
          </Pressable>
        </View>
      ) : null}

      {state === 'route' && activeRoute ? (
        <View style={styles.routeState}>
          <TransportModeSelector
            selectedTransport={selectedTransport}
            onSelectTransport={onSelectTransport}
          />

          <View style={styles.routeHeader}>
            <View style={styles.routePoints}>
              <ThemedText style={styles.routeLabel}>From</ThemedText>
              <ThemedText style={styles.routeValue}>Current location</ThemedText>
              <ThemedText style={[styles.routeLabel, styles.routeLabelOffset]}>To</ThemedText>
              <ThemedText style={styles.routeValue}>{activeRoute.destinationName}</ThemedText>
            </View>
            <View style={styles.routeStats}>
              <ThemedText style={styles.routeStatMain}>{activeRoute.durationText}</ThemedText>
              <ThemedText style={styles.routeStatSub}>
                {activeRoute.arrivalTimeText} · {activeRoute.distanceText}
              </ThemedText>
            </View>
          </View>

          <RouteOptionsCarousel
            options={routeOptions}
            selectedMode={selectedMode ?? activeRoute.mode}
            onSelectMode={onSelectMode}
          />
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingTop: 14,
    backgroundColor: 'rgba(7, 13, 24, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  inputRow: {
    minHeight: 54,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  input: {
    flex: 1,
    color: '#F7F9FD',
    fontSize: 15,
    paddingVertical: 0,
  },
  toggleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  resultsList: {
    marginTop: 14,
  },
  resultItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  resultIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159, 179, 255, 0.12)',
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    color: '#F7F9FD',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  resultSubtitle: {
    color: '#8F9BB5',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  destinationState: {
    marginTop: 14,
    paddingBottom: 14,
  },
  destinationHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  destinationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(166, 120, 255, 0.16)',
  },
  destinationCopy: {
    flex: 1,
  },
  destinationTitle: {
    color: '#F7F9FD',
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '800',
  },
  destinationSubtitle: {
    color: '#8F9BB5',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  buildButton: {
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#365DFF',
  },
  buildButtonText: {
    color: '#F8FAFF',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  routeState: {
    marginTop: 14,
    paddingBottom: 14,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
    marginBottom: 14,
  },
  routePoints: {
    flex: 1,
  },
  routeLabel: {
    color: '#8F9BB5',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  routeLabelOffset: {
    marginTop: 10,
  },
  routeValue: {
    color: '#F7F9FD',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  routeStats: {
    alignItems: 'flex-end',
  },
  routeStatMain: {
    color: '#F7F9FD',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  routeStatSub: {
    color: '#8F9BB5',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  errorCard: {
    marginTop: 12,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.18)',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    color: '#FFB2B2',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
