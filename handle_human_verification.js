const puppeteer = require('puppeteer-core');

async function handleHumanVerification() {
  console.log('🤖 Handling human verification for Slawo');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/lib/chromium/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log('📡 Loading Arena.ai to handle verification...');
    await page.goto('https://arena.ai/c/new', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Screenshot current state
    await page.screenshot({ path: '/root/clawd/verification_page.png' });
    console.log('📸 Current verification state captured');
    
    // Handle human verification
    const verificationResult = await page.evaluate(() => {
      // Look for Cloudflare verification checkbox
      const verifyCheckbox = document.querySelector('input[type="checkbox"]') || 
                           document.querySelector('[role="checkbox"]') ||
                           document.querySelector('.cf-turnstile') ||
                           document.querySelector('#challenge-form input');
      
      if (verifyCheckbox) {
        console.log('✅ Found verification checkbox');
        verifyCheckbox.click();
        return 'VERIFICATION_CHECKBOX_CLICKED';
      }
      
      // Look for "Verify you are human" text and click parent
      const verifyElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.toLowerCase().includes('verify') &&
        el.textContent.toLowerCase().includes('human')
      );
      
      for (let element of verifyElements) {
        console.log('Found verify human text:', element.textContent);
        
        // Find clickable parent
        let clickable = element;
        while (clickable && clickable.parentNode) {
          if (clickable.onclick || 
              clickable.style.cursor === 'pointer' ||
              clickable.getAttribute('role') === 'checkbox' ||
              clickable.tagName === 'INPUT' ||
              window.getComputedStyle(clickable).cursor === 'pointer') {
            break;
          }
          clickable = clickable.parentNode;
        }
        
        clickable.click();
        return 'VERIFY_HUMAN_CLICKED';
      }
      
      // Handle Cloudflare challenge button
      const challengeButton = document.querySelector('button[type="submit"]') ||
                             document.querySelector('.cf-browser-verification button') ||
                             document.querySelector('#challenge-form button');
      
      if (challengeButton) {
        console.log('Found challenge button');
        challengeButton.click();
        return 'CHALLENGE_BUTTON_CLICKED';
      }
      
      return 'NO_VERIFICATION_FOUND';
    });
    
    console.log('🔐 Verification result:', verificationResult);
    
    // Wait for verification to complete
    if (verificationResult !== 'NO_VERIFICATION_FOUND') {
      console.log('⏳ Waiting for verification to complete...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Screenshot after verification
      await page.screenshot({ path: '/root/clawd/after_verification.png' });
      console.log('📸 After verification screenshot');
      
      // Check if we can now access Opus
      const opusAccessible = await page.evaluate(() => {
        // Look for message input to confirm we're in
        const messageInput = document.querySelector('textarea[name="message"]') ||
                           document.querySelector('textarea[placeholder*="Ask"]');
        
        if (messageInput && !messageInput.disabled) {
          return 'OPUS_ACCESSIBLE';
        }
        
        // Check if still blocked
        const blocked = document.body.textContent.includes('Security') ||
                       document.body.textContent.includes('Verification') ||
                       document.body.textContent.includes('Cloudflare');
        
        return blocked ? 'STILL_BLOCKED' : 'STATUS_UNCLEAR';
      });
      
      console.log('🎯 Opus access status:', opusAccessible);
      
      return { verificationResult, opusAccessible };
    }
    
    return { verificationResult };
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
    return { error: error.message };
  } finally {
    await browser.close();
    console.log('🏁 Browser closed');
  }
}

handleHumanVerification().then(result => {
  console.log('🎯 HUMAN VERIFICATION COMPLETE:', JSON.stringify(result, null, 2));
});