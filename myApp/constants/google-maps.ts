export const GOOGLE_ROUTES_API_KEY = 'AIzaSyDeHzo3840OF0uIra59qQNT_l7nUyHGLOI';

export function hasGoogleRoutesApiKey() {
  return (
    GOOGLE_ROUTES_API_KEY.length > 0 &&
    GOOGLE_ROUTES_API_KEY !== 'PASTE_YOUR_GOOGLE_MAPS_API_KEY_HERE'
  );
}
