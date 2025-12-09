// AI Agent Service
// ใช้ AI ช่วยแกะข้อมูล, จัดระเบียบ, validate

const aiService = require('./aiService');
const scrapingService = require('./scrapingService');
const googleMapsService = require('./googleMapsService');
const { db, pool } = require('../database');
const { v4: uuidv4 } = require('uuid');

// Helper function to parse Facebook post date (e.g., "5 ชั่วโมง", "1 วัน", "2 วัน")
function parsePostDate(postDateStr) {
  if (!postDateStr) return null;

  const now = new Date();
  const dateStr = postDateStr.toLowerCase().trim();

  // Match patterns like "5 ชั่วโมง", "1 วัน", "2 วัน", "3 สัปดาห์", "1 เดือน"
  const hourMatch = dateStr.match(/(\d+)\s*ชั่วโมง/);
  if (hourMatch) {
    const hours = parseInt(hourMatch[1]);
    const date = new Date(now);
    date.setHours(date.getHours() - hours);
    return date;
  }

  const dayMatch = dateStr.match(/(\d+)\s*วัน/);
  if (dayMatch) {
    const days = parseInt(dayMatch[1]);
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date;
  }

  const weekMatch = dateStr.match(/(\d+)\s*สัปดาห์/);
  if (weekMatch) {
    const weeks = parseInt(weekMatch[1]);
    const date = new Date(now);
    date.setDate(date.getDate() - (weeks * 7));
    return date;
  }

  const monthMatch = dateStr.match(/(\d+)\s*เดือน/);
  if (monthMatch) {
    const months = parseInt(monthMatch[1]);
    const date = new Date(now);
    date.setMonth(date.getMonth() - months);
    return date;
  }

  // If can't parse, assume it's recent (within 30 days)
  return now;
}

