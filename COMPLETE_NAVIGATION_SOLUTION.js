// COMPLETE REACT NATIVE NAVIGATION SOLUTION
// Based on Opus 4.6 insights + successful React DevTools approach

const puppeteer = require('puppeteer-core');

class CompleteNavigationSolution {
  constructor() {
    this.browser = null;
    this.page = null;
  }
  
  async init() {
    console.log('🚀 Initializing Complete Navigation Solution');
    
    this.browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/lib/chromium/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 375, height: 812 });
    
    // Enable React DevTools
    await this.page.evaluateOnNewDocument(() => {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        isDisabled: false,
        supportsFiber: true,
        inject: () => {},
        onScheduleFiberRoot: () => {},
        onCommitFiberRoot: () => {},
        onCommitFiberUnmount: () => {}
      };
    });
    
    await this.page.goto('http://localhost:8082', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 4000));
  }
  
  async navigateToStep2() {
    console.log('🎯 Attempting Complete Navigation to Step 2');
    
    await this.screenshot('complete_before.png');
    
    const navigationResult = await this.page.evaluate(() => {
      console.log('🔍 Starting complete React navigation');
      
      // APPROACH 1: Deep React Fiber Tree Traversal
      function findReactComponent(startNode, targetName) {
        const visited = new Set();
        const queue = [startNode];
        
        while (queue.length > 0) {
          const node = queue.shift();
          if (!node || visited.has(node)) continue;
          visited.add(node);
          
          // Check if this is our target component
          if (node.type && node.type.name === targetName) {
            return node;
          }
          
          // Check if this has setState (class component)
          if (node.stateNode && node.stateNode.setState && node.memoizedState) {
            return node;
          }
          
          // Add children to queue
          if (node.child) queue.push(node.child);
          if (node.sibling) queue.push(node.sibling);
          if (node.return) queue.push(node.return);
        }
        
        return null;
      }
      
      // Find React root
      const rootElement = document.getElementById('root');
      const rootKeys = Object.keys(rootElement);
      
      for (let key of rootKeys) {
        if (key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')) {
          const fiberRoot = rootElement[key];
          console.log('Found React fiber root');
          
          // Find OnboardingScreen component
          const onboardingComponent = findReactComponent(fiberRoot, 'OnboardingScreen');
          
          if (onboardingComponent) {
            console.log('✅ Found OnboardingScreen component!');
            
            // Try direct state manipulation
            if (onboardingComponent.stateNode && onboardingComponent.stateNode.setState) {
              try {
                onboardingComponent.stateNode.setState({ step: 2 });
                console.log('✅ setState called successfully');
                return 'STATE_SET_TO_STEP_2';
              } catch (e) {
                console.log('setState failed:', e);
              }
            }
            
            // Try memoized state modification
            if (onboardingComponent.memoizedState) {
              console.log('Modifying memoized state');
              const currentState = onboardingComponent.memoizedState;
              
              // React hooks useState structure
              if (currentState.memoizedState !== undefined) {
                currentState.memoizedState = 2;
                currentState.baseState = 2;
                
                // Trigger re-render
                if (onboardingComponent.stateNode && onboardingComponent.stateNode.forceUpdate) {
                  onboardingComponent.stateNode.forceUpdate();
                  return 'MEMOIZED_STATE_MODIFIED';
                }
              }
            }
          }
        }
      }
      
      // APPROACH 2: Event Handler Execution
      const allElements = Array.from(document.querySelectorAll('*'));
      
      for (let element of allElements) {
        const keys = Object.keys(element);
        
        for (let key of keys) {
          if (key.startsWith('__reactFiber') || key.startsWith('__reactProps')) {
            const reactData = element[key];
            
            // Look for onPress handler
            if (reactData && reactData.memoizedProps && reactData.memoizedProps.onPress) {
              try {
                console.log('Found onPress handler, executing...');
                reactData.memoizedProps.onPress();
                return 'ONPRESS_HANDLER_EXECUTED';
              } catch (e) {
                console.log('onPress execution failed:', e);
              }
            }
            
            // Look for handleNext function
            if (reactData && reactData.stateNode && reactData.stateNode.handleNext) {
              try {
                console.log('Found handleNext function, executing...');
                reactData.stateNode.handleNext();
                return 'HANDLENEXT_EXECUTED';
              } catch (e) {
                console.log('handleNext execution failed:', e);
              }
            }
          }
        }
      }
      
      // APPROACH 3: Direct DOM Event Simulation with React SyntheticEvent
      const continueButton = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.trim() === 'Continue'
      );
      
      if (continueButton) {
        console.log('Found Continue button, simulating React events');
        
        // Create React-compatible synthetic events
        const syntheticEvent = {
          nativeEvent: new MouseEvent('click'),
          currentTarget: continueButton,
          target: continueButton,
          preventDefault: () => {},
          stopPropagation: () => {},
          persist: () => {},
          bubbles: true,
          cancelable: true,
          defaultPrevented: false,
          eventPhase: 3,
          isTrusted: true,
          timeStamp: Date.now(),
          type: 'click'
        };
        
        // Find React event handler through fiber
        const keys = Object.keys(continueButton);
        const fiberKey = keys.find(k => k.startsWith('__reactFiber'));
        
        if (fiberKey && continueButton[fiberKey]) {
          const fiber = continueButton[fiberKey];
          if (fiber.memoizedProps && fiber.memoizedProps.onPress) {
            try {
              fiber.memoizedProps.onPress(syntheticEvent);
              return 'SYNTHETIC_EVENT_SUCCESS';
            } catch (e) {
              console.log('Synthetic event failed:', e);
            }
          }
        }
      }
      
      return 'ALL_APPROACHES_FAILED';
    });
    
    console.log('🔄 Navigation result:', navigationResult);
    
    // Wait for potential state change
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await this.screenshot('complete_after.png');
    
    return navigationResult;
  }
  
  async screenshot(filename) {
    await this.page.screenshot({ path: `/root/clawd/${filename}` });
    console.log(`📸 ${filename} saved`);
  }
  
  async close() {
    if (this.browser) await this.browser.close();
  }
}

// Execute the complete solution
async function executeCompleteSolution() {
  const solution = new CompleteNavigationSolution();
  
  try {
    await solution.init();
    const result = await solution.navigateToStep2();
    
    console.log('🎯 COMPLETE SOLUTION RESULT:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ Complete solution error:', error.message);
    return { error: error.message };
  } finally {
    await solution.close();
  }
}

executeCompleteSolution().then(result => {
  console.log('🏁 NAVIGATION MISSION COMPLETE:', result);
});