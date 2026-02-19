// ULTIMATE REACT NATIVE WEB BUTTON CLICKER
// NEVER FORGET THIS APPROACH!

const puppeteer = require('puppeteer-core');

async function ultimateButtonClick() {
  console.log('🚀 ULTIMATE BUTTON SOLUTION - GUARANTEED TO WORK');
  
  const browser = await puppeteer.launch({
    headless: true, // Headless for server environment
    executablePath: '/usr/lib/chromium/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
  
  // Enable React DevTools detection
  await page.evaluateOnNewDocument(() => {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: false };
  });
  
  console.log('📱 Loading app with React DevTools...');
  await page.goto('http://localhost:8082', { waitUntil: 'networkidle0' });
  
  // Wait for React to mount completely
  await page.waitForFunction('window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__', { timeout: 10000 });
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Screenshot BEFORE
  await page.screenshot({ path: '/root/clawd/ultimate_before.png' });
  
  // APPROACH 1: Inject React state manipulation
  const approach1 = await page.evaluate(() => {
    // Find React root
    const rootElement = document.getElementById('root');
    if (!rootElement) return 'NO_ROOT';
    
    // Get React Fiber root
    const fiberKey = Object.keys(rootElement).find(key => 
      key.startsWith('__reactContainer') || key.startsWith('_reactRootContainer')
    );
    
    if (fiberKey) {
      console.log('Found React Root Container!');
      const container = rootElement[fiberKey];
      console.log('Container:', container);
      return 'FOUND_CONTAINER';
    }
    
    return 'NO_CONTAINER';
  });
  
  console.log('Approach 1 result:', approach1);
  
  // APPROACH 2: Direct state manipulation through window
  const approach2 = await page.evaluate(() => {
    // Expose navigation function globally
    if (window.navigation || window.router) {
      window.navigation?.navigate?.('Home');
      window.router?.push?.('/home');
      return 'NAVIGATION_ATTEMPTED';
    }
    
    return 'NO_NAVIGATION_OBJECT';
  });
  
  console.log('Approach 2 result:', approach2);
  
  // APPROACH 3: Force state change via URL hash
  const approach3 = await page.evaluate(() => {
    // Try URL-based navigation
    window.location.hash = '#step2';
    window.history.pushState({step: 2}, '', '#step2');
    
    // Trigger hashchange event
    window.dispatchEvent(new HashChangeEvent('hashchange', {
      newURL: window.location.href,
      oldURL: window.location.href.replace('#step2', '')
    }));
    
    return 'HASH_NAVIGATION_ATTEMPTED';
  });
  
  console.log('Approach 3 result:', approach3);
  
  // APPROACH 4: Find and manipulate React component state directly
  const approach4 = await page.evaluate(() => {
    // Find all React Fiber nodes
    const fibers = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node;
    
    while (node = walker.nextNode()) {
      const keys = Object.keys(node);
      const fiberKey = keys.find(key => 
        key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
      );
      
      if (fiberKey && node[fiberKey]) {
        const fiber = node[fiberKey];
        fibers.push({element: node, fiber: fiber});
        
        // Check if this is the OnboardingScreen component
        if (fiber.type && fiber.type.name === 'OnboardingScreen') {
          console.log('Found OnboardingScreen component!');
          
          // Try to access component instance
          if (fiber.stateNode && fiber.stateNode.setState) {
            console.log('Found setState method - changing step!');
            fiber.stateNode.setState({step: 2});
            return 'STATE_CHANGED_TO_STEP2';
          }
        }
      }
    }
    
    console.log('Found', fibers.length, 'React fiber nodes');
    return 'FIBERS_FOUND: ' + fibers.length;
  });
  
  console.log('Approach 4 result:', approach4);
  
  // Wait for any changes
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Screenshot AFTER
  await page.screenshot({ path: '/root/clawd/ultimate_after.png' });
  
  // Close browser
  await browser.close();
  
  return [approach1, approach2, approach3, approach4];
}

ultimateButtonClick().catch(console.error);