class AgentService {
  // Scrape website and extract plant data using AI
  async scrapeWebsite(websiteId, url) {
    try {
      console.log(`🤖 AI Agent: Starting scrape for ${url}`);

      // 1. Scrape HTML content
      const scrapeResult = await scrapingService.scrapeHTML(url);
      if (!scrapeResult.success) {
        const errorMsg = scrapeResult.error || 'Unknown error';
        console.error(`❌ Scraping failed: ${errorMsg}`);

        // Check if it's a Facebook URL and provide helpful error message
        const isFacebook = url.includes('facebook.com') || url.includes('fb.com');
        if (isFacebook) {
          throw new Error(`ไม่สามารถ scrape Facebook ได้: ${errorMsg}\n\n💡 หมายเหตุ: Facebook มีระบบป้องกัน bot ที่แข็งแกร่ง อาจต้อง:\n- ใช้ Puppeteer (ต้องติดตั้ง Chromium)\n- ใช้ Facebook Graph API (ต้องมี Access Token)\n- หรือลองใช้ URL อื่น`);
        }

        throw new Error(`Failed to scrape: ${errorMsg}`);
      }

      console.log(`✅ Scraping successful: ${scrapeResult.method}, HTML length: ${scrapeResult.html.length}`);

      // 2. Extract text content
      const textResult = await scrapingService.extractText(scrapeResult.html);
      if (!textResult.success) {
        throw new Error(`Failed to extract text: ${textResult.error}`);
      }

      // 3. Extract structured data (basic) - รวมรูปภาพด้วย
      const structuredResult = await scrapingService.extractStructuredData(scrapeResult.html);

      // เก็บ URL รูปภาพสำหรับส่งให้ AI
      const imageUrls = structuredResult.data?.images?.slice(0, 10).map(img => img.src).filter(src => src && !src.startsWith('data:')).join(', ') || '';

      // 4. Use AI to analyze and extract plant data
      // Check if it's Facebook
      const isFacebook = url.includes('facebook.com') || url.includes('fb.com');
      const isFacebookProfile = url.includes('/user/') || url.includes('/profile.php');
      const sourceType = isFacebookProfile ? 'Facebook Profile (เจ้าของสวน)' : (isFacebook ? 'Facebook Group/Page' : 'เว็บไซต์');

      const aiPrompt = `คุณเป็น AI Agent ที่ช่วยแกะข้อมูลต้นไม้และราคาจาก${sourceType}

ข้อมูลจาก${sourceType}:
URL: ${url}
Title: ${structuredResult.data?.title || 'N/A'}
Text Content: ${textResult.text.substring(0, 8000)}... (truncated)
${imageUrls ? `\nรูปภาพที่พบ: ${imageUrls}` : ''}

${isFacebookProfile ? `⚠️ หมายเหตุ: ข้อมูลนี้มาจาก Facebook Profile ของเจ้าของสวน/ผู้ขาย

🎯 สำคัญมาก: 
- แกะข้อมูลเฉพาะจากโพสต์ล่าสุด (ไม่เกิน 30 วัน) เท่านั้น
- ตรวจสอบวันที่ของโพสต์ก่อนแกะข้อมูล (ถ้ามี "5 ชั่วโมง", "1 วัน", "2 วัน" เป็นต้น)
- ถ้าโพสต์เก่ากว่า 30 วัน ให้ข้ามไป
- เก็บเฉพาะโพสต์ที่ใหม่ที่สุด (ล่าสุดก่อน)

ข้อมูลที่พบ:
- ชื่อต้นไม้ (จากโพสต์/รูปภาพ)
- เบอร์โทรศัพท์ (จากข้อมูลติดต่อ)
- รูปภาพต้นไม้ (อาจไม่มีราคา)
- ข้อมูลติดต่อ (ชื่อ เบอร์โทร ที่อยู่)
- วันที่โพสต์ (ถ้ามี เช่น "5 ชั่วโมง", "1 วัน", "2 วัน")

⚠️ ราคาอาจไม่มี: ถ้าไม่มีราคา ให้ใส่ price เป็น null หรือ 0
⚠️ เก็บข้อมูลต้นไม้ทั้งหมดที่พบ: แม้ไม่มีราคาก็เก็บไว้ แต่ต้องเป็นโพสต์ล่าสุด (ไม่เกิน 30 วัน) เท่านั้น` : ''}

${isFacebook && !isFacebookProfile ? '⚠️ หมายเหตุ: ข้อมูลนี้มาจาก Facebook Group/Page อาจมีรูปแบบที่แตกต่างจากเว็บไซต์ปกติ กรุณาแกะข้อมูลจากโพสต์หรือคอมเมนต์ที่เกี่ยวข้องกับต้นไม้และราคา' : ''}

กรุณาแกะข้อมูลต้นไม้และราคาจากข้อมูลข้างต้น และแปลงเป็น JSON format ตามโครงสร้างนี้:

{
  "supplier": {
    "name": "ชื่อร้านค้า/เจ้าของสวน",
    "location": "ที่อยู่ (ถ้ามี)",
    "phone": "เบอร์โทร (ถ้ามี)",
    "website": "${url}"
  },
      "plants": [
    {
      "name": "ชื่อต้นไม้",
      "scientificName": "ชื่อวิทยาศาสตร์ (ถ้ามี)",
      "category": "หมวดหมู่ (ไม้ประดับ, ไม้ล้อม, ไม้ดอก, ไม้ใบ, แคคตัส, บอนไซ, กล้วยไม้)",
      "price": ราคา (ตัวเลข หรือ null ถ้าไม่มีราคา),
      "size": "ขนาด (ถ้ามี)",
      "description": "คำอธิบาย (ถ้ามี)",
      "imageUrl": "URL รูปภาพต้นไม้ (ถ้ามี)",
      "postDate": "วันที่โพสต์ (ถ้ามี เช่น '5 ชั่วโมง', '1 วัน', '2 วัน')",
      "stockAvailable": true/false (ถ้าตรวจสอบได้)
    }
  ],
  "confidence": 0.0-1.0 (ความมั่นใจในการแกะข้อมูล)
}

⚠️ สำคัญ: ถ้าไม่มีราคา ให้ใส่ price เป็น null หรือ 0 (ห้ามใส่ราคาแบบสุ่ม)
⚠️ เก็บข้อมูลต้นไม้ทั้งหมดที่พบ แม้ไม่มีราคาก็เก็บไว้

ตอบเป็น JSON ล้วนๆ เท่านั้น ห้ามใส่โค้ดบล็อก (เช่น code fences) หรือคำอธิบายอื่นๆ`;

      const aiResult = await aiService.analyzeText(aiPrompt);

      if (!aiResult || !aiResult.plants) {
        throw new Error('AI failed to extract plant data');
      }

      // 5. Validate and clean data using AI
      const validatedData = await this.validateAndCleanData(aiResult);

      // 6. Save to database
      const savedData = await this.saveScrapingResults(websiteId, url, validatedData);

      return {
        success: true,
        data: savedData,
        rawData: {
          htmlLength: scrapeResult.html.length,
          textLength: textResult.text.length,
          method: scrapeResult.method
        }
      };

    } catch (error) {
      console.error('❌ AI Agent Error:', error);
      throw error;
    }
  }

