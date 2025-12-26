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
  mapUrl?: string | null;
}

export interface RouteStep {
  supplierId: string;
  supplierName: string;
  address: string;
  phone: string;
  plants: string[];
  estimatedCost: number;
  estimatedTime: number;
  distance_to_next?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface GardenAnalysisResult {
  plants: GardenPlant[];
  lawn?: {
    type: string | null;
    area: string | null;
    position?: Position | null;
  };
  pathways?: Pathway[];
  otherElements?: OtherElement[];
  totalPlants: number;
  gardenType: string;
  confidence: number;
}

export interface Position {
  x: number; // 0-100 (0=ซ้ายสุด, 100=ขวาสุด)
  y: number; // 0-100 (0=บนสุด, 100=ล่างสุด)
}

export interface GardenPlant {
  name: string;
  category?: string; // หมวดหมู่ต้นไม้ (focal_tree, columnar, round_shrub, etc.)
  scientificName?: string;
  englishName?: string; // ชื่อภาษาอังกฤษจาก PlantNet
  quantity: number;
  size?: string;
  location?: string;
  position?: Position;
  description?: string; // ลักษณะต้นไม้ (เช่น พุ่มกลม, ต้นสูง)
  plantNetConfidence?: number;
  plantNetVerified?: boolean;
  plantNetAlternatives?: Array<{
    scientificName: string;
    thaiName?: string;
    englishName?: string;
    confidence: number;
  }>;
  needsTranslation?: boolean;
  fallbackUsed?: boolean; // ใช้ต้นไม้จากคลังยอดนิยมหรือไม่
  originalName?: string; // ชื่อเดิมก่อนใช้ fallback
  notes?: string;
}

export interface Pathway {
  material: string;
  length?: string | null;
  area?: string | null;
  location?: string;
  position?: Position;
}

export interface OtherElement {
  type: string;
  description?: string;
  quantity?: number;
  location?: string;
  position?: Position;
}

class AIService {
  // ⚠️ ไม่ใช้ API Key ใน Frontend อีกต่อไป - เรียกผ่าน Backend เพื่อความปลอดภัย

  // แปลง HEIF/HEIC เป็น JPEG/PNG (OpenAI ไม่รองรับ HEIF)
  private async convertHeifToJpeg(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        
        // ตั้งค่า timeout สำหรับการโหลดรูปภาพ (10 วินาที)
        const timeoutId = setTimeout(() => {
          reject(new Error('การแปลงรูปภาพใช้เวลานานเกินไป - Browser อาจไม่รองรับ HEIF/HEIC'));
        }, 10000);
        
        img.onload = () => {
          clearTimeout(timeoutId);
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('ไม่สามารถสร้าง canvas context ได้'));
            return;
          }

          ctx.drawImage(img, 0, 0);

