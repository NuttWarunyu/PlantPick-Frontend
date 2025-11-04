// AI Agent Service
// ใช้ AI ช่วยแกะข้อมูล, จัดระเบียบ, validate

const aiService = require('./aiService');
const scrapingService = require('./scrapingService');
const { db, pool } = require('../database');
const { v4: uuidv4 } = require('uuid');

class AgentService {
  // Scrape website and extract plant data using AI
  async scrapeWebsite(websiteId, url) {
    try {
      console.log(`🤖 AI Agent: Starting scrape for ${url}`);
      
      // 1. Scrape HTML content
      const scrapeResult = await scrapingService.scrapeHTML(url);
      if (!scrapeResult.success) {
        throw new Error(`Failed to scrape: ${scrapeResult.error}`);
      }

      // 2. Extract text content
      const textResult = await scrapingService.extractText(scrapeResult.html);
      if (!textResult.success) {
        throw new Error(`Failed to extract text: ${textResult.error}`);
      }

      // 3. Extract structured data (basic)
      const structuredResult = await scrapingService.extractStructuredData(scrapeResult.html);
      
      // 4. Use AI to analyze and extract plant data
      // Check if it's Facebook
      const isFacebook = url.includes('facebook.com') || url.includes('fb.com');
      const sourceType = isFacebook ? 'Facebook Group/Page' : 'เว็บไซต์';
      
      const aiPrompt = `คุณเป็น AI Agent ที่ช่วยแกะข้อมูลต้นไม้และราคาจาก${sourceType}

ข้อมูลจาก${sourceType}:
URL: ${url}
Title: ${structuredResult.data?.title || 'N/A'}
Text Content: ${textResult.text.substring(0, 8000)}... (truncated)

${isFacebook ? '⚠️ หมายเหตุ: ข้อมูลนี้มาจาก Facebook Group/Page อาจมีรูปแบบที่แตกต่างจากเว็บไซต์ปกติ กรุณาแกะข้อมูลจากโพสต์หรือคอมเมนต์ที่เกี่ยวข้องกับต้นไม้และราคา' : ''}

กรุณาแกะข้อมูลต้นไม้และราคาจากข้อมูลข้างต้น และแปลงเป็น JSON format ตามโครงสร้างนี้:

{
  "supplier": {
    "name": "ชื่อร้านค้า",
    "location": "ที่อยู่",
    "phone": "เบอร์โทร",
    "website": "${url}"
  },
  "plants": [
    {
      "name": "ชื่อต้นไม้",
      "scientificName": "ชื่อวิทยาศาสตร์ (ถ้ามี)",
      "category": "หมวดหมู่ (ไม้ประดับ, ไม้ล้อม, ไม้ดอก, ไม้ใบ, แคคตัส, บอนไซ, กล้วยไม้)",
      "price": ราคา (ตัวเลข),
      "size": "ขนาด (ถ้ามี)",
      "description": "คำอธิบาย (ถ้ามี)",
      "stockAvailable": true/false (ถ้าตรวจสอบได้)
    }
  ],
  "confidence": 0.0-1.0 (ความมั่นใจในการแกะข้อมูล)
}

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

กรุณาตรวจสอบและจัดระเบียบข้อมูล:
1. ตรวจสอบความถูกต้องของชื่อต้นไม้ (ถ้าชื่อไม่ถูกต้อง ให้แก้ไข)
2. จัดระเบียบหมวดหมู่ให้ถูกต้อง (ไม้ประดับ, ไม้ล้อม, ไม้ดอก, ไม้ใบ, แคคตัส, บอนไซ, กล้วยไม้)
3. ตรวจสอบราคา (ต้องเป็นตัวเลขที่สมเหตุสมผล)
4. จัดระเบียบขนาด (ถ้ามี)
5. ลบข้อมูลที่ซ้ำซ้อน

ตอบเป็น JSON format เดียวกับข้อมูลที่ส่งมา แต่เป็นข้อมูลที่ตรวจสอบและจัดระเบียบแล้ว

ตอบเป็น JSON ล้วนๆ เท่านั้น ห้ามใส่โค้ดบล็อก`;

      const validatedResult = await aiService.analyzeText(validationPrompt);
      
      return validatedResult || extractedData;
    } catch (error) {
      console.error('Validation error:', error);
      return extractedData; // Return original if validation fails
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

      // 2. Find or create supplier
      let supplier = null;
      if (data.supplier) {
        supplier = await db.findOrCreateSupplier({
          name: data.supplier.name || 'ไม่ระบุ',
          location: data.supplier.location || '',
          phone: data.supplier.phone || null,
          phoneNumbers: data.supplier.phone ? [data.supplier.phone] : [],
          description: `Scraped from ${url}`,
          website: data.supplier.website || url
        });
      }

      // 3. Process each plant
      const savedPlants = [];
      if (data.plants && Array.isArray(data.plants)) {
        for (const plantData of data.plants) {
          try {
            // Find or create plant
            const plant = await db.findOrCreatePlant({
              name: plantData.name || 'ไม่ระบุชื่อ',
              category: plantData.category || 'ไม้ประดับ',
              plantType: plantData.category || 'ไม้ประดับ',
              measurementType: plantData.size ? 'ขนาดกระถาง' : 'ความสูง',
              description: plantData.description || null,
              scientificName: plantData.scientificName || ''
            });

            // Save scraping result
            const resultId = `result_${Date.now()}_${uuidv4()}`;
            await pool.query(`
              INSERT INTO scraping_results (id, job_id, plant_id, supplier_id, plant_name, price, size, raw_data)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              resultId,
              jobId,
              plant.id,
              supplier?.id || null,
              plantData.name,
              plantData.price || 0,
              plantData.size || null,
              JSON.stringify(plantData)
            ]);

            // Update plant-supplier relationship if price exists
            if (supplier && plantData.price) {
              await db.upsertPlantSupplier(plant.id, supplier.id, {
                price: plantData.price,
                size: plantData.size || null
              });
            }

            savedPlants.push({
              plantId: plant.id,
              plantName: plant.name,
              price: plantData.price,
              supplierId: supplier?.id
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
        supplierId: supplier?.id,
        plants: savedPlants,
        count: savedPlants.length,
        confidence: data.confidence || 0.5
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
}

module.exports = new AgentService();

