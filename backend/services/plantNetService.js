// 🌿 PlantNet API Service - สำหรับระบุพืชพันธุ์จากรูปภาพ

class PlantNetService {
  constructor() {
    this.apiKey = process.env.PLANTNET_API_KEY || '';
    this.baseUrl = 'https://my-api.plantnet.org/v2';
    this.project = 'world'; // หรือ 'asia' สำหรับเอเชีย
  }

  /**
   * ระบุพืชพันธุ์จากรูปภาพ
   * @param {string} base64Image - รูปภาพในรูปแบบ base64 (ไม่ต้องมี data:image prefix)
   * @param {Object} options - ตัวเลือกเพิ่มเติม
   * @returns {Promise<Object>} ผลลัพธ์การระบุพืชพันธุ์
   */
  async identifyPlant(base64Image, options = {}) {
    if (!this.apiKey) {
      throw new Error('PlantNet API key not found. Please set PLANTNET_API_KEY in Railway variables.');
    }

    try {
      // PlantNet API ต้องการ base64 string โดยตรง (ไม่ใช่ data URL)
      // ตรวจสอบว่ามี prefix หรือไม่
      let cleanBase64 = base64Image;
      if (base64Image.includes(',')) {
        cleanBase64 = base64Image.split(',')[1]; // ลบ data:image/jpeg;base64, prefix
      }

      const response = await fetch(`${this.baseUrl}/identify/${this.project}?api-key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: [cleanBase64], // ส่ง base64 string โดยตรง
          modifiers: options.modifiers || ['crops_fast', 'similar_images'],
          plant_details: options.plantDetails || [
            'common_names',
            'url',
            'name_authority',
            'wiki_description',
            'synonyms',
            'gbif_id'
          ],
          plant_language: options.language || 'th', // ภาษาไทย
          include_related_images: options.includeRelatedImages !== false // รวมรูปที่เกี่ยวข้อง
        })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          const textResponse = await response.text();
          errorData = { error: textResponse || `HTTP ${response.status}` };
        }
        
        let errorMessage = `PlantNet API error: ${response.status}`;
        
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'PlantNet API key is invalid or unauthorized';
        } else if (response.status === 415) {
          errorMessage = 'PlantNet API: Unsupported Media Type - รูปภาพอาจมีรูปแบบไม่ถูกต้อง';
        } else if (response.status === 429) {
          errorMessage = 'PlantNet API rate limit exceeded (500 requests/day)';
        } else if (errorData.error) {
          errorMessage = `PlantNet API error: ${errorData.error}`;
        } else if (errorData.message) {
          errorMessage = `PlantNet API error: ${errorData.message}`;
        }
        
        console.error('❌ PlantNet API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return this.formatPlantNetResponse(data);

    } catch (error) {
      console.error('❌ PlantNet API Error:', error);
      throw error;
    }
  }

  /**
   * จัดรูปแบบ response จาก PlantNet ให้เป็นรูปแบบที่ใช้งานง่าย
   */
  formatPlantNetResponse(data) {
    if (!data.results || data.results.length === 0) {
      return {
        success: false,
        message: 'ไม่พบพืชพันธุ์ที่ตรงกัน',
        suggestions: []
      };
    }

    const suggestions = data.results.map((result, index) => {
      const species = result.species;
      const score = result.score || 0;
      
      // หาชื่อภาษาไทย (common_names)
      const thaiName = species.commonNames?.find(name => 
        name.lang === 'th' || name.lang === 'th-TH'
      )?.value || null;

      // หาชื่อภาษาอังกฤษ
      const englishName = species.commonNames?.find(name => 
        name.lang === 'en' || name.lang === 'en-US'
      )?.value || null;

      return {
        rank: index + 1,
        scientificName: species.scientificNameWithoutAuthor || species.scientificName,
        scientificNameWithAuthor: species.scientificName,
        thaiName: thaiName,
        englishName: englishName,
        commonNames: species.commonNames || [],
        confidence: Math.round(score * 100), // แปลงเป็นเปอร์เซ็นต์
        score: score,
        wikiUrl: species.url,
        wikiDescription: species.wikiDescription,
        gbifId: species.gbifId,
        synonyms: species.synonyms || [],
        images: result.images || []
      };
    });

    return {
      success: true,
      message: `พบ ${suggestions.length} ชนิดพืชพันธุ์`,
      suggestions: suggestions,
      bestMatch: suggestions[0], // ตัวเลือกที่ดีที่สุด
      totalResults: suggestions.length
    };
  }

  /**
   * ระบุพืชพันธุ์หลายรูปพร้อมกัน (1-5 รูป)
   */
  async identifyPlantMultiple(images, options = {}) {
    if (!this.apiKey) {
      throw new Error('PlantNet API key not found. Please set PLANTNET_API_KEY in Railway variables.');
    }

    if (!images || images.length === 0 || images.length > 5) {
      throw new Error('PlantNet API requires 1-5 images');
    }

    try {
      // PlantNet API ต้องการ base64 string โดยตรง (ไม่ใช่ data URL)
      const imageDataArray = images.map(img => {
        if (img.includes(',')) {
          return img.split(',')[1]; // ลบ data:image/jpeg;base64, prefix
        }
        return img;
      });

      const response = await fetch(`${this.baseUrl}/identify/${this.project}?api-key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: imageDataArray,
          modifiers: options.modifiers || ['crops_fast', 'similar_images'],
          plant_details: options.plantDetails || [
            'common_names',
            'url',
            'name_authority',
            'wiki_description',
            'synonyms'
          ],
          plant_language: options.language || 'th'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`PlantNet API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      return this.formatPlantNetResponse(data);

    } catch (error) {
      console.error('❌ PlantNet API Error:', error);
      throw error;
    }
  }
}

module.exports = new PlantNetService();

