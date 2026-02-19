const puppeteer = require('puppeteer-core');

async function navigateToOpus() {
  console.log('🎯 Navigating to Arena.ai for Opus 4.6');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/lib/chromium/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log('📡 Loading Arena.ai...');
    await page.goto('https://arena.ai', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Screenshot initial
    await page.screenshot({ path: '/root/clawd/arena_initial.png' });
    console.log('📸 Arena.ai initial screenshot');
    
    // Look for model selection or direct chat
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasOpus: document.body.textContent.toLowerCase().includes('opus'),
        hasClaude: document.body.textContent.toLowerCase().includes('claude'),
        hasModels: document.body.textContent.toLowerCase().includes('model'),
        links: Array.from(document.querySelectorAll('a')).map(a => ({
          text: a.textContent.trim(),
          href: a.href
        })).filter(link => link.text && link.href)
      };
    });
    
    console.log('📄 Page analysis:', JSON.stringify(pageContent, null, 2));
    
    // Try to find chat or model selection
    const chatStarted = await page.evaluate(() => {
      // Look for chat interface or model selector
      const chatElements = [
        'button[data-testid*="chat"]',
        'button[aria-label*="chat"]', 
        'input[placeholder*="message"]',
        'textarea[placeholder*="message"]',
        '.chat-input',
        '.message-input'
      ];
      
      for (let selector of chatElements) {
        const element = document.querySelector(selector);
        if (element) {
          element.click();
          return `CLICKED_${selector}`;
        }
      }
      
      // Look for direct links to models
      const links = document.querySelectorAll('a');
      for (let link of links) {
        if (link.textContent.toLowerCase().includes('opus') || 
            link.textContent.toLowerCase().includes('claude')) {
          link.click();
          return `CLICKED_LINK: ${link.textContent}`;
        }
      }
      
      return 'NO_CHAT_FOUND';
    });
    
    console.log('🔄 Chat attempt result:', chatStarted);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: '/root/clawd/arena_after_interaction.png' });
    
    return { pageContent, chatStarted };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { error: error.message };
  } finally {
    await browser.close();
    console.log('🏁 Browser closed');
  }
}

navigateToOpus().then(result => {
  console.log('🎯 ARENA.AI RESULT:', JSON.stringify(result, null, 2));
});