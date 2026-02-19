const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width: 375, height: 812});
  await page.goto('http://localhost:8082');
  await page.waitForTimeout(3000);
  
  // Continue Button suchen und klicken
  try {
    await page.waitForSelector('text=Continue', {timeout: 5000});
    await page.click('text=Continue');
    await page.waitForTimeout(2000);
    console.log('✅ Continue Button geklickt');
  } catch (e) {
    console.log('⚠️ Continue Button nicht gefunden, versuche andere Selektoren');
    // Fallback - klicke auf grünes Element
    await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (let el of elements) {
        const style = window.getComputedStyle(el);
        if (style.backgroundColor.includes('rgb(34, 197, 94)') || style.backgroundColor.includes('green')) {
          el.click();
          break;
        }
      }
    });
  }
  
  await page.screenshot({path: '/root/clawd/step1_after_continue_click.png'});
  await browser.close();
  console.log('✅ Screenshot nach Continue-Klick gespeichert');
})();