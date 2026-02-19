const { chromium } = require('playwright');

async function clickContinueButton() {
  console.log('🎯 Starting browser to click Continue button...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  
  console.log('📱 Navigating to SilenceNow app...');
  await page.goto('http://localhost:8082');
  await page.waitForTimeout(3000);
  
  // Screenshot BEFORE click
  await page.screenshot({ path: '/root/clawd/before_click.png' });
  console.log('📸 Screenshot BEFORE click taken');
  
  try {
    // Try different selectors for the Continue button
    console.log('🔍 Looking for Continue button...');
    
    // Method 1: Text content
    const continueButton = await page.locator('text=Continue').first();
    if (await continueButton.count() > 0) {
      console.log('✅ Found Continue button by text!');
      await continueButton.click();
    } else {
      // Method 2: Look for touchable elements with button-like styling
      console.log('🔍 Trying alternative selectors...');
      const buttons = await page.locator('[role="button"], button, [data-testid*="button"]');
      const buttonCount = await buttons.count();
      console.log(`Found ${buttonCount} button-like elements`);
      
      if (buttonCount > 0) {
        await buttons.first().click();
        console.log('✅ Clicked first button-like element');
      } else {
        // Method 3: Find green elements (the Continue button is green)
        console.log('🔍 Looking for green elements...');
        await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          for (let el of elements) {
            const style = window.getComputedStyle(el);
            const bgColor = style.backgroundColor;
            const text = el.textContent?.trim();
            
            if (bgColor.includes('rgb(0, 230, 118)') || 
                bgColor.includes('rgb(34, 197, 94)') ||
                text === 'Continue') {
              console.log('Found green element or Continue text:', text, bgColor);
              el.click();
              return true;
            }
          }
          return false;
        });
        console.log('✅ Tried clicking green elements');
      }
    }
    
    // Wait for potential navigation/state change
    await page.waitForTimeout(2000);
    
    // Screenshot AFTER click
    await page.screenshot({ path: '/root/clawd/after_click.png' });
    console.log('📸 Screenshot AFTER click taken');
    
  } catch (error) {
    console.error('❌ Error clicking button:', error.message);
  }
  
  await browser.close();
  console.log('🏁 Browser closed');
}

clickContinueButton().catch(console.error);