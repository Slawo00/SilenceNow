/**
 * COMPLETE SilenceNow App Testing Script
 * Tests navigation, functionality, and identifies real issues
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function completeAppTest() {
  console.log('🧪 VOLLSTÄNDIGER SilenceNow APP TEST');
  console.log('=====================================');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-features=VizDisplayCompositor'
    ],
    defaultViewport: { width: 1280, height: 720 }
  });

  const page = await browser.newPage();
  
  try {
    console.log('📱 Teste App Load...');
    
    // 1. Initial Load Test
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '/tmp/test_01_initial.png' });
    console.log('✅ Screenshot 1: Initial load');
    
    // 2. Test Console Errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // 3. Test Continue Button
    console.log('🖱️ Teste Continue Button...');
    
    const continueButtonExists = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      for (let el of allElements) {
        if (el.textContent && el.textContent.trim() === 'Continue') {
          return {
            found: true,
            tagName: el.tagName,
            clickable: el.onclick !== null || el.addEventListener !== null,
            styles: window.getComputedStyle(el).getPropertyValue('cursor')
          };
        }
      }
      return { found: false };
    });
    
    console.log('Continue Button Analysis:', continueButtonExists);
    
    // 4. Try to click Continue
    if (continueButtonExists.found) {
      const clickResult = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        for (let el of allElements) {
          if (el.textContent && el.textContent.trim() === 'Continue') {
            // Simulate touch/click event
            const event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            el.dispatchEvent(event);
            return true;
          }
        }
        return false;
      });
      
      console.log('Click simulated:', clickResult);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/test_02_after_click.png' });
      console.log('✅ Screenshot 2: After click attempt');
    }
    
    // 5. Test if page changed
    const currentUrl = page.url();
    const pageContent = await page.content();
    const hasWelcomeText = pageContent.includes('Welcome to SilenceNow');
    
    console.log('📊 NAVIGATION TEST RESULTS:');
    console.log('  Current URL:', currentUrl);
    console.log('  Still shows Welcome:', hasWelcomeText);
    console.log('  Console Errors:', errors.length);
    
    if (errors.length > 0) {
      console.log('❌ JAVASCRIPT ERRORS FOUND:');
      errors.slice(0, 3).forEach(err => console.log('   ', err));
    }
    
    // 6. Test React Component Structure
    const reactStructure = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (root && root.children.length > 0) {
        return {
          hasRoot: true,
          childrenCount: root.children.length,
          firstChildTag: root.children[0].tagName,
          hasReactText: document.body.innerHTML.includes('react'),
          totalElements: document.querySelectorAll('*').length
        };
      }
      return { hasRoot: false };
    });
    
    console.log('⚛️ REACT STRUCTURE:', reactStructure);
    
  } catch (error) {
    console.log('❌ TEST ERROR:', error.message);
    await page.screenshot({ path: '/tmp/test_error.png' });
  } finally {
    await browser.close();
  }
  
  // 7. File System Check
  console.log('\\n📁 CHECKING KEY FILES:');
  const keyFiles = [
    'src/screens/OnboardingScreen.js',
    'src/screens/HomeScreen.js', 
    'src/navigation/AppNavigator.js',
    'src/components/LiveMeter.js'
  ];
  
  keyFiles.forEach(file => {
    try {
      const stats = fs.statSync(`projects/SilenceNow/${file}`);
      console.log(`✅ ${file} (${Math.round(stats.size/1024)}KB)`);
    } catch (e) {
      console.log(`❌ ${file} - MISSING!`);
    }
  });
  
  console.log('\\n🎯 TEST COMPLETE - Check screenshots in /tmp/');
}

// Run the test
completeAppTest().catch(console.error);