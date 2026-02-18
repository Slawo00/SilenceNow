# SilenceNow MVP

## Project Overview

**SilenceNow** is a noise monitoring app for tenants to document noise disturbances automatically. It measures ambient decibel levels (no audio recording), detects noise events above a configurable threshold, and builds court-proof evidence for rent reduction claims under German law (§ 536 BGB).

### Core Features
- Live dB measurement via smartphone microphone
- Automatic event detection (threshold: 55 dB default)
- Local SQLite database for event storage
- 14-day summary with event count and average dB
- Rent reduction estimation
- Event detail view with frequency profile
- Onboarding flow with privacy explanation
- Settings screen (threshold, notifications, night mode)
- Optional Supabase cloud sync
- Background audio monitoring (iOS silent audio trick)

### Brand Identity
- **Primary Color**: Electric Green (#00E676)
- **Background**: Midnight Blue (#1A2332)
- **Accent**: Soft White (#F8F9FA)
- **Style**: Dark theme, privacy-focused, legal-evidence-oriented

## Project Structure

```
App.js                              # Main Entry Point
app.json                            # Expo Config (Background Audio)
babel.config.js                     # Babel Config
package.json                        # Dependencies
src/
├── screens/
│   ├── OnboardingScreen.js         # Welcome + Permissions (3 steps)
│   ├── HomeScreen.js               # Dashboard + Live Monitoring
│   ├── EventDetailScreen.js        # Event Details + Frequency Profile
│   └── SettingsScreen.js           # Settings (Threshold, Notifications, Data)
├── components/
│   ├── LiveMeter.js                # Real-time dB Meter
│   ├── EventCard.js                # Event List Item
│   └── Heatmap.js                  # Week Heatmap (simple version)
├── services/
│   ├── AudioMonitor.js             # Background Audio Monitoring
│   ├── EventDetector.js            # Event Detection Logic
│   └── DatabaseService.js          # Local SQLite + Supabase Sync
├── utils/
│   ├── constants.js                # Colors, Thresholds, Frequency Bands
│   └── calculations.js             # dB Calculation, FFT estimation
└── navigation/
    └── AppNavigator.js             # Stack Navigator
assets/
├── icon.png                        # App Icon (placeholder)
├── splash.png                      # Splash Screen (placeholder)
└── adaptive-icon.png               # Android Adaptive Icon (placeholder)
```

## Technology Stack

- **Framework**: React Native with Expo (SDK 54)
- **Navigation**: React Navigation (Stack Navigator)
- **Local DB**: expo-sqlite (SQLite on device)
- **Audio**: expo-av (microphone access, metering)
- **Cloud**: Supabase (optional sync)
- **Charts**: react-native-svg
- **Background**: expo-task-manager, expo-background-fetch, expo-keep-awake
- **Notifications**: expo-notifications

## Development

### Start
```bash
npx expo start
```

### With Expo Go
```bash
npx expo start
# Scan QR code with Expo Go app on phone
```

## Environment Variables (Optional)

For Supabase cloud sync:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## Privacy

- NO audio is recorded
- Only decibel values (numbers) are stored
- Only frequency band energy values (numbers)
- Only timestamps
- All data stored locally on device by default
- Cloud sync is optional and user-controlled

## Recent Changes

- **18.02.2026**: Complete rebuild from SigmaFinanceAI to SilenceNow
  - New app purpose: Noise monitoring for tenant rights
  - Stack: React Native / Expo with Stack Navigator
  - Screens: Onboarding, Home (Dashboard), EventDetail, Settings
  - Services: AudioMonitor, EventDetector, DatabaseService (SQLite + Supabase)
  - Components: LiveMeter, EventCard, Heatmap
  - Dark theme with Midnight Blue + Electric Green branding
