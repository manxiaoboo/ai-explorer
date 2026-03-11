import { chromium, Browser, Page, BrowserContext } from 'playwright-core';

export interface ScrapedTool {
  name: string;
  category: string;
  pricing: string;
  description: string;
  website?: string;
  detailUrl?: string;
}

// 随机 User-Agent 列表
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Edg/119.0.0.0',
];

// 随机延迟函数 (毫秒)
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// 随机选择数组元素
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class AIToolsDirectoryScraper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private baseUrl = 'https://aitoolsdirectory.com';
  private requestCount = 0;
  private readonly MAX_REQUESTS_PER_SESSION = 50; // 每个会话最多请求数
  private readonly MAX_PAGES_PER_CATEGORY = 5; // 每个分类最多抓取页数

  async init() {
    const userAgent = randomChoice(USER_AGENTS);
    
    this.browser = await chromium.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ]
    });

    this.context = await this.browser.newContext({
      userAgent,
      viewport: { width: 1920, height: 1080 },
      screen: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      // 添加更多浏览器指纹
      colorScheme: 'light',
    });

    // 添加额外的 HTTP 头（简化版，避免被识别）
    await this.context.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    this.page = await this.context.newPage();
    
    // 模拟人类行为：随机滚动
    await this.simulateHumanBehavior();
    
    console.log(`  使用 User-Agent: ${userAgent.slice(0, 50)}...`);
  }

  // 模拟人类行为
  private async simulateHumanBehavior() {
    if (!this.page) return;
    
    try {
      // 随机滚动（只在页面有滚动条时）
      await this.page.evaluate(() => {
        if (document.body.scrollHeight > window.innerHeight) {
          const scrollAmount = Math.floor(Math.random() * 300) + 100;
          window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }
      });
      
      // 随机等待
      await randomDelay(500, 2000);
    } catch (e) {
      // 忽略滚动错误
    }
  }

  // 检查是否需要休息
  private async checkRateLimit() {
    this.requestCount++;
    
    // 每 10 个请求后长休息
    if (this.requestCount % 10 === 0) {
      const restTime = Math.floor(Math.random() * 5000) + 5000; // 5-10 秒
      console.log(`  已发送 ${this.requestCount} 个请求，休息 ${restTime/1000} 秒...`);
      await randomDelay(restTime, restTime + 2000);
    }
    
    // 每 30 个请求后重新初始化浏览器
    if (this.requestCount >= this.MAX_REQUESTS_PER_SESSION) {
      console.log(`  达到会话限制 (${this.MAX_REQUESTS_PER_SESSION})，重新初始化浏览器...`);
      await this.restart();
      this.requestCount = 0;
    }
  }

  // 重新初始化浏览器
  private async restart() {
    await this.close();
    await randomDelay(3000, 5000);
    await this.init();
  }

  async scrapeAllTools(maxCategories: number = 10): Promise<ScrapedTool[]> {
    if (!this.page) throw new Error('Scraper not initialized');

    const tools: ScrapedTool[] = [];
    const seenNames = new Set<string>();

    // 获取所有分类页面
    const categoryUrls = await this.getCategoryUrls();
    console.log(`发现 ${categoryUrls.length} 个分类页面，将抓取前 ${maxCategories} 个`);

    for (let i = 0; i < Math.min(categoryUrls.length, maxCategories); i++) {
      const categoryUrl = categoryUrls[i];
      
      try {
        console.log(`\n[${i + 1}/${Math.min(categoryUrls.length, maxCategories)}] 抓取分类: ${categoryUrl}`);
        
        // 每个分类前休息
        if (i > 0) {
          const categoryDelay = Math.floor(Math.random() * 3000) + 3000; // 3-6 秒
          console.log(`  休息 ${categoryDelay/1000} 秒...`);
          await randomDelay(categoryDelay, categoryDelay + 1000);
        }
        
        const categoryTools = await this.scrapeCategoryPage(categoryUrl);
        
        for (const tool of categoryTools) {
          const key = tool.name.toLowerCase().trim();
          if (!seenNames.has(key)) {
            seenNames.add(key);
            tools.push(tool);
          }
        }
        
        console.log(`  ✓ 该分类抓取到 ${categoryTools.length} 个工具，总计 ${tools.length} 个`);
        
      } catch (error) {
        console.error(`  ✗ 抓取分类失败: ${categoryUrl}`, error);
        // 出错后长休息
        await randomDelay(10000, 15000);
      }
    }

    return tools;
  }

  async scrapeCategoryPage(categoryUrl: string): Promise<ScrapedTool[]> {
    if (!this.page) throw new Error('Scraper not initialized');

    // 检查速率限制
    await this.checkRateLimit();

    // 随机延迟 (3-8 秒)
    await randomDelay(3000, 8000);

    // 使用 networkidle 确保内容完全加载
    try {
      await this.page.goto(categoryUrl, { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
      
      // 等待内容加载
      await randomDelay(2000, 4000);
      
      // 模拟人类滚动
      await this.simulateHumanBehavior();
      
    } catch (error) {
      console.warn(`  页面加载超时，尝试使用备用策略...`);
      // 备用：至少等待 domcontentloaded
      try {
        await this.page.goto(categoryUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000 
        });
        await randomDelay(3000, 5000);
      } catch (e) {
        console.error(`  页面加载完全失败: ${categoryUrl}`);
        return [];
      }
    }

    const tools = await this.page.evaluate(() => {
      const results: ScrapedTool[] = [];
      const cards = document.querySelectorAll('.sv-tile.sv-size-small');

      for (const card of cards) {
        const text = (card as HTMLElement).innerText.trim();
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (lines.length >= 4) {
          const name = lines[0];
          const category = lines[1];
          let pricing = '';
          let description = '';

          for (let i = 2; i < lines.length; i++) {
            const line = lines[i];
            if (['Free', 'Freemium', 'Paid', 'Free Trial', 'Contact', 'Open Source'].includes(line)) {
              pricing = line;
            } else if (line !== 'Details') {
              description += line + ' ';
            }
          }

          // 获取网站链接
          const linkEl = card.querySelector('a[href^="http"]');
          const website = linkEl?.getAttribute('href') || undefined;

          // 获取详情页链接
          const detailLink = card.querySelector('a[href^="/tool/"]');
          const detailUrl = detailLink?.getAttribute('href');

          if (name && pricing && name.length < 100) {
            results.push({
              name,
              category,
              pricing,
              description: description.trim(),
              website,
              detailUrl: detailUrl ? 'https://aitoolsdirectory.com' + detailUrl : undefined
            });
          }
        }
      }

      return results;
    });

    return tools;
  }

  // 获取所有分类URL（公开方法）
  async getAllCategoryUrls(): Promise<string[]> {
    if (!this.page) throw new Error('Scraper not initialized');

    // 随机延迟
    await randomDelay(2000, 5000);

    await this.page.goto(this.baseUrl, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await randomDelay(2000, 4000);

    const urls = await this.page.evaluate((baseUrl) => {
      const links = document.querySelectorAll('a[href^="/"]');
      const categories: string[] = [];
      
      for (const link of links) {
        const href = link.getAttribute('href');
        if (href && 
            href.startsWith('/') && 
            !href.includes('/blog') && 
            !href.includes('/submit') && 
            !href.includes('/about') &&
            !href.includes('/trends') &&
            !href.includes('/communities') &&
            !href.includes('/newsletter') &&
            href !== '/' &&
            href.split('/').length === 2) {
          categories.push(baseUrl + href);
        }
      }
      
      return [...new Set(categories)];
    }, this.baseUrl);

    return urls;
  }

  // 兼容旧代码的私有方法
  private async getCategoryUrls(): Promise<string[]> {
    return this.getAllCategoryUrls();
  }





  async close() {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    this.page = null;
    this.requestCount = 0;
  }
}
