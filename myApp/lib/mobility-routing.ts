import {
  ROUTE_MODE_META,
  ROUTE_MODES_BY_TRANSPORT,
  TRANSPORT_MODE_META,
  type DestinationSuggestion,
  type RouteMode,
  type TransportMode,
} from '@/components/map/mobility-data';
import { fetchTrafficAwareRoute, type RouteCoordinate } from '@/lib/google-routes';

export type MobilityRouteOption = {
  mode: RouteMode;
  transportMode: TransportMode;
  destinationName: string;
  path: RouteCoordinate[];
  durationText: string;
  arrivalTimeText: string;
  distanceText: string;
  modeTag: string;
  strokeColor: string;
  summaryHint: string;
};

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (!hours) {
    return `${minutes} мин`;
  }

  return rest ? `${hours} ч ${rest} мин` : `${hours} ч`;
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} м`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} км`;
}

function formatArrival(secondsFromNow: number) {
  return new Date(Date.now() + secondsFromNow * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function nudgeCoordinate(
  coordinate: RouteCoordinate,
  latitudeOffset: number,
  longitudeOffset: number
): RouteCoordinate {
  return {
    latitude: coordinate.latitude + latitudeOffset,
    longitude: coordinate.longitude + longitudeOffset,
  };
}

function createModePath(path: RouteCoordinate[], mode: RouteMode, transportMode: TransportMode) {
  if (path.length < 3 || mode === 'Fastest' || mode === 'Shortest') {
    return path;
  }

  const midIndex = Math.floor(path.length / 2);

  return path.map((point, index) => {
    if (index !== midIndex) {
      return point;
    }

    if (mode === 'Eco') {
      return nudgeCoordinate(point, 0.0025, -0.0032);
    }

    if (mode === 'Safe') {
      return transportMode === 'Driving'
        ? nudgeCoordinate(point, 0.0018, 0.0038)
        : nudgeCoordinate(point, 0.0012, 0.0021);
    }

    return nudgeCoordinate(point, -0.0018, 0.0017);
  });
}

function getModeAdjustments(mode: RouteMode, transportMode: TransportMode) {
  if (mode === 'Eco') {
    return {
      durationDelta: 4 * 60,
      distanceDelta: 700,
      summaryHint: 'Меньше загрязнённых участков',
    };
  }

  if (mode === 'Safe') {
    return {
      durationDelta: transportMode === 'Driving' ? 5 * 60 : 4 * 60,
      distanceDelta: transportMode === 'Driving' ? 900 : 350,
      summaryHint: 'Более активные и освещённые улицы',
    };
  }

  if (mode === 'Accessible') {
    return {
      durationDelta: 6 * 60,
      distanceDelta: 250,
      summaryHint: 'Более удобные и спокойные сегменты',
    };
  }

  if (mode === 'Shortest') {
    return {
      durationDelta: 2 * 60,
      distanceDelta: -120,
      summaryHint: 'Максимально прямой пеший маршрут',
    };
  }

  return {
    durationDelta: 0,
    distanceDelta: 0,
    summaryHint: 'Минимальное время в пути',
  };
}

export async function buildMobilityRouteOptions(
  origin: RouteCoordinate,
  destination: DestinationSuggestion,
  transportMode: TransportMode
): Promise<MobilityRouteOption[]> {
  if (!destination.coordinate) {
    throw new Error('Destination coordinates are missing.');
  }

  const base = await fetchTrafficAwareRoute(
    origin,
    destination.coordinate,
    TRANSPORT_MODE_META[transportMode].travelMode
  );

  return ROUTE_MODES_BY_TRANSPORT[transportMode].map((mode) => {
    const meta = ROUTE_MODE_META[mode];
    const adjustments = getModeAdjustments(mode, transportMode);
    const durationSeconds = Math.max(60, base.durationSeconds + adjustments.durationDelta);
    const distanceMeters = Math.max(100, base.distanceMeters + adjustments.distanceDelta);

    return {
      mode,
      transportMode,
      destinationName: destination.title,
      path: createModePath(base.path, mode, transportMode),
      durationText:
        mode === 'Fastest' || mode === 'Shortest'
          ? base.durationText
          : formatDuration(durationSeconds),
      arrivalTimeText: formatArrival(durationSeconds),
      distanceText:
        mode === 'Fastest' || mode === 'Shortest'
          ? base.distanceText
          : formatDistance(distanceMeters),
      modeTag: meta.tag,
      strokeColor: meta.color,
      summaryHint: adjustments.summaryHint,
    };
  });
}