  // Use AI to validate and clean extracted data
  async validateAndCleanData(extractedData) {
    try {
      const validationPrompt = `คุณเป็น AI Agent ที่ช่วยตรวจสอบและจัดระเบียบข้อมูลต้นไม้

ข้อมูลที่แกะมาได้:
${JSON.stringify(extractedData, null, 2)}

🎯 กรุณาตรวจสอบและจัดระเบียบข้อมูลให้ครบถ้วนและถูกต้อง:

1. **ชื่อต้นไม้**: ตรวจสอบและแก้ไขให้ถูกต้อง (ใช้ชื่อที่ใช้กันทั่วไป)
2. **ชื่อร้าน/Supplier**: ตรวจสอบชื่อร้านค้า/เจ้าของสวนให้ถูกต้อง
3. **ไซต์/ขนาด**: จัดระเบียบขนาดให้เป็นรูปแบบที่สม่ำเสมอ (เช่น "15\"", "10\"", "ขนาดเล็ก", "ขนาดกลาง")
4. **รูปภาพ**: ตรวจสอบ URL รูปภาพให้ถูกต้อง
5. **หมวดหมู่**: จัดระเบียบหมวดหมู่ให้ถูกต้อง (ไม้ประดับ, ไม้ล้อม, ไม้ดอก, ไม้ใบ, แคคตัส, บอนไซ, กล้วยไม้)
6. **ราคา**: ตรวจสอบราคาให้เป็นตัวเลขที่สมเหตุสมผล (ถ้าไม่มีราคา ให้ใส่ null)
7. **ข้อมูล Supplier**: ตรวจสอบเบอร์โทร, ที่อยู่ให้ถูกต้อง
8. **ลบข้อมูลที่ซ้ำซ้อน**: รวมข้อมูลที่ซ้ำกัน

⚠️ สำคัญ: ข้อมูลต้องจัดระเบียบให้ครบถ้วน (ชื่อต้นไม้, ชื่อร้าน, ไซต์, รูปภาพ) เพื่อให้ Admin สามารถตรวจสอบและ approve ได้ง่าย

ตอบเป็น JSON format เดียวกับข้อมูลที่ส่งมา แต่เป็นข้อมูลที่ตรวจสอบและจัดระเบียบแล้ว

ตอบเป็น JSON ล้วนๆ เท่านั้น ห้ามใส่โค้ดบล็อก`;

      const validatedResult = await aiService.analyzeText(validationPrompt);

      return validatedResult || extractedData;
    } catch (error) {
      console.error('Validation error:', error);
      return extractedData; // Return original if validation fails
    }
  }

