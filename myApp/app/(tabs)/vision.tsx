import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Redirect } from 'expo-router';
import * as Speech from 'expo-speech';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAccessibility } from '@/contexts/accessibility-context';
import {
  analyzeImageForBlindAssistance,
  hasOpenAIVisionConfig,
  type BlindAssistantGuidance,
} from '@/lib/openai-vision';

const palette = {
  screen: '#09131F',
  card: 'rgba(255,255,255,0.08)',
  cardStrong: 'rgba(255,255,255,0.12)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.72)',
  primary: '#59A8FF',
  success: '#33D17A',
  warning: '#FFB547',
  danger: '#FF6B5F',
};

const INITIAL_GUIDANCE: BlindAssistantGuidance = {
  title: 'Ассистент готов',
  detail: 'Нажмите "Анализировать сейчас", чтобы сделать снимок и получить подсказку.',
  spokenText: 'Ассистент готов. Нажмите анализировать сейчас.',
  severity: 'safe',
  tags: ['Ожидание', 'Камера'],
};

function getSeverityColor(severity: BlindAssistantGuidance['severity']) {
  if (severity === 'danger') {
    return palette.danger;
  }

  if (severity === 'caution') {
    return palette.warning;
  }

  return palette.success;
}

export default function VisionScreen() {
  const { blindModeEnabled } = useAccessibility();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [guidanceEnabled, setGuidanceEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState('');
  const [guidance, setGuidance] = useState<BlindAssistantGuidance>(INITIAL_GUIDANCE);
  const hasApiKey = hasOpenAIVisionConfig();

  const severityColor = useMemo(() => getSeverityColor(guidance.severity), [guidance.severity]);

  const speakGuidance = useCallback(
    (nextGuidance: BlindAssistantGuidance) => {
      if (!voiceEnabled) {
        return;
      }

      Speech.stop();
      Speech.speak(nextGuidance.spokenText, {
        language: 'ru-RU',
        rate: 0.92,
        pitch: 1,
      });
    },
    [voiceEnabled]
  );

  const captureAndAnalyze = useCallback(async () => {
    if (
      !blindModeEnabled ||
      !guidanceEnabled ||
      !hasApiKey ||
      !permission?.granted ||
      !cameraRef.current ||
      isAnalyzing
    ) {
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorText('');

      const picture = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.35,
        skipProcessing: true,
        shutterSound: false,
      });

      if (!picture.base64) {
        throw new Error('Camera did not return base64 data.');
      }

      const nextGuidance = await analyzeImageForBlindAssistance(picture.base64);

      setGuidance(nextGuidance);
      setLastUpdatedAt(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      speakGuidance(nextGuidance);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось обработать изображение через OpenAI.';

      setErrorText(message);
      setGuidance({
        title: 'Ошибка анализа',
        detail: 'Не удалось получить подсказку. Проверьте интернет и ключ OpenAI API.',
        spokenText: 'Не удалось получить подсказку. Проверьте интернет и ключ OpenAI API.',
        severity: 'caution',
        tags: ['Ошибка', 'Проверить сеть'],
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [blindModeEnabled, guidanceEnabled, hasApiKey, isAnalyzing, permission?.granted, speakGuidance]);

  useEffect(() => {
    if (!blindModeEnabled) {
      Speech.stop();
    }
  }, [blindModeEnabled]);

  useEffect(() => {
    if (!blindModeEnabled || Platform.OS === 'web') {
      return;
    }

    if (permission && !permission.granted) {
      void requestPermission();
    }
  }, [blindModeEnabled, permission, requestPermission]);

  useEffect(() => {
    if (!blindModeEnabled || !guidanceEnabled || !hasApiKey || !permission?.granted) {
      return;
    }

    void captureAndAnalyze();

    const interval = setInterval(() => {
      void captureAndAnalyze();
    }, 9000);

    return () => {
      clearInterval(interval);
    };
  }, [blindModeEnabled, captureAndAnalyze, guidanceEnabled, hasApiKey, permission?.granted]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  if (!blindModeEnabled) {
    return <Redirect href="/(tabs)/routes" />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.cameraWrap}>
        {permission?.granted && Platform.OS !== 'web' ? (
          <CameraView ref={cameraRef} facing="back" style={styles.camera} />
        ) : (
          <View style={styles.cameraFallback}>
            <Ionicons name="camera-outline" size={48} color={palette.primary} />
            <ThemedText style={styles.cameraFallbackTitle}>Камера не активна</ThemedText>
            <ThemedText style={styles.cameraFallbackText}>
              Разрешите доступ к камере, чтобы OpenAI анализировал сцену и озвучивал подсказки.
            </ThemedText>
          </View>
        )}

        <View style={styles.overlayTop}>
          <View style={styles.liveBadge}>
            <View
              style={[
                styles.liveDot,
                {
                  backgroundColor: isAnalyzing
                    ? palette.primary
                    : guidanceEnabled
                      ? palette.success
                      : palette.warning,
                },
              ]}
            />
            <ThemedText style={styles.liveBadgeText}>
              {isAnalyzing ? 'OpenAI анализирует сцену' : guidanceEnabled ? 'Зрение активно' : 'Зрение на паузе'}
            </ThemedText>
          </View>

          <View style={styles.iconPill}>
            <Ionicons
              name={voiceEnabled ? 'volume-high-outline' : 'volume-mute-outline'}
              size={18}
              color="#FFFFFF"
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!hasApiKey ? (
          <View style={styles.warningCard}>
            <ThemedText style={styles.warningTitle}>Нужен OpenAI API key</ThemedText>
            <ThemedText style={styles.warningText}>
              Добавьте `EXPO_PUBLIC_OPENAI_API_KEY` в `.env`, чтобы включить реальный vision-анализ.
            </ThemedText>
          </View>
        ) : null}

        <View style={[styles.sceneCard, { borderColor: severityColor }]}>
          <ThemedText style={styles.sceneEyebrow}>OpenAI Vision</ThemedText>
          <ThemedText style={styles.sceneTitle}>{guidance.title}</ThemedText>
          <ThemedText style={styles.sceneText}>{guidance.detail}</ThemedText>

          <View style={styles.tagRow}>
            {guidance.tags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <ThemedText style={styles.tagText}>{tag}</ThemedText>
              </View>
            ))}
          </View>

          {lastUpdatedAt ? (
            <ThemedText style={styles.updatedText}>Последний анализ: {lastUpdatedAt}</ThemedText>
          ) : null}
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, guidanceEnabled && styles.actionButtonActive]}
            onPress={() => setGuidanceEnabled((current) => !current)}>
            <Ionicons
              name={guidanceEnabled ? 'pause-outline' : 'play-outline'}
              size={18}
              color="#FFFFFF"
            />
            <ThemedText style={styles.actionButtonText}>
              {guidanceEnabled ? 'Пауза' : 'Запустить'}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.secondaryActionButton]}
            onPress={() => void captureAndAnalyze()}
            disabled={isAnalyzing}>
            <Ionicons name="sparkles-outline" size={18} color={palette.text} />
            <ThemedText style={styles.secondaryActionText}>
              {isAnalyzing ? 'Анализ...' : 'Анализировать сейчас'}
            </ThemedText>
          </Pressable>
        </View>

        <Pressable
          style={[styles.voiceToggle, voiceEnabled && styles.voiceToggleActive]}
          onPress={() => setVoiceEnabled((current) => !current)}>
          <Ionicons
            name={voiceEnabled ? 'volume-high-outline' : 'volume-mute-outline'}
            size={18}
            color={voiceEnabled ? '#FFFFFF' : palette.text}
          />
          <ThemedText style={[styles.voiceToggleText, voiceEnabled && styles.voiceToggleTextActive]}>
            {voiceEnabled ? 'Голосовые подсказки включены' : 'Голосовые подсказки выключены'}
          </ThemedText>
        </Pressable>

        {!permission?.granted ? (
          <Pressable style={styles.permissionButton} onPress={() => void requestPermission()}>
            <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
            <ThemedText style={styles.permissionButtonText}>Разрешить камеру</ThemedText>
          </Pressable>
        ) : null}

        {errorText ? (
          <View style={styles.errorCard}>
            <ThemedText style={styles.errorTitle}>Ошибка OpenAI</ThemedText>
            <ThemedText style={styles.errorText}>{errorText}</ThemedText>
          </View>
        ) : null}

        <View style={styles.helpCard}>
          <ThemedText style={styles.helpTitle}>Что делает ассистент</ThemedText>
          <View style={styles.helpRow}>
            <Ionicons name="camera-outline" size={18} color={palette.primary} />
            <ThemedText style={styles.helpText}>Делает кадр с камеры каждые несколько секунд</ThemedText>
          </View>
          <View style={styles.helpRow}>
            <Ionicons name="sparkles-outline" size={18} color={palette.warning} />
            <ThemedText style={styles.helpText}>Отправляет изображение в OpenAI vision-модель</ThemedText>
          </View>
          <View style={styles.helpRow}>
            <Ionicons name="volume-high-outline" size={18} color={palette.success} />
            <ThemedText style={styles.helpText}>Озвучивает короткую подсказку о препятствиях и пути впереди</ThemedText>
          </View>
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
  cameraWrap: {
    height: 340,
    position: 'relative',
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#101B2B',
    gap: 12,
  },
  cameraFallbackTitle: {
    color: palette.text,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  cameraFallbackText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: 18,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(9,19,31,0.62)',
  },
  liveDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(9,19,31,0.62)',
  },
  content: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },
  warningCard: {
    marginTop: -34,
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(255, 181, 71, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 181, 71, 0.32)',
  },
  warningTitle: {
    color: palette.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  warningText: {
    marginTop: 8,
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  sceneCard: {
    marginTop: -34,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    backgroundColor: palette.cardStrong,
  },
  sceneEyebrow: {
    color: palette.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sceneTitle: {
    marginTop: 10,
    color: palette.text,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
  },
  sceneText: {
    marginTop: 8,
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  tagChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.card,
  },
  tagText: {
    color: palette.text,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  updatedText: {
    marginTop: 14,
    color: palette.muted,
    fontSize: 12,
    lineHeight: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#223149',
  },
  actionButtonActive: {
    backgroundColor: palette.primary,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  secondaryActionButton: {
    backgroundColor: '#FFFFFF',
  },
  secondaryActionText: {
    color: '#09131F',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  voiceToggle: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voiceToggleActive: {
    backgroundColor: '#223149',
  },
  voiceToggleText: {
    color: '#09131F',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  voiceToggleTextActive: {
    color: '#FFFFFF',
  },
  permissionButton: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: palette.primary,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  errorCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(255, 107, 95, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 95, 0.24)',
  },
  errorTitle: {
    color: '#FFD2CE',
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '800',
  },
  errorText: {
    marginTop: 8,
    color: '#FFE6E2',
    fontSize: 13,
    lineHeight: 18,
  },
  helpCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: palette.card,
    gap: 14,
  },
  helpTitle: {
    color: palette.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  helpText: {
    flex: 1,
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