          // แปลงเป็น JPEG (OpenAI รองรับ)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('ไม่สามารถแปลงรูปภาพได้'));
                return;
              }
              // สร้าง File object ใหม่เป็น JPEG
              const jpegFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              console.log(`🔄 แปลง HEIF/HEIC เป็น JPEG: ${file.name} → ${jpegFile.name} (${(blob.size / 1024 / 1024).toFixed(2)}MB)`);
              resolve(jpegFile);
            },
            'image/jpeg',
            0.92 // quality สูงเพื่อรักษาคุณภาพ
          );
        };
        
        img.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error('Browser ไม่รองรับการแสดงผล HEIF/HEIC - กรุณาใช้ Safari บน iOS/macOS หรือแปลงรูปภาพเป็น JPEG/PNG ก่อนอัปโหลด'));
        };
        
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    });
  }

  // บีบอัดรูปภาพสำหรับ mobile (ลดขนาดไฟล์เพื่อเพิ่มความเร็ว)
  private async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.85): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // คำนวณขนาดใหม่ถ้าใหญ่เกิน maxWidth
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('ไม่สามารถสร้าง canvas context ได้'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // แปลงเป็น blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('ไม่สามารถบีบอัดรูปภาพได้'));
                return;
              }
              // สร้าง File object ใหม่
              const compressedFile = new File([blob], file.name, {
                type: file.type || 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            file.type || 'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('ไม่สามารถโหลดรูปภาพได้'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    });
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

  // 🌿 วิเคราะห์รูปภาพสวน/บ้านเพื่อระบุต้นไม้ (เรียกผ่าน Backend เพื่อความปลอดภัย)
  async analyzeGardenImage(imageFile: File, retryCount: number = 0): Promise<GardenAnalysisResult> {
    const MAX_RETRIES = 2; // retry สูงสุด 2 ครั้ง
    
    try {
      // ตรวจสอบและแปลง HEIF/HEIC เป็น JPEG (OpenAI ไม่รองรับ HEIF)
      let processedFile = imageFile;
      const isHeif = imageFile.type === 'image/heic' || 
                     imageFile.type === 'image/heif' ||
                     /\.(heic|heif)$/i.test(imageFile.name);
      
      if (isHeif) {
        try {
          processedFile = await this.convertHeifToJpeg(imageFile);
          console.log(`🔄 แปลง HEIF/HEIC เป็น JPEG: ${imageFile.name} → ${processedFile.name}`);
        } catch (convertError) {
          console.error('❌ ไม่สามารถแปลง HEIF ได้:', convertError);
          throw new Error('ไม่สามารถแปลงรูปภาพ HEIF/HEIC ได้ กรุณาใช้รูปภาพรูปแบบอื่น (JPEG, PNG, GIF, WebP)');
        }
      }
      
      // บีบอัดรูปภาพสำหรับ mobile (ลดขนาดไฟล์เพื่อเพิ่มความเร็ว)
      if (processedFile.size > 2 * 1024 * 1024) { // ถ้าไฟล์ใหญ่กว่า 2MB ให้บีบอัด
        try {
          processedFile = await this.compressImage(processedFile, 1920, 0.85);
          console.log(`📦 บีบอัดรูปภาพ: ${(imageFile.size / 1024 / 1024).toFixed(2)}MB → ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
        } catch (compressError) {
          console.warn('⚠️ ไม่สามารถบีบอัดรูปภาพได้ ใช้รูปเดิม:', compressError);
          // ไม่ throw error เพราะยังใช้รูปเดิมได้
        }
      }
      
      // แปลงไฟล์เป็น Base64
      const base64Image = await this.fileToBase64(processedFile);
      
      // เรียก Backend API แทนการเรียก OpenAI โดยตรง (ปลอดภัยกว่า - API Key อยู่บน Backend)
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, ''); // ลบ /api ถ้ามี
      
      // สร้าง AbortController สำหรับ timeout (90 วินาที - ให้เวลา backend ทำงาน)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 วินาที
      
      const response = await fetch(`${backendUrl}/api/ai/analyze-garden`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image: base64Image
        }),
        signal: controller.signal // เพิ่ม signal สำหรับ timeout
      });
      
      // Clear timeout เมื่อ response กลับมาแล้ว
      clearTimeout(timeoutId);

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
        return data.data as GardenAnalysisResult;
      } else {
        // Backend ส่ง response มาว่าไม่สำเร็จ
        throw new Error(data.message || 'ไม่สามารถวิเคราะห์รูปภาพได้');
      }

    } catch (error: any) {
      console.error('Error analyzing garden image with AI:', error);
      
      // ตรวจสอบว่าเป็น timeout error หรือไม่
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        throw new Error('Request timeout: การวิเคราะห์ใช้เวลานานเกินไป (เกิน 90 วินาที). กรุณาลองใหม่อีกครั้ง หรือเลือกรูปภาพที่มีขนาดเล็กลง');
      }
      
      // Retry mechanism สำหรับ network errors
      if (retryCount < MAX_RETRIES && (
        error.message?.includes('network') || 
        error.message?.includes('fetch') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError')
      )) {
        console.log(`🔄 Retry ${retryCount + 1}/${MAX_RETRIES}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.analyzeGardenImage(imageFile, retryCount + 1);
      }
      
      throw error;
    }
  }

  // สแกนใบเสร็จด้วย ChatGPT Vision (เรียกผ่าน Backend เพื่อความปลอดภัย)
  async scanBill(imageFile: File, retryCount: number = 0): Promise<BillScanResult> {
    const MAX_RETRIES = 2; // retry สูงสุด 2 ครั้ง
    
    try {
      // ตรวจสอบและแปลง HEIF/HEIC เป็น JPEG (OpenAI ไม่รองรับ HEIF)
      let processedFile = imageFile;
      const isHeif = imageFile.type === 'image/heic' || 
                     imageFile.type === 'image/heif' ||
                     /\.(heic|heif)$/i.test(imageFile.name);
      
      if (isHeif) {
        try {
          processedFile = await this.convertHeifToJpeg(imageFile);
          console.log(`🔄 แปลง HEIF/HEIC เป็น JPEG: ${imageFile.name} → ${processedFile.name}`);
        } catch (convertError) {
          console.error('❌ ไม่สามารถแปลง HEIF ได้:', convertError);
          throw new Error('ไม่สามารถแปลงรูปภาพ HEIF/HEIC ได้ กรุณาใช้รูปภาพรูปแบบอื่น (JPEG, PNG, GIF, WebP)');
        }
      }
      
      // บีบอัดรูปภาพสำหรับ mobile (ลดขนาดไฟล์เพื่อเพิ่มความเร็ว)
      if (processedFile.size > 2 * 1024 * 1024) { // ถ้าไฟล์ใหญ่กว่า 2MB ให้บีบอัด
        try {
          processedFile = await this.compressImage(processedFile, 1920, 0.85);
          console.log(`📦 บีบอัดรูปภาพ: ${(imageFile.size / 1024 / 1024).toFixed(2)}MB → ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
        } catch (compressError) {
          console.warn('⚠️ ไม่สามารถบีบอัดรูปภาพได้ ใช้รูปเดิม:', compressError);
          // ไม่ throw error เพราะยังใช้รูปเดิมได้
        }
      }
      
      // แปลงไฟล์เป็น Base64
      const base64Image = await this.fileToBase64(processedFile);
      
      // เรียก Backend API แทนการเรียก OpenAI โดยตรง (ปลอดภัยกว่า - API Key อยู่บน Backend)
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, ''); // ลบ /api ถ้ามี
      
      // สร้าง AbortController สำหรับ timeout (60 วินาที)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 วินาที
      
      const response = await fetch(`${backendUrl}/api/ai/scan-bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image: base64Image
        }),
        signal: controller.signal // เพิ่ม signal สำหรับ timeout
      });
      
      // Clear timeout เมื่อ response กลับมาแล้ว
      clearTimeout(timeoutId);

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
        
        // ตรวจสอบว่าเป็น timeout error หรือไม่
        if (error.name === 'AbortError' || error.message?.includes('aborted')) {
          throw new Error('Request timeout: การสแกนใช้เวลานานเกินไป (เกิน 60 วินาที). กรุณาลองใหม่อีกครั้ง หรือเลือกรูปภาพที่มีขนาดเล็กลง');
        }
        
        // Retry mechanism สำหรับ network errors
        if (retryCount < MAX_RETRIES && (
          error.message?.includes('network') || 
          error.message?.includes('fetch') ||
          error.message?.includes('Failed to fetch') ||
          error.message?.includes('NetworkError')
        )) {
          console.log(`🔄 Retry ${retryCount + 1}/${MAX_RETRIES}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return this.scanBill(imageFile, retryCount + 1);
        }
        
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

  // วางแผนเส้นทางด้วย AI (เรียกผ่าน Backend API)
  async optimizeRoute(selectedSuppliers: any[], projectLocation: string): Promise<RouteOptimization> {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, ''); // ลบ /api ถ้ามี
      
      // แปลง suppliers เป็น format ที่ backend ต้องการ
      const suppliersForApi = selectedSuppliers.map(supplier => ({
        name: supplier.name,
        location: supplier.location,
        items: supplier.plants?.map((plant: string) => ({ plantName: plant, quantity: 1 })) || [],
        totalValue: 0
      }));

      const response = await fetch(`${backendUrl}/api/route/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectLocation,
          selectedSuppliers: suppliersForApi
        })
      });

      if (!response.ok) {
        let errorMessage = `เกิดข้อผิดพลาด: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `เกิดข้อผิดพลาดจาก Backend (Status: ${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // แปลง response จาก backend ให้ตรงกับ RouteOptimization interface
        const backendData = data.data;
        
        // แปลง route array เป็น RouteStep[]
        const optimizedRoute: RouteStep[] = backendData.route
          .filter((step: any) => step.location !== projectLocation) // กรอง project location ออก
          .map((step: any, index: number) => {
            // หา supplier ที่ตรงกับ location
            const supplier = selectedSuppliers.find(s => 
              s.name === step.location || s.location === step.location
            );
            
            return {
              supplierId: supplier?.id || `supplier_${index}`,
              supplierName: step.location || supplier?.name || 'ไม่ระบุ',
              address: supplier?.location || step.location || 'ไม่ระบุที่อยู่',
              phone: supplier?.phone || 'ไม่ระบุเบอร์โทร',
              plants: supplier?.plants || [],
              estimatedCost: step.distance_to_next ? Math.round(step.distance_to_next * 0.75) : 0,
              estimatedTime: step.distance_to_next ? Math.round(step.distance_to_next / 50 * 60) : 0,
              distance_to_next: step.distance_to_next || 0,
              coordinates: {
                lat: 0, // จะต้องหา supplier coords จาก backendData.suppliers
                lng: 0
              }
            };
          });

        // อัพเดท coordinates จาก suppliers data
        backendData.suppliers?.forEach((supplier: any, index: number) => {
          if (optimizedRoute[index] && supplier.coords) {
            optimizedRoute[index].coordinates = {
              lat: supplier.coords.lat,
              lng: supplier.coords.lng
            };
          }
        });

        // คำนวณ savings (เปรียบเทียบกับ route แบบไม่ optimize)
        const totalDistance = backendData.totalDistance || 0;
        const estimatedSavings = totalDistance * 0.1; // ประมาณ 10% ประหยัด

        return {
          totalDistance: backendData.totalDistance || 0,
          totalTime: backendData.estimatedTime || 0,
          totalCost: backendData.fuelCost || 0,
          optimizedRoute,
          savings: {
            distance: estimatedSavings,
            time: Math.round(estimatedSavings / 50 * 60), // แปลงเป็นนาที
            cost: Math.round(estimatedSavings * 0.75)
          },
          mapUrl: backendData.mapUrl || null
        };
      } else {
        throw new Error(data.message || 'ไม่สามารถวางแผนเส้นทางได้');
      }
    } catch (error: any) {
      console.error('Error optimizing route:', error);
      // Fallback to mock data if API fails
      console.warn('Falling back to mock data');
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
