import type { RouteCoordinate, RouteTravelMode } from '@/lib/google-routes';

export type TransportMode = 'Driving' | 'Walking';

export type RouteMode = 'Eco' | 'Safe' | 'Fastest' | 'Shortest' | 'Accessible';

export type DestinationSuggestion = {
  id: string;
  title: string;
  subtitle: string;
  coordinate?: RouteCoordinate;
  placeId?: string;
  hint: string;
};

export type OverlayCircle = {
  id: string;
  center: RouteCoordinate;
  radius: number;
  fillColor: string;
  strokeColor: string;
};

export type OverlayPolygon = {
  id: string;
  coordinates: RouteCoordinate[];
  fillColor: string;
  strokeColor: string;
};

export const TRANSPORT_MODE_META: Record<
  TransportMode,
  {
    icon: string;
    color: string;
    travelMode: RouteTravelMode;
  }
> = {
  Driving: {
    icon: 'car-outline',
    color: '#2D7BFF',
    travelMode: 'DRIVE',
  },
  Walking: {
    icon: 'walk-outline',
    color: '#12A66B',
    travelMode: 'WALK',
  },
};

export const ROUTE_MODES_BY_TRANSPORT: Record<TransportMode, RouteMode[]> = {
  Driving: ['Fastest', 'Eco', 'Safe'],
  Walking: ['Shortest', 'Safe', 'Accessible'],
};

export const ROUTE_MODE_META: Record<
  RouteMode,
  { tag: string; color: string; icon: string; description: string }
> = {
  Fastest: {
    tag: 'Fastest ETA',
    color: '#4DA3FF',
    icon: 'flash-outline',
    description: 'Prioritizes the quickest direct drive.',
  },
  Eco: {
    tag: 'Low pollution',
    color: '#35C98F',
    icon: 'leaf-outline',
    description: 'Simulates a cleaner corridor with lower pollution exposure.',
  },
  Safe: {
    tag: 'Safer streets',
    color: '#FFB347',
    icon: 'shield-checkmark-outline',
    description: 'Prefers busier, better-lit streets and calmer edges.',
  },
  Shortest: {
    tag: 'Shortest walk',
    color: '#12A66B',
    icon: 'trail-sign-outline',
    description: 'Prefers the most direct walking path.',
  },
  Accessible: {
    tag: 'Accessible route',
    color: '#A678FF',
    icon: 'accessibility-outline',
    description: 'Favors easier movement and more comfortable access points.',
  },
};

export const DESTINATION_SUGGESTIONS: DestinationSuggestion[] = [
  {
    id: 'alatau-arena',
    title: 'Alatau Arena',
    subtitle: 'Alatau district',
    hint: 'Event venue and sports cluster',
    coordinate: { latitude: 43.2738, longitude: 76.8221 },
  },
  {
    id: 'family-park',
    title: 'Family Park',
    subtitle: 'Auezov district',
    hint: 'Green leisure spot with busy foot traffic',
    coordinate: { latitude: 43.2295, longitude: 76.8412 },
  },
  {
    id: 'sairan-lake',
    title: 'Sairan Lake Walk',
    subtitle: 'Almaty west side',
    hint: 'Open lakeside destination',
    coordinate: { latitude: 43.2261, longitude: 76.8564 },
  },
  {
    id: 'mega-park',
    title: 'MEGA Park',
    subtitle: 'City center',
    hint: 'Retail and dining destination',
    coordinate: { latitude: 43.2662, longitude: 76.9286 },
  },
  {
    id: 'panfilov',
    title: 'Panfilov Promenade',
    subtitle: 'Historic center',
    hint: 'Walkable central corridor',
    coordinate: { latitude: 43.2612, longitude: 76.9456 },
  },
  {
    id: 'tech-hub',
    title: 'Alatau Tech Hub',
    subtitle: 'Innovation cluster',
    hint: 'Coworking and startup campus',
    coordinate: { latitude: 43.2661, longitude: 76.8226 },
  },
];

export const ECO_OVERLAY_ZONES: OverlayCircle[] = [
  {
    id: 'eco-1',
    center: { latitude: 43.2483, longitude: 76.8721 },
    radius: 760,
    fillColor: 'rgba(53, 201, 143, 0.14)',
    strokeColor: 'rgba(53, 201, 143, 0.28)',
  },
  {
    id: 'eco-2',
    center: { latitude: 43.2612, longitude: 76.8404 },
    radius: 620,
    fillColor: 'rgba(90, 214, 164, 0.12)',
    strokeColor: 'rgba(90, 214, 164, 0.24)',
  },
];

export const SAFETY_OVERLAY_AREAS: OverlayPolygon[] = [
  {
    id: 'safe-1',
    coordinates: [
      { latitude: 43.2449, longitude: 76.8944 },
      { latitude: 43.2518, longitude: 76.9072 },
      { latitude: 43.2411, longitude: 76.9165 },
      { latitude: 43.2337, longitude: 76.9012 },
    ],
    fillColor: 'rgba(255, 179, 71, 0.10)',
    strokeColor: 'rgba(255, 179, 71, 0.26)',
  },
];

export const ACCESSIBILITY_OVERLAY_ZONES: OverlayCircle[] = [
  {
    id: 'access-1',
    center: { latitude: 43.2381, longitude: 76.8874 },
    radius: 520,
    fillColor: 'rgba(166, 120, 255, 0.12)',
    strokeColor: 'rgba(166, 120, 255, 0.28)',
  },
];
