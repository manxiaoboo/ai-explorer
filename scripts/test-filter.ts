import { chromium } from 'playwright';

// Test smart content extraction
async function testExtraction() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Test with OpenAI blog
  await page.goto('https://openai.com/blog/introducing-gpt-5-4', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  await page.waitForTimeout(2000);
  
  // Extract with filtering
  const result = await page.evaluate(() => {
    const noiseSelectors = [
      'nav', 'header', '.header', '#header', '.navbar', '.navigation',
      '.sidebar', '.menu', '.ad', '.ads', '.advertisement',
      '.social-share', '.share-buttons', '.comments', '#comments',
      '.related', '.related-posts', '.recommended', '.read-more',
      'footer', '.footer', '.site-footer', '.copyright',
      '.newsletter', '.subscribe', '.signup-form',
      '.tag-list', '.category-list', '.post-tags'
    ];
    
    const noiseLinkPatterns = [
      /^read more$/i, /^continue reading$/i, /^learn more$/i,
      /^click here$/i, /^download$/i, /^subscribe$/i,
      /^sign up$/i, /^share$/i, /^tweet$/i, /^facebook$/i
    ];
    
    // Find main content
    let mainContent = document.querySelector('article') || 
                      document.querySelector('main') || 
                      document.querySelector('[role="main"]') ||
                      document.querySelector('.post-content') ||
                      document.querySelector('.entry-content') ||
                      document.body;
    
    if (!mainContent) return { html: '', textLength: 0 };
    
    // Clone
    const clone = mainContent.cloneNode(true);
    
    // Remove noise
    noiseSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => {
        const text = el.textContent || '';
        const hasParagraphs = el.querySelector('p');
        if (text.length < 150 || !hasParagraphs) {
          el.remove();
        }
      });
    });
    
    // Remove buttons
    clone.querySelectorAll('button').forEach(btn => btn.remove());
    
    // Clean links
    clone.querySelectorAll('a').forEach(link => {
      const text = (link.textContent || '').trim();
      if (noiseLinkPatterns.some(p => p.test(text))) {
        link.remove();
      }
    });
    
    // Remove empty
    clone.querySelectorAll('p, div').forEach(el => {
      if (!el.textContent?.trim() && !el.querySelector('img')) {
        el.remove();
      }
    });
    
    return {
      html: clone.innerHTML.substring(0, 1000),
      textLength: clone.textContent?.length || 0,
      removedElements: mainContent.innerHTML.length - clone.innerHTML.length
    };
  });
  
  await browser.close();
  
  console.log('✅ Extraction Test Results:\n');
  console.log('Text length:', result.textLength);
  console.log('HTML preview (first 500 chars):');
  console.log(result.html.substring(0, 500));
  console.log('\n...');
}

testExtraction().catch(console.error);
