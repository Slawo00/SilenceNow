const puppeteer = require('puppeteer-core');

async function simulateClick() {
  console.log('🎯 Simulating Continue button click...');
  
  // Use Chrome binary directly
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
    await page.goto('http://localhost:8082', { waitUntil: 'networkidle0' });
    
    // Screenshot before click
    await page.screenshot({ path: '/root/clawd/before_continue_click.png' });
    console.log('📸 Before-click screenshot saved');
    
    // Wait for React to fully render
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Try to find and click the Continue button
    console.log('🔍 Searching for Continue button...');
    
    const clicked = await page.evaluate(() => {
      // Search for Continue text
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ALL
      );
      
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent && node.textContent.trim() === 'Continue') {
          console.log('Found Continue button!');
          
          // Find clickable parent
          let clickable = node;
          while (clickable && clickable.parentNode) {
            if (clickable.onclick || 
                clickable.style.cursor === 'pointer' ||
                clickable.getAttribute('role') === 'button' ||
                clickable.tagName === 'BUTTON' ||
                window.getComputedStyle(clickable).cursor === 'pointer') {
              break;
            }
            clickable = clickable.parentNode;
          }
          
          // Simulate click
          clickable.click();
          
          // Also trigger React events
          const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          clickable.dispatchEvent(event);
          
          return true;
        }
      }
      return false;
    });
    
    console.log(clicked ? '✅ Continue button clicked!' : '❌ Continue button not found');
    
    // Wait for navigation/state change
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Screenshot after click
    await page.screenshot({ path: '/root/clawd/after_continue_click.png' });
    console.log('📸 After-click screenshot saved');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 Browser closed');
  }
}

simulateClick();