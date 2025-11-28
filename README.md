# SigmaFinanceAI

An interactive Finance Coaching application for CFOs and finance leaders to optimize their month-end close process.

## Features

- **4 Optimization Goals**: Speed (Fast Close), Quality & Accuracy, Automation, Compliance & Governance
- **40 Strategic Levers**: 10 proven strategies per goal with detailed implementation guides
- **AI Tool Recommendations**: Curated list of finance automation tools with filtering by goal and category
- **My Plan**: Personal optimization roadmap with status tracking (Planned, In Progress, Done)
- **Onboarding Flow**: Personalized experience based on your primary goal, company size, and current close duration
- **Dark Theme**: Modern UI with dark navy background and cyan/teal accents

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI (optional, for advanced features)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd SigmaFinanceAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

### Running the App

After starting the development server, you have several options:

- **Web**: Press `w` to open in web browser
- **iOS Simulator**: Press `i` (requires macOS with Xcode)
- **Android Emulator**: Press `a` (requires Android Studio)
- **Expo Go**: Scan the QR code with Expo Go app on your device

### Web-specific Command

To run directly on web with port 5000:
```bash
npx expo start --web --port 5000
```

## Project Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx    # Tab Navigation
│   ├── index.tsx      # Home Screen with value proposition
│   ├── goals.tsx      # Goals Overview
│   ├── plan.tsx       # My Plan - personal roadmap
│   └── tools.tsx      # AI Tools with filtering
├── goal/
│   └── [id].tsx       # Goal Detail with levers
├── lever/
│   └── [id].tsx       # Lever Detail with implementation guide
├── tool/
│   └── [id].tsx       # Tool Detail with related levers
├── onboarding/
│   └── index.tsx      # Onboarding Flow
├── _layout.tsx        # Root Layout with Providers
└── +not-found.tsx     # 404 Screen

context/
├── OnboardingContext.tsx  # Onboarding state management
└── PlanContext.tsx        # My Plan state management

services/
├── storage.ts             # AsyncStorage utilities
└── supabaseClient.ts      # Supabase placeholder (future)

data/
└── goals.ts           # Goals, Levers, AI Tools data

components/            # Reusable UI Components
constants/             # Colors and theme
hooks/                 # Custom React hooks
assets/                # Images and fonts
```

## GitHub Integration with Replit

### Connecting to GitHub

1. In Replit, go to **Version Control** in the left sidebar
2. Click **Connect to GitHub**
3. Authorize Replit to access your GitHub account
4. Create a new repository or connect to an existing one

### Pushing Changes

1. Make your changes in the editor
2. Go to **Version Control**
3. Stage your changes by clicking the **+** button
4. Write a commit message
5. Click **Commit & Push**

### Pulling Changes

1. Go to **Version Control**
2. Click **Pull** to fetch the latest changes from GitHub

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Storage**: AsyncStorage for local persistence
- **Styling**: React Native StyleSheet
- **Theming**: Dark mode with custom color palette
- **Platforms**: iOS, Android, Web

## Future Enhancements

- Supabase integration for cloud sync and authentication
- Team collaboration features
- Progress analytics dashboard
- Push notifications for reminders

## License

MIT License
