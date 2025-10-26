// 🗄️ Database Service - ระบบจัดการฐานข้อมูลที่แข็งแกร่ง
// จัดการข้อมูลต้นไม้และผู้จัดจำหน่ายแบบครบวงจร

import { Plant, Supplier } from '../types';

export interface DatabaseStats {
  totalPlants: number;
  totalSuppliers: number;
  totalConnections: number;
  lastBackup: string | null;
  dataSize: number;
}

export interface BulkUpdateResult {
  success: number;
  failed: number;
  errors: string[];
  updatedData: any[];
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  importedData: any[];
}

export interface BackupData {
  timestamp: string;
  version: string;
  plants: Plant[];
  suppliers: Supplier[];
  metadata: {
    totalRecords: number;
    dataSize: number;
    checksum: string;
  };
}

export class DatabaseService {
  private static instance: DatabaseService;
  private readonly DB_VERSION = '1.0.0';
  private readonly STORAGE_KEYS = {
    PLANTS: 'plantsData',
    SUPPLIERS: 'suppliersData',
    BACKUPS: 'databaseBackups',
    SETTINGS: 'databaseSettings'
  };

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // 🚀 เริ่มต้นฐานข้อมูล
  private initializeDatabase(): void {
    try {
      // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
      const existingPlants = this.getPlants();
      if (existingPlants.length === 0) {
        // โหลดข้อมูลเริ่มต้น
        this.loadInitialData();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      this.loadInitialData();
    }
  }

  // 📊 ดึงข้อมูลสถิติฐานข้อมูล
  public getDatabaseStats(): DatabaseStats {
    const plants = this.getPlants();
    const suppliers = this.getSuppliers();
    
    const totalConnections = plants.reduce((total, plant) => 
      total + plant.suppliers.length, 0
    );
    
    const dataSize = this.calculateDataSize();
    const lastBackup = this.getLastBackupTime();

    return {
      totalPlants: plants.length,
      totalSuppliers: suppliers.length,
      totalConnections,
      lastBackup,
      dataSize
    };
  }

  // 🌱 จัดการข้อมูลต้นไม้
  public getPlants(): Plant[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.PLANTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting plants:', error);
      return [];
    }
  }

  public savePlants(plants: Plant[]): boolean {
    try {
      // Validation
      if (!this.validatePlants(plants)) {
        throw new Error('Invalid plant data');
      }

      localStorage.setItem(this.STORAGE_KEYS.PLANTS, JSON.stringify(plants));
      this.updateLastModified();
      return true;
    } catch (error) {
      console.error('Error saving plants:', error);
      return false;
    }
  }

  public addPlant(plant: Omit<Plant, 'id'>): boolean {
    try {
      const plants = this.getPlants();
      const newPlant: Plant = {
        ...plant,
        id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      plants.push(newPlant);
      return this.savePlants(plants);
    } catch (error) {
      console.error('Error adding plant:', error);
      return false;
    }
  }

  public updatePlant(plantId: string, updates: Partial<Plant>): boolean {
    try {
      const plants = this.getPlants();
      const index = plants.findIndex(p => p.id === plantId);
      
      if (index === -1) {
        throw new Error('Plant not found');
      }

      plants[index] = { ...plants[index], ...updates };
      return this.savePlants(plants);
    } catch (error) {
      console.error('Error updating plant:', error);
      return false;
    }
  }

  public deletePlant(plantId: string): boolean {
    try {
      const plants = this.getPlants();
      const filteredPlants = plants.filter(p => p.id !== plantId);
      return this.savePlants(filteredPlants);
    } catch (error) {
      console.error('Error deleting plant:', error);
      return false;
    }
  }

  // 🏪 จัดการข้อมูลผู้จัดจำหน่าย
  public getSuppliers(): Supplier[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SUPPLIERS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting suppliers:', error);
      return [];
    }
  }

