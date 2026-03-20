import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';
import {
  COMMUNITY_CHAT_MESSAGES,
  PROFILE_COMMUNITY_ITEMS,
  PROFILE_EMERGENCY_ITEMS,
  QUICK_ACCESSIBILITY_ACTIONS,
  REPORT_CATEGORIES,
  GUESS_ALATAU_LEADERBOARD,
} from '@/lib/smart-city-mock';

type ActiveSheet = 'chat' | 'report' | 'accessibility' | 'rating' | null;

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

function ProfileRow({
  title,
  icon,
  badge,
  onPress,
  tint = '#111111',
  value,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
  onPress: () => void;
  tint?: string;
  value?: string;
}) {
  return (
    <Pressable style={styles.rowCard} onPress={onPress}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrap}>
          <Ionicons name={icon} size={18} color={tint} />
        </View>
        <ThemedText style={[styles.rowTitle, { color: tint }]}>{title}</ThemedText>
      </View>

      <View style={styles.rowRight}>
        {value ? <ThemedText style={styles.rowValue}>{value}</ThemedText> : null}
        {badge ? (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{badge}</ThemedText>
          </View>
        ) : null}
        <Ionicons name="chevron-forward" size={16} color="#C4CBDA" />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { blindModeEnabled, setBlindModeEnabled } = useAccessibility();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [chatMessages, setChatMessages] = useState(COMMUNITY_CHAT_MESSAGES);
  const [chatDraft, setChatDraft] = useState('');
  const [selectedReportCategory, setSelectedReportCategory] = useState<string | null>(null);
  const [reportText, setReportText] = useState('');
  const [reportImageUri, setReportImageUri] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [isPickingReportImage, setIsPickingReportImage] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState<'Рус' | 'Қаз'>('Рус');
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = useMemo(() => {
    if (!user?.email) {
      return 'Гость';
    }

    return user.email.split('@')[0] || 'Пользователь';
  }, [user?.email]);

  const handleAuthAction = async () => {
    if (!user) {
      router.push('/(auth)');
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSendMessage = () => {
    const text = chatDraft.trim();

    if (!text) {
      return;
    }

    setChatMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        author: 'Вы',
        text,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        own: true,
      },
    ]);
    setChatDraft('');
  };

  const canSubmitReport =
    !!selectedReportCategory && (reportText.trim().length >= 6 || reportImageUri.length > 0);

  const handlePickReportImage = async () => {
    try {
      setIsPickingReportImage(true);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      setReportImageUri(result.assets[0].uri);
    } finally {
      setIsPickingReportImage(false);
    }
  };

  const handleSubmitReport = () => {
    if (!canSubmitReport) {
      return;
    }

    setReportSuccess('Заявка отправлена в систему города.');
    setSelectedReportCategory(null);
    setReportText('');
    setReportImageUri('');
    setActiveSheet(null);
  };

  const handleBlindModeToggle = async (enabled: boolean) => {
    await setBlindModeEnabled(enabled);

    if (enabled) {
      setActiveSheet(null);
      router.push('/(tabs)/vision');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Профиль</ThemedText>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={42} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.heroName}>{displayName}</ThemedText>
          {user?.email ? <ThemedText style={styles.heroSubtitle}>{user.email}</ThemedText> : null}

          <Pressable style={styles.primaryButton} onPress={() => void handleAuthAction()}>
            {isSigningOut ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.primaryButtonText}>
                {user ? 'Выйти из профиля' : 'Войти через ЭЦП'}
              </ThemedText>
            )}
          </Pressable>

          <Pressable style={styles.gameCard} onPress={() => router.push('/guess-alatau')}>
            <View style={styles.gameIconWrap}>
              <Ionicons name="map-outline" size={22} color="#1677FF" />
            </View>
            <View style={styles.gameText}>
              <ThemedText style={styles.gameTitle}>Угадай Алатау</ThemedText>
              <ThemedText style={styles.gameSubtitle}>Игра — угадай место по фото</ThemedText>
            </View>
            <View style={styles.playButton}>
              <ThemedText style={styles.playButtonText}>Играть</ThemedText>
            </View>
          </Pressable>

          {reportSuccess ? (
            <View style={styles.successCard}>
              <Ionicons name="checkmark-circle-outline" size={16} color={palette.success} />
              <ThemedText style={styles.successText}>{reportSuccess}</ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionBlock}>
          <ThemedText style={styles.sectionLabel}>КОМЬЮНИТИ</ThemedText>
          <View style={styles.groupCard}>
            {PROFILE_COMMUNITY_ITEMS.map((item) => (
              <ProfileRow
                key={item.id}
                title={item.title}
                icon={item.icon as keyof typeof Ionicons.glyphMap}
                badge={item.badge}
                onPress={() => {
                  if (item.id === 'chat') {
                    setActiveSheet('chat');
                    return;
                  }

                  if (item.id === 'report') {
                    setActiveSheet('report');
                    return;
                  }

                  setActiveSheet('rating');
                }}
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <ThemedText style={styles.sectionLabel}>НАСТРОЙКИ</ThemedText>
          <View style={styles.groupCard}>
            <ProfileRow
              title="Уведомления"
              icon="notifications-outline"
              value={notificationsEnabled ? 'Вкл' : 'Выкл'}
              onPress={() => setNotificationsEnabled((current) => !current)}
            />
            <ProfileRow
              title="Язык / Тіл"
              icon="language-outline"
              value={language}
              onPress={() => setLanguage((current) => (current === 'Рус' ? 'Қаз' : 'Рус'))}
            />
            <ProfileRow
              title="Спец. возможности"
              icon="accessibility-outline"
              onPress={() => setActiveSheet('accessibility')}
            />
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <ThemedText style={styles.sectionLabel}>ЭКСТРЕННЫЕ</ThemedText>
          <View style={styles.groupCard}>
            {PROFILE_EMERGENCY_ITEMS.map((item) => (
              <ProfileRow
                key={item.id}
                title={item.title}
                icon={item.icon as keyof typeof Ionicons.glyphMap}
                tint={item.tone}
                onPress={() => void Linking.openURL(`tel:${item.title.match(/\d+/)?.[0] ?? '112'}`)}
              />
            ))}
          </View>
        </View>

        <ThemedText style={styles.footerText}>Alatau Smart City v1.0.0 · г. Алматы</ThemedText>
      </ScrollView>

      <BottomSheet
        visible={activeSheet === 'chat'}
        title="Чат жителей Алатау"
        icon="chatbubble-ellipses-outline"
        onClose={() => setActiveSheet(null)}>
        <View style={styles.sheetContent}>
          <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
            {chatMessages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.own ? styles.ownMessageBubble : styles.otherMessageBubble,
                ]}>
                {!message.own ? <ThemedText style={styles.messageAuthor}>{message.author}</ThemedText> : null}
                <ThemedText style={[styles.messageText, message.own && styles.ownMessageText]}>
                  {message.text}
                </ThemedText>
                <ThemedText style={[styles.messageTime, message.own && styles.ownMessageTime]}>
                  {message.time}
                </ThemedText>
              </View>
            ))}
          </ScrollView>

          <View style={styles.chatComposerRow}>
            <TextInput
              value={chatDraft}
              onChangeText={setChatDraft}
              placeholder="Написать..."
              placeholderTextColor={palette.muted}
              style={styles.chatInput}
            />
            <Pressable style={styles.sendButton} onPress={handleSendMessage}>
              <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <Pressable style={styles.closeButton} onPress={() => setActiveSheet(null)}>
            <ThemedText style={styles.closeButtonText}>Закрыть</ThemedText>
          </Pressable>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={activeSheet === 'report'}
        title="Сообщить о проблеме"
        icon="megaphone-outline"
        onClose={() => setActiveSheet(null)}>
        <View style={styles.sheetContent}>
          <ThemedText style={styles.formLabel}>КАТЕГОРИЯ</ThemedText>
          <View style={styles.categoryGrid}>
            {REPORT_CATEGORIES.map((category) => {
              const active = selectedReportCategory === category.id;

              return (
                <Pressable
                  key={category.id}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setSelectedReportCategory(category.id)}>
                  <Ionicons
                    name={category.icon as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={active ? '#1677FF' : '#111111'}
                  />
                  <ThemedText style={[styles.categoryText, active && styles.categoryTextActive]}>
                    {category.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <ThemedText style={[styles.formLabel, styles.formLabelOffset]}>ОПИСАНИЕ</ThemedText>
          <TextInput
            value={reportText}
            onChangeText={setReportText}
            placeholder="Опишите подробнее..."
            placeholderTextColor={palette.muted}
            multiline
            textAlignVertical="top"
            style={styles.reportInput}
          />

          <ThemedText style={[styles.formLabel, styles.formLabelOffset]}>Р¤РћРўРћ</ThemedText>
          <Pressable style={styles.attachButton} onPress={() => void handlePickReportImage()}>
            <View style={styles.attachButtonLeft}>
              {isPickingReportImage ? (
                <ActivityIndicator size="small" color={palette.primary} />
              ) : (
                <Ionicons name="image-outline" size={18} color={palette.primary} />
              )}
              <ThemedText style={styles.attachButtonText}>
                {reportImageUri ? 'РР·РјРµРЅРёС‚СЊ РёР·РѕР±СЂР°Р¶РµРЅРёРµ' : 'РџСЂРёРєСЂРµРїРёС‚СЊ РёР·РѕР±СЂР°Р¶РµРЅРёРµ'}
              </ThemedText>
            </View>
            <Ionicons name="add-circle-outline" size={18} color={palette.primary} />
          </Pressable>

          {reportImageUri ? (
            <View style={styles.reportPreviewCard}>
              <Image source={{ uri: reportImageUri }} style={styles.reportPreviewImage} contentFit="cover" />
              <View style={styles.reportPreviewMeta}>
                <ThemedText style={styles.reportPreviewTitle}>Р¤РѕС‚Рѕ РїСЂРёРєСЂРµРїР»РµРЅРѕ</ThemedText>
                <ThemedText style={styles.reportPreviewCaption}>
                  РњРѕР¶РЅРѕ РѕС‚РїСЂР°РІРёС‚СЊ Р·Р°СЏРІРєСѓ СЃ С„РѕС‚Рѕ РёР»Рё Р·Р°РјРµРЅРёС‚СЊ РµРіРѕ.
                </ThemedText>
              </View>
              <Pressable style={styles.removePreviewButton} onPress={() => setReportImageUri('')}>
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.primaryActionButton,
              !canSubmitReport && styles.disabledButton,
            ]}
            onPress={handleSubmitReport}
            disabled={!canSubmitReport}>
            <ThemedText style={styles.primaryActionButtonText}>Отправить заявку</ThemedText>
          </Pressable>

          <Pressable style={styles.closeButton} onPress={() => setActiveSheet(null)}>
            <ThemedText style={styles.closeButtonText}>Закрыть</ThemedText>
          </Pressable>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={activeSheet === 'accessibility'}
        title="Спец. возможности"
        icon="accessibility-outline"
        onClose={() => setActiveSheet(null)}>
        <View style={styles.sheetContent}>
          <View style={styles.blindModeCard}>
            <View style={styles.blindModeCopy}>
              <ThemedText style={styles.blindModeTitle}>Режим для незрячих</ThemedText>
              <ThemedText style={styles.blindModeText}>
                Добавляет вкладку &quot;Зрение&quot;, открывает камеру и включает голосовые
                подсказки.
              </ThemedText>
            </View>

            <Switch
              value={blindModeEnabled}
              onValueChange={(value) => void handleBlindModeToggle(value)}
              trackColor={{ false: '#D9DEE8', true: 'rgba(22, 119, 255, 0.42)' }}
              thumbColor={blindModeEnabled ? '#1677FF' : '#FFFFFF'}
            />
          </View>

          {blindModeEnabled ? (
            <Pressable
              style={styles.openVisionButton}
              onPress={() => {
                setActiveSheet(null);
                router.push('/(tabs)/vision');
              }}>
              <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
              <ThemedText style={styles.openVisionButtonText}>
                Открыть вкладку &quot;Зрение&quot;
              </ThemedText>
            </Pressable>
          ) : null}

          <View style={styles.visionCard}>
            <ThemedText style={styles.visionTitle}>Алатау Вижн</ThemedText>
            <ThemedText style={styles.visionText}>
              Камера + голосовая навигация для слабовидящих
            </ThemedText>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </View>

          <ThemedText style={styles.formLabel}>ГОЛОСОВОЕ УПРАВЛЕНИЕ</ThemedText>
          <Pressable
            style={[
              styles.voiceButton,
              isVoiceListening && { backgroundColor: '#1FB24D' },
            ]}
            onPress={() => setIsVoiceListening((current) => !current)}>
            <Ionicons name="mic-outline" size={18} color="#FFFFFF" />
            <ThemedText style={styles.voiceButtonText}>
              {isVoiceListening ? 'Остановить распознавание' : 'Начать распознавание'}
            </ThemedText>
          </Pressable>

          <ThemedText style={[styles.formLabel, styles.formLabelOffset]}>РАЗМЕР ШРИФТА</ThemedText>
          <View style={styles.fontControls}>
            {[14, 16, 18, 20].map((size) => {
              const active = size === fontSize;

              return (
                <Pressable
                  key={size}
                  style={[styles.fontChip, active && styles.fontChipActive]}
                  onPress={() => setFontSize(size)}>
                  <ThemedText style={[styles.fontChipText, active && styles.fontChipTextActive]}>
                    {size}px
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.fontPreview}>
            <ThemedText style={{ color: '#111111', fontSize, lineHeight: fontSize + 6 }}>
              Пример текста — {fontSize}px
            </ThemedText>
          </View>

          <ThemedText style={[styles.formLabel, styles.formLabelOffset]}>БЫСТРАЯ ОЗВУЧКА</ThemedText>
          <View style={styles.quickActionsRow}>
            {QUICK_ACCESSIBILITY_ACTIONS.map((item) => (
              <View key={item.id} style={styles.quickActionChip}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={15} color="#111111" />
                <ThemedText style={styles.quickActionText}>{item.label}</ThemedText>
              </View>
            ))}
          </View>

          <Pressable style={styles.closeButton} onPress={() => setActiveSheet(null)}>
            <ThemedText style={styles.closeButtonText}>Закрыть</ThemedText>
          </Pressable>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={activeSheet === 'rating'}
        title="Рейтинг активности"
        icon="trophy-outline"
        onClose={() => setActiveSheet(null)}>
        <View style={styles.sheetContent}>
          <View style={styles.ratingCard}>
            <ThemedText style={styles.ratingBig}>24 место</ThemedText>
            <ThemedText style={styles.ratingCaption}>Ваш текущий городской прогресс</ThemedText>
          </View>

          {GUESS_ALATAU_LEADERBOARD.map((player, index) => (
            <View key={player.id} style={styles.leaderboardRow}>
              <ThemedText style={styles.leaderboardPlace}>#{index + 1}</ThemedText>
              <ThemedText style={styles.leaderboardName}>{player.name}</ThemedText>
              <ThemedText style={styles.leaderboardScore}>{player.score}</ThemedText>
            </View>
          ))}

          <Pressable style={styles.closeButton} onPress={() => setActiveSheet(null)}>
            <ThemedText style={styles.closeButtonText}>Закрыть</ThemedText>
          </Pressable>
        </View>
      </BottomSheet>
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
    paddingBottom: 12,
  },
  title: {
    color: palette.text,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '800',
  },
  heroCard: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  heroName: {
    marginTop: 14,
    color: palette.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 4,
    color: palette.muted,
    fontSize: 13,
    lineHeight: 16,
  },
  primaryButton: {
    width: '100%',
    marginTop: 18,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '800',
  },
  gameCard: {
    width: '100%',
    marginTop: 16,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(22, 119, 255, 0.18)',
    backgroundColor: 'rgba(22, 119, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gameIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameText: {
    flex: 1,
  },
  gameTitle: {
    color: palette.primary,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  gameSubtitle: {
    color: '#4D6B9D',
    fontSize: 13,
    lineHeight: 17,
    marginTop: 4,
  },
  playButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: palette.primary,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
  },
  successCard: {
    width: '100%',
    marginTop: 14,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.10)',
  },
  successText: {
    color: '#2B8A45',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  sectionBlock: {
    marginTop: 16,
  },
  sectionLabel: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  groupCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  rowCard: {
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F4F6FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '600',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowValue: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  badge: {
    minWidth: 26,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 8,
    backgroundColor: '#FF453A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
  },
  footerText: {
    marginTop: 20,
    color: '#C1C8D6',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  sheetContent: {
    gap: 14,
  },
  chatList: {
    maxHeight: 360,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  otherMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F3F8',
  },
  ownMessageBubble: {
    alignSelf: 'flex-end',
    backgroundColor: palette.primary,
  },
  messageAuthor: {
    color: palette.primary,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  messageText: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 21,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    marginTop: 8,
    color: palette.muted,
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'right',
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.72)',
  },
  chatComposerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatInput: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F4F6FB',
    color: palette.text,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  closeButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6FB',
  },
  closeButtonText: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  formLabel: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  formLabelOffset: {
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    width: '48%',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F4F6FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(22, 119, 255, 0.10)',
  },
  categoryText: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: palette.primary,
  },
  reportInput: {
    minHeight: 90,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F4F6FB',
    color: palette.text,
    fontSize: 15,
  },
  attachButton: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F4F6FB',
    borderWidth: 1,
    borderColor: 'rgba(22, 119, 255, 0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  attachButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  attachButtonText: {
    color: palette.primary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  reportPreviewCard: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: '#F4F6FB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportPreviewImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  reportPreviewMeta: {
    flex: 1,
  },
  reportPreviewTitle: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  reportPreviewCaption: {
    marginTop: 4,
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  removePreviewButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18263C',
  },
  primaryActionButton: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
  },
  disabledButton: {
    opacity: 0.45,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  blindModeCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#F4F6FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  blindModeCopy: {
    flex: 1,
  },
  blindModeTitle: {
    color: palette.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  blindModeText: {
    marginTop: 6,
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  openVisionButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: palette.primary,
  },
  openVisionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  visionCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#090909',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  visionTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '800',
  },
  visionText: {
    flex: 1,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    lineHeight: 18,
  },
  voiceButton: {
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.success,
  },
  voiceButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  fontControls: {
    flexDirection: 'row',
    gap: 8,
  },
  fontChip: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
  },
  fontChipActive: {
    backgroundColor: 'rgba(22, 119, 255, 0.12)',
  },
  fontChipText: {
    color: palette.text,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  fontChipTextActive: {
    color: palette.primary,
  },
  fontPreview: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F4F6FB',
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F4F6FB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickActionText: {
    color: palette.text,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
  },
  ratingCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: palette.primarySoft,
  },
  ratingBig: {
    color: palette.primary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
  },
  ratingCaption: {
    marginTop: 6,
    color: '#5E7FB0',
    fontSize: 13,
    lineHeight: 17,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingVertical: 12,
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
});
