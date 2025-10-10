// API Service Layer สำหรับจัดการข้อมูลต้นไม้และผู้จัดจำหน่าย
// พร้อมสำหรับ server จริง

import { mockSuppliers, getPlantSuppliers, getSupplierById } from '../data/mockSuppliers';

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

export interface StatisticsData {
  totalPlants: number;
  totalSuppliers: number;
  categoryCount: Record<string, number>;
  plantTypeCount: Record<string, number>;
}

// Mock API สำหรับ development
class MockApiService {
  private baseUrl = 'http://localhost:3002/api'; // พร้อมสำหรับ server จริง

  // ดึงข้อมูลต้นไม้ทั้งหมด
  async getPlants(): Promise<ApiResponse<PlantData[]>> {
    try {
      // ใน development ใช้ localStorage
      const plants = this.getPlantsFromLocalStorage();
      
      // เพิ่ม Mock Suppliers ให้กับต้นไม้
      const plantsWithSuppliers = plants.map(plant => {
        const plantSuppliers = getPlantSuppliers(plant.id);
        const suppliers = plantSuppliers.map(ps => ({
          id: ps.supplierId,
          name: ps.supplierName,
          price: ps.price,
          phone: getSupplierById(ps.supplierId)?.phone || '',
          location: getSupplierById(ps.supplierId)?.location || '',
          lastUpdated: new Date().toISOString(),
          size: ps.size
        }));
        
        return {
          ...plant,
          suppliers,
          hasSuppliers: suppliers.length > 0
        };
      });
      
      return {
        success: true,
        data: plantsWithSuppliers,
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

  // ดึงข้อมูลสถิติ
  async getStatistics(): Promise<ApiResponse<StatisticsData>> {
    try {
      const plants = this.getPlantsFromLocalStorage();
      
      // นับจำนวนต้นไม้ตามหมวดหมู่
      const categoryCount: Record<string, number> = {};
      const plantTypeCount: Record<string, number> = {};
      
      plants.forEach(plant => {
        categoryCount[plant.category] = (categoryCount[plant.category] || 0) + 1;
        plantTypeCount[plant.plantType] = (plantTypeCount[plant.plantType] || 0) + 1;
      });
      
      // นับจำนวนร้านค้า
      const allSuppliers = new Set();
      plants.forEach(plant => {
        plant.suppliers.forEach(supplier => {
          allSuppliers.add(supplier.name);
        });
      });
      
      return {
        success: true,
        data: {
          totalPlants: plants.length,
          totalSuppliers: allSuppliers.size + mockSuppliers.length,
          categoryCount,
          plantTypeCount
        },
        message: 'ดึงข้อมูลสถิติสำเร็จ'
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalPlants: 0,
          totalSuppliers: 0,
          categoryCount: {},
          plantTypeCount: {}
        },
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ'
      };
    }
  }

  // ดึงข้อมูลผู้จัดจำหน่ายทั้งหมด
  async getSuppliers(): Promise<ApiResponse<any[]>> {
    try {
      // ใช้ข้อมูลจากฐานข้อมูลจริงผ่าน RealApiService
      const realApi = new RealApiService();
      const response = await realApi.getSuppliers();
      
      if (response.success) {
        return response;
      } else {
        // ถ้า RealApiService ล้มเหลว ให้ใช้ Mock Data
        return {
          success: true,
          data: mockSuppliers,
          message: 'ดึงข้อมูลผู้จัดจำหน่ายสำเร็จ (Mock Data)'
        };
      }
    } catch (error) {
      // ถ้าเกิด error ให้ใช้ Mock Data
      return {
        success: true,
        data: mockSuppliers,
        message: 'ดึงข้อมูลผู้จัดจำหน่ายสำเร็จ (Mock Data)'
      };
    }
  }

  // ดึงข้อมูลการเชื่อมต่อต้นไม้-ผู้จัดจำหน่าย
  async getPlantSuppliers(plantId?: string, supplierId?: string): Promise<ApiResponse<any[]>> {
    try {
      const data = getPlantSuppliers(plantId, supplierId);
      return {
        success: true,
        data,
        message: 'ดึงข้อมูลการเชื่อมต่อสำเร็จ'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการเชื่อมต่อ'
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
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

  async getPlants(): Promise<ApiResponse<PlantData[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plants`);
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
      const response = await fetch(`${this.baseUrl}/api/plants/${request.plantId}/suppliers`, {
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
      const response = await fetch(`${this.baseUrl}/api/plants/${plantId}/suppliers/${supplierId}/price`, {
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

  // ดึงข้อมูลสถิติ
  async getStatistics(): Promise<ApiResponse<StatisticsData>> {
    try {
      const response = await fetch(`${this.baseUrl}/statistics`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        data: {
          totalPlants: 0,
          totalSuppliers: 0,
          categoryCount: {},
          plantTypeCount: {}
        },
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ server'
      };
    }
  }

  // ดึงข้อมูลผู้จัดจำหน่ายทั้งหมด
  async getSuppliers(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/suppliers`);
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

  // ดึงข้อมูลการเชื่อมต่อต้นไม้-ผู้จัดจำหน่าย
  async getPlantSuppliers(plantId?: string, supplierId?: string): Promise<ApiResponse<any[]>> {
    try {
      let url = `${this.baseUrl}/plant-suppliers`;
      const params = new URLSearchParams();
      if (plantId) params.append('plantId', plantId);
      if (supplierId) params.append('supplierId', supplierId);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
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
}

// Export service instance
export const apiService = new MockApiService(); // ใช้ MockApiService ชั่วคราวเพื่อแก้ปัญหา JSON parse