  public saveSuppliers(suppliers: Supplier[]): boolean {
    try {
      if (!this.validateSuppliers(suppliers)) {
        throw new Error('Invalid supplier data');
      }

      localStorage.setItem(this.STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
      this.updateLastModified();
      return true;
    } catch (error) {
      console.error('Error saving suppliers:', error);
      return false;
    }
  }

  public addSupplier(plantId: string, supplier: Omit<Supplier, 'id'>): boolean {
    try {
      const plants = this.getPlants();
      const plantIndex = plants.findIndex(p => p.id === plantId);
      
      if (plantIndex === -1) {
        throw new Error('Plant not found');
      }

      const newSupplier: Supplier = {
        ...supplier,
        id: `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lastUpdated: new Date().toISOString()
      };

      plants[plantIndex].suppliers.push(newSupplier);
      plants[plantIndex].hasSuppliers = true;
      
      return this.savePlants(plants);
    } catch (error) {
      console.error('Error adding supplier:', error);
      return false;
    }
  }

  public updateSupplierPrice(plantId: string, supplierId: string, newPrice: number): boolean {
    try {
      const plants = this.getPlants();
      const plant = plants.find(p => p.id === plantId);
      
      if (!plant) {
        throw new Error('Plant not found');
      }

      const supplier = plant.suppliers.find(s => s.id === supplierId);
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      supplier.price = newPrice;
      supplier.lastUpdated = new Date().toISOString();
      
      return this.savePlants(plants);
    } catch (error) {
      console.error('Error updating supplier price:', error);
      return false;
    }
  }

  // 🔄 Bulk Operations
  public bulkUpdatePrices(updates: Array<{
    plantId: string;
    supplierId: string;
    newPrice: number;
  }>): BulkUpdateResult {
    const result: BulkUpdateResult = {
      success: 0,
      failed: 0,
      errors: [],
      updatedData: []
    };

    const plants = this.getPlants();
    const updatedPlants = [...plants];

    for (const update of updates) {
      try {
        const plant = updatedPlants.find(p => p.id === update.plantId);
        if (!plant) {
          result.errors.push(`Plant ${update.plantId} not found`);
          result.failed++;
          continue;
        }

        const supplier = plant.suppliers.find(s => s.id === update.supplierId);
        if (!supplier) {
          result.errors.push(`Supplier ${update.supplierId} not found`);
          result.failed++;
          continue;
        }

        supplier.price = update.newPrice;
        supplier.lastUpdated = new Date().toISOString();
        result.success++;
        result.updatedData.push({
          plantId: update.plantId,
          supplierId: update.supplierId,
          newPrice: update.newPrice
        });
      } catch (error) {
        result.errors.push(`Error updating ${update.plantId}: ${error}`);
        result.failed++;
      }
    }

    if (result.success > 0) {
      this.savePlants(updatedPlants);
    }

    return result;
  }

  // 📥 Import/Export
  public exportData(): BackupData {
    const plants = this.getPlants();
    const suppliers = this.getSuppliers();
    const timestamp = new Date().toISOString();
    
    return {
      timestamp,
      version: this.DB_VERSION,
      plants,
      suppliers,
      metadata: {
        totalRecords: plants.length + suppliers.length,
        dataSize: this.calculateDataSize(),
        checksum: this.calculateChecksum(plants, suppliers)
      }
    };
  }

  public importData(backupData: BackupData): ImportResult {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      importedData: []
    };

    try {
      // Validate backup data
      if (!this.validateBackupData(backupData)) {
        result.errors.push('Invalid backup data format');
        result.failed++;
        return result;
      }

      // Backup current data
      const currentBackup = this.exportData();
      this.saveBackup(currentBackup);

      // Import new data
      if (backupData.plants && backupData.plants.length > 0) {
        if (this.savePlants(backupData.plants)) {
          result.success += backupData.plants.length;
          result.importedData.push(...backupData.plants);
        } else {
          result.errors.push('Failed to import plants');
          result.failed++;
        }
      }

      if (backupData.suppliers && backupData.suppliers.length > 0) {
        if (this.saveSuppliers(backupData.suppliers)) {
          result.success += backupData.suppliers.length;
          result.importedData.push(...backupData.suppliers);
        } else {
          result.errors.push('Failed to import suppliers');
          result.failed++;
        }
      }

    } catch (error) {
      result.errors.push(`Import failed: ${error}`);
      result.failed++;
    }

    return result;
  }

  // 💾 Backup/Restore
  public createBackup(): boolean {
    try {
      const backupData = this.exportData();
      return this.saveBackup(backupData);
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    }
  }

  public getBackups(): BackupData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.BACKUPS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting backups:', error);
      return [];
    }
  }

  public restoreBackup(backupData: BackupData): boolean {
    try {
      // Create backup of current data
      this.createBackup();
      
      // Restore from backup
      return this.importData(backupData).success > 0;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  // 🔍 Search and Filter
  public searchPlants(query: string): Plant[] {
    const plants = this.getPlants();
    const lowerQuery = query.toLowerCase();
    
    return plants.filter(plant => 
      plant.name.toLowerCase().includes(lowerQuery) ||
      plant.scientificName.toLowerCase().includes(lowerQuery) ||
      plant.category.toLowerCase().includes(lowerQuery)
    );
  }

  public getPlantsByCategory(category: string): Plant[] {
    return this.getPlants().filter(plant => plant.category === category);
  }

  public getSuppliersByLocation(location: string): Supplier[] {
    const plants = this.getPlants();
    const suppliers: Supplier[] = [];
    
    plants.forEach(plant => {
      plant.suppliers.forEach(supplier => {
        if (supplier.location.toLowerCase().includes(location.toLowerCase())) {
          suppliers.push(supplier);
        }
      });
    });
    
    return suppliers;
  }

  // 🧹 Maintenance
  public clearAllData(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.PLANTS);
      localStorage.removeItem(this.STORAGE_KEYS.SUPPLIERS);
      localStorage.removeItem(this.STORAGE_KEYS.BACKUPS);
      localStorage.removeItem(this.STORAGE_KEYS.SETTINGS);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  public optimizeDatabase(): boolean {
    try {
      // Remove duplicate suppliers
      const plants = this.getPlants();
      const optimizedPlants = plants.map(plant => ({
        ...plant,
        suppliers: this.removeDuplicateSuppliers(plant.suppliers)
      }));
      
      return this.savePlants(optimizedPlants);
    } catch (error) {
      console.error('Error optimizing database:', error);
      return false;
    }
  }

  // Private helper methods
  private loadInitialData(): void {
    // Load from plants.ts if available
    try {
      // This would be implemented based on your initial data structure
      console.log('Loading initial data...');
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }

  private validatePlants(plants: Plant[]): boolean {
    return plants.every(plant => 
      plant.id && 
      plant.name && 
      plant.scientificName && 
      plant.category &&
      Array.isArray(plant.suppliers)
    );
  }

  private validateSuppliers(suppliers: Supplier[]): boolean {
    return suppliers.every(supplier => 
      supplier.id && 
      supplier.name && 
      typeof supplier.price === 'number' &&
      supplier.price > 0
    );
  }

  private validateBackupData(data: any): boolean {
    return data && 
           data.version && 
           data.timestamp && 
           Array.isArray(data.plants) &&
           Array.isArray(data.suppliers);
  }

  private calculateDataSize(): number {
    const plants = this.getPlants();
    const suppliers = this.getSuppliers();
    const data = { plants, suppliers };
    return JSON.stringify(data).length;
  }

  private calculateChecksum(plants: Plant[], suppliers: Supplier[]): string {
    const data = JSON.stringify({ plants, suppliers });
    // Simple checksum - in production, use crypto
    return btoa(data).slice(0, 16);
  }

  private saveBackup(backupData: BackupData): boolean {
    try {
      const backups = this.getBackups();
      backups.push(backupData);
      
      // Keep only last 10 backups
      if (backups.length > 10) {
        backups.splice(0, backups.length - 10);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.BACKUPS, JSON.stringify(backups));
      return true;
    } catch (error) {
      console.error('Error saving backup:', error);
      return false;
    }
  }

  private getLastBackupTime(): string | null {
    const backups = this.getBackups();
    return backups.length > 0 ? backups[backups.length - 1].timestamp : null;
  }

  private updateLastModified(): void {
    const settings = this.getSettings();
    settings.lastModified = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  private getSettings(): any {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : { lastModified: null };
    } catch (error) {
      return { lastModified: null };
    }
  }

  private removeDuplicateSuppliers(suppliers: Supplier[]): Supplier[] {
    const seen = new Set();
    return suppliers.filter(supplier => {
      const key = `${supplier.name}-${supplier.phone}-${supplier.location}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
