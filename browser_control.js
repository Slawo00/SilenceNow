const { execSync } = require('child_process');

// Connect to Chrome DevTools
const pageId = '66400CF4F8BF057BF2EC7F4846564C93';
const wsUrl = `ws://localhost:9222/devtools/page/${pageId}`;

console.log('Connecting to Arena.ai via Chrome DevTools...');

// Send message to find chat input
const message = JSON.stringify({
  id: 1,
  method: 'Runtime.evaluate',
  params: {
    expression: `
      // Find chat input field
      const input = document.querySelector('textarea[placeholder*="Ask"], textarea[placeholder*="Message"], input[placeholder*="Ask"], input[placeholder*="Message"]');
      if (input) {
        input.value = "EXPERTISE: Du bist Claude 4 Opus 4.6 - der weltweit beste React Native Expert. PROBLEM: SilenceNow Expo Go App hat TouchableOpacity onPress Event Probleme. Continue Button funktioniert nicht mit Browser automation, aber echte Smartphone-Touch Events sind nötig. TECHNICAL DETAILS: Expo Router v3, React Native Web, Port 8082, Onboarding Screen. QUESTION: Wie löst man das TouchableOpacity Event Problem konkret? REQUEST: Gib mir KONKRETE LÖSUNG mit Code-Beispielen.";
        input.dispatchEvent(new Event('input', { bubbles: true }));
        "Message eingegeben";
      } else {
        "Input field nicht gefunden";
      }
    `
  }
});

console.log('Trying to inject message via Chrome DevTools API...');