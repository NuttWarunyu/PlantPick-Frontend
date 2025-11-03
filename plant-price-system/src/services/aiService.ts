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
  // ⚠️ ไม่ใช้ API Key ใน Frontend อีกต่อไป - เรียกผ่าน Backend เพื่อความปลอดภัย

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

  // สแกนใบเสร็จด้วย ChatGPT Vision (เรียกผ่าน Backend เพื่อความปลอดภัย)
  async scanBill(imageFile: File): Promise<BillScanResult> {
    try {
      // แปลงไฟล์เป็น Base64
      const base64Image = await this.fileToBase64(imageFile);
      
      // เรียก Backend API แทนการเรียก OpenAI โดยตรง (ปลอดภัยกว่า - API Key อยู่บน Backend)
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, ''); // ลบ /api ถ้ามี
      
      const response = await fetch(`${backendUrl}/api/ai/scan-bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image: base64Image
        })
      });

      // ตรวจสอบ HTTP status
      if (!response.ok) {
        // อ่าน error message จาก backend
        let errorMessage = `เกิดข้อผิดพลาด: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // ถ้า parse JSON ไม่ได้ ให้ใช้ default message
          errorMessage = `เกิดข้อผิดพลาดจาก Backend (Status: ${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // ตรวจสอบว่า response สำเร็จหรือไม่
      if (data.success && data.data) {
        return data.data as BillScanResult;
      } else {
        // Backend ส่ง response มาว่าไม่สำเร็จ
        throw new Error(data.message || 'ไม่สามารถสแกนใบเสร็จได้');
      }

    } catch (error: any) {
      console.error('Error scanning bill with AI:', error);
      // ⚠️ ไม่ใช้ Mock Data อีกต่อไป - throw error ต่อให้ UI จัดการ
      // ให้ UI แสดง error message ที่ชัดเจนแทน
      throw error;
    }
  }

  // วิเคราะห์ราคาด้วย AI (ใช้ Mock Data ชั่วคราว - สามารถปรับให้เรียกผ่าน Backend ทีหลัง)
  async analyzePrice(plantId: string, plantName: string, currentPrice: number, historicalPrices: number[]): Promise<PriceAnalysis> {
    // TODO: ปรับให้เรียกผ่าน Backend API `/api/ai/analyze-price` เพื่อความปลอดภัย
    return this.getMockPriceAnalysis(plantName, currentPrice);

    /* Legacy code - เรียก OpenAI โดยตรง (ไม่ปลอดภัย)
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
      // ... rest of legacy code ...
    */
  }

  // วางแผนเส้นทางด้วย AI (ใช้ Mock Data ชั่วคราว - สามารถปรับให้เรียกผ่าน Backend ทีหลัง)
  async optimizeRoute(selectedSuppliers: any[], projectLocation: string): Promise<RouteOptimization> {
    // TODO: ปรับให้เรียกผ่าน Backend API `/api/ai/optimize-route` เพื่อความปลอดภัย
    return this.getMockRouteOptimization(selectedSuppliers);

    /* Legacy code - เรียก OpenAI โดยตรง (ไม่ปลอดภัย)
    // ... removed for security ...
    */
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
