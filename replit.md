# SigmaFinanceAI

## Project Overview

**SigmaFinanceAI** is an interactive Finance Coaching application for CFOs and finance leaders to optimize their month-end close process.

### Core Features
- 4 Optimization Goals
- 40 Strategic Levers (10 per goal)
- Detailed implementation guides per lever
- AI Tool recommendations

### Corporate Identity
- **Logo**: Custom ΣFinanceAI logo image (assets/images/logo.png) with Sigma symbol, network graphic, and branding
- **Primary Color**: Cyan/Teal (#00D4AA)
- **Background**: Dark theme (#0F172A / #1E293B)
- **Tagline**: "AI. FINANCE. EXCELLENCE"

## Project Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx    # Tab Navigation (Home, Goals, AI Tools)
│   ├── index.tsx      # Dashboard Screen
│   ├── goals.tsx      # Goals Overview
│   └── tools.tsx      # AI Tools with Search
├── goal/
│   └── [id].tsx       # Goal Detail Screen with 10 Levers
├── lever/
│   └── [id].tsx       # Lever Detail Screen with Implementation Guide
├── _layout.tsx        # Root Layout
└── +not-found.tsx     # 404 Screen

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
- **Styling**: React Native StyleSheet
- **Theming**: Light/Dark Mode Support
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

## Recent Changes

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
