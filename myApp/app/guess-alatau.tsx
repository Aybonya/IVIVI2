import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import {
  GUESS_ALATAU_LEADERBOARD,
  GUESS_ALATAU_ROUNDS,
} from '@/lib/smart-city-mock';

const ROUND_DURATION = 30;

const palette = {
  screen: '#F3F4F8',
  card: '#FFFFFF',
  text: '#111111',
  muted: '#8E99AB',
  border: 'rgba(16, 22, 40, 0.08)',
  primary: '#1677FF',
  primarySoft: 'rgba(22, 119, 255, 0.08)',
  success: '#34C759',
};

export default function GuessAlatauScreen() {
  const [playerName, setPlayerName] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [isFinished, setIsFinished] = useState(false);

  const currentRound = GUESS_ALATAU_ROUNDS[roundIndex] ?? null;

  useEffect(() => {
    if (!hasStarted || isFinished || selectedOption) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(interval);
          setSelectedOption('__timeout__');
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, isFinished, selectedOption]);

  const roundProgress = useMemo(
    () => `${Math.min(roundIndex + 1, GUESS_ALATAU_ROUNDS.length)}/${GUESS_ALATAU_ROUNDS.length}`,
    [roundIndex]
  );

  const startGame = () => {
    if (playerName.trim().length < 2) {
      return;
    }

    setScore(0);
    setRoundIndex(0);
    setTimeLeft(ROUND_DURATION);
    setSelectedOption(null);
    setIsFinished(false);
    setHasStarted(true);
  };

  const handleSelectOption = (option: string) => {
    if (!currentRound || selectedOption) {
      return;
    }

    setSelectedOption(option);

    if (option === currentRound.correctOption) {
      setScore((current) => current + 100 + timeLeft * 2);
    }
  };

  const goNext = () => {
    if (roundIndex >= GUESS_ALATAU_ROUNDS.length - 1) {
      setIsFinished(true);
      return;
    }

    setRoundIndex((current) => current + 1);
    setTimeLeft(ROUND_DURATION);
    setSelectedOption(null);
  };

  const resetGame = () => {
    setHasStarted(false);
    setRoundIndex(0);
    setTimeLeft(ROUND_DURATION);
    setSelectedOption(null);
    setIsFinished(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={16} color={palette.primary} />
          <ThemedText style={styles.backLinkText}>В приложение</ThemedText>
        </Pressable>

        {!hasStarted ? (
          <View style={styles.card}>
            <View style={styles.gameLogo}>
              <Ionicons name="locate-outline" size={28} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.title}>Угадай Алатау</ThemedText>
            <ThemedText style={styles.subtitle}>
              Смотри на описание локации и угадай, где сделан снимок.
            </ThemedText>
            <ThemedText style={styles.metaText}>5 раундов · 30 секунд на каждый</ThemedText>

            <View style={styles.instructionsCard}>
              <View style={styles.instructionRow}>
                <Ionicons name="camera-outline" size={18} color="#111111" />
                <ThemedText style={styles.instructionText}>Изучи описание локации</ThemedText>
              </View>
              <View style={styles.instructionRow}>
                <Ionicons name="location-outline" size={18} color="#111111" />
                <ThemedText style={styles.instructionText}>
                  Выбери правильное место на карточках
                </ThemedText>
              </View>
              <View style={styles.instructionRow}>
                <Ionicons name="trophy-outline" size={18} color="#111111" />
                <ThemedText style={styles.instructionText}>Получай очки за точность и скорость</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.inputLabel}>Твоё имя</ThemedText>
            <TextInput
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Введи имя (мин. 2 символа)"
              placeholderTextColor={palette.muted}
              style={styles.input}
            />

            <Pressable
              style={[styles.primaryButton, playerName.trim().length < 2 && styles.disabledButton]}
              onPress={startGame}
              disabled={playerName.trim().length < 2}>
              <ThemedText style={styles.primaryButtonText}>Начать игру</ThemedText>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={() => setShowLeaderboard((current) => !current)}>
              <ThemedText style={styles.secondaryButtonText}>Таблица лидеров</ThemedText>
            </Pressable>

            {showLeaderboard ? (
              <View style={styles.leaderboardCard}>
                {GUESS_ALATAU_LEADERBOARD.map((item, index) => (
                  <View key={item.id} style={styles.leaderboardRow}>
                    <ThemedText style={styles.leaderboardPlace}>#{index + 1}</ThemedText>
                    <ThemedText style={styles.leaderboardName}>{item.name}</ThemedText>
                    <ThemedText style={styles.leaderboardScore}>{item.score}</ThemedText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.gameHeader}>
              <View>
                <ThemedText style={styles.gameHeaderTitle}>Угадай Алатау</ThemedText>
                <ThemedText style={styles.gameHeaderMeta}>
                  Игрок: {playerName} · Раунд {roundProgress}
                </ThemedText>
              </View>
              <View style={styles.timerBadge}>
                <ThemedText style={styles.timerText}>{timeLeft}s</ThemedText>
              </View>
            </View>

            {!isFinished && currentRound ? (
              <>
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="images-outline" size={28} color={palette.primary} />
                  <ThemedText style={styles.photoPlaceholderTitle}>{currentRound.clueTitle}</ThemedText>
                  <ThemedText style={styles.photoPlaceholderText}>{currentRound.clueText}</ThemedText>
                </View>

                <View style={styles.optionsList}>
                  {currentRound.options.map((option) => {
                    const isCorrect = selectedOption && option === currentRound.correctOption;
                    const isWrong = selectedOption === option && option !== currentRound.correctOption;

                    return (
                      <Pressable
                        key={option}
                        style={[
                          styles.optionButton,
                          isCorrect && styles.correctOption,
                          isWrong && styles.wrongOption,
                        ]}
                        onPress={() => handleSelectOption(option)}
                        disabled={!!selectedOption}>
                        <ThemedText style={styles.optionText}>{option}</ThemedText>
                      </Pressable>
                    );
                  })}
                </View>

                {selectedOption ? (
                  <Pressable style={styles.primaryButton} onPress={goNext}>
                    <ThemedText style={styles.primaryButtonText}>
                      {roundIndex === GUESS_ALATAU_ROUNDS.length - 1 ? 'Завершить игру' : 'Следующий раунд'}
                    </ThemedText>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <View style={styles.resultCard}>
                <Ionicons name="sparkles-outline" size={28} color={palette.success} />
                <ThemedText style={styles.resultTitle}>Игра завершена</ThemedText>
                <ThemedText style={styles.resultScore}>{score} очков</ThemedText>
                <ThemedText style={styles.resultText}>
                  Отлично, {playerName}! Можно сыграть ещё раз или вернуться в приложение.
                </ThemedText>

                <Pressable style={styles.primaryButton} onPress={resetGame}>
                  <ThemedText style={styles.primaryButtonText}>Сыграть снова</ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        )}
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
    paddingBottom: 60,
  },
  backLink: {
    marginTop: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLinkText: {
    color: palette.primary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  card: {
    borderRadius: 26,
    padding: 20,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  gameLogo: {
    alignSelf: 'center',
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  title: {
    marginTop: 16,
    color: palette.text,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    color: '#5E6F8B',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  metaText: {
    marginTop: 10,
    color: '#5E6F8B',
    fontSize: 15,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  instructionsCard: {
    marginTop: 18,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#F4F6FB',
    gap: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  instructionText: {
    flex: 1,
    color: palette.text,
    fontSize: 14,
    lineHeight: 18,
  },
  inputLabel: {
    marginTop: 18,
    color: palette.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  input: {
    marginTop: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
    fontSize: 15,
  },
  primaryButton: {
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  disabledButton: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: palette.border,
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  leaderboardCard: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#F4F6FB',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  leaderboardPlace: {
    width: 34,
    color: palette.muted,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  leaderboardName: {
    flex: 1,
    color: palette.text,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  leaderboardScore: {
    color: palette.primary,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  gameHeaderTitle: {
    color: palette.text,
    fontSize: 23,
    lineHeight: 27,
    fontWeight: '800',
  },
  gameHeaderMeta: {
    marginTop: 6,
    color: palette.muted,
    fontSize: 14,
    lineHeight: 18,
  },
  timerBadge: {
    minWidth: 54,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primarySoft,
  },
  timerText: {
    color: palette.primary,
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '800',
  },
  photoPlaceholder: {
    marginTop: 18,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
  },
  photoPlaceholderTitle: {
    marginTop: 14,
    color: palette.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  photoPlaceholderText: {
    marginTop: 10,
    color: '#5E6F8B',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  optionsList: {
    marginTop: 18,
    gap: 10,
  },
  optionButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: palette.border,
  },
  correctOption: {
    borderColor: 'rgba(52, 199, 89, 0.35)',
    backgroundColor: 'rgba(52, 199, 89, 0.10)',
  },
  wrongOption: {
    borderColor: 'rgba(255, 69, 58, 0.32)',
    backgroundColor: 'rgba(255, 69, 58, 0.08)',
  },
  optionText: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  resultCard: {
    marginTop: 26,
    alignItems: 'center',
  },
  resultTitle: {
    marginTop: 16,
    color: palette.text,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  resultScore: {
    marginTop: 10,
    color: palette.primary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
  },
  resultText: {
    marginTop: 10,
    color: '#5E6F8B',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
});
