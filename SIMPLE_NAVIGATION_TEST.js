// SIMPLE BUT ROBUST NAVIGATION TEST

const puppeteer = require('puppeteer-core');

async function testNavigation() {
  console.log('🎯 Testing React Native Navigation');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/lib/chromium/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
  
  try {
    // Load app
    console.log('📱 Loading SilenceNow...');
    await page.goto('http://localhost:8082', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Screenshot initial
    await page.screenshot({ path: '/root/clawd/nav_test_initial.png' });
    console.log('📸 Initial screenshot taken');
    
    // Try to force navigation by directly calling React Navigation
    const navigationResult = await page.evaluate(() => {
      // Method 1: Look for navigation object
      if (window.navigation) {
        window.navigation.navigate('Home');
        return 'WINDOW_NAVIGATION_CALLED';
      }
      
      // Method 2: Find React Navigation instance
      const allElements = document.querySelectorAll('*');
      for (let element of allElements) {
        const keys = Object.keys(element);
        for (let key of keys) {
          if (key.startsWith('__reactFiber')) {
            const fiber = element[key];
            
            // Look for navigation prop
            if (fiber.memoizedProps && fiber.memoizedProps.navigation) {
              console.log('Found navigation prop!');
              try {
                fiber.memoizedProps.navigation.replace('Home');
                return 'REACT_NAVIGATION_REPLACE_CALLED';
              } catch (e) {
                try {
                  fiber.memoizedProps.navigation.navigate('Home');
                  return 'REACT_NAVIGATION_NAVIGATE_CALLED';
                } catch (e2) {
                  return 'REACT_NAVIGATION_FOUND_BUT_FAILED';
                }
              }
            }
            
            // Look for handleNext function
            if (fiber.memoizedProps && fiber.memoizedProps.handleNext) {
              fiber.memoizedProps.handleNext();
              return 'HANDLE_NEXT_CALLED';
            }
          }
        }
      }
      
      return 'NO_NAVIGATION_FOUND';
    });
    
    console.log('🔄 Navigation result:', navigationResult);
    
    // Wait and screenshot
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: '/root/clawd/nav_test_after.png' });
    console.log('📸 After screenshot taken');
    
    return navigationResult;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return 'ERROR: ' + error.message;
  } finally {
    await browser.close();
    console.log('🏁 Browser closed');
  }
}

testNavigation().then(result => {
  console.log('🎯 FINAL RESULT:', result);
});