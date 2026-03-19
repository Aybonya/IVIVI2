import type { RouteCoordinate } from '@/lib/google-routes';

export type HeatLayer = {
  id: string;
  center: RouteCoordinate;
  radius: number;
  fillColor: string;
  strokeColor: string;
};

type HeatHotspot = {
  id: string;
  center: RouteCoordinate;
  color: string;
  radii: number[];
  alpha: number[];
};

function toRgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '');
  const value = Number.parseInt(clean, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildLayers(hotspots: HeatHotspot[]) {
  return hotspots.flatMap((hotspot) =>
    hotspot.radii.map((radius, index) => ({
      id: `${hotspot.id}-${radius}`,
      center: hotspot.center,
      radius,
      fillColor: toRgba(hotspot.color, hotspot.alpha[index] ?? 0.08),
      strokeColor: toRgba(hotspot.color, Math.max((hotspot.alpha[index] ?? 0.08) * 0.55, 0.06)),
    }))
  );
}

const pollutionHotspots: HeatHotspot[] = [
  {
    id: 'pollution-sairan',
    center: { latitude: 43.2274, longitude: 76.8608 },
    color: '#FF8A3D',
    radii: [1500, 950, 520],
    alpha: [0.08, 0.13, 0.18],
  },
  {
    id: 'pollution-center',
    center: { latitude: 43.2391, longitude: 76.9093 },
    color: '#FF5A5F',
    radii: [1800, 1100, 580],
    alpha: [0.07, 0.12, 0.18],
  },
];

const safetyHotspots: HeatHotspot[] = [
  {
    id: 'safety-west',
    center: { latitude: 43.2515, longitude: 76.8964 },
    color: '#FF477E',
    radii: [1700, 980, 460],
    alpha: [0.06, 0.11, 0.16],
  },
  {
    id: 'safety-north',
    center: { latitude: 43.2704, longitude: 76.8441 },
    color: '#FF7A45',
    radii: [1400, 820, 420],
    alpha: [0.05, 0.09, 0.15],
  },
];

export const POLLUTION_HEATMAP_LAYERS = buildLayers(pollutionHotspots);
export const SAFETY_HEATMAP_LAYERS = buildLayers(safetyHotspots);
