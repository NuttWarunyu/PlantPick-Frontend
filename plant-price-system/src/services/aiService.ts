// AI Service for ChatGPT Integration
export interface BillScanResult {
  supplierName: string;
  supplierPhone?: string;
  supplierLocation?: string;
  billDate: string;
  totalAmount: number;
  items: BillItem[];
  confidence: number;
}

export interface BillItem {
  plantName: string;
  quantity: number;
  price: number;
  total: number;
  size?: string;
  notes?: string;
}

export interface PriceAnalysis {
  plantId: string;
  plantName: string;
  currentPrice: number;
  averagePrice: number;
  priceChange: number;
  priceChangePercent: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

export interface RouteOptimization {
  totalDistance: number;
  totalTime: number;
  totalCost: number;
  optimizedRoute: RouteStep[];
  savings: {
    distance: number;
    time: number;
    cost: number;
  };
}

export interface RouteStep {
  supplierId: string;
  supplierName: string;
  address: string;
  phone: string;
  plants: string[];
  estimatedCost: number;
  estimatedTime: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

class AIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. AI features will be disabled.');
    }
  }

  // ตรวจสอบว่า API key มีอยู่หรือไม่
  private isApiKeyAvailable(): boolean {
    return !!this.apiKey;
  }

  // แปลงไฟล์เป็น Base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // ลบ data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  // สแกนใบเสร็จด้วย ChatGPT Vision
  async scanBill(imageFile: File): Promise<BillScanResult> {
    if (!this.isApiKeyAvailable()) {
      // จำลองข้อมูลเมื่อไม่มี API key
      return this.getMockBillScanResult();
    }

    try {
      const base64Image = await this.fileToBase64(imageFile);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o', // ใช้ GPT-4 Vision
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

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // แปลง JSON string เป็น object
      const result = JSON.parse(content);
      return result as BillScanResult;

    } catch (error) {
      console.error('Error scanning bill with AI:', error);
      // กลับไปใช้ข้อมูลจำลองเมื่อเกิดข้อผิดพลาด
      return this.getMockBillScanResult();
    }
  }

  // วิเคราะห์ราคาด้วย AI
  async analyzePrice(plantId: string, plantName: string, currentPrice: number, historicalPrices: number[]): Promise<PriceAnalysis> {
    if (!this.isApiKeyAvailable()) {
      return this.getMockPriceAnalysis(plantName, currentPrice);
    }

    try {
      const averagePrice = historicalPrices.reduce((sum, price) => sum + price, 0) / historicalPrices.length;
      const priceChange = currentPrice - averagePrice;
      const priceChangePercent = (priceChange / averagePrice) * 100;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `วิเคราะห์ราคาต้นไม้ "${plantName}" 
              
              ราคาปัจจุบัน: ${currentPrice} บาท
              ราคาเฉลี่ย: ${averagePrice.toFixed(2)} บาท
              การเปลี่ยนแปลง: ${priceChangePercent.toFixed(2)}%
              
              กรุณาให้คำแนะนำในการซื้อ:
              1. ราคาปัจจุบันเหมาะสมหรือไม่
              2. ควรซื้อตอนนี้หรือรอ
              3. ราคาที่คาดหวังในอนาคต
              
              ตอบเป็นภาษาไทยและสั้นกระชับ`
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const recommendation = data.choices[0]?.message?.content || 'ไม่สามารถวิเคราะห์ได้';

      return {
        plantId,
        plantName,
        currentPrice,
        averagePrice,
        priceChange,
        priceChangePercent,
        trend: priceChangePercent > 5 ? 'up' : priceChangePercent < -5 ? 'down' : 'stable',
        recommendation
      };

    } catch (error) {
      console.error('Error analyzing price with AI:', error);
      return this.getMockPriceAnalysis(plantName, currentPrice);
    }
  }

  // วางแผนเส้นทางด้วย AI
  async optimizeRoute(selectedSuppliers: any[], projectLocation: string): Promise<RouteOptimization> {
    if (!this.isApiKeyAvailable()) {
      return this.getMockRouteOptimization(selectedSuppliers);
    }

    try {
      const suppliersInfo = selectedSuppliers.map(s => 
        `- ${s.name} (${s.location}) - ต้นไม้: ${s.plants?.join(', ') || 'ไม่ระบุ'}`
      ).join('\n');

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `วางแผนเส้นทางที่ประหยัดที่สุดสำหรับการซื้อต้นไม้
              
              ร้านค้าที่เลือก:
              ${suppliersInfo}
              
              ที่ตั้งโปรเจกต์: ${projectLocation}
              
              กรุณาแนะนำลำดับการเดินทางที่:
              1. ใช้เวลาและระยะทางน้อยที่สุด
              2. ประหยัดค่าใช้จ่ายในการเดินทาง
              3. หลีกเลี่ยงการจราจรติดขัด
              
              ตอบเป็น JSON format`
            }
          ],
          max_tokens: 1000,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (content) {
        return JSON.parse(content);
      } else {
        return this.getMockRouteOptimization(selectedSuppliers);
      }

    } catch (error) {
      console.error('Error optimizing route with AI:', error);
      return this.getMockRouteOptimization(selectedSuppliers);
    }
  }

  // ข้อมูลจำลองสำหรับการทดสอบ
  private getMockBillScanResult(): BillScanResult {
    return {
      supplierName: 'สวนไม้ประดับ ณัฐพล',
      supplierPhone: '081-234-5678',
      supplierLocation: 'นครปฐม',
      billDate: '2024-10-10',
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

  private getMockPriceAnalysis(plantName: string, currentPrice: number): PriceAnalysis {
    const averagePrice = currentPrice * (0.8 + Math.random() * 0.4);
    const priceChange = currentPrice - averagePrice;
    const priceChangePercent = (priceChange / averagePrice) * 100;

    return {
      plantId: 'mock_id',
      plantName,
      currentPrice,
      averagePrice,
      priceChange,
      priceChangePercent,
      trend: priceChangePercent > 5 ? 'up' : priceChangePercent < -5 ? 'down' : 'stable',
      recommendation: `ราคาปัจจุบัน ${currentPrice} บาท ${priceChangePercent > 0 ? 'สูงกว่า' : 'ต่ำกว่า'} ราคาเฉลี่ย ${Math.abs(priceChangePercent).toFixed(1)}%`
    };
  }

  private getMockRouteOptimization(selectedSuppliers: any[]): RouteOptimization {
    return {
      totalDistance: 45.2,
      totalTime: 120,
      totalCost: 850,
      optimizedRoute: selectedSuppliers.map((supplier, index) => ({
        supplierId: supplier.id || `supplier_${index}`,
        supplierName: supplier.name || `ร้านค้า ${index + 1}`,
        address: supplier.location || 'ไม่ระบุที่อยู่',
        phone: supplier.phone || 'ไม่ระบุเบอร์โทร',
        plants: supplier.plants || [],
        estimatedCost: Math.floor(Math.random() * 5000) + 1000,
        estimatedTime: Math.floor(Math.random() * 60) + 30,
        coordinates: {
          lat: 13.7563 + (Math.random() - 0.5) * 0.1,
          lng: 100.5018 + (Math.random() - 0.5) * 0.1
        }
      })),
      savings: {
        distance: 12.5,
        time: 25,
        cost: 150
      }
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
