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
- Global drawer navigation with hamburger menu
- Priority badges on lever cards (High/Medium/Low)

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
│   └── [id].tsx       # Goal Detail Screen with 10 Levers + priority badges
├── lever/
│   └── [id].tsx       # Lever Detail Screen with comprehensive guide
├── tool/
│   └── [id].tsx       # AI Tool Detail Screen
├── onboarding.tsx     # Onboarding Flow (3 steps)
├── how-it-works.tsx   # How It Works information page
├── privacy.tsx        # Data & Privacy page
├── contact.tsx        # Contact / Feedback page
├── terms.tsx          # Terms & Conditions page
├── _layout.tsx        # Root Layout with Drawer Navigator
└── +not-found.tsx     # 404 Screen

components/
├── ui/                # UI Base Components (Icons, TabBar)
├── DrawerContent.tsx  # Right-side drawer menu content
├── GlobalHeader.tsx   # Global header with logo, title, hamburger menu
├── ThemedText.tsx     # Theme-aware Text
└── ThemedView.tsx     # Theme-aware View

context/
├── OnboardingContext.tsx  # Onboarding state management
└── PlanContext.tsx        # My Plan state management

services/
├── storage.ts             # AsyncStorage utilities
└── supabaseClient.ts      # Supabase placeholder (future)

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
- **Navigation**: Expo Router (file-based routing) with Drawer Navigator
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
- Priority level (High/Medium/Low)
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

### Global Drawer Navigation
- Right-side sliding drawer menu (hamburger icon in top-right)
- Navigation to: Home, Goals, My Plan, AI Tools
- Information pages: How it Works, Data & Privacy, Contact/Feedback, Terms & Conditions
- "Restart Onboarding" option to reset preferences

### GlobalHeader Component
- Consistent header across all screens
- Shows logo + branding on main screens
- Shows back button + title on detail screens
- Hamburger menu icon always visible (opens drawer)

### Onboarding Flow
3-step personalized onboarding:
1. Primary goal selection
2. Company size (Small/Mid-size/Large)
3. Close duration (1-20+ days)

### My Plan
Personal optimization roadmap:
- Add levers from goal detail screens
- "Add All Levers to Plan" button on goal screens
- Track status (Planned, In Progress, Done)
- Priority badges on lever cards
- AI tool count display
- View by goal grouping
- Persist across sessions with AsyncStorage

### Priority Badges
Color-coded priority indicators on lever cards:
- **High Priority**: Red (#EF4444)
- **Medium Priority**: Orange (#F59E0B)
- **Low Priority**: Green (#10B981)

### Home Screen
- Value proposition section
- CTA button to start optimization
- Recommended goal based on onboarding
- "How it Works" feature cards
- Quick access to all goals

## Recent Changes

- **28.11.2025**: Drawer navigation and GlobalHeader implementation
  - Implemented right-side drawer navigation with hamburger menu
  - Created GlobalHeader component for consistent header across screens
  - Created DrawerContent component with navigation links and onboarding restart
  - Added 4 informational pages: How it Works, Data & Privacy, Contact/Feedback, Terms & Conditions
  - Added priority badges (High/Medium/Low) on lever cards in Goal detail screen
  - Enhanced My Plan tab with priority display and tool count
  - Updated all screens to use GlobalHeader component
  - Integrated drawer into root layout with swipe gestures

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