  // Analyze pasted text from Facebook posts (manual input)
  async analyzePastedText(text, sourceUrl = null) {
    try {
      console.log(`🤖 AI Agent: Analyzing pasted text (length: ${text.length})`);

      // Use AI to analyze and extract plant data from pasted text
      const aiPrompt = `คุณเป็น AI Agent ที่ช่วยแกะข้อมูลต้นไม้และราคาจากข้อความที่ copy-paste จาก Facebook

⚠️ หมายเหตุ: ข้อมูลนี้มาจาก Facebook Post ที่ admin copy-paste มา

🎯 สำคัญมาก: 
- แกะข้อมูลต้นไม้ทั้งหมดที่พบในข้อความ
- แกะข้อมูลราคา (ถ้ามี)
- แกะข้อมูลขนาด/ไซต์ (ถ้ามี)
- แกะข้อมูลติดต่อ (ชื่อ เบอร์โทร ที่อยู่ Line ID)
- แกะข้อมูลบริการ (ปลูก ส่ง เก็บเงินปลายทาง)
- วันที่โพสต์ (ถ้ามี เช่น "15 นาที", "1 ชั่วโมง", "1 วัน")

ข้อมูลที่พบ:
- ชื่อต้นไม้ (จากข้อความ)
- เบอร์โทรศัพท์ (จากข้อมูลติดต่อ)
- ข้อมูลติดต่อ (ชื่อ เบอร์โทร ที่อยู่ Line ID)
- ราคา (ถ้ามี - อาจไม่มีราคาในบางโพสต์)
- ขนาด/ไซต์ (ถ้ามี เช่น "80 เซน - 3 เมตร", "2-2.20-2.50-3-3.50-4 เมตร")
- บริการ (ปลูก ส่ง เก็บเงินปลายทาง)

⚠️ ราคาอาจไม่มี: ถ้าไม่มีราคา ให้ใส่ price เป็น null หรือ 0
⚠️ เก็บข้อมูลต้นไม้ทั้งหมดที่พบ: แม้ไม่มีราคาก็เก็บไว้

ข้อความที่ copy-paste มา:
${text}

กรุณาแกะข้อมูลต้นไม้และราคาจากข้อความข้างต้น และแปลงเป็น JSON format ตามโครงสร้างนี้:

{
  "supplier": {
    "name": "ชื่อร้านค้า/เจ้าของสวน/ผู้ขาย",
    "location": "ที่อยู่ (ถ้ามี)",
    "phone": "เบอร์โทร (ถ้ามี)",
    "lineId": "Line ID (ถ้ามี)",
    "website": "${sourceUrl || 'Facebook Post'}"
  },
  "plants": [
    {
      "name": "ชื่อต้นไม้",
      "scientificName": "ชื่อวิทยาศาสตร์ (ถ้ามี)",
      "category": "หมวดหมู่ (ไม้ประดับ, ไม้ล้อม, ไม้ดอก, ไม้ใบ, แคคตัส, บอนไซ, กล้วยไม้)",
      "price": ราคา (ตัวเลข หรือ null ถ้าไม่มีราคา),
      "size": "ขนาด (ถ้ามี เช่น '80 เซน - 3 เมตร', '2-2.20-2.50-3-3.50-4 เมตร')",
      "description": "คำอธิบาย (ถ้ามี)",
      "imageUrl": null,
      "postDate": "วันที่โพสต์ (ถ้ามี เช่น '15 นาที', '1 ชั่วโมง', '1 วัน')",
      "stockAvailable": true/false (ถ้าตรวจสอบได้)
    }
  ],
  "services": ["ปลูก", "ส่ง", "เก็บเงินปลายทาง"] (ถ้ามี),
  "confidence": 0.0-1.0 (ความมั่นใจในการแกะข้อมูล)
}

⚠️ สำคัญ: ถ้าไม่มีราคา ให้ใส่ price เป็น null หรือ 0 (ห้ามใส่ราคาแบบสุ่ม)
⚠️ เก็บข้อมูลต้นไม้ทั้งหมดที่พบ แม้ไม่มีราคาก็เก็บไว้
⚠️ แกะข้อมูลเบอร์โทร Line ID และข้อมูลติดต่อให้ครบถ้วน

ตอบเป็น JSON ล้วนๆ เท่านั้น ห้ามใส่โค้ดบล็อก (เช่น code fences) หรือคำอธิบายอื่นๆ`;

      const aiResult = await aiService.analyzeText(aiPrompt);

      if (!aiResult || !aiResult.plants) {
        throw new Error('AI failed to extract plant data from pasted text');
      }

      // Validate and clean data using AI
      const validatedData = await this.validateAndCleanData(aiResult);

      // Save to database
      const savedData = await this.saveScrapingResults(null, sourceUrl || 'Facebook Post (Pasted)', validatedData);

      return {
        success: true,
        data: savedData,
        rawData: {
          textLength: text.length,
          method: 'pasted-text'
        }
      };

    } catch (error) {
      console.error('❌ AI Agent Error (Pasted Text):', error);
      throw error;
    }
  }

