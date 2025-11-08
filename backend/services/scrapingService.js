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

// Helper to normalize Facebook URLs
function normalizeFacebookUrl(url) {
  if (!url.includes('facebook.com') && !url.includes('fb.com')) {
    return url;
  }
  
  // Convert mobile URL to desktop URL
  if (url.includes('m.facebook.com')) {
    url = url.replace('m.facebook.com', 'www.facebook.com');
  }
  
  // Ensure https
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }
  
  return url;
}

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
        // สำหรับ Railway/Production ใช้ chromium จาก nixpacks
        // Try to find chromium executable
        let executablePath = null;
        
        // Check common locations for chromium
        const { execSync } = require('child_process');
        try {
          // Try to find chromium in PATH
          executablePath = execSync('which chromium', { encoding: 'utf-8' }).trim();
        } catch (e) {
          // Try common paths
          const commonPaths = [
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/usr/local/bin/chromium',
            '/app/.apt/usr/bin/chromium-browser'
          ];
          for (const path of commonPaths) {
            try {
              require('fs').accessSync(path);
              executablePath = path;
              break;
            } catch (e) {
              // Path doesn't exist, continue
            }
          }
        }
        
        const launchOptions = {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-ipc-flooding-protection'
          ]
        };
        
        if (executablePath) {
          launchOptions.executablePath = executablePath;
          console.log(`✅ Using Chromium at: ${executablePath}`);
        } else {
          console.log('⚠️ Chromium not found in PATH, trying default...');
        }
        
        this.browser = await puppeteer.launch(launchOptions);
        console.log('✅ Puppeteer browser initialized successfully');
      } catch (error) {
        console.error('⚠️ Puppeteer initialization failed:', error.message);
        console.error('⚠️ Will use fallback method (axios+cheerio)');
        this.browser = null;
      }
    }
    return this.browser;
  }

  // Scrape HTML content from URL
  async scrapeHTML(url) {
    // Normalize Facebook URLs
    const normalizedUrl = normalizeFacebookUrl(url);
    const isFacebook = normalizedUrl.includes('facebook.com') || normalizedUrl.includes('fb.com');
    
    try {
      // Try Puppeteer first (better for dynamic content like Facebook)
      if (await this.initBrowser()) {
        const page = await this.browser.newPage();
        
        try {
          // Set realistic browser headers and viewport
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          await page.setViewport({ width: 1920, height: 1080 });
          
          // Set extra headers to look more like a real browser
          await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9,th;q=0.8',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          });
          
          if (isFacebook) {
            console.log(`🌐 Scraping Facebook URL: ${normalizedUrl}`);
            
            // For Facebook, use more lenient wait strategy
            try {
              await page.goto(normalizedUrl, { 
                waitUntil: 'domcontentloaded', 
                timeout: 90000 
              });
              
              // Wait for initial content to load
              await page.waitForTimeout(5000);
              
              // Check if we got blocked or redirected to login
              const currentUrl = page.url();
              const pageTitle = await page.title();
              
              if (currentUrl.includes('login') || currentUrl.includes('checkpoint') || pageTitle.toLowerCase().includes('log in')) {
                console.warn('⚠️ Facebook redirected to login page - may need authentication');
                // Continue anyway, might still have some content
              }
              
              // Try to wait for posts to load
              try {
                await page.waitForSelector('body', { timeout: 5000 });
              } catch (e) {
                console.log('⚠️ Could not find body element, continuing anyway...');
              }
              
              // Scroll down gradually to load recent posts
              for (let i = 0; i < 5; i++) {
                await page.evaluate(() => {
                  window.scrollBy(0, window.innerHeight * 2);
                });
                await page.waitForTimeout(2000 + Math.random() * 1000); // Random delay
              }
              
              // Scroll back to top
              await page.evaluate(() => {
                window.scrollTo(0, 0);
              });
              await page.waitForTimeout(2000);
              
            } catch (navError) {
              console.error('⚠️ Navigation error:', navError.message);
              // Continue to try to get content anyway
            }
            
          } else {
            // For other websites, use normal wait
            await page.goto(normalizedUrl, { waitUntil: 'networkidle2', timeout: 30000 });
          }
          
          const html = await page.content();
          await page.close();
          
          // Check if HTML is meaningful (not just error page)
          if (html.length < 1000) {
            throw new Error('HTML content too short, may be an error page');
          }
          
          return { success: true, html, method: 'puppeteer' };
          
        } catch (pageError) {
          await page.close().catch(() => {});
          throw pageError;
        }
      }
    } catch (error) {
      console.error('❌ Puppeteer error:', error.message);
      // Don't return yet, try fallback
    }

    // Fallback: Use axios + cheerio (for static content)
    // Note: This won't work well for Facebook due to JavaScript rendering
    if (!isFacebook) {
      try {
        console.log(`🌐 Using fallback method (axios) for: ${normalizedUrl}`);
        const response = await axios.get(normalizedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,th;q=0.8'
          },
          timeout: 30000,
          maxRedirects: 5
        });
        return { success: true, html: response.data, method: 'axios' };
      } catch (error) {
        console.error('❌ Axios fallback error:', error.message);
        return { 
          success: false, 
          error: `Failed to scrape: ${error.message}. ${isFacebook ? 'Facebook requires JavaScript rendering (Puppeteer).' : ''}` 
        };
      }
    } else {
      // For Facebook, if Puppeteer fails, we can't use axios fallback
      return { 
        success: false, 
        error: `Failed to scrape Facebook: Puppeteer unavailable or blocked. Facebook requires JavaScript rendering.` 
      };
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

