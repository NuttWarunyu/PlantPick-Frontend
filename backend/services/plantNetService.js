// 🌿 PlantNet API Service - สำหรับระบุพืชพันธุ์จากรูปภาพ

class PlantNetService {
  constructor() {
    this.apiKey = process.env.PLANTNET_API_KEY || '';
    this.baseUrl = 'https://my-api.plantnet.org/v2';
    this.project = 'all'; // 'all' = ทุกโครงการ (แนะนำ), 'world' = ทั่วโลก, 'asia' = เอเชีย
  }

  /**
   * ระบุพืชพันธุ์จากรูปภาพ
   * @param {string} base64Image - รูปภาพในรูปแบบ base64 (อาจมี data:image prefix)
   * @param {Object} options - ตัวเลือกเพิ่มเติม
   * @returns {Promise<Object>} ผลลัพธ์การระบุพืชพันธุ์
   */
  async identifyPlant(base64Image, options = {}) {
    if (!this.apiKey) {
      throw new Error('PlantNet API key not found. Please set PLANTNET_API_KEY in Railway variables.');
    }

    try {
      // PlantNet API ต้องการ FormData (multipart/form-data) ไม่ใช่ JSON
      // ตรวจสอบว่ามี prefix หรือไม่
      let cleanBase64 = base64Image;
      if (base64Image.includes(',')) {
        cleanBase64 = base64Image.split(',')[1]; // ลบ data:image/jpeg;base64, prefix
      }

      // แปลง base64 เป็น Buffer
      const imageBuffer = Buffer.from(cleanBase64, 'base64');

      // สร้าง FormData
      const FormData = require('form-data');
      const formData = new FormData();
      
      // ส่งรูปภาพเป็น binary file
      formData.append('images', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg',
      });
      
      // ระบุอวัยวะของพืช (auto = ให้ AI ระบุเอง)
      formData.append('organs', options.organs || 'auto');
      
      // ภาษา (th = ไทย)
      if (options.language) {
        formData.append('lang', options.language);
      } else {
        formData.append('lang', 'th');
      }

      // plant_details เป็น JSON string
      const plantDetails = options.plantDetails || [
        'common_names',
        'url',
        'name_authority',
        'wiki_description',
        'synonyms',
        'gbif_id'
      ];
      formData.append('plant_details', JSON.stringify(plantDetails));

      // include-related-images
      if (options.includeRelatedImages !== false) {
        formData.append('include-related-images', 'true');
      }

      // nb-results (จำนวนผลลัพธ์สูงสุด)
      if (options.nbResults) {
        formData.append('nb-results', options.nbResults.toString());
      }

      console.log(`🌿 เรียก PlantNet API: project=${this.project}, lang=th, organs=auto`);

      const response = await fetch(`${this.baseUrl}/identify/${this.project}?api-key=${this.apiKey}`, {
        method: 'POST',
        body: formData, // ส่ง FormData (ไม่ต้องตั้ง Content-Type header - FormData จะตั้งให้เอง)
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
    // PlantNet API response structure:
    // {
    //   "bestMatch": "Scientific Name L.",
    //   "results": [
    //     {
    //       "score": 0.90734,
    //       "species": {
    //         "scientificName": "Ajuga genevensis L.",
    //         "scientificNameWithoutAuthor": "Ajuga genevensis",
    //         "commonNames": [
    //           { "lang": "en", "value": "Blue bugleweed" },
    //           { "lang": "th", "value": "ชื่อไทย" }
    //         ],
    //         ...
    //       }
    //     }
    //   ]
    // }

    if (!data.results || data.results.length === 0) {
      return {
        success: false,
        message: 'ไม่พบพืชพันธุ์ที่ตรงกัน',
        suggestions: [],
        bestMatch: null
      };
    }

    const suggestions = data.results.map((result, index) => {
      const species = result.species;
      const score = result.score || 0;
      
      // หาชื่อภาษาไทย (common_names)
      // PlantNet commonNames เป็น array ของ objects: { lang: "th", value: "ชื่อไทย" }
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
        gbifId: result.gbif?.id || species.gbifId,
        synonyms: species.synonyms || [],
        images: result.images || []
      };
    });

    const bestMatch = suggestions[0];

    return {
      success: true,
      message: `พบ ${suggestions.length} ชนิดพืชพันธุ์`,
      suggestions: suggestions,
      bestMatch: bestMatch, // ตัวเลือกที่ดีที่สุด
      totalResults: suggestions.length,
      bestMatchName: data.bestMatch || bestMatch?.scientificName // ชื่อวิทยาศาสตร์จาก PlantNet
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
      // PlantNet API ต้องการ FormData
      const FormData = require('form-data');
      const formData = new FormData();

      // ส่งรูปภาพหลายรูป (1-5 รูป)
      images.forEach((img, index) => {
        let cleanBase64 = img;
        if (img.includes(',')) {
          cleanBase64 = img.split(',')[1];
        }
        const imageBuffer = Buffer.from(cleanBase64, 'base64');
        formData.append('images', imageBuffer, {
          filename: `image${index + 1}.jpg`,
          contentType: 'image/jpeg',
        });
      });

      // ระบุอวัยวะของพืช (ต้องมีจำนวนเท่ากับจำนวนรูป)
      const organs = options.organs || images.map(() => 'auto');
      organs.forEach(organ => {
        formData.append('organs', organ);
      });

      // ภาษา
      if (options.language) {
        formData.append('lang', options.language);
      } else {
        formData.append('lang', 'th');
      }

      // plant_details
      const plantDetails = options.plantDetails || [
        'common_names',
        'url',
        'name_authority',
        'wiki_description',
        'synonyms'
      ];
      formData.append('plant_details', JSON.stringify(plantDetails));

      // ใช้ axios แทน fetch
      const response = await axios.post(
        `${this.baseUrl}/identify/${this.project}?api-key=${this.apiKey}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      const data = response.data;
      return this.formatPlantNetResponse(data);

    } catch (error) {
      // Handle axios errors
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data || {};
        console.error('❌ PlantNet API Error:', {
          status: status,
          errorData: errorData
        });
        throw new Error(`PlantNet API error: ${status} - ${errorData.error || 'Unknown error'}`);
      } else if (error.request) {
        console.error('❌ PlantNet API Request Error:', error.message);
        throw new Error(`PlantNet API request failed: ${error.message}`);
      } else {
        console.error('❌ PlantNet API Error:', error.message);
        throw error;
      }
    }
  }
}

module.exports = new PlantNetService();
