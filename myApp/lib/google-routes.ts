import { GOOGLE_ROUTES_API_KEY, hasGoogleRoutesApiKey } from '@/constants/google-maps';

export type RouteCoordinate = {
  latitude: number;
  longitude: number;
};

export type RouteTravelMode = 'DRIVE' | 'WALK';

export type RouteTrafficStatus = 'Low' | 'Moderate' | 'High';

export type TrafficAwareRoute = {
  path: RouteCoordinate[];
  distanceMeters: number;
  durationSeconds: number;
  staticDurationSeconds: number;
  distanceText: string;
  durationText: string;
  staticDurationText: string;
  delayMinutes: number;
  etaText: string;
  trafficStatus: RouteTrafficStatus;
};

type ComputeRoutesResponse = {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
    staticDuration?: string;
    polyline?: { encodedPolyline?: string };
    localizedValues?: {
      distance?: { text?: string };
      duration?: { text?: string };
      staticDuration?: { text?: string };
    };
  }>;
  error?: { message?: string };
};

function parseDurationSeconds(duration?: string) {
  return duration ? Number.parseFloat(duration.replace('s', '')) || 0 : 0;
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (!hours) {
    return `${minutes} min`;
  }

  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function formatEta(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFutureDepartureTime() {
  return new Date(Date.now() + 5 * 60 * 1000).toISOString();
}

function getTrafficStatus(durationSeconds: number, staticDurationSeconds: number): RouteTrafficStatus {
  const delaySeconds = Math.max(0, durationSeconds - staticDurationSeconds);
  const delayMinutes = delaySeconds / 60;
  const ratio = staticDurationSeconds > 0 ? delaySeconds / staticDurationSeconds : 0;

  if (delayMinutes >= 10 || ratio >= 0.3) {
    return 'High';
  }

  if (delayMinutes >= 4 || ratio >= 0.12) {
    return 'Moderate';
  }

  return 'Low';
}

function decodePolyline(encoded: string): RouteCoordinate[] {
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  const coordinates: RouteCoordinate[] = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    longitude += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
  }

  return coordinates;
}

export async function fetchTrafficAwareRoute(
  origin: RouteCoordinate,
  destination: RouteCoordinate,
  travelMode: RouteTravelMode = 'DRIVE'
): Promise<TrafficAwareRoute> {
  if (!hasGoogleRoutesApiKey()) {
    throw new Error('Add your Google Maps API key in constants/google-maps.ts first.');
  }

  const body: Record<string, unknown> = {
    origin: { location: { latLng: origin } },
    destination: { location: { latLng: destination } },
    travelMode,
    computeAlternativeRoutes: false,
    languageCode: 'en-US',
    units: 'METRIC',
    polylineQuality: 'HIGH_QUALITY',
    polylineEncoding: 'ENCODED_POLYLINE',
  };

  if (travelMode === 'DRIVE') {
    body.routingPreference = 'TRAFFIC_AWARE_OPTIMAL';
    body.departureTime = getFutureDepartureTime();
  }

  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_ROUTES_API_KEY,
      'X-Goog-FieldMask':
        'routes.distanceMeters,routes.duration,routes.staticDuration,routes.polyline.encodedPolyline,routes.localizedValues',
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as ComputeRoutesResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch route from Google Routes API.');
  }

  const route = data.routes?.[0];

  if (!route?.polyline?.encodedPolyline) {
    throw new Error('Google Routes API returned no route polyline.');
  }

  const durationSeconds = parseDurationSeconds(route.duration);
  const staticDurationSeconds = parseDurationSeconds(route.staticDuration || route.duration);
  const delayMinutes =
    travelMode === 'DRIVE'
      ? Math.max(0, Math.round((durationSeconds - staticDurationSeconds) / 60))
      : 0;

  return {
    path: decodePolyline(route.polyline.encodedPolyline),
    distanceMeters: route.distanceMeters ?? 0,
    durationSeconds,
    staticDurationSeconds,
    distanceText: route.localizedValues?.distance?.text || formatDistance(route.distanceMeters ?? 0),
    durationText: route.localizedValues?.duration?.text || formatDuration(durationSeconds),
    staticDurationText:
      route.localizedValues?.staticDuration?.text || formatDuration(staticDurationSeconds),
    delayMinutes,
    etaText: formatEta(durationSeconds),
    trafficStatus:
      travelMode === 'DRIVE'
        ? getTrafficStatus(durationSeconds, staticDurationSeconds)
        : 'Low',
  };
}
