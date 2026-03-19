import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Circle, MapPressEvent, Marker, Polyline } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DestinationSearchSheet, type SheetState } from '@/components/map/destination-search-sheet';
import {
  DESTINATION_SUGGESTIONS,
  type DestinationSuggestion,
  type RouteMode,
  type TransportMode,
} from '@/components/map/mobility-data';
import { OverlayControls } from '@/components/map/overlay-controls';
import { CITY_REGION } from '@/components/map/map-data';
import { ThemedText } from '@/components/themed-text';
import { useCurrentLocation } from '@/hooks/use-current-location';
import {
  POLLUTION_HEATMAP_LAYERS,
  SAFETY_HEATMAP_LAYERS,
} from '@/lib/overlay-simulator';
import { resolvePlaceSuggestion, searchPlaces } from '@/lib/place-search';
import {
  buildMobilityRouteOptions,
  type MobilityRouteOption,
} from '@/lib/mobility-routing';

const palette = {
  screen: '#EEF3F8',
  panel: 'rgba(255,255,255,0.92)',
  border: 'rgba(18, 34, 58, 0.10)',
  text: '#102133',
  softText: '#6D7C92',
};

function DestinationPin() {
  return (
    <View style={styles.pinWrap}>
      <View style={styles.pinCore}>
        <Ionicons name="flag" size={16} color="#FFFFFF" />
      </View>
      <View style={styles.pinLabel}>
        <ThemedText style={styles.pinLabelText}>Destination</ThemedText>
      </View>
    </View>
  );
}

