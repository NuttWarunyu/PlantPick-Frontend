// API Service Layer สำหรับจัดการข้อมูลต้นไม้และผู้จัดจำหน่าย
// พร้อมสำหรับ server จริง

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PlantData {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  plantType: 'ไม้ประดับ' | 'ไม้ล้อม' | 'ไม้คลุมดิน' | 'ไม้ดอก' | 'ไม้ใบ' | 'แคคตัส' | 'บอนไซ' | 'กล้วยไม้';
  measurementType: 'ความสูง' | 'ขนาดลำต้น' | 'ขนาดถุงดำ' | 'ขนาดกระถาง' | 'จำนวนกิ่ง';
  suppliers: SupplierData[];
  hasSuppliers: boolean;
}

export interface SupplierData {
  id: string;
  name: string;
  price: number;
  phone: string;
  location: string;
  lastUpdated: string;
  size?: string;
}

export interface AddSupplierRequest {
  plantId: string;
  name: string;
  price: number;
  phone: string;
  location: string;
  size?: string;
}

// Mock API สำหรับ development
class MockApiService {
  private baseUrl = 'http://localhost:3001/api'; // พร้อมสำหรับ server จริง

  // ดึงข้อมูลต้นไม้ทั้งหมด
  async getPlants(): Promise<ApiResponse<PlantData[]>> {
    try {
      // ใน development ใช้ localStorage
      const plants = this.getPlantsFromLocalStorage();
      return {
        success: true,
        data: plants,
        message: 'ดึงข้อมูลต้นไม้สำเร็จ'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลต้นไม้'
      };
    }
  }

  // เพิ่มข้อมูลผู้จัดจำหน่าย
  async addSupplier(request: AddSupplierRequest): Promise<ApiResponse<SupplierData>> {
    try {
      const newSupplier: SupplierData = {
        id: `supplier_${Date.now()}`,
        name: request.name,
        price: request.price,
        phone: request.phone,
        location: request.location,
        lastUpdated: new Date().toISOString(),
        size: request.size
      };

      // อัปเดตข้อมูลใน localStorage
      this.updatePlantSupplier(request.plantId, newSupplier);

      return {
        success: true,
        data: newSupplier,
        message: 'เพิ่มข้อมูลผู้จัดจำหน่ายสำเร็จ'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as SupplierData,
        message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลผู้จัดจำหน่าย'
      };
    }
  }

  // อัปเดตราคาผู้จัดจำหน่าย
  async updateSupplierPrice(plantId: string, supplierId: string, newPrice: number): Promise<ApiResponse<SupplierData>> {
    try {
      const updatedSupplier = this.updateSupplierPriceInLocalStorage(plantId, supplierId, newPrice);
      
      return {
        success: true,
        data: updatedSupplier,
        message: 'อัปเดตราคาสำเร็จ'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as SupplierData,
        message: 'เกิดข้อผิดพลาดในการอัปเดตราคา'
      };
    }
  }

  // Private methods สำหรับ localStorage
  private getPlantsFromLocalStorage(): PlantData[] {
    const stored = localStorage.getItem('plantsData');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  private updatePlantSupplier(plantId: string, newSupplier: SupplierData): void {
    const plants = this.getPlantsFromLocalStorage();
    const plantIndex = plants.findIndex(p => p.id === plantId);
    
    if (plantIndex !== -1) {
      plants[plantIndex].suppliers.push(newSupplier);
      plants[plantIndex].hasSuppliers = true;
      localStorage.setItem('plantsData', JSON.stringify(plants));
    }
  }

  private updateSupplierPriceInLocalStorage(plantId: string, supplierId: string, newPrice: number): SupplierData {
    const plants = this.getPlantsFromLocalStorage();
    const plant = plants.find(p => p.id === plantId);
    
    if (plant) {
      const supplier = plant.suppliers.find(s => s.id === supplierId);
      if (supplier) {
        supplier.price = newPrice;
        supplier.lastUpdated = new Date().toISOString();
        localStorage.setItem('plantsData', JSON.stringify(plants));
        return supplier;
      }
    }
    throw new Error('ไม่พบข้อมูลผู้จัดจำหน่าย');
  }
}

// Real API Service สำหรับ production
class RealApiService {
  private baseUrl = process.env.REACT_APP_API_URL || 'https://api.plantpick.com';

  async getPlants(): Promise<ApiResponse<PlantData[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/plants`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ server'
      };
    }
  }

  async addSupplier(request: AddSupplierRequest): Promise<ApiResponse<SupplierData>> {
    try {
      const response = await fetch(`${this.baseUrl}/plants/${request.plantId}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        data: {} as SupplierData,
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ server'
      };
    }
  }

  async updateSupplierPrice(plantId: string, supplierId: string, newPrice: number): Promise<ApiResponse<SupplierData>> {
    try {
      const response = await fetch(`${this.baseUrl}/plants/${request.plantId}/suppliers/${supplierId}/price`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price: newPrice }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        data: {} as SupplierData,
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ server'
      };
    }
  }
}

// Export service instance
export const apiService = process.env.NODE_ENV === 'production' 
  ? new RealApiService() 
  : new MockApiService();
