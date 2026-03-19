import { GOOGLE_ROUTES_API_KEY } from '@/constants/google-maps';
import type { DestinationSuggestion } from '@/components/map/mobility-data';
import { ROUTE_ORIGIN } from '@/components/map/map-data';
import type { RouteCoordinate } from '@/lib/google-routes';

type AutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }>;
  error?: { message?: string };
};

type PlaceDetailsResponse = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  error?: { message?: string };
};

function getBiasCircle(location: RouteCoordinate) {
  return {
    circle: {
      center: location,
      radius: 25000,
    },
  };
}

export async function searchPlaces(
  query: string,
  locationBias = ROUTE_ORIGIN.coordinate
): Promise<DestinationSuggestion[]> {
  if (query.trim().length < 2) {
    return [];
  }

  const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_ROUTES_API_KEY,
      'X-Goog-FieldMask':
        'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text',
    },
    body: JSON.stringify({
      input: query,
      languageCode: 'ru',
      regionCode: 'kz',
      includedRegionCodes: ['kz'],
      locationBias: getBiasCircle(locationBias),
    }),
  });

  const data = (await response.json()) as AutocompleteResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to search places.');
  }

  return (
    data.suggestions
      ?.map((entry) => {
        const prediction = entry.placePrediction;

        if (!prediction?.placeId) {
          return null;
        }

        return {
          id: prediction.placeId,
          placeId: prediction.placeId,
          title:
            prediction.structuredFormat?.mainText?.text ||
            prediction.text?.text ||
            'Unknown place',
          subtitle: prediction.structuredFormat?.secondaryText?.text || 'Kazakhstan',
          hint: 'Google Places',
        } satisfies DestinationSuggestion;
      })
      .filter((item): item is DestinationSuggestion => item !== null) || []
  );
}

export async function resolvePlaceSuggestion(suggestion: DestinationSuggestion) {
  if (suggestion.coordinate) {
    return suggestion;
  }

  if (!suggestion.placeId) {
    throw new Error('Missing place id for the selected suggestion.');
  }

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${suggestion.placeId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_ROUTES_API_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
      },
    }
  );

  const data = (await response.json()) as PlaceDetailsResponse;

  if (!response.ok || !data.location?.latitude || !data.location?.longitude) {
    throw new Error(data.error?.message || 'Failed to resolve place details.');
  }

  return {
    id: data.id || suggestion.id,
    placeId: suggestion.placeId,
    title: data.displayName?.text || suggestion.title,
    subtitle: data.formattedAddress || suggestion.subtitle,
    hint: 'Google Places',
    coordinate: {
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    },
  } satisfies DestinationSuggestion;
}
