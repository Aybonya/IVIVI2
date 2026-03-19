import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import MapView, { Circle, Marker, Polygon } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CITY_MARKERS,
  CITY_REGION,
  DANGER_ZONE,
  FILTER_OPTIONS,
  SERVICE_AREA,
  type CityMarker,
  type InsightCategory,
  type InsightStatus,
} from '@/components/map/map-data';
import { StatusBadge } from '@/components/map/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

const categoryStyles: Record<
  InsightCategory,
  { color: string; soft: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  Traffic: {
    color: '#FF7A45',
    soft: 'rgba(255, 122, 69, 0.15)',
    icon: 'git-network-outline',
  },
  Safety: {
    color: '#30C48D',
    soft: 'rgba(48, 196, 141, 0.15)',
    icon: 'shield-checkmark-outline',
  },
  Resources: {
    color: '#4DA3FF',
    soft: 'rgba(77, 163, 255, 0.15)',
    icon: 'flash-outline',
  },
};

function getStatusTone(status: InsightStatus): 'safe' | 'moderate' | 'alert' {
  if (status === 'Safe') {
    return 'safe';
  }

  if (status === 'Moderate') {
    return 'moderate';
  }

  return 'alert';
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: InsightCategory;
  active: boolean;
  onPress: () => void;
}) {
  const style = categoryStyles[label];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        active && {
          backgroundColor: style.soft,
          borderColor: style.color,
        },
      ]}>
      <Ionicons name={style.icon} size={13} color={active ? style.color : '#8F9BB5'} />
      <ThemedText style={[styles.filterChipText, active && { color: '#F7F9FD' }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function MiniMarker({
  marker,
  selected,
}: {
  marker: CityMarker;
  selected: boolean;
}) {
  const palette = categoryStyles[marker.category];

  return (
    <View
      style={[
        styles.markerWrap,
        {
          backgroundColor: palette.color,
          borderColor: selected ? '#FFFFFF' : 'rgba(255,255,255,0.58)',
          transform: [{ scale: selected ? 1.08 : 1 }],
        },
      ]}>
      <Ionicons name={palette.icon} size={10} color="#FFFFFF" />
    </View>
  );
}

export default function SmartCityMapScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const [activeFilters, setActiveFilters] = useState<InsightCategory[]>(FILTER_OPTIONS);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [isTopUIVisible, setIsTopUIVisible] = useState(false);
  const [isBottomExpanded, setIsBottomExpanded] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const visibleMarkers = useMemo(
    () => CITY_MARKERS.filter((marker) => activeFilters.includes(marker.category)),
    [activeFilters]
  );

  const selectedMarker =
    visibleMarkers.find((marker) => marker.id === selectedMarkerId) ??
    CITY_MARKERS.find((marker) => marker.id === selectedMarkerId) ??
    null;

  useEffect(() => {
    if (selectedMarkerId && !visibleMarkers.some((marker) => marker.id === selectedMarkerId)) {
      setSelectedMarkerId(null);
      setIsBottomExpanded(false);
    }
  }, [selectedMarkerId, visibleMarkers]);

  const toggleFilter = (filter: InsightCategory) => {
    setActiveFilters((current) => {
      if (current.includes(filter)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((item) => item !== filter);
      }

      return [...current, filter];
    });
  };

  const centerMap = () => {
    mapRef.current?.animateToRegion(CITY_REGION, 900);
  };

  const handleMapPress = () => {
    setIsFocusMode(true);
    setIsTopUIVisible(false);
    setIsBottomExpanded(false);
  };

  const handleMarkerPress = (marker: CityMarker) => {
    setSelectedMarkerId(marker.id);
    setIsBottomExpanded(true);
    setIsTopUIVisible(false);
    setIsFocusMode(false);
  };

  const toggleFocusMode = () => {
    setIsFocusMode((current) => {
      const next = !current;

      if (next) {
        setIsTopUIVisible(false);
        setIsBottomExpanded(false);
      }

      return next;
    });
  };

  const toggleTopUI = () => {
    setIsTopUIVisible((current) => !current);
    setIsFocusMode(false);
  };

  const expandBottomPanel = () => {
    if (selectedMarker) {
      setIsBottomExpanded(true);
      setIsFocusMode(false);
    }
  };

  const collapseBottomPanel = () => {
    setIsBottomExpanded(false);
  };

  const showTopContent = isTopUIVisible && !isFocusMode;
  const showBottomExpanded = !!selectedMarker && isBottomExpanded && !isFocusMode;
  const showBottomCollapsed = !!selectedMarker && !isBottomExpanded && !isFocusMode;
  const mapType = Platform.OS === 'ios' ? (isDark ? 'mutedStandard' : 'standard') : 'standard';
  const palette = isDark
    ? {
        screen: '#07101C',
        shade: 'rgba(4, 10, 18, 0.12)',
        panel: 'rgba(8, 17, 31, 0.82)',
        panelSolid: 'rgba(7, 13, 24, 0.94)',
        card: 'rgba(255,255,255,0.05)',
        border: 'rgba(255,255,255,0.08)',
        text: '#F7F9FD',
        muted: '#8F9BB5',
        softText: '#A7B0C7',
        dot: '#56D6A2',
        badge: 'rgba(93, 106, 255, 0.18)',
        badgeText: '#9AB0FF',
      }
    : {
        screen: '#EEF3F9',
        shade: 'rgba(255, 255, 255, 0.00)',
        panel: 'rgba(255, 255, 255, 0.92)',
        panelSolid: 'rgba(255, 255, 255, 0.96)',
        card: 'rgba(13, 24, 40, 0.05)',
        border: 'rgba(16, 29, 46, 0.10)',
        text: '#112033',
        muted: '#6C7B91',
        softText: '#6C7B91',
        dot: '#1FA971',
        badge: 'rgba(54, 93, 255, 0.10)',
        badgeText: '#365DFF',
      };

  return (
    <View style={[styles.screen, { backgroundColor: palette.screen }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={CITY_REGION}
        mapType={mapType}
        showsCompass={false}
        showsBuildings={false}
        showsPointsOfInterest={false}
        showsIndoors={false}
        toolbarEnabled={false}
        pitchEnabled
        rotateEnabled={false}
        onPress={handleMapPress}>
        {activeFilters.includes('Safety') ? (
          <Circle
            center={DANGER_ZONE.center}
            radius={DANGER_ZONE.radius}
            fillColor="rgba(255, 106, 106, 0.16)"
            strokeColor="rgba(255, 106, 106, 0.45)"
            strokeWidth={2}
          />
        ) : null}

        {activeFilters.includes('Resources') ? (
          <Polygon
            coordinates={SERVICE_AREA}
            fillColor="rgba(77, 163, 255, 0.12)"
            strokeColor="rgba(77, 163, 255, 0.48)"
            strokeWidth={2}
          />
        ) : null}

        {visibleMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => handleMarkerPress(marker)}
            tracksViewChanges={false}>
            <MiniMarker marker={marker} selected={marker.id === selectedMarker?.id} />
          </Marker>
        ))}
      </MapView>

      <View pointerEvents="none" style={[styles.mapShade, { backgroundColor: palette.shade }]} />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={[styles.topContainer, { paddingTop: insets.top + 6 }]}>
          <View style={styles.compactBar}>
            <Pressable
              style={[styles.compactInfo, { backgroundColor: palette.panel, borderColor: palette.border }]}
              onPress={toggleTopUI}>
              <View style={[styles.compactDot, { backgroundColor: palette.dot }]} />
              <View style={styles.compactTextWrap}>
                <ThemedText style={[styles.compactLabel, { color: palette.muted }]}>Live urban layer</ThemedText>
                <ThemedText style={[styles.compactTitle, { color: palette.text }]}>Almaty Grid</ThemedText>
              </View>
            </Pressable>

            <View style={styles.compactActions}>
              <Pressable
                style={[styles.smallRoundButton, { backgroundColor: palette.panel, borderColor: palette.border }]}
                onPress={toggleTopUI}>
                <Ionicons
                  name={showTopContent ? 'chevron-up' : 'options-outline'}
                  size={18}
                  color={palette.text}
                />
              </Pressable>
              <Pressable
                style={[styles.smallRoundButton, { backgroundColor: palette.panel, borderColor: palette.border }]}
                onPress={centerMap}>
                <Ionicons name="locate" size={18} color={palette.text} />
              </Pressable>
            </View>
          </View>

          {showTopContent ? (
            <View style={[styles.topSheet, { backgroundColor: palette.panel, borderColor: palette.border }]}>
              <View style={[styles.searchBar, { backgroundColor: palette.card, borderColor: palette.border }]}>
                <Ionicons name="search-outline" size={18} color={palette.softText} />
                <TextInput
                  editable={false}
                  placeholder="Search districts, hubs, and incidents"
                  placeholderTextColor={palette.softText}
                  style={[styles.searchInput, { color: palette.text }]}
                />
                <View style={[styles.searchBadge, { backgroundColor: palette.badge }]}>
                  <ThemedText style={[styles.searchBadgeText, { color: palette.badgeText }]}>Live</ThemedText>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}>
                {FILTER_OPTIONS.map((filter) => (
                  <FilterChip
                    key={filter}
                    label={filter}
                    active={activeFilters.includes(filter)}
                    onPress={() => toggleFilter(filter)}
                  />
                ))}
              </ScrollView>

              <View style={styles.summaryRow}>
                <View>
                  <ThemedText style={[styles.summaryLabel, { color: palette.muted }]}>Urban intelligence</ThemedText>
                  <ThemedText style={[styles.summaryTitle, { color: palette.text }]}>Almaty Live Grid</ThemedText>
                </View>
                <View style={[styles.summaryMetric, { backgroundColor: palette.card }]}>
                  <ThemedText style={[styles.summaryMetricValue, { color: palette.text }]}>{visibleMarkers.length}</ThemedText>
                  <ThemedText style={[styles.summaryMetricLabel, { color: palette.muted }]}>signals</ThemedText>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        <View style={[styles.floatingActions, { bottom: insets.bottom + 138 }]}>
          <Pressable
            style={[styles.focusButton, { backgroundColor: palette.panel, borderColor: palette.border }]}
            onPress={toggleFocusMode}>
            <Ionicons
              name={isFocusMode ? 'scan-outline' : 'eye-off-outline'}
              size={16}
              color={palette.text}
            />
            <ThemedText style={[styles.focusButtonText, { color: palette.text }]}>
              {isFocusMode ? 'Expand UI' : 'Focus Map'}
            </ThemedText>
          </Pressable>
        </View>

        {showBottomExpanded ? (
          <View
            style={[
              styles.bottomPanel,
              { paddingBottom: Math.max(insets.bottom, 16), backgroundColor: palette.panelSolid, borderColor: palette.border },
            ]}>
            <Pressable style={styles.grabberPress} onPress={collapseBottomPanel}>
              <View style={[styles.grabber, { backgroundColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(17,32,51,0.16)' }]} />
            </Pressable>

            <View style={styles.bottomHeader}>
              <View style={styles.bottomTitleWrap}>
                <ThemedText style={[styles.bottomEyebrow, { color: palette.muted }]}>{selectedMarker.category}</ThemedText>
                <ThemedText style={[styles.bottomTitle, { color: palette.text }]}>{selectedMarker.title}</ThemedText>
              </View>
              <StatusBadge
                label={selectedMarker.status}
                tone={getStatusTone(selectedMarker.status)}
              />
            </View>

            <ThemedText style={[styles.bottomDescription, { color: palette.softText }]}>{selectedMarker.description}</ThemedText>

            <View style={styles.metricRow}>
              <View style={[styles.metricCard, { backgroundColor: palette.card }]}>
                <ThemedText style={[styles.metricLabel, { color: palette.muted }]}>Response note</ThemedText>
                <ThemedText style={[styles.metricValue, { color: palette.text }]}>{selectedMarker.detail}</ThemedText>
              </View>
              <View style={[styles.metricCard, { backgroundColor: palette.card }]}>
                <ThemedText style={[styles.metricLabel, { color: palette.muted }]}>Quick signal</ThemedText>
                <ThemedText style={[styles.metricValue, { color: palette.text }]}>{selectedMarker.eta}</ThemedText>
              </View>
            </View>
          </View>
        ) : null}

        {showBottomCollapsed ? (
          <Pressable
            style={[
              styles.bottomMini,
              { bottom: Math.max(insets.bottom, 16), backgroundColor: palette.panelSolid, borderColor: palette.border },
            ]}
            onPress={expandBottomPanel}>
            <View style={styles.bottomMiniLeft}>
              <View
                style={[
                  styles.bottomMiniAccent,
                  { backgroundColor: categoryStyles[selectedMarker.category].color },
                ]}
              />
              <View style={styles.bottomMiniTextWrap}>
                <ThemedText style={[styles.bottomMiniLabel, { color: palette.muted }]}>{selectedMarker.category}</ThemedText>
                <ThemedText style={[styles.bottomMiniTitle, { color: palette.text }]}>{selectedMarker.title}</ThemedText>
              </View>
            </View>
            <View style={styles.bottomMiniRight}>
              <StatusBadge
                label={selectedMarker.status}
                tone={getStatusTone(selectedMarker.status)}
              />
            </View>
          </Pressable>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07101C',
  },
  mapShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 10, 18, 0.08)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topContainer: {
    paddingHorizontal: 14,
    gap: 10,
  },
  compactBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(8, 17, 31, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  compactDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#56D6A2',
  },
  compactTextWrap: {
    flex: 1,
  },
  compactLabel: {
    color: '#8E9AB4',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  compactTitle: {
    color: '#F7F9FD',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 3,
  },
  compactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallRoundButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 17, 31, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topSheet: {
    borderRadius: 28,
    padding: 14,
    gap: 12,
    backgroundColor: 'rgba(8, 17, 31, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFF',
    fontSize: 15,
  },
  searchBadge: {
    borderRadius: 999,
    backgroundColor: 'rgba(93, 106, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchBadgeText: {
    color: '#9AB0FF',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  filterRow: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipText: {
    color: '#A1A9BE',
    fontSize: 13,
    lineHeight: 15,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#8F9BB7',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
  },
  summaryTitle: {
    color: '#F8FAFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryMetric: {
    minWidth: 72,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  summaryMetricValue: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '800',
  },
  summaryMetricLabel: {
    color: '#98A2BD',
    fontSize: 11,
    lineHeight: 13,
    marginTop: 3,
  },
  floatingActions: {
    position: 'absolute',
    right: 14,
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(8, 17, 31, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 10,
  },
  focusButtonText: {
    color: '#F7F9FD',
    fontSize: 13,
    lineHeight: 15,
    fontWeight: '700',
  },
  markerWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 5,
  },
  bottomPanel: {
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: 'rgba(7, 13, 24, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 14,
  },
  grabberPress: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  grabber: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  bottomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  bottomTitleWrap: {
    flex: 1,
  },
  bottomEyebrow: {
    color: '#8B96B1',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bottomTitle: {
    color: '#F8FAFF',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    marginTop: 6,
  },
  bottomDescription: {
    color: '#B4BED4',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  metricCard: {
    flex: 1,
    borderRadius: 22,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  metricLabel: {
    color: '#8F9BB7',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricValue: {
    color: '#F5F7FB',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  bottomMini: {
    marginHorizontal: 14,
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(7, 13, 24, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bottomMiniLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bottomMiniAccent: {
    width: 10,
    height: 34,
    borderRadius: 999,
  },
  bottomMiniTextWrap: {
    flex: 1,
  },
  bottomMiniLabel: {
    color: '#8B96B1',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bottomMiniTitle: {
    color: '#F7F9FD',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  bottomMiniRight: {
    alignItems: 'flex-end',
  },
});
