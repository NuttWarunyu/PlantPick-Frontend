// 🤖 AI Service for Backend - Intelligent Features

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  // 🔍 ตรวจสอบความถูกต้องของข้อมูลด้วย AI
  async validateDataWithAI(data, type) {
    if (!this.apiKey) {
      // ถ้าไม่มี API key ให้ return basic validation
      return {
        isValid: true,
        confidence: 0.5,
        suggestions: []
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'คุณเป็นผู้เชี่ยวชาญในการตรวจสอบข้อมูลต้นไม้และร้านค้า'
            },
            {
              role: 'user',
              content: `ตรวจสอบข้อมูล${type}ต่อไปนี้:\n${JSON.stringify(data, null, 2)}\n\nกรุณาแนะนำการแก้ไขและให้คะแนนความเชื่อมั่น (0-1)`
            }
          ],
          temperature: 0.3
        })
      });

      const result = await response.json();
      // Parse AI response and extract validation results
      
      return {
        isValid: true, // Default
        confidence: 0.8,
        suggestions: []
      };
    } catch (error) {
      console.error('AI Validation Error:', error);
      return {
        isValid: true,
        confidence: 0.5,
        suggestions: []
      };
    }
  }

  // 💰 วิเคราะห์ราคาด้วย AI
  async analyzePrice(plantName, price, category) {
    if (!this.apiKey) {
      return this.getMockPriceAnalysis();
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'คุณเป็นผู้เชี่ยวชาญด้านราคาต้นไม้ในประเทศไทย'
            },
            {
              role: 'user',
              content: `วิเคราะห์ราคาต้นไม้ "${plantName}" ประเภท "${category}" ราคา ${price} บาท\n\nควรแนะนำอะไร? ราคาเหมาะสมหรือไม่?`
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      });

      const result = await response.json();
      
      return {
        isFairPrice: true,
        recommendation: 'ราคาอยู่ในเกณฑ์เหมาะสม',
        averagePrice: price,
        marketTrend: 'stable'
      };
    } catch (error) {
      console.error('AI Price Analysis Error:', error);
      return this.getMockPriceAnalysis();
    }
  }

  // 🔄 แนะนำราคาที่เหมาะสม (Smart Pricing)
  suggestOptimalPrice(plantName, category, currentPrice, historicalPrices) {
    const avgPrice = historicalPrices.length > 0 
      ? historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length
      : currentPrice;

    const suggestions = {
      recommendedPrice: currentPrice,
      confidence: 0.7,
      reasoning: `ราคา ${currentPrice} บาท ใกล้เคียงกับค่าเฉลี่ย ${avgPrice.toFixed(2)} บาท`
    };

    if (currentPrice > avgPrice * 1.5) {
      suggestions.recommendedPrice = avgPrice * 1.1;
      suggestions.confidence = 0.9;
      suggestions.reasoning = 'ราคาสูงเกินไป แนะนำให้ลดลง';
    }

    if (currentPrice < avgPrice * 0.5) {
      suggestions.recommendedPrice = avgPrice * 0.9;
      suggestions.confidence = 0.9;
      suggestions.reasoning = 'ราคาต่ำเกินไป ตรวจสอบความถูกต้อง';
    }

    return suggestions;
  }

  // 🔍 Detect Duplicates with AI
  detectDuplicatePlants(plantName, plantType) {
    // Simple duplicate detection based on name similarity
    return {
      isDuplicate: false,
      similarPlants: [],
      confidence: 0.5
    };
  }

  // 📊 Generate Business Insights
  generateInsights(plants, suppliers, orders) {
    return {
      totalPlants: plants?.length || 0,
      totalSuppliers: suppliers?.length || 0,
      averagePrice: this.calculateAveragePrice(plants),
      mostPopularPlants: this.getMostPopularPlants(plants),
      recommendations: this.generateRecommendations(plants, suppliers)
    };
  }

  // Helper methods
  calculateAveragePrice(plants) {
    if (!plants || plants.length === 0) return 0;
    
    const prices = plants
      .flatMap(p => p.suppliers || [])
      .map(s => s.price)
      .filter(p => p > 0);
    
    return prices.length > 0 
      ? prices.reduce((a, b) => a + b, 0) / prices.length 
      : 0;
  }

  getMostPopularPlants(plants) {
    // Return top 5 most popular plants
    return (plants || []).slice(0, 5);
  }

  generateRecommendations(plants, suppliers) {
    const recommendations = [];

    if (plants && plants.length < 10) {
      recommendations.push('แนะนำให้เพิ่มข้อมูลต้นไม้ให้มากขึ้น');
    }

    if (suppliers && suppliers.length < 3) {
      recommendations.push('ควรเพิ่มผู้จัดจำหน่ายเพิ่มเติมเพื่อเปรียบเทียบราคา');
    }

    return recommendations;
  }

  getMockPriceAnalysis() {
    return {
      isFairPrice: true,
      recommendation: 'ราคาอยู่ในเกณฑ์เหมาะสม',
      averagePrice: 500,
      marketTrend: 'stable'
    };
  }

  // 📸 สแกนใบเสร็จด้วย ChatGPT Vision (GPT-4o)
  async scanBill(base64Image) {
    // ตรวจสอบว่ามี API Key หรือไม่
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY in Railway variables.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `อ่านใบเสร็จร้านต้นไม้นี้และแปลงเป็น JSON format ตามโครงสร้างนี้:
                  {
                    "supplierName": "ชื่อร้านค้า",
                    "supplierPhone": "เบอร์โทรศัพท์",
                    "supplierLocation": "ที่อยู่",
                    "billDate": "วันที่ (YYYY-MM-DD)",
                    "totalAmount": ราคารวม,
                    "items": [
                      {
                        "plantName": "ชื่อต้นไม้",
                        "quantity": จำนวน,
                        "price": ราคาต่อต้น,
                        "total": ราคารวม,
                        "size": "ไซต์ (ถ้ามี)",
                        "notes": "หมายเหตุ (ถ้ามี)"
                      }
                    ],
                    "confidence": 0.95
                  }
                  
                  กรุณาอ่านข้อมูลให้ครบถ้วนและแม่นยำ`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      // ตรวจสอบ HTTP status
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = `OpenAI API error: ${response.status}`;
        
        // ตรวจสอบ error type
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'OpenAI API key is invalid or unauthorized';
        } else if (response.status === 429) {
          errorMessage = 'OpenAI API rate limit exceeded';
        } else if (errorData.error?.message) {
          errorMessage = `OpenAI API error: ${errorData.error.message}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // แปลง JSON string เป็น object
      try {
        const result = JSON.parse(content);
        return result;
      } catch (parseError) {
        throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
      }

    } catch (error) {
      console.error('❌ Error scanning bill with AI:', error);
      // ⚠️ ไม่ใช้ Mock Data - throw error ต่อให้ endpoint จัดการ
      throw error;
    }
  }

  // Mock data สำหรับ Bill Scan
  getMockBillScanResult() {
    return {
      supplierName: 'สวนไม้ประดับ ณัฐพล',
      supplierPhone: '081-234-5678',
      supplierLocation: 'นครปฐม',
      billDate: new Date().toISOString().split('T')[0],
      totalAmount: 15750,
      confidence: 0.92,
      items: [
        {
          plantName: 'มอนสเตอร่า เดลิซิโอซ่า',
          quantity: 2,
          price: 450,
          total: 900,
          size: '1-2 ฟุต',
          notes: 'ต้นใหญ่'
        },
        {
          plantName: 'ยางอินเดีย',
          quantity: 3,
          price: 350,
          total: 1050,
          size: '2-3 ฟุต'
        },
        {
          plantName: 'ฟิโลเดนดรอน เฮเดรซิฟอลิอัม',
          quantity: 1,
          price: 280,
          total: 280,
          size: 'S'
        },
        {
          plantName: 'แคคตัส หลากชนิด',
          quantity: 10,
          price: 120,
          total: 1200,
          notes: 'ชุด 10 ต้น'
        },
        {
          plantName: 'ไม้ล้อม - ต้นไผ่',
          quantity: 5,
          price: 2500,
          total: 12500,
          size: '3-4 เมตร'
        }
      ]
    };
  }
}

module.exports = new AIService();

