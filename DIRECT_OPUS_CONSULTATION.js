const puppeteer = require('puppeteer-core');

async function directOpusConsultation() {
  console.log('🚀 DIREKTE OPUS 4.6 KONSULTATION - React Native Web Continue Button Problem');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/lib/chromium/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log('📡 Loading Arena.ai for Opus consultation...');
    await page.goto('https://arena.ai/c/new', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Handle cookies
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acceptBtn = buttons.find(btn => 
        btn.textContent.includes('Accept') || btn.textContent.includes('Close')
      );
      if (acceptBtn) acceptBtn.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Screenshot BEFORE sending question
    await page.screenshot({ path: '/root/clawd/opus_before_question.png' });
    console.log('📸 Arena.ai interface captured BEFORE question');
    
    // Send VERY SPECIFIC question to Opus
    const messageResult = await page.evaluate(() => {
      const textarea = document.querySelector('textarea[name="message"]') ||
                      document.querySelector('textarea[placeholder*="Ask"]');
      
      if (textarea) {
        const specificQuestion = `URGENT React Native Web Problem - Need Expert Solution:

I have a React Native Web app (Expo) with this EXACT structure:

OnboardingScreen.js:
- TouchableOpacity with onPress={handleNext}
- handleNext function changes state: setStep(step + 1)
- Currently stuck on Step 1 Welcome Screen

SPECIFIC PROBLEM:
- Browser automation (Puppeteer) can click DOM elements
- But React Native Web TouchableOpacity onPress events DO NOT fire
- All my attempts failed: DOM clicks, React Fiber manipulation, synthetic events

QUESTION: What is the EXACT Puppeteer/Playwright code that can trigger React Native Web TouchableOpacity onPress events?

I need WORKING CODE, not theory. This is blocking production deployment.`;

        textarea.focus();
        textarea.value = specificQuestion;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Send the message
        const sendBtn = Array.from(document.querySelectorAll('button')).find(btn => 
          !btn.disabled && (btn.textContent.includes('Send') || btn.querySelector('svg'))
        );
        
        if (sendBtn) {
          sendBtn.click();
          return 'URGENT_QUESTION_SENT_TO_OPUS';
        }
        
        textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        return 'ENTER_PRESSED_FOR_OPUS';
      }
      
      return 'NO_TEXTAREA_FOUND';
    });
    
    console.log('📤 Message to Opus 4.6:', messageResult);
    
    if (messageResult.includes('SENT') || messageResult.includes('PRESSED')) {
      console.log('⏳ Waiting for Opus 4.6 expert response...');
      
      // Wait longer for complex response
      await new Promise(resolve => setTimeout(resolve, 25000));
      
      // Screenshot AFTER Opus response
      await page.screenshot({ path: '/root/clawd/opus_after_response.png' });
      console.log('📸 Arena.ai with Opus response captured');
      
      // Try to extract the full response
      const opusResponse = await page.evaluate(() => {
        // Get all text content from the page
        const fullPageText = document.body.textContent;
        
        // Look for code blocks or technical responses
        const codeBlocks = Array.from(document.querySelectorAll('code, pre')).map(el => el.textContent);
        
        // Look for any elements containing React/Puppeteer related content
        const allElements = Array.from(document.querySelectorAll('*'));
        const reactResponses = [];
        
        allElements.forEach(el => {
          const text = el.textContent;
          if (text && text.length > 50 && (
            text.includes('TouchableOpacity') ||
            text.includes('Puppeteer') ||
            text.includes('React Native') ||
            text.includes('onPress') ||
            text.includes('browser automation')
          )) {
            reactResponses.push(text.trim());
          }
        });
        
        return {
          pageLength: fullPageText.length,
          codeBlocks: codeBlocks,
          reactResponses: reactResponses.slice(0, 5), // Top 5 relevant responses
          hasResponse: fullPageText.includes('TouchableOpacity') || fullPageText.includes('Puppeteer')
        };
      });
      
      console.log('🤖 Opus 4.6 Response Analysis:', JSON.stringify(opusResponse, null, 2));
      
      return {
        messageResult: messageResult,
        opusResponse: opusResponse,
        screenshotBefore: '/root/clawd/opus_before_question.png',
        screenshotAfter: '/root/clawd/opus_after_response.png'
      };
    }
    
    return { messageResult: messageResult, error: 'Failed to send to Opus' };
    
  } catch (error) {
    console.error('❌ Arena.ai Opus consultation failed:', error.message);
    return { error: error.message };
  } finally {
    await browser.close();
    console.log('🏁 Arena.ai session closed');
  }
}

// Execute immediate Opus consultation
directOpusConsultation().then(result => {
  console.log('\n🎯 OPUS 4.6 DIRECT CONSULTATION RESULTS:');
  console.log('=====================================');
  
  if (result.opusResponse) {
    console.log('✅ Opus Response Analysis:', result.opusResponse);
    
    if (result.opusResponse.reactResponses && result.opusResponse.reactResponses.length > 0) {
      console.log('\n📝 OPUS INSIGHTS ON REACT NATIVE WEB:');
      result.opusResponse.reactResponses.forEach((response, i) => {
        console.log(`\n--- Opus Insight ${i + 1} ---`);
        console.log(response.substring(0, 500));
        if (response.length > 500) console.log('... (response continues)');
      });
    }
    
    if (result.opusResponse.codeBlocks && result.opusResponse.codeBlocks.length > 0) {
      console.log('\n💻 CODE BLOCKS FROM OPUS:');
      result.opusResponse.codeBlocks.forEach((code, i) => {
        console.log(`\n--- Code Block ${i + 1} ---`);
        console.log(code);
      });
    }
  }
  
  console.log('\n📸 Screenshots saved:');
  console.log('- Before: /root/clawd/opus_before_question.png');
  console.log('- After: /root/clawd/opus_after_response.png');
  
  console.log('\n🏁 OPUS CONSULTATION COMPLETE');
}).catch(console.error);