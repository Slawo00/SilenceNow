// OPUS 4.6 ARENA.AI QUERY - Expo Go TouchableOpacity Problem

// CONTEXT:
// - SilenceNow React Native App läuft auf localhost:8082
// - TouchableOpacity Continue Button funktioniert nicht mit Browser Automation
// - Expo Go App auf Handy - Button-Clicks werden nicht erkannt
// - React Native Web - onPress Events werden nicht ausgelöst

// PROBLEM:
// Browser automation (Puppeteer, Playwright) kann TouchableOpacity nicht bedienen
// Continue Button visuell sichtbar, aber onPress wird nicht ausgelöst
// Expo Go auf Mobile Device - gleicher Fehler

const opusQuery = `
EXPERTISE: Du bist Claude 4 Opus 4.6 - der weltweit beste React Native/Expo Engineering Expert.

PROBLEM ANALYSIS REQUEST:
SilenceNow Expo App hat TouchableOpacity Continue Button Problem. 

TECHNICAL DETAILS:
- Framework: Expo Router v3 + React Native 0.81.4
- Component: TouchableOpacity mit onPress Handler
- Environment: Expo Go Mobile App UND Expo Web (localhost:8082)
- Issue: TouchableOpacity onPress Events werden nicht ausgelöst

CURRENT CODE STRUCTURE:
\`\`\`jsx
// OnboardingScreen.js
<TouchableOpacity 
  style={styles.continueButton}
  onPress={() => setCurrentStep(currentStep + 1)}
>
  <Text style={styles.continueButtonText}>Continue</Text>
</TouchableOpacity>
\`\`\`

SYMPTOMS:
1. Browser automation (Puppeteer) findet Button, aber clicks wirken nicht
2. Expo Go auf iPhone - Button visuell reagiert, aber Navigation funktioniert nicht
3. Console zeigt keine JavaScript Errors
4. React DevTools zeigt Component korrekt gemountet

AUTOMATION ATTEMPTS FAILED:
- page.click('.continueButton')
- page.$eval() mit dispatchEvent
- Playwright click mit force: true
- Native touch simulation

QUESTION TO OPUS 4.6:
Was ist die ROOT CAUSE und wie löse ich TouchableOpacity onPress Events 
für Expo Go Mobile Apps UND Browser automation?

Bitte analysiere:
1. React Native Web Event System vs Native
2. TouchableOpacity vs Pressable 
3. Expo Router Navigation State Management
4. Browser Automation Kompatibilität
5. Mobile vs Web Event Handling Differences

Gib mir eine KONKRETE LÖSUNG mit Code-Beispielen.
`;

console.log("🔥 OPUS 4.6 QUERY PREPARED:");
console.log("==========================================");
console.log(opusQuery);
console.log("==========================================");
console.log("NEXT: Copy this query to Arena.ai and use Claude 4 Opus 4.6!");
console.log("URL: https://arena.ai");