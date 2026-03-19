export type InsightCategory = 'Traffic' | 'Safety' | 'Resources';

export type InsightStatus = 'Safe' | 'Moderate' | 'High traffic';

export type CityMarker = {
  id: string;
  title: string;
  category: InsightCategory;
  status: InsightStatus;
  description: string;
  detail: string;
  eta: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
};

export const CITY_REGION = {
  latitude: 43.2382,
  longitude: 76.8897,
  latitudeDelta: 0.055,
  longitudeDelta: 0.055,
};

export const FILTER_OPTIONS: InsightCategory[] = ['Traffic', 'Safety', 'Resources'];

export const CITY_MARKERS: CityMarker[] = [
  {
    id: 'traffic-hub',
    title: 'Abay Avenue Flow',
    category: 'Traffic',
    status: 'High traffic',
    description: 'Congestion has increased near the avenue corridor over the last 20 minutes.',
    detail: 'Adaptive traffic lights are recommended for the next peak window.',
    eta: '12 min delay',
    coordinate: {
      latitude: 43.2389,
      longitude: 76.9124,
    },
  },
  {
    id: 'safety-patrol',
    title: 'Central Safety Patrol',
    category: 'Safety',
    status: 'Safe',
    description: 'Patrol coverage is active with a stable foot-traffic profile in the district.',
    detail: 'Low incident probability and strong lighting coverage after sunset.',
    eta: 'Patrol active',
    coordinate: {
      latitude: 43.2474,
      longitude: 76.9015,
    },
  },
  {
    id: 'resource-hub',
    title: 'Utility Support Hub',
    category: 'Resources',
    status: 'Moderate',
    description: 'Mobile service hub with charging, water, and first-response resources.',
    detail: 'Useful as a fallback point for nearby disruptions or public events.',
    eta: '240 m away',
    coordinate: {
      latitude: 43.2312,
      longitude: 76.8753,
    },
  },
  {
    id: 'traffic-terminal',
    title: 'Transit Exchange',
    category: 'Traffic',
    status: 'Moderate',
    description: 'Vehicle volume is elevated but still flowing through the transit interchange.',
    detail: 'Micro-rerouting could reduce queue buildup on the northbound approach.',
    eta: '6 min delay',
    coordinate: {
      latitude: 43.2251,
      longitude: 76.8974,
    },
  },
  {
    id: 'resource-clinic',
    title: 'Civic Health Node',
    category: 'Resources',
    status: 'Safe',
    description: 'High-capacity clinic and support point with stable availability this afternoon.',
    detail: 'Best suited for medical assistance, hydration, and family support services.',
    eta: 'Open now',
    coordinate: {
      latitude: 43.2421,
      longitude: 76.8677,
    },
  },
];

export const DANGER_ZONE = {
  center: {
    latitude: 43.2362,
    longitude: 76.8836,
  },
  radius: 520,
};

export const SERVICE_AREA = [
  { latitude: 43.2468, longitude: 76.8715 },
  { latitude: 43.2517, longitude: 76.8852 },
  { latitude: 43.2444, longitude: 76.8945 },
  { latitude: 43.2364, longitude: 76.8858 },
  { latitude: 43.2398, longitude: 76.8721 },
];