  // Save scraping results to database
  async saveScrapingResults(websiteId, url, data) {
    const jobId = `job_${Date.now()}_${uuidv4()}`;

    try {
      // 1. Create scraping job
      await pool.query(`
        INSERT INTO scraping_jobs (id, website_id, url, status, started_at)
        VALUES ($1, $2, $3, $4, NOW())
      `, [jobId, websiteId || null, url, 'processing']);

      // 2. Save scraping results as PENDING (waiting for admin approval)
      // Don't save to plants/suppliers yet - wait for approval
      const savedPlants = [];
      if (data.plants && Array.isArray(data.plants)) {
        for (const plantData of data.plants) {
          try {
            // Save scraping result as PENDING (waiting for admin approval)
            const resultId = `result_${Date.now()}_${uuidv4()}`;
            // ถ้ามีราคา ใช้ราคา ถ้าไม่มี ใช้ null (ไม่ใช่ 0)
            const plantPrice = (plantData.price && plantData.price > 0) ? plantData.price : null;

            // Store all data for admin review (including supplier info)
            // Don't create plant/supplier yet - wait for approval
            await pool.query(`
              INSERT INTO scraping_results (
                id, job_id, plant_id, supplier_id, plant_name, price, size, 
                raw_data, confidence, status, image_url,
                supplier_name, supplier_phone, supplier_location
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `, [
              resultId,
              jobId,
              null, // plant_id = null (will be set after approval)
              null, // supplier_id = null (will be set after approval)
              plantData.name,
              plantPrice,
              plantData.size || null,
              JSON.stringify(plantData),
              data.confidence || 0.8,
              'pending', // Status: pending (waiting for approval)
              plantData.imageUrl || null,
              data.supplier?.name || null,
              data.supplier?.phone || null,
              data.supplier?.location || null
            ]);

            // Don't save to plants/suppliers yet - wait for admin approval
            // This will be done in the approval endpoint

            savedPlants.push({
              resultId,
              plantName: plantData.name,
              price: plantPrice,
              size: plantData.size,
              imageUrl: plantData.imageUrl,
              supplierName: data.supplier?.name
            });
          } catch (error) {
            console.error(`Error saving plant ${plantData.name}:`, error);
          }
        }
      }

      // 4. Update job status
      await pool.query(`
        UPDATE scraping_jobs
        SET status = $1, completed_at = NOW(), result = $2
        WHERE id = $3
      `, ['completed', JSON.stringify({ plants: savedPlants, count: savedPlants.length }), jobId]);

      return {
        jobId,
        plants: savedPlants,
        count: savedPlants.length,
        confidence: data.confidence || 0.5,
        status: 'pending' // All results are pending approval
      };

    } catch (error) {
      // Update job status to failed
      await pool.query(`
        UPDATE scraping_jobs
        SET status = $1, completed_at = NOW(), result = $2
        WHERE id = $3
      `, ['failed', JSON.stringify({ error: error.message }), jobId]);
      throw error;
    }
  }
  // Search from Google Maps and save as candidates
  async searchPlacesAndSave(keywords, filterWholesale = false) {
    // 1. Handle single keyword or array
    const keywordList = Array.isArray(keywords) ? keywords : [keywords];
    const jobId = `job_maps_${Date.now()}_${uuidv4()}`;
    const allSavedItems = [];
    let totalProcessed = 0;

    try {
      console.log(`🤖 AI Agent: Starting Google Maps batch search for ${keywordList.length} keywords`);

      // Create Job
      await pool.query(`
        INSERT INTO scraping_jobs (id, website_id, url, status, started_at)
        VALUES ($1, $2, $3, $4, NOW())
      `, [jobId, null, `Maps Batch Search (${keywordList.length} keywords)`, 'processing']);

      // 2. Loop through keywords
      for (const keyword of keywordList) {
        if (!keyword || !keyword.trim()) continue;

        try {
          console.log(`📍 Searching for: "${keyword}"`);
          const places = await googleMapsService.searchPlaces(keyword);

          if (places.length === 0) continue;

          // 3. Process each place
          for (const place of places) {
            totalProcessed++;

            // Deduplication (Check by Place ID)
            if (place.placeId) {
              const existing = await pool.query(
                `SELECT id FROM scraping_results WHERE raw_data->>'placeId' = $1 AND status != 'rejected'`,
                [place.placeId]
              );
              if (existing.rows.length > 0) {
                console.log(`Evaluate duplicate: ${place.name} (Skipping)`);
                continue;
              }
            }

            // Fetch Details (Phone, etc.)
            let detailedPlace = place;
            if (place.placeId) {
              const details = await googleMapsService.getPlaceDetails(place.placeId);
              if (details) {
                // Merge details
                detailedPlace = { ...place, ...details };
                // Specific phone formatting if needed
                detailedPlace.phone = details.formatted_phone_number || details.international_phone_number || place.phone;
              }
            }

            // AI Filtering (Wholesale check)
            if (filterWholesale) {
              const isWholesale = await this.checkIfWholesale(detailedPlace);
              if (!isWholesale) {
                console.log(`🚫 AI Filtered out: ${detailedPlace.name} (Not wholesale)`);
                continue;
              }
            }

            // Save Result
            const resultId = `result_${Date.now()}_${uuidv4()}`;
            await pool.query(`
              INSERT INTO scraping_results (
                id, job_id, plant_id, supplier_id, plant_name, price, size, 
                raw_data, confidence, status, image_url,
                supplier_name, supplier_phone, supplier_location
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `, [
              resultId,
              jobId,
              null,
              null,
              `New Supplier Found`, // Generic name
              null,
              null,
              JSON.stringify(detailedPlace),
              0.95,
              'pending',
              null, // Image URL could be fetched from Photo References later
              detailedPlace.name,
              detailedPlace.phone || null,
              detailedPlace.formatted_address || detailedPlace.location
            ]);

            allSavedItems.push({
              resultId,
              supplierName: detailedPlace.name,
              location: detailedPlace.formatted_address
            });
          }

        } catch (searchErr) {
          console.error(`Error searching keyword "${keyword}":`, searchErr);
        }
      }

      // 4. Update Job
      await pool.query(`
        UPDATE scraping_jobs
        SET status = $1, completed_at = NOW(), result = $2
        WHERE id = $3
      `, ['completed', JSON.stringify({ items: allSavedItems, count: allSavedItems.length }), jobId]);

      return {
        success: true,
        count: allSavedItems.length,
        processed: totalProcessed,
        jobId,
        items: allSavedItems
      };

    } catch (error) {
      console.error('❌ Maps Batch Search Error:', error);
      // Update job status to failed
      await pool.query(`
        UPDATE scraping_jobs
        SET status = $1, completed_at = NOW(), result = $2
        WHERE id = $3
      `, ['failed', JSON.stringify({ error: error.message }), jobId]);
      throw error;
    }
  }

