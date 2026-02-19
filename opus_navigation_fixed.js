const puppeteer = require('puppeteer-core');

async function getOpusNavigationSolution() {
  console.log('🤖 Consulting Opus 4.6 for React Native Navigation Solution');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/lib/chromium/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    await page.goto('https://arena.ai/c/new', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Handle cookies properly
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acceptBtn = buttons.find(btn => 
        btn.textContent.includes('Accept') || 
        btn.textContent.includes('Close') ||
        btn.textContent.includes('OK')
      );
      if (acceptBtn) {
        acceptBtn.click();
        console.log('Cookie dialog handled');
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Send detailed query to Opus
    const messageResult = await page.evaluate(() => {
      const textarea = document.querySelector('textarea[name="message"]') || 
                      document.querySelector('textarea[placeholder*="Ask"]') ||
                      document.querySelector('textarea');
      
      if (textarea) {
        const expertQuery = `EXPERT REACT NATIVE WEB NAVIGATION PROBLEM:

I have an Expo React Native app with this structure:

OnboardingScreen.js:
- useState hook: const [step, setStep] = useState(1)
- TouchableOpacity with onPress={handleNext}
- handleNext function: if (step < 3) setStep(step + 1) else navigation.replace('Home')

PROBLEM: Puppeteer browser automation cannot trigger React Native Web TouchableOpacity events. Regular DOM click() doesn't work.

NEED: 3 bulletproof methods to programmatically navigate between steps in React Native Web apps running in browser.

Focus on: React Fiber manipulation, state injection, or React DevTools approaches.`;

        textarea.focus();
        textarea.value = expertQuery;
        
        // Trigger React events
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Send message
        const sendButton = Array.from(document.querySelectorAll('button')).find(btn => 
          !btn.disabled && (
            btn.textContent.includes('Send') ||
            btn.querySelector('svg') ||
            btn.type === 'submit'
          )
        );
        
        if (sendButton) {
          sendButton.click();
          return 'OPUS_QUERY_SENT';
        }
        
        // Fallback: Enter key
        textarea.dispatchEvent(new KeyboardEvent('keydown', { 
          key: 'Enter', 
          bubbles: true, 
          cancelable: true 
        }));
        return 'ENTER_KEY_SENT';
      }
      
      return 'NO_TEXTAREA_FOUND';
    });
    
    console.log('📤 Query sent to Opus:', messageResult);
    
    if (messageResult.includes('SENT')) {
      console.log('⏳ Waiting for Opus 4.6 expert response...');
      await new Promise(resolve => setTimeout(resolve, 20000)); // Wait longer for complex response
      
      // Extract Opus response
      const solution = await page.evaluate(() => {
        // Find all text content that looks like a response
        const allText = document.body.textContent;
        
        // Look for sections that contain React/programming content
        const codeBlocks = [];
        const textNodes = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        let node;
        const responses = [];
        while (node = textNodes.nextNode()) {
          const text = node.textContent.trim();
          if (text.length > 100 && (
            text.includes('React') || 
            text.includes('useState') || 
            text.includes('TouchableOpacity') ||
            text.includes('method') ||
            text.includes('solution')
          )) {
            responses.push(text);
          }
        }
        
        return {
          responses: responses.slice(-5), // Last 5 relevant responses
          fullLength: allText.length
        };
      });
      
      console.log('🤖 Opus Solution Extracted:', JSON.stringify(solution, null, 2));
      
      await page.screenshot({ path: '/root/clawd/opus_expert_response.png' });
      
      return { messageResult, solution };
    }
    
    return { messageResult, error: 'Failed to send query' };
    
  } catch (error) {
    console.error('❌ Arena.ai Error:', error.message);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

getOpusNavigationSolution().then(result => {
  console.log('🎯 OPUS EXPERT CONSULTATION COMPLETE');
  
  if (result.solution && result.solution.responses.length > 0) {
    console.log('✅ OPUS PROVIDED SOLUTIONS:');
    result.solution.responses.forEach((response, i) => {
      console.log(`\n--- SOLUTION ${i + 1} ---`);
      console.log(response.substring(0, 500) + '...');
    });
  } else {
    console.log('⚠️ No clear solution extracted, but query was sent');
  }
});