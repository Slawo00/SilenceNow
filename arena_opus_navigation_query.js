const puppeteer = require('puppeteer-core');

async function askOpusForNavigationSolution() {
  console.log('🎯 Asking Opus 4.6 for React Native Navigation Solution');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/lib/chromium/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log('📡 Loading Arena.ai Chat...');
    await page.goto('https://arena.ai/c/new', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Accept cookies first
    const cookieHandled = await page.evaluate(() => {
      const acceptBtn = document.querySelector('button:contains("Accept Cookies"), [data-testid*="accept"], .accept');
      if (acceptBtn) {
        acceptBtn.click();
        return true;
      }
      
      // Try text-based search
      const buttons = Array.from(document.querySelectorAll('button'));
      const acceptButton = buttons.find(btn => 
        btn.textContent.includes('Accept') || 
        btn.textContent.includes('OK') ||
        btn.textContent.includes('Close')
      );
      if (acceptButton) {
        acceptButton.click();
        return true;
      }
      return false;
    });
    
    console.log('🍪 Cookie handling:', cookieHandled);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find message input and send complex query to Opus
    const messageResult = await page.evaluate(() => {
      const messageInput = document.querySelector('textarea[placeholder*="Ask"], textarea[name="message"]');
      if (messageInput) {
        const query = `I have a React Native Web app built with Expo that runs on localhost:8082. The TouchableOpacity onPress events don't work when I try to automate button clicks with Puppeteer/browser automation.

The app structure:
- OnboardingScreen with useState hook for step navigation (step 1, 2, 3)
- TouchableOpacity with handleNext function
- React Navigation between screens

Problem: Browser automation can click DOM elements but React Native Web doesn't respond to synthetic click events.

I need a bulletproof solution to programmatically navigate through the screens. Give me 3 specific approaches that will work.`;

        messageInput.focus();
        messageInput.value = query;
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Find and click send button
        const sendBtn = Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent.includes('Send') || 
          btn.querySelector('svg') ||
          !btn.disabled && btn.type === 'submit'
        );
        
        if (sendBtn) {
          sendBtn.click();
          return 'MESSAGE_SENT_TO_OPUS';
        } else {
          // Try Enter key
          messageInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
          return 'ENTER_PRESSED';
        }
      }
      return 'NO_INPUT_FOUND';
    });
    
    console.log('📤 Message to Opus result:', messageResult);
    
    if (messageResult !== 'NO_INPUT_FOUND') {
      console.log('⏳ Waiting for Opus 4.6 response...');
      // Wait longer for AI response
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Extract Opus response
      const opusResponse = await page.evaluate(() => {
        // Look for response messages
        const messageContainers = document.querySelectorAll('[data-testid*="message"], .message, [role="article"], .response');
        const messages = [];
        
        messageContainers.forEach(container => {
          const text = container.textContent.trim();
          if (text.length > 50) { // Filter out short/empty messages
            messages.push(text);
          }
        });
        
        // Return the last few messages (likely to contain the response)
        return messages.slice(-3);
      });
      
      console.log('🤖 Opus 4.6 Response:', JSON.stringify(opusResponse, null, 2));
      
      await page.screenshot({ path: '/root/clawd/opus_navigation_solution.png' });
      console.log('📸 Opus response screenshot saved');
      
      return { messageResult, opusResponse };
    }
    
    return { messageResult };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { error: error.message };
  } finally {
    await browser.close();
    console.log('🏁 Browser closed');
  }
}

askOpusForNavigationSolution().then(result => {
  console.log('🎯 OPUS NAVIGATION SOLUTION:', JSON.stringify(result, null, 2));
});