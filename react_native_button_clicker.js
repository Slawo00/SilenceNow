const puppeteer = require('puppeteer-core');

async function clickReactNativeButton() {
  console.log('🎯 React Native Button Clicker - ROBUST VERSION');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/lib/chromium/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812 });
    
    console.log('📱 Loading SilenceNow app...');
    await page.goto('http://localhost:8082', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for React to fully mount
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Screenshot BEFORE
    await page.screenshot({ path: '/root/clawd/before_react_click.png' });
    console.log('📸 BEFORE screenshot saved');
    
    // ROBUST REACT NATIVE CLICK APPROACH
    console.log('🔍 Attempting React Native button click...');
    
    const clickResult = await page.evaluate(() => {
      console.log('🎯 Starting React Native click simulation');
      
      // Method 1: Find TouchableOpacity components
      const touchables = document.querySelectorAll('[role="button"], [data-focusable="true"]');
      console.log(`Found ${touchables.length} touchable elements`);
      
      for (let touchable of touchables) {
        const text = touchable.textContent || touchable.innerText || '';
        console.log('Checking touchable:', text.trim());
        
        if (text.includes('Continue')) {
          console.log('✅ Found Continue touchable!');
          
          // Simulate full touch sequence for React Native
          const rect = touchable.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          // TouchStart
          const touchStartEvent = new TouchEvent('touchstart', {
            touches: [{
              identifier: 0,
              target: touchable,
              clientX: centerX,
              clientY: centerY,
              pageX: centerX,
              pageY: centerY
            }],
            bubbles: true,
            cancelable: true
          });
          touchable.dispatchEvent(touchStartEvent);
          console.log('📱 TouchStart dispatched');
          
          // TouchEnd (after small delay)
          setTimeout(() => {
            const touchEndEvent = new TouchEvent('touchend', {
              changedTouches: [{
                identifier: 0,
                target: touchable,
                clientX: centerX,
                clientY: centerY,
                pageX: centerX,
                pageY: centerY
              }],
              bubbles: true,
              cancelable: true
            });
            touchable.dispatchEvent(touchEndEvent);
            console.log('📱 TouchEnd dispatched');
            
            // Also trigger click as fallback
            touchable.click();
            console.log('🖱️ Click dispatched');
          }, 50);
          
          return 'REACT_NATIVE_TOUCH_TRIGGERED';
        }
      }
      
      // Method 2: Direct React Fiber manipulation
      console.log('🔍 Trying React Fiber approach...');
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ALL);
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent && node.textContent.trim() === 'Continue') {
          console.log('Found Continue text node');
          
          // Find React Fiber
          const keys = Object.keys(node);
          for (let key of keys) {
            if (key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')) {
              console.log('Found React Fiber!');
              const fiber = node[key];
              
              // Try to find onClick/onPress handler
              if (fiber.memoizedProps && fiber.memoizedProps.onPress) {
                console.log('✅ Found onPress handler - executing!');
                fiber.memoizedProps.onPress();
                return 'REACT_FIBER_ONPRESS_EXECUTED';
              }
            }
          }
          
          // Walk up parent chain for handlers
          let parent = node.parentElement;
          while (parent) {
            const parentKeys = Object.keys(parent);
            for (let key of parentKeys) {
              if (key.startsWith('__reactFiber')) {
                const fiber = parent[key];
                if (fiber.memoizedProps && fiber.memoizedProps.onPress) {
                  console.log('✅ Found parent onPress handler - executing!');
                  fiber.memoizedProps.onPress();
                  return 'REACT_PARENT_ONPRESS_EXECUTED';
                }
              }
            }
            parent = parent.parentElement;
          }
        }
      }
      
      return 'NO_HANDLER_FOUND';
    });
    
    console.log('🔄 Click result:', clickResult);
    
    // Wait for state change
    console.log('⏳ Waiting for React state change...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Screenshot AFTER
    await page.screenshot({ path: '/root/clawd/after_react_click.png' });
    console.log('📸 AFTER screenshot saved');
    
    return clickResult;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return 'ERROR: ' + error.message;
  } finally {
    await browser.close();
    console.log('🏁 Browser closed');
  }
}

clickReactNativeButton().then(result => {
  console.log('🎯 FINAL RESULT:', result);
});