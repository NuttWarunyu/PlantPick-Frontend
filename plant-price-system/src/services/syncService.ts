// Sync Service สำหรับจัดการข้อมูลระหว่าง localStorage และ server
// พร้อมสำหรับ server จริง

import { apiService, PlantData, SupplierData } from './api';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  pendingChanges: number;
}

export class SyncService {
  private static instance: SyncService;
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSync: null,
    pendingChanges: 0
  };

  private constructor() {
    // ฟังการเปลี่ยนแปลงสถานะออนไลน์
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
    });
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // ดึงข้อมูลต้นไม้พร้อม sync
  async getPlants(): Promise<PlantData[]> {
    try {
      // ลองดึงจาก server ก่อน
      if (this.syncStatus.isOnline) {
        const response = await apiService.getPlants();
        if (response.success) {
          // บันทึกลง localStorage
          localStorage.setItem('plantsData', JSON.stringify(response.data));
          this.syncStatus.lastSync = new Date().toISOString();
          return response.data;
        }
      }
    } catch (error) {
      console.log('ไม่สามารถเชื่อมต่อ server ได้ ใช้ข้อมูลจาก localStorage');
    }

    // ใช้ข้อมูลจาก localStorage
    const stored = localStorage.getItem('plantsData');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  // เพิ่มข้อมูลผู้จัดจำหน่ายพร้อม sync
  async addSupplier(plantId: string, supplierData: Omit<SupplierData, 'id' | 'lastUpdated'>): Promise<boolean> {
    try {
      if (this.syncStatus.isOnline) {
        // ส่งไป server
        const response = await apiService.addSupplier({
          plantId,
          ...supplierData
        });

        if (response.success) {
          // อัปเดต localStorage
          this.updateLocalStorageSupplier(plantId, response.data);
          this.syncStatus.lastSync = new Date().toISOString();
          return true;
        }
      }
    } catch (error) {
      console.log('ไม่สามารถเชื่อมต่อ server ได้ บันทึกใน localStorage');
    }

    // บันทึกใน localStorage
    const newSupplier: SupplierData = {
      ...supplierData,
      id: `supplier_${Date.now()}`,
      lastUpdated: new Date().toISOString()
    };

    this.updateLocalStorageSupplier(plantId, newSupplier);
    this.syncStatus.pendingChanges++;
    return true;
  }

  // อัปเดตราคาพร้อม sync
  async updatePrice(plantId: string, supplierId: string, newPrice: number): Promise<boolean> {
    try {
      if (this.syncStatus.isOnline) {
        // ส่งไป server
        const response = await apiService.updateSupplierPrice(plantId, supplierId, newPrice);

        if (response.success) {
          // อัปเดต localStorage
          this.updateLocalStoragePrice(plantId, supplierId, newPrice);
          this.syncStatus.lastSync = new Date().toISOString();
          return true;
        }
      }
    } catch (error) {
      console.log('ไม่สามารถเชื่อมต่อ server ได้ บันทึกใน localStorage');
    }

    // บันทึกใน localStorage
    this.updateLocalStoragePrice(plantId, supplierId, newPrice);
    this.syncStatus.pendingChanges++;
    return true;
  }

  // Sync ข้อมูลที่ค้างอยู่
  async syncPendingChanges(): Promise<void> {
    if (!this.syncStatus.isOnline || this.syncStatus.pendingChanges === 0) {
      return;
    }

    try {
      // ดึงข้อมูลล่าสุดจาก server
      const response = await apiService.getPlants();
      if (response.success) {
        localStorage.setItem('plantsData', JSON.stringify(response.data));
        this.syncStatus.lastSync = new Date().toISOString();
        this.syncStatus.pendingChanges = 0;
      }
    } catch (error) {
      console.log('ไม่สามารถ sync ข้อมูลได้');
    }
  }

  // ดึงสถานะ sync
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Private methods
  private updateLocalStorageSupplier(plantId: string, supplier: SupplierData): void {
    const plants = this.getPlantsFromLocalStorage();
    const plantIndex = plants.findIndex(p => p.id === plantId);
    
    if (plantIndex !== -1) {
      plants[plantIndex].suppliers.push(supplier);
      plants[plantIndex].hasSuppliers = true;
      localStorage.setItem('plantsData', JSON.stringify(plants));
    }
  }

  private updateLocalStoragePrice(plantId: string, supplierId: string, newPrice: number): void {
    const plants = this.getPlantsFromLocalStorage();
    const plant = plants.find(p => p.id === plantId);
    
    if (plant) {
      const supplier = plant.suppliers.find(s => s.id === supplierId);
      if (supplier) {
        supplier.price = newPrice;
        supplier.lastUpdated = new Date().toISOString();
        localStorage.setItem('plantsData', JSON.stringify(plants));
      }
    }
  }

  private getPlantsFromLocalStorage(): PlantData[] {
    const stored = localStorage.getItem('plantsData');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();
