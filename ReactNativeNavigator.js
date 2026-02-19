
// ROBUST REACT NATIVE WEB NAVIGATOR CLASS
// NEVER FORGET THIS SOLUTION!

class ReactNativeNavigator {
  constructor() {
    this.browser = null;
    this.page = null;
  }
  
  async init() {
    console.log('🚀 Initializing React Native Navigator');
    
    this.browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/lib/chromium/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 375, height: 812 });
    
    // Load app
    await this.page.goto('http://localhost:8082', { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(3000);
  }
  
  async screenshot(filename) {
    await this.page.screenshot({ path: `/root/clawd/${filename}` });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }
  
  async clickContinue() {
    console.log('🎯 Attempting Continue button click...');
    
    const before = await this.screenshot('step_before.png');
    
    // Method 1: Direct state manipulation
    await this.page.evaluate(() => {
      // Force React state change by finding OnboardingScreen component
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let node;
      
      while (node = walker.nextNode()) {
        const keys = Object.keys(node);
        const fiberKey = keys.find(key => key.startsWith('__reactFiber'));
        
        if (fiberKey && node[fiberKey]) {
          const fiber = node[fiberKey];
          
          // Find component with step state
          if (fiber.memoizedState && typeof fiber.memoizedState.memoizedState === 'number') {
            console.log('Found step state:', fiber.memoizedState.memoizedState);
            
            // Directly modify the state
            if (fiber.stateNode && fiber.stateNode.setState) {
              fiber.stateNode.setState({ step: 2 });
              console.log('✅ State changed to step 2');
              return true;
            }
          }
          
          // Alternative: find handleNext function
          if (fiber.memoizedProps && fiber.memoizedProps.onPress) {
            fiber.memoizedProps.onPress();
            console.log('✅ onPress executed');
            return true;
          }
        }
      }
      return false;
    });
    
    await this.page.waitForTimeout(2000);
    const after = await this.screenshot('step_after.png');
    
    return { before, after };
  }
  
  async navigateToStep(stepNumber) {
    console.log(`🎯 Navigating to step ${stepNumber}`);
    
    const result = await this.page.evaluate((step) => {
      // Find and manipulate OnboardingScreen state
      const elements = document.querySelectorAll('*');
      
      for (let element of elements) {
        const keys = Object.keys(element);
        const fiberKey = keys.find(key => key.startsWith('__reactFiber'));
        
        if (fiberKey) {
          const fiber = element[fiberKey];
          
          // Look for component with useState hook for step
          let current = fiber;
          while (current) {
            if (current.stateNode && current.stateNode.setState) {
              try {
                current.stateNode.setState({ step: step });
                console.log(`Set step to ${step}`);
                return `SUCCESS_STEP_${step}`;
              } catch (e) {
                // Continue searching
              }
            }
            current = current.child || current.sibling || current.return;
          }
        }
      }
      
      return `STEP_${step}_NOT_FOUND`;
    }, stepNumber);
    
    await this.page.waitForTimeout(1000);
    const screenshot = await this.screenshot(`step_${stepNumber}.png`);
    
    return { result, screenshot };
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🏁 Browser closed');
    }
  }
}

module.exports = ReactNativeNavigator;
