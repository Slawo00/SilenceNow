// Direct Playwright click test
const { exec } = require('child_process');

console.log('🎯 Using Playwright to click Continue button...');

const playwrightScript = `
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  
  console.log('📱 Loading app...');
  await page.goto('http://localhost:8082');
  await page.waitForLoadState('networkidle');
  
  // Screenshot before
  await page.screenshot({ path: '/root/clawd/before_click.png' });
  console.log('📸 Before screenshot saved');
  
  // Find and click Continue button
  try {
    // Wait for React to render
    await page.waitForTimeout(3000);
    
    // Try multiple selectors
    const selectors = [
      'text=Continue',
      '[data-testid="continue-button"]',
      'button:has-text("Continue")',
      '.button-text:has-text("Continue")',
      '*:has-text("Continue")'
    ];
    
    let clicked = false;
    for (const selector of selectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          console.log('✅ Found Continue with selector:', selector);
          await element.click();
          clicked = true;
          break;
        }
      } catch (e) {
        console.log('❌ Selector failed:', selector);
      }
    }
    
    if (!clicked) {
      console.log('🔍 Manual DOM search...');
      await page.evaluate(() => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        let node;
        while (node = walker.nextNode()) {
          if (node.nodeValue.trim() === 'Continue') {
            const parent = node.parentElement;
            console.log('Found Continue text, clicking parent:', parent.tagName);
            parent.click();
            return true;
          }
        }
        return false;
      });
    }
    
    await page.waitForTimeout(2000);
    
    // Screenshot after
    await page.screenshot({ path: '/root/clawd/after_click.png' });
    console.log('📸 After screenshot saved');
    
  } catch (error) {
    console.error('❌ Click error:', error.message);
  }
  
  await browser.close();
})();
`;

// Write and execute
require('fs').writeFileSync('/tmp/playwright_click.js', playwrightScript);
exec('cd /root/clawd && node /tmp/playwright_click.js', (error, stdout, stderr) => {
  console.log('STDOUT:', stdout);
  if (stderr) console.log('STDERR:', stderr);
  if (error) console.log('ERROR:', error.message);
});