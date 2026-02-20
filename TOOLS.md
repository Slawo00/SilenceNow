# TOOLS.md - Local Notes

**🚨 WAHRHEIT & BEWEISE VERPFLICHTEND:**
- **NUR SCHREIBEN WAS DURCH TESTS/OUTPUTS GESICHERT IST!**
- **KEINE BEHAUPTUNGEN OHNE BEWEISE!**
- **Bei Unsicherheit: "ICH WEISS ES NICHT" sagen!**

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## OPUS 4.6 API ACCESS - CRITICAL!

**Bei schwierigen Programmieraufgaben:**
- SOFORT meinen eigenen Opus 4.6 API Schlüssel verwenden
- KEINE Zeit verschwenden mit schwächeren Modellen
- Complex coding problems (React Native, Expo, TouchableOpacity issues!)
- SQL structure validation  
- Any time standard models fail
- SOFORT bei Blockaden!
- **IMMER wenn Engineering-Expertise gebraucht wird!**

## EXPO APP TESTING - CRITICAL!

**EXPO SETUP FÜR EIGENSTÄNDIGES APP-TESTING:**
```bash
cd projects/SilenceNow
npm install                    # Dependencies installieren
npx expo start --web --port 3000 --background  # Development Server
curl http://localhost:3000/    # App-Status prüfen
```

**EXPO TESTING WORKFLOW:**
1. `cd projects/SilenceNow`
2. `npx expo start --web --port 3000` (background process)
3. App läuft auf http://localhost:3000
4. Code ändern → Auto-Reload im Browser
5. Services/APIs via curl/node testen

**VERFÜGBARE SCREENS:**
- OnboardingScreen, HomeScreen, ReportsScreen, SettingsScreen
- Alle React Native Components funktionieren via react-native-web

## SCREENSHOT TESTING - CRITICAL!

**ECHTE SCREENSHOTS MIT CHROMIUM:**
```bash
# Echte PNG-Screenshots von App machen  
node real_screenshot_tool.js http://localhost:3000 /tmp/screenshot.png

# Verschiedene Screens screenshotten
node real_screenshot_tool.js http://localhost:3000 /tmp/onboarding.png 1280 720
node real_screenshot_tool.js http://localhost:3000 /tmp/reports.png 1920 1080
```

**SCREENSHOT CAPABILITIES:**
- ✅ **Echte PNG-Bilder** mit Chromium Browser
- ✅ **Vollständige UI-Erfassung** (nicht nur HTML)
- ✅ **Verschiedene Auflösungen** (1280x720, 1920x1080, etc.)
- ✅ **Automatische Reports** mit Dateigröße und Status
- ✅ **Beweisbar** - Echte visuelle Testbelege

## 🚨 SILENCENOW — KRITISCH!
**App läuft aus `/root/clawd/src/` — NICHT aus `projects/SilenceNow/src/`!**
- `App.js` → `./src/navigation/AppNavigator`
- ALLE Änderungen in `src/` machen, NICHT in `projects/SilenceNow/src/`
- 3x denselben Fehler gemacht. Slawo war zu Recht wütend.

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