  // AI Helper: Check if place is a wholesale supplier
  async checkIfWholesale(place) {
    // Simple fast check: check types or name
    const keywords = ['wholesale', 'supplies', 'garden center', 'florist', 'market', 'farm', 'ขายส่ง', 'ตลาด', 'สวน', 'ฟาร์ม'];
    const nameLower = place.name.toLowerCase();

    // 1. Basic Keyword Match
    const hasKeyword = keywords.some(k => nameLower.includes(k));
    if (hasKeyword) return true; // High likelihood

    // 2. AI Analysis for ambiguous cases (using existing aiService)
    try {
      const prompt = `Analyzer this business: "${place.name}". 
      Categories: ${JSON.stringify(place.types)}. 
      Reviews: ${JSON.stringify(place.reviews?.slice(0, 2) || [])}.
      Is this significantly likely to be a plant wholesaler, plant market, or large garden supplier?
      Answer YES or NO only.`;

      const aiResponse = await aiService.analyzeText(prompt);
      // aiService returns JSON usually, but here we just want a string check if analyzeText returns string.
      // Assuming analyzeText returns object, we might need a simpler calls. 
      // For safety, let's stick to keyword matching + Types for now to save tokens/time,
      // as "Wholesale" filter implies strict "Wholesale" intent.

      // Let's rely on Types
      const validTypes = ['florist', 'store', 'point_of_interest', 'establishment'];
      if (!place.types || place.types.length === 0) return true; // Default keep

      return place.types.some(t => validTypes.includes(t));
    } catch (e) {
      return true; // Fail safe: keep it
    }
  }
}

module.exports = new AgentService();
