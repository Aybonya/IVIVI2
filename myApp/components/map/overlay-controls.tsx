import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

type OverlayKey = 'eco' | 'safe';

const META: Record<OverlayKey, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  eco: { icon: 'leaf-outline', color: '#35C98F' },
  safe: { icon: 'shield-checkmark-outline', color: '#FFB347' },
};

export function OverlayControls({
  values,
  onToggle,
}: {
  values: Record<OverlayKey, boolean>;
  onToggle: (key: OverlayKey) => void;
}) {
  return (
    <View style={styles.wrap}>
      {(Object.keys(META) as OverlayKey[]).map((key) => {
        const meta = META[key];
        const active = values[key];

        return (
          <Pressable
            key={key}
            style={[
              styles.button,
              active && { borderColor: meta.color, backgroundColor: `${meta.color}1A` },
            ]}
            onPress={() => onToggle(key)}>
            <Ionicons name={meta.icon} size={16} color={active ? meta.color : '#97A5BF'} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    padding: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(7, 13, 24, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
});
