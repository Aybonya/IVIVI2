import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MetricDialCard } from '@/components/city/metric-dial-card';
import { ThemedText } from '@/components/themed-text';
import {
  CITY_LAYER_LEGEND,
  CITY_STATE_METRICS,
  CITY_STATE_SUMMARY,
} from '@/lib/smart-city-mock';

const palette = {
  screen: '#F3F4F8',
  card: '#FFFFFF',
  text: '#111111',
  muted: '#8E99AB',
  border: 'rgba(16, 22, 40, 0.08)',
};

export default function CityScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>City State</ThemedText>
        </View>

        <View style={styles.metricsGrid}>
          {CITY_STATE_METRICS.map((metric) => (
            <MetricDialCard
              key={metric.id}
              value={metric.value}
              unit={metric.unit}
              title={metric.title}
              status={metric.status}
              progress={metric.progress}
              color={metric.color}
            />
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Слои карты</ThemedText>
          <View style={styles.legendWrap}>
            {CITY_LAYER_LEGEND.map((item) => (
              <View key={item.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <ThemedText style={styles.legendLabel}>{item.label}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.summaryRow}>
          {CITY_STATE_SUMMARY.map((item) => (
            <View key={item.id} style={styles.summaryCard}>
              <ThemedText style={[styles.summaryValue, { color: item.color }]}>{item.value}</ThemedText>
              <ThemedText style={styles.summaryLabel}>{item.label}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.updateRow}>
          <Ionicons name="time-outline" size={14} color="#8E99AB" />
          <ThemedText style={styles.updateText}>Обновлено сегодня в 11:04</ThemedText>
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  section: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 16,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  legendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: palette.text,
    fontSize: 13,
    lineHeight: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: palette.border,
  },
  summaryValue: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },
  summaryLabel: {
    marginTop: 6,
    color: palette.muted,
    fontSize: 12,
    lineHeight: 15,
  },
  updateRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  updateText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
