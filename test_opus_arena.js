const puppeteer = require('puppeteer-core');

async function testOpusOnArena() {
  console.log('🎯 Testing Opus 4.6 on Arena.ai');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/lib/chromium/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log('📡 Loading Arena.ai New Chat...');
    await page.goto('https://arena.ai/c/new', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Screenshot the chat interface
    await page.screenshot({ path: '/root/clawd/arena_chat_interface.png' });
    console.log('📸 Chat interface screenshot');
    
    // Look for model selection or text input
    const chatInterface = await page.evaluate(() => {
      return {
        hasTextInput: !!document.querySelector('input[type="text"], textarea'),
        hasModelSelect: !!document.querySelector('select, [role="combobox"], [data-testid*="model"]'),
        textInputs: Array.from(document.querySelectorAll('input, textarea')).map(input => ({
          type: input.type,
          placeholder: input.placeholder,
          name: input.name,
          id: input.id
        })),
        buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
          text: btn.textContent.trim(),
          disabled: btn.disabled
        })),
        bodyText: document.body.textContent.substring(0, 500)
      };
    });
    
    console.log('💬 Chat interface analysis:', JSON.stringify(chatInterface, null, 2));
    
    // Try to send a message to Opus
    const messageResult = await page.evaluate(() => {
      // Look for message input
      const textInputs = document.querySelectorAll('input[type="text"], textarea');
      const messageInput = Array.from(textInputs).find(input => 
        input.placeholder && (
          input.placeholder.toLowerCase().includes('message') ||
          input.placeholder.toLowerCase().includes('prompt') ||
          input.placeholder.toLowerCase().includes('ask')
        )
      );
      
      if (messageInput) {
        messageInput.focus();
        messageInput.value = 'Was denkst du über die SilenceNow App? Kurze Antwort bitte.';
        
        // Trigger input event
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Look for send button
        const sendButton = Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent.toLowerCase().includes('send') ||
          btn.textContent.toLowerCase().includes('submit') ||
          btn.textContent === '➤' ||
          btn.textContent === '→'
        );
        
        if (sendButton && !sendButton.disabled) {
          sendButton.click();
          return 'MESSAGE_SENT';
        } else {
          // Try Enter key
          messageInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
          return 'ENTER_PRESSED';
        }
      }
      
      return 'NO_INPUT_FOUND';
    });
    
    console.log('📤 Message result:', messageResult);
    
    if (messageResult !== 'NO_INPUT_FOUND') {
      console.log('⏳ Waiting for response...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Check for response
      const response = await page.evaluate(() => {
        // Look for response content
        const messages = document.querySelectorAll('[data-testid*="message"], .message, [role="article"]');
        if (messages.length > 0) {
          return Array.from(messages).map(msg => msg.textContent.trim()).slice(-2);
        }
        
        // Check if page content changed significantly
        const currentText = document.body.textContent;
        return currentText.substring(0, 1000);
      });
      
      console.log('📨 Response:', response);
      
      await page.screenshot({ path: '/root/clawd/arena_with_response.png' });
      console.log('📸 Response screenshot');
      
      return { chatInterface, messageResult, response };
    }
    
    return { chatInterface, messageResult };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { error: error.message };
  } finally {
    await browser.close();
    console.log('🏁 Browser closed');
  }
}

testOpusOnArena().then(result => {
  console.log('🎯 OPUS TEST RESULT:', JSON.stringify(result, null, 2));
});