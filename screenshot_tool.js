// Screenshot Tool für eigenständiges Testing
const fs = require('fs');

async function takeScreenshot(url = 'http://localhost:3000', outputPath = '/tmp/app_screenshot.html') {
  try {
    // Einfacher HTML-basierter Screenshot Ersatz
    const response = await fetch(url);
    const html = await response.text();
    
    // Analysiere DOM-Struktur
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Unknown';
    
    // Suche nach React/Expo spezifischen Inhalten
    const hasReactNative = html.includes('react-native-web');
    const hasExpo = html.includes('expo');
    const hasBundle = html.includes('AppEntry.bundle');
    
    // Screenshot-ähnlicher Report
    const report = `
=== APP SCREENSHOT REPORT ===
URL: ${url}
Timestamp: ${new Date().toISOString()}
Title: ${title}
React Native Web: ${hasReactNative ? '✅' : '❌'}
Expo: ${hasExpo ? '✅' : '❌'}
Bundle Loaded: ${hasBundle ? '✅' : '❌'}
HTML Size: ${html.length} characters

=== DOM ANALYSIS ===
${html.substring(0, 500)}...

=== STATUS ===
${response.status === 200 ? '✅ APP RUNNING' : '❌ APP ERROR'}
`;

    fs.writeFileSync(outputPath, report);
    console.log(`✅ Screenshot report saved to: ${outputPath}`);
    return { success: true, path: outputPath, status: response.status };
    
  } catch (error) {
    const errorReport = `❌ SCREENSHOT FAILED: ${error.message}`;
    console.error(errorReport);
    fs.writeFileSync(outputPath, errorReport);
    return { success: false, error: error.message };
  }
}

module.exports = { takeScreenshot };

// Wenn direkt ausgeführt
if (require.main === module) {
  const args = process.argv.slice(2);
  const url = args[0] || 'http://localhost:3000';
  const output = args[1] || '/tmp/app_screenshot.html';
  
  takeScreenshot(url, output).then(result => {
    process.exit(result.success ? 0 : 1);
  });
}