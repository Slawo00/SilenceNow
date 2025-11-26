# SigmaFinanceAI

## Projektübersicht

**SigmaFinanceAI** ist eine interaktive Finance-Coaching-Anwendung für CFOs und Finanzführungskräfte zur Optimierung ihres Monatsabschlussprozesses.

### Kernfunktionen
- 4 Optimierungsziele (Goals)
- 40 strategische Hebel (10 pro Ziel)
- Detaillierte Implementierungsanleitungen pro Hebel
- KI-Tool-Empfehlungen

## Projektstruktur

```
app/
├── (tabs)/
│   ├── _layout.tsx    # Tab-Navigation (Dashboard, Ziele, KI-Tools)
│   ├── index.tsx      # Dashboard-Screen
│   ├── goals.tsx      # Ziele-Übersicht
│   └── tools.tsx      # KI-Tools-Übersicht mit Suche
├── goal/
│   └── [id].tsx       # Goal Detail Screen mit 10 Hebeln
├── lever/
│   └── [id].tsx       # Lever Detail Screen mit Implementierung
├── _layout.tsx        # Root Layout
└── +not-found.tsx     # 404 Screen

components/             # Wiederverwendbare UI-Komponenten
├── ui/                # UI-Basiskomponenten (Icons, TabBar)
├── ThemedText.tsx     # Thema-bewusster Text
└── ThemedView.tsx     # Thema-bewusste View

constants/
└── Colors.ts          # Farbpalette (Light/Dark Mode)

data/
└── goals.ts           # Datensturktur für Goals, Levers, AI-Tools

hooks/
├── useColorScheme.ts  # System-Farbschema-Hook
└── useThemeColor.ts   # Thema-Farben-Hook
```

## Technologie-Stack

- **Framework**: React Native mit Expo
- **Navigation**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet
- **Theming**: Light/Dark Mode Support
- **Plattformen**: iOS, Android, Web

## Entwicklung

### Start
```bash
npx expo start
```

### Web-Version
```bash
npx expo start --web
```

## Datenstruktur

### Goals (Optimierungsziele)
1. **Schnelligkeit** - Beschleunigung des Monatsabschlusses
2. **Qualität** - Erhöhung der Abschlussqualität
3. **Automatisierung** - Maximale Automatisierung
4. **Erkenntnisse** - Gewinnung wertvoller Insights

### Levers (Hebel)
Jedes Ziel hat 10 strategische Hebel mit:
- Titel und Kurzbeschreibung
- 5-Schritte Implementierungsanleitung
- Vorteile/Benefits
- 2 empfohlene KI-Tools
- Aufwand-/Impact-Bewertung

## Letzte Änderungen

- **26.11.2025**: Initiale Erstellung der SigmaFinanceAI App
  - Dashboard mit Übersicht und Statistiken
  - Goals-Screen mit 4 Optimierungszielen
  - Goal-Detail-Screen mit 10 Hebeln
  - Lever-Detail-Screen mit Implementierungsanleitung
  - KI-Tools-Screen mit Suche und Filterung
  - Dark/Light Mode Support
