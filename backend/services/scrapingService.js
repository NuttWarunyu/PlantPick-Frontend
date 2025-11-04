// Web Scraping Service
// ใช้ Puppeteer หรือ Cheerio สำหรับ scraping

let puppeteer = null;
try {
  puppeteer = require('puppeteer-core');
} catch (e) {
  console.log('⚠️ Puppeteer-core not available, using axios+cheerio only');
}

const axios = require('axios');
const cheerio = require('cheerio');

class ScrapingService {
  constructor() {
    this.browser = null;
  }

  // Initialize browser (Puppeteer)
  async initBrowser() {
    if (!puppeteer) {
      return null;
    }
    if (!this.browser) {
      try {
        // สำหรับ Railway/Production อาจต้องใช้ chromium
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
          ]
        });
      } catch (error) {
        console.error('⚠️ Puppeteer not available, using fallback method');
        this.browser = null;
      }
    }
    return this.browser;
  }

  // Scrape HTML content from URL
  async scrapeHTML(url) {
    try {
      // Try Puppeteer first (better for dynamic content like Facebook)
      if (await this.initBrowser()) {
        const page = await this.browser.newPage();
        
        // Set realistic browser headers
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Check if it's a Facebook URL
        const isFacebook = url.includes('facebook.com') || url.includes('fb.com');
        
        if (isFacebook) {
          // For Facebook, wait longer and scroll to load content
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
          
          // Wait a bit for content to load
          await page.waitForTimeout(3000);
          
          // Scroll down gradually to load recent posts first (Facebook loads newest first)
          // Only scroll enough to load posts from last 30 days
          for (let i = 0; i < 3; i++) {
            await page.evaluate(() => {
              window.scrollBy(0, window.innerHeight * 2);
            });
            await page.waitForTimeout(1500);
          }
          
          // Scroll back to top to ensure we have the latest posts
          await page.evaluate(() => {
            window.scrollTo(0, 0);
          });
          await page.waitForTimeout(1000);
        } else {
          // For other websites, use normal wait
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        }
        
        const html = await page.content();
        await page.close();
        return { success: true, html, method: 'puppeteer' };
      }
    } catch (error) {
      console.error('Puppeteer error, trying fallback:', error.message);
    }

    // Fallback: Use axios + cheerio (for static content)
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });
      return { success: true, html: response.data, method: 'axios' };
    } catch (error) {
      console.error('Scraping error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Extract raw text from HTML
  async extractText(html) {
    try {
      const $ = cheerio.load(html);
      // Remove script and style tags
      $('script, style').remove();
      // Get text content
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      return { success: true, text };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Extract structured data from HTML (basic)
  async extractStructuredData(html) {
    try {
      const $ = cheerio.load(html);
      const data = {
        title: $('title').text() || '',
        meta: {
          description: $('meta[name="description"]').attr('content') || '',
          keywords: $('meta[name="keywords"]').attr('content') || ''
        },
        headings: [],
        links: [],
        images: []
      };

      // Extract headings
      $('h1, h2, h3').each((i, el) => {
        data.headings.push({ tag: el.name, text: $(el).text().trim() });
      });

      // Extract links
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href && text) {
          data.links.push({ href, text });
        }
      });

      // Extract images
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        const alt = $(el).attr('alt') || '';
        if (src) {
          data.images.push({ src, alt });
        }
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Cleanup browser
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new ScrapingService();