export default function SmartCityMapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const hasCenteredOnUser = useRef(false);
  const { location, permissionGranted, isLoading: isLocating, errorMessage: locationError } =
    useCurrentLocation();

  const [query, setQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false);
  const [searchResults, setSearchResults] = useState<DestinationSuggestion[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<DestinationSuggestion | null>(null);
  const [routeOptions, setRouteOptions] = useState<MobilityRouteOption[]>([]);
  const [selectedMode, setSelectedMode] = useState<RouteMode | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<TransportMode>('Driving');
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [overlays, setOverlays] = useState({
    eco: false,
    safe: false,
  });

  useEffect(() => {
    if (!permissionGranted || hasCenteredOnUser.current) {
      return;
    }

    hasCenteredOnUser.current = true;
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.045,
        longitudeDelta: 0.045,
      },
      900
    );
  }, [location, permissionGranted]);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSearchResults(DESTINATION_SUGGESTIONS.slice(0, 5));
        return;
      }

      setIsSearchingPlaces(true);

      try {
        const results = await searchPlaces(query, location);

        if (!cancelled) {
          setSearchResults(results.length ? results : DESTINATION_SUGGESTIONS.slice(0, 5));
        }
      } catch {
        if (!cancelled) {
          setSearchResults(DESTINATION_SUGGESTIONS.slice(0, 5));
        }
      } finally {
        if (!cancelled) {
          setIsSearchingPlaces(false);
        }
      }
    }, 260);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [location, query]);

  const activeRoute =
    routeOptions.find((item) => item.mode === selectedMode) ?? routeOptions[0] ?? null;

  const sheetState: SheetState = useMemo(() => {
    if (isSheetCollapsed) {
      return 'collapsed';
    }

    if (routeOptions.length && selectedMode) {
      return 'route';
    }

    if (selectedDestination) {
      return 'destination';
    }

    if (isSearchExpanded || query.length > 0) {
      return 'search';
    }

    return 'collapsed';
  }, [isSearchExpanded, isSheetCollapsed, query.length, routeOptions.length, selectedDestination, selectedMode]);

  const combinedError = routeError || locationError;

  const fitRoute = (destination: DestinationSuggestion, path: { latitude: number; longitude: number }[]) => {
    if (!destination.coordinate) {
      return;
    }

    mapRef.current?.fitToCoordinates([location, destination.coordinate, ...path], {
      edgePadding: {
        top: 120,
        right: 40,
        bottom: 230,
        left: 40,
      },
      animated: true,
    });
  };

  const setDestination = (destination: DestinationSuggestion) => {
    setSelectedDestination(destination);
    setQuery(destination.title);
    setRouteOptions([]);
    setSelectedMode(null);
    setSelectedTransport('Driving');
    setRouteError('');
    setIsSearchExpanded(false);
    setIsSheetCollapsed(false);
  };

  const handleMapPress = (event: MapPressEvent) => {
    Keyboard.dismiss();

    setDestination({
      id: `tap-${event.nativeEvent.coordinate.latitude}-${event.nativeEvent.coordinate.longitude}`,
      title: 'Pinned destination',
      subtitle: 'Selected on map',
      hint: 'Map pin',
      coordinate: event.nativeEvent.coordinate,
    });
  };

  const handleSelectSuggestion = async (suggestion: DestinationSuggestion) => {
    setSelectedDestination(null);
    setRouteOptions([]);
    setSelectedMode(null);
    setRouteError('');
    setIsSearchingPlaces(true);

    try {
      const resolved = await resolvePlaceSuggestion(suggestion);
      setDestination(resolved);
    } catch (error) {
      setRouteError(error instanceof Error ? error.message : 'Unable to open this place.');
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const handleBuildRoute = async () => {
    if (!selectedDestination?.coordinate) {
      return;
    }

    setIsRouting(true);
    setRouteError('');

    try {
      const options = await buildMobilityRouteOptions(
        location,
        selectedDestination,
        selectedTransport
      );
      const defaultMode = options[0]?.mode ?? null;
      setRouteOptions(options);
      setSelectedMode(defaultMode);
      setIsSheetCollapsed(false);
      fitRoute(selectedDestination, options[0]?.path ?? []);
    } catch (error) {
      setRouteError(error instanceof Error ? error.message : 'Unable to build route right now.');
    } finally {
      setIsRouting(false);
    }
  };

  const handleSelectMode = (mode: RouteMode) => {
    setSelectedMode(mode);
    setIsSheetCollapsed(false);

    const nextRoute = routeOptions.find((item) => item.mode === mode);

    if (nextRoute && selectedDestination) {
      fitRoute(selectedDestination, nextRoute.path);
    }
  };

  const handleSelectTransport = async (transportMode: TransportMode) => {
    setSelectedTransport(transportMode);
    setRouteError('');

    if (!selectedDestination?.coordinate) {
      return;
    }

    setIsRouting(true);

    try {
      const options = await buildMobilityRouteOptions(location, selectedDestination, transportMode);
      const defaultMode = options[0]?.mode ?? null;
      setRouteOptions(options);
      setSelectedMode(defaultMode);

      if (options[0]) {
        fitRoute(selectedDestination, options[0].path);
      }
    } catch (error) {
      setRouteError(
        error instanceof Error ? error.message : 'Unable to switch transport mode right now.'
      );
    } finally {
      setIsRouting(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedDestination(null);
    setRouteOptions([]);
    setSelectedMode(null);
    setRouteError('');
    setIsSearchExpanded(true);
    setIsSheetCollapsed(false);
    setSearchResults(DESTINATION_SUGGESTIONS.slice(0, 5));
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={CITY_REGION}
        mapType="standard"
        showsCompass={false}
        showsIndoors={false}
        showsBuildings={false}
        showsPointsOfInterest={false}
        rotateEnabled={false}
        toolbarEnabled={false}
        showsUserLocation
        onPress={handleMapPress}>
        {overlays.eco
          ? POLLUTION_HEATMAP_LAYERS.map((layer) => (
              <Circle
                key={layer.id}
                center={layer.center}
                radius={layer.radius}
                fillColor={layer.fillColor}
                strokeColor={layer.strokeColor}
                strokeWidth={1}
              />
            ))
          : null}

        {overlays.safe
          ? SAFETY_HEATMAP_LAYERS.map((layer) => (
              <Circle
                key={layer.id}
                center={layer.center}
                radius={layer.radius}
                fillColor={layer.fillColor}
                strokeColor={layer.strokeColor}
                strokeWidth={1}
              />
            ))
          : null}

        {selectedDestination?.coordinate ? (
          <Marker coordinate={selectedDestination.coordinate} tracksViewChanges={false}>
            <DestinationPin />
          </Marker>
        ) : null}

        {activeRoute?.path.length ? (
          <Polyline
            coordinates={activeRoute.path}
            strokeColor={activeRoute.strokeColor}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        ) : null}
      </MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={[styles.headerRow, { paddingTop: insets.top + 2 }]}>
          <View style={styles.headerPill}>
            <Ionicons name="navigate-outline" size={16} color="#2D7BFF" />
            <ThemedText style={styles.headerText}>
              {permissionGranted ? 'Live GPS origin' : 'Almaty fallback origin'}
            </ThemedText>
          </View>

          <View style={styles.actionButtons}>
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                setIsSearchExpanded(true);
                setIsSheetCollapsed(false);
                setRouteOptions([]);
                setSelectedMode(null);
                setSelectedTransport('Driving');
                setSelectedDestination(null);
                setQuery('');
              }}>
              <Ionicons name="search-outline" size={18} color={palette.text} />
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() =>
                mapRef.current?.animateToRegion(
                  {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.045,
                    longitudeDelta: 0.045,
                  },
                  900
                )
              }>
              <Ionicons name="locate-outline" size={18} color={palette.text} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.sideControls, { bottom: insets.bottom + 122 }]}>
          <OverlayControls
            values={overlays}
            onToggle={(key) =>
              setOverlays((current) => ({
                ...current,
                [key]: !current[key],
              }))
            }
          />
        </View>

        <DestinationSearchSheet
          state={sheetState}
          isCollapsed={isSheetCollapsed}
          query={query}
          onQueryChange={(value) => {
            setQuery(value);
            setIsSearchExpanded(true);
            setIsSheetCollapsed(false);
            setSelectedDestination(null);
            setRouteOptions([]);
            setSelectedMode(null);
            setSelectedTransport('Driving');
            setRouteError('');
          }}
          onFocus={() => {
            setIsSearchExpanded(true);
            setIsSheetCollapsed(false);
          }}
          onClear={handleClear}
          onToggleCollapse={() => setIsSheetCollapsed((current) => !current)}
          suggestions={searchResults}
          selectedDestination={selectedDestination}
          selectedTransport={selectedTransport}
          onSelectSuggestion={(destination) => void handleSelectSuggestion(destination)}
          onSelectTransport={(mode) => void handleSelectTransport(mode)}
          onBuildRoute={() => void handleBuildRoute()}
          routeOptions={routeOptions}
          selectedMode={selectedMode}
          onSelectMode={handleSelectMode}
          isLoading={isRouting || isSearchingPlaces || isLocating}
          errorMessage={combinedError}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.screen,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
  },
  headerText: {
    color: palette.text,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
  },
  sideControls: {
    position: 'absolute',
    right: 14,
  },
  pinWrap: {
    alignItems: 'center',
  },
  pinCore: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0FBF84',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.86)',
  },
  pinLabel: {
    marginTop: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(18, 34, 58, 0.10)',
  },
  pinLabelText: {
    color: palette.text,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
  },
});
