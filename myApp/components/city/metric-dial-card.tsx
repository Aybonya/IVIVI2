import Svg, { Path } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

function describeArc(progress: number) {
  const clamped = Math.max(0.02, Math.min(progress, 1));
  const radius = 32;
  const centerX = 38;
  const centerY = 38;
  const startAngle = Math.PI;
  const endAngle = Math.PI + Math.PI * clamped;
  const startX = centerX + radius * Math.cos(startAngle);
  const startY = centerY + radius * Math.sin(startAngle);
  const endX = centerX + radius * Math.cos(endAngle);
  const endY = centerY + radius * Math.sin(endAngle);
  const largeArcFlag = clamped > 0.5 ? 1 : 0;

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
}

export function MetricDialCard({
  value,
  unit,
  title,
  status,
  progress,
  color,
}: {
  value: string;
  unit: string;
  title: string;
  status: string;
  progress: number;
  color: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.dialWrap}>
        <Svg width={76} height={48} viewBox="0 0 76 48">
          <Path
            d="M 6 38 A 32 32 0 0 1 70 38"
            fill="none"
            stroke="#E3E7EF"
            strokeWidth={7}
            strokeLinecap="round"
          />
          <Path
            d={describeArc(progress)}
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.valueWrap}>
          <ThemedText style={styles.value}>{value}</ThemedText>
          {unit ? <ThemedText style={styles.unit}>{unit}</ThemedText> : null}
        </View>
      </View>

      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={[styles.status, { color }]}>{status}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: '#F4F5FA',
  },
  dialWrap: {
    alignItems: 'center',
  },
  valueWrap: {
    position: 'absolute',
    top: 8,
    alignItems: 'center',
  },
  value: {
    color: '#111111',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  unit: {
    color: '#8E99AB',
    fontSize: 10,
    lineHeight: 12,
    marginTop: 2,
  },
  title: {
    marginTop: 14,
    color: '#8E99AB',
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  status: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '700',
  },
});
