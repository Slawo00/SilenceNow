// Real Screenshot Tool mit Chromium
const { execSync } = require('child_process');
const fs = require('fs');

async function takeRealScreenshot(url = 'http://localhost:3000', outputPath = '/tmp/real_screenshot.png', width = 1280, height = 720) {
  try {
    const command = `chromium --headless --disable-gpu --no-sandbox --disable-dev-shm-usage --window-size=${width},${height} --virtual-time-budget=5000 --screenshot=${outputPath} "${url}"`;
    
    console.log(`Taking screenshot of ${url}...`);
    const output = execSync(command, { 
      timeout: 30000,
      stdio: ['ignore', 'ignore', 'pipe'] 
    });
    
    // Check if file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`✅ Screenshot saved: ${outputPath} (${stats.size} bytes)`);
      
      // Generate report
      const report = `
=== REAL SCREENSHOT REPORT ===
URL: ${url}
Timestamp: ${new Date().toISOString()}
Output: ${outputPath}
Size: ${stats.size} bytes
Resolution: ${width}x${height}px
Status: ✅ SUCCESS

Screenshot successfully captured with Chromium browser!
File location: ${outputPath}
`;

      fs.writeFileSync(outputPath + '.report', report);
      return { success: true, path: outputPath, size: stats.size };
    } else {
      throw new Error('Screenshot file not created');
    }
    
  } catch (error) {
    console.error(`❌ Screenshot failed: ${error.message}`);
    
    const errorReport = `
=== SCREENSHOT ERROR REPORT ===
URL: ${url}
Timestamp: ${new Date().toISOString()}
Error: ${error.message}
Status: ❌ FAILED
`;

    fs.writeFileSync(outputPath + '.error', errorReport);
    return { success: false, error: error.message };
  }
}

module.exports = { takeRealScreenshot };

// Wenn direkt ausgeführt
if (require.main === module) {
  const args = process.argv.slice(2);
  const url = args[0] || 'http://localhost:3000';
  const output = args[1] || '/tmp/real_screenshot.png';
  const width = parseInt(args[2]) || 1280;
  const height = parseInt(args[3]) || 720;
  
  takeRealScreenshot(url, output, width, height).then(result => {
    process.exit(result.success ? 0 : 1);
  });
}