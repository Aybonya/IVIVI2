import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

import { ROUTE_ORIGIN } from '@/components/map/map-data';
import type { RouteCoordinate } from '@/lib/google-routes';

type CurrentLocationState = {
  location: RouteCoordinate;
  permissionGranted: boolean;
  isLoading: boolean;
  errorMessage: string;
};

export function useCurrentLocation() {
  const [state, setState] = useState<CurrentLocationState>({
    location: ROUTE_ORIGIN.coordinate,
    permissionGranted: false,
    isLoading: true,
    errorMessage: '',
  });

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (permission.status !== 'granted') {
          setState((current) => ({
            ...current,
            permissionGranted: false,
            isLoading: false,
            errorMessage: 'Location access is denied. Using Almaty fallback origin for now.',
          }));
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const nextCoordinate = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        setState({
          location: nextCoordinate,
          permissionGranted: true,
          isLoading: false,
          errorMessage: '',
        });

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 25,
            timeInterval: 15000,
          },
          (update) => {
            setState((current) => ({
              ...current,
              location: {
                latitude: update.coords.latitude,
                longitude: update.coords.longitude,
              },
            }));
          }
        );
      } catch (error) {
        setState((current) => ({
          ...current,
          permissionGranted: false,
          isLoading: false,
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Unable to get the current location right now.',
        }));
      }
    };

    void startTracking();

    return () => {
      subscription?.remove();
    };
  }, []);

  return state;
}
