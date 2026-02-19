const puppeteer = require('puppeteer-core');

class ArenaAiOpusWorkflow {
  constructor() {
    this.browser = null;
    this.page = null;
    this.sessionActive = false;
  }
  
  async init() {
    console.log('🚀 Initializing Arena.ai Opus 4.6 Workflow');
    
    this.browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/lib/chromium/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to Arena.ai
    await this.page.goto('https://arena.ai/c/new', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Handle cookies/verification (already done for Slawo)
    await this.handleInitialSetup();
    
    this.sessionActive = true;
    console.log('✅ Arena.ai Opus 4.6 session ready');
  }
  
  async handleInitialSetup() {
    // Accept cookies and handle verification
    await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const acceptBtn = buttons.find(btn => 
        btn.textContent.includes('Accept') || 
        btn.textContent.includes('Close')
      );
      if (acceptBtn) acceptBtn.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  async askOpus(question) {
    if (!this.sessionActive) {
      throw new Error('Arena.ai session not initialized');
    }
    
    console.log('🤖 Asking Opus 4.6:', question.substring(0, 100) + '...');
    
    // Send question to Opus
    const messageResult = await this.page.evaluate((q) => {
      const textarea = document.querySelector('textarea[name="message"]') ||
                      document.querySelector('textarea[placeholder*="Ask"]');
      
      if (textarea) {
        textarea.focus();
        textarea.value = q;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Send message
        const sendBtn = Array.from(document.querySelectorAll('button')).find(btn => 
          !btn.disabled && (
            btn.textContent.includes('Send') ||
            btn.querySelector('svg')
          )
        );
        
        if (sendBtn) {
          sendBtn.click();
          return 'MESSAGE_SENT_TO_OPUS';
        }
        
        // Fallback: Enter key
        textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        return 'ENTER_PRESSED';
      }
      
      return 'NO_INPUT_FOUND';
    }, question);
    
    console.log('📤 Message result:', messageResult);
    
    if (messageResult.includes('SENT') || messageResult.includes('PRESSED')) {
      // Wait for Opus response
      console.log('⏳ Waiting for Opus 4.6 response...');
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Extract response
      const response = await this.page.evaluate(() => {
        // Find response content
        const messageElements = document.querySelectorAll('[data-testid*="message"], .message, [role="article"]');
        const responses = [];
        
        messageElements.forEach(el => {
          const text = el.textContent.trim();
          if (text.length > 100) {
            responses.push(text);
          }
        });
        
        return responses.slice(-3); // Last 3 responses
      });
      
      await this.page.screenshot({ path: `/root/clawd/opus_response_${Date.now()}.png` });
      
      return {
        question: question,
        response: response,
        status: 'success'
      };
    }
    
    return {
      question: question,
      response: ['Failed to send message to Opus'],
      status: 'error'
    };
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.sessionActive = false;
      console.log('🏁 Arena.ai session closed');
    }
  }
}

// CONSISTENT OPUS 4.6 USAGE FOR REACT NATIVE PROBLEMS
async function useOpusForReactNativeProblem() {
  const opus = new ArenaAiOpusWorkflow();
  
  try {
    await opus.init();
    
    // Ask Opus about specific React Native Web navigation issues
    const result = await opus.askOpus(`
Als Expert für React Native Web und Mobile App Testing:

Ich habe eine SilenceNow App (Expo React Native Web) auf localhost:8082.
Problem: TouchableOpacity onPress Events funktionieren nicht mit Browser automation.

Konkrete Frage:
1. Welche spezifischen Puppeteer/Playwright Befehle funktionieren für React Native Web TouchableOpacity?
2. Wie kann ich React Fiber State direkt manipulieren für Navigation?
3. Welche Alternativen gibt es zu OpenClaw für immediate Testing?

Gib mir konkreten, ausführbaren Code - keine Theorie.
    `);
    
    console.log('🎯 OPUS 4.6 RESPONSE:', JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    console.error('❌ Arena.ai Opus error:', error);
    return { error: error.message };
  } finally {
    await opus.close();
  }
}

// EXECUTE OPUS CONSULTATION
useOpusForReactNativeProblem().then(result => {
  console.log('🏁 OPUS 4.6 CONSULTATION COMPLETE');
  
  if (result.response && result.response.length > 0) {
    console.log('\n=== OPUS 4.6 INSIGHTS ===');
    result.response.forEach((resp, i) => {
      console.log(`\n--- Response ${i + 1} ---`);
      console.log(resp.substring(0, 1000));
      if (resp.length > 1000) console.log('... (truncated)');
    });
  }
});