import { StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const highlights = [
  {
    title: 'Clean start',
    description: 'A fresh Expo Router home screen without the stock tutorial blocks.',
  },
  {
    title: 'Ready to build',
    description: 'This space can become your onboarding, dashboard, or first product flow.',
  },
  {
    title: 'Easy to grow',
    description: 'We can add auth, tabs, API calls, and animations on top of this layout next.',
  },
];

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#f6eadf', dark: '#2d2119' }}
      headerImage={
        <View style={styles.heroArtwork}>
          <View style={styles.orbLarge} />
          <View style={styles.orbSmall} />
          <View style={styles.frame}>
            <ThemedText style={styles.frameLabel}>myApp</ThemedText>
            <ThemedText style={styles.frameTitle}>Welcome</ThemedText>
          </View>
        </View>
      }>
      <ThemedView style={styles.heroCard} lightColor="#fff7ef" darkColor="#1f1712">
        <ThemedText style={styles.eyebrow}>Start here</ThemedText>
        <ThemedText type="title" style={styles.title}>
          A warmer first screen for your app
        </ThemedText>
        <ThemedText style={styles.lead}>
          Your project is live, styled, and ready for the next idea. This page is now a proper
          landing screen instead of the default Expo starter content.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle">What changed</ThemedText>
        <ThemedText style={styles.sectionCopy}>
          The welcome page now feels like a product surface, with clearer hierarchy and cleaner
          content blocks.
        </ThemedText>
      </ThemedView>

      {highlights.map((item) => (
        <ThemedView
          key={item.title}
          style={styles.featureCard}
          lightColor="#ffffff"
          darkColor="#221a15">
          <View style={styles.featureAccent} />
          <View style={styles.featureBody}>
            <ThemedText type="subtitle" style={styles.featureTitle}>
              {item.title}
            </ThemedText>
            <ThemedText>{item.description}</ThemedText>
          </View>
        </ThemedView>
      ))}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  heroArtwork: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  orbLarge: {
    position: 'absolute',
    top: 28,
    right: 36,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: '#d8a36d',
    opacity: 0.35,
  },
  orbSmall: {
    position: 'absolute',
    bottom: 26,
    left: 34,
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: '#7c4d2f',
    opacity: 0.18,
  },
  frame: {
    width: '100%',
    marginTop: 40,
    borderRadius: 28,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(124,77,47,0.18)',
  },
  frameLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#8a5a38',
  },
  frameTitle: {
    marginTop: 10,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '800',
    color: '#241812',
  },
  heroCard: {
    marginTop: -6,
    borderRadius: 28,
    padding: 24,
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#a1683d',
  },
  title: {
    lineHeight: 38,
  },
  lead: {
    fontSize: 17,
    lineHeight: 27,
  },
  sectionHeader: {
    gap: 8,
    paddingTop: 6,
  },
  sectionCopy: {
    opacity: 0.8,
  },
  featureCard: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: 22,
    padding: 18,
    alignItems: 'flex-start',
  },
  featureAccent: {
    width: 12,
    height: 12,
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: '#c78653',
  },
  featureBody: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 19,
  },
});
