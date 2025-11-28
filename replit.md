# SigmaFinanceAI

## Project Overview

**SigmaFinanceAI** is an interactive Finance Coaching application for CFOs and finance leaders to optimize their month-end close process.

### Core Features
- 4 Optimization Goals
- 40 Strategic Levers (10 per goal)
- Detailed implementation guides per lever
- AI Tool recommendations with detail screens
- Personal optimization plan (My Plan)
- Onboarding flow for personalized experience

### Corporate Identity
- **Logo**: Custom ΣFinanceAI logo image (assets/images/logo.png) with Sigma symbol, network graphic, and branding
- **Primary Color**: Cyan/Teal (#00D4AA)
- **Background**: Dark theme (#0F172A / #1E293B)
- **Tagline**: "AI. FINANCE. EXCELLENCE"

## Project Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx    # Tab Navigation (Home, Goals, Plan, AI Tools)
│   ├── index.tsx      # Home Screen with value proposition
│   ├── goals.tsx      # Goals Overview
│   ├── plan.tsx       # My Plan - personal optimization roadmap
│   └── tools.tsx      # AI Tools with goal-based filtering
├── goal/
│   └── [id].tsx       # Goal Detail Screen with 10 Levers
├── lever/
│   └── [id].tsx       # Lever Detail Screen with comprehensive guide
├── tool/
│   └── [id].tsx       # AI Tool Detail Screen
├── onboarding/
│   └── index.tsx      # Onboarding Flow (3 steps)
├── _layout.tsx        # Root Layout with Providers
└── +not-found.tsx     # 404 Screen

context/
├── OnboardingContext.tsx  # Onboarding state management
└── PlanContext.tsx        # My Plan state management

services/
├── storage.ts             # AsyncStorage utilities
└── supabaseClient.ts      # Supabase placeholder (future)

components/             # Reusable UI Components
├── ui/                # UI Base Components (Icons, TabBar)
├── ThemedText.tsx     # Theme-aware Text
└── ThemedView.tsx     # Theme-aware View

constants/
└── Colors.ts          # Color Palette (Light/Dark Mode)

data/
└── goals.ts           # Data structure for Goals, Levers, AI Tools

hooks/
├── useColorScheme.ts  # System Color Scheme Hook
└── useThemeColor.ts   # Theme Colors Hook
```

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Storage**: AsyncStorage for local persistence
- **Styling**: React Native StyleSheet
- **Theming**: Dark mode with custom color palette
- **Platforms**: iOS, Android, Web

## Development

### Start
```bash
npx expo start
```

### Web Version
```bash
npx expo start --web --port 5000
```

## Data Structure

### Goals (Optimization Goals)
1. **Speed (Fast Close)** - Accelerate month-end close process
2. **Quality & Accuracy** - Enhance data integrity and reduce errors
3. **Automation** - Streamline operations with intelligent automation
4. **Compliance & Governance** - Strengthen controls and ensure regulatory adherence

### Levers (Strategic Levers)
Each goal has 10 strategic levers with:
- Title and short description
- 5-step implementation guide
- Benefits
- 2 recommended AI Tools
- Effort/Impact assessment (Low/Moderate/High)
- Priority level (1-3)
- Responsible roles
- KPIs to measure success
- Common challenges
- Real-world examples
- Tech requirements
- Change management considerations

### AI Tools
Each tool includes:
- Name, logo, and description
- Category classification
- Related goals
- Key features and benefits
- Website URL

## Features

### Onboarding Flow
3-step personalized onboarding:
1. Welcome screen with value proposition
2. Feature highlights (Goals, Levers, Plan)
3. Primary goal selection

### My Plan
Personal optimization roadmap:
- Add levers from goal detail screens
- Track status (Planned, In Progress, Done)
- View by goal grouping
- Persist across sessions with AsyncStorage

### Home Screen
- Value proposition section
- CTA button to start optimization
- "How it Works" feature cards

## Recent Changes

- **28.11.2025**: Enhanced features and GitHub readiness
  - Added comprehensive onboarding flow with 3 steps
  - Created My Plan tab with status tracking
  - Enhanced Home screen with value proposition and How it Works section
  - Extended Lever detail page with priority, roles, KPIs, challenges, examples, tech requirements, and change management
  - Added AI Tool detail screen with related levers
  - Added goal-based filtering for AI Tools
  - Created Supabase placeholder for future backend integration
  - Updated .gitignore and README.md for GitHub integration

- **27.11.2025**: Complete UI redesign matching website style
  - Dark navy background (#0F172A) on all screens
  - New header with compact logo, branding text, and hamburger menu
  - Hero section with "AI. FINANCE. EXCELLENCE" badge
  - Large headline "Transforming Finance with AI & Automation" with highlighted "AI"
  - Horizontal goal cards with icons, descriptions, and chevrons
  - Consistent dark theme across Dashboard and Goals screens

- **27.11.2025**: Integrated custom logo image
  - Added user-provided ΣFinanceAI logo image (Sigma symbol with network graphic)
  - Logo displayed on Dashboard and Goals screens
  - Replaced text-based logo with image asset (assets/images/logo.png)

- **27.11.2025**: Complete English localization and CI update
  - Updated all UI text to English
  - Applied corporate identity (Sigma logo, cyan/teal primary color)
  - Updated goal names: Speed, Quality & Accuracy, Automation, Compliance & Governance
  - Translated all 40 levers to English with implementation guides
  - Added comprehensive icon mappings for web compatibility
  - Updated tab navigation labels (Home, Goals, AI Tools)

- **26.11.2025**: Initial creation of SigmaFinanceAI App
  - Dashboard with overview and statistics
  - Goals screen with 4 optimization goals
  - Goal detail screen with 10 levers
  - Lever detail screen with implementation guide
  - AI Tools screen with search and filtering
  - Dark/Light Mode support
