import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DESTINATION_SUGGESTIONS,
  type DestinationSuggestion,
  type TransportMode,
} from '@/components/map/mobility-data';
import { ThemedText } from '@/components/themed-text';

type MockRouteOption = {
  id: string;
  mode: string;
  eta: string;
  distance: string;
  color: string;
  hint: string;
};

const palette = {
  screen: '#F3F4F8',
  card: '#FFFFFF',
  text: '#111111',
  muted: '#8E99AB',
  border: 'rgba(16, 22, 40, 0.08)',
  primary: '#1677FF',
};

function buildMockRoutes(transportMode: TransportMode): MockRouteOption[] {
  if (transportMode === 'Driving') {
    return [
      {
        id: 'fastest',
        mode: 'Fastest',
        eta: '14 мин',
        distance: '6.2 км',
        color: '#1677FF',
        hint: 'Минимальное время в пути',
      },
      {
        id: 'eco',
        mode: 'Eco',
        eta: '17 мин',
        distance: '6.6 км',
        color: '#34C759',
        hint: 'Меньше загруженных и пыльных участков',
      },
      {
        id: 'safe',
        mode: 'Safe',
        eta: '18 мин',
        distance: '6.8 км',
        color: '#FF9500',
        hint: 'Более спокойный коридор движения',
      },
    ];
  }

  return [
    {
      id: 'shortest',
      mode: 'Shortest',
      eta: '21 мин',
      distance: '1.9 км',
      color: '#1677FF',
      hint: 'Наиболее короткая пешая траектория',
    },
    {
      id: 'safe',
      mode: 'Safe',
      eta: '24 мин',
      distance: '2.2 км',
      color: '#FF9500',
      hint: 'Маршрут через более оживлённые зоны',
    },
    {
      id: 'accessible',
      mode: 'Accessible',
      eta: '26 мин',
      distance: '2.4 км',
      color: '#7D5BFF',
      hint: 'Более ровный и комфортный проход',
    },
  ];
}

export default function RoutesWebScreen() {
  const [query, setQuery] = useState('');
  const [selectedTransport, setSelectedTransport] = useState<TransportMode>('Driving');
  const [selectedDestination, setSelectedDestination] = useState<DestinationSuggestion | null>(
    DESTINATION_SUGGESTIONS[0] ?? null
  );

  const suggestions = useMemo(() => {
    if (query.trim().length < 2) {
      return DESTINATION_SUGGESTIONS.slice(0, 5);
    }

    const value = query.toLowerCase();
    return DESTINATION_SUGGESTIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(value) || item.subtitle.toLowerCase().includes(value)
    );
  }, [query]);

  const routes = useMemo(() => buildMockRoutes(selectedTransport), [selectedTransport]);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Routes</ThemedText>
          <ThemedText style={styles.subtitle}>
            Быстрый planner для web-preview без нативной карты
          </ThemedText>
        </View>

        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={palette.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Куда вы хотите добраться?"
              placeholderTextColor={palette.muted}
              style={styles.input}
            />
          </View>

          <View style={styles.transportRow}>
            {(['Driving', 'Walking'] as TransportMode[]).map((mode) => {
              const active = mode === selectedTransport;

              return (
                <Pressable
                  key={mode}
                  style={[styles.transportChip, active && styles.transportChipActive]}
                  onPress={() => setSelectedTransport(mode)}>
                  <Ionicons
                    name={mode === 'Driving' ? 'car-outline' : 'walk-outline'}
                    size={16}
                    color={active ? '#FFFFFF' : palette.text}
                  />
                  <ThemedText style={[styles.transportText, active && styles.transportTextActive]}>
                    {mode === 'Driving' ? 'Driving' : 'Walking'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Популярные точки</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsRow}>
            {suggestions.map((item) => {
              const active = selectedDestination?.id === item.id;

              return (
                <Pressable
                  key={item.id}
                  style={[styles.suggestionCard, active && styles.suggestionCardActive]}
                  onPress={() => {
                    setSelectedDestination(item);
                    setQuery(item.title);
                  }}>
                  <ThemedText style={[styles.suggestionTitle, active && styles.suggestionTitleActive]}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.suggestionSubtitle}>{item.subtitle}</ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Варианты маршрута {selectedDestination ? `до ${selectedDestination.title}` : ''}
          </ThemedText>

          {routes.map((route) => (
            <View key={route.id} style={styles.routeCard}>
              <View style={[styles.routeAccent, { backgroundColor: route.color }]} />
              <View style={styles.routeBody}>
                <View style={styles.routeHeader}>
                  <ThemedText style={styles.routeMode}>{route.mode}</ThemedText>
                  <ThemedText style={styles.routeEta}>{route.eta}</ThemedText>
                </View>
                <ThemedText style={styles.routeDistance}>{route.distance}</ThemedText>
                <ThemedText style={styles.routeHint}>{route.hint}</ThemedText>
              </View>
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
  },
  title: {
    color: palette.text,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  searchCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F6F8FC',
  },
  input: {
    flex: 1,
    color: palette.text,
    fontSize: 15,
  },
  transportRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  transportChip: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F1F4FA',
  },
  transportChipActive: {
    backgroundColor: palette.primary,
  },
  transportText: {
    color: palette.text,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  transportTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  suggestionsRow: {
    gap: 10,
    paddingTop: 12,
  },
  suggestionCard: {
    width: 170,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: palette.border,
  },
  suggestionCardActive: {
    borderColor: 'rgba(22, 119, 255, 0.28)',
    backgroundColor: 'rgba(22, 119, 255, 0.06)',
  },
  suggestionTitle: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  suggestionTitleActive: {
    color: palette.primary,
  },
  suggestionSubtitle: {
    marginTop: 6,
    color: palette.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  routeCard: {
    marginTop: 12,
    flexDirection: 'row',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: palette.border,
  },
  routeAccent: {
    width: 8,
  },
  routeBody: {
    flex: 1,
    padding: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeMode: {
    color: palette.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  routeEta: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  routeDistance: {
    marginTop: 6,
    color: palette.muted,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
  },
  routeHint: {
    marginTop: 10,
    color: palette.text,
    fontSize: 13,
    lineHeight: 18,
  },
});
