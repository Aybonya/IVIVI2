# Run Guide

## Requirements

- Node.js LTS installed
- Expo Go installed on iPhone
- Computer and iPhone on the same Wi-Fi network

## Install dependencies

```powershell
npm install
```

If PowerShell blocks `npm`, use:

```powershell
npm.cmd install
```

## Start the app

```powershell
npx expo start
```

If PowerShell blocks `npx`, use:

```powershell
npx.cmd expo start
```

## Open on iPhone

1. Open Expo Go on your iPhone.
2. Scan the QR code shown in the terminal or Expo developer page.
3. Wait for the bundle to load.

## Helpful commands

```powershell
npm run lint
npm run ios
npm run android
npm run web
```

## Firebase setup

1. Copy `.env.example` to `.env`.
2. Paste your Firebase web app config values into the `EXPO_PUBLIC_FIREBASE_*` variables.
3. Restart Expo after editing env variables.

## Notes

- `node_modules` and `.expo` should not be committed.
- If network restrictions break package installation, retry with your local network or proxy settings adjusted.
