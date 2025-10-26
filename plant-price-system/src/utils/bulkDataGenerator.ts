// 🔄 Bulk Data Generator - เครื่องมือสร้างข้อมูลจำนวนมาก
// สำหรับทดสอบและเพิ่มข้อมูลตัวอย่าง

import { Plant, Supplier } from '../types';
import { databaseService } from '../services/databaseService';

export interface BulkDataOptions {
  plantCount: number;
  suppliersPerPlant: number;
  categories: string[];
  locations: string[];
  priceRange: { min: number; max: number };
}

export class BulkDataGenerator {
  private static instance: BulkDataGenerator;

  private constructor() {}

  public static getInstance(): BulkDataGenerator {
    if (!BulkDataGenerator.instance) {
      BulkDataGenerator.instance = new BulkDataGenerator();
    }
    return BulkDataGenerator.instance;
  }

  // 🌱 สร้างข้อมูลต้นไม้จำนวนมาก
  public generateBulkPlants(options: BulkDataOptions): Plant[] {
    const plants: Plant[] = [];
    const plantNames = this.getPlantNames();
    const scientificNames = this.getScientificNames();

    for (let i = 0; i < options.plantCount; i++) {
      const plantName = plantNames[i % plantNames.length];
      const scientificName = scientificNames[i % scientificNames.length];
      const category = options.categories[i % options.categories.length];
      
      const plant: Plant = {
        id: `plant_${Date.now()}_${i}`,
        name: `${plantName} ${i + 1}`,
        scientificName: `${scientificName} ${i + 1}`,
        category,
        plantType: this.getPlantTypeFromCategory(category),
        measurementType: this.getMeasurementTypeFromCategory(category),
        suppliers: this.generateSuppliersForPlant(options, i),
        hasSuppliers: true
      };

      plants.push(plant);
    }

    return plants;
  }

  // 🏪 สร้างข้อมูลผู้จัดจำหน่ายสำหรับต้นไม้
  private generateSuppliersForPlant(options: BulkDataOptions, plantIndex: number): Supplier[] {
    const suppliers: Supplier[] = [];
    const supplierNames = this.getSupplierNames();
    const phoneNumbers = this.generatePhoneNumbers(options.suppliersPerPlant);

    for (let i = 0; i < options.suppliersPerPlant; i++) {
      const supplier: Supplier = {
        id: `supplier_${Date.now()}_${plantIndex}_${i}`,
        name: supplierNames[i % supplierNames.length],
        price: this.generateRandomPrice(options.priceRange),
        phone: phoneNumbers[i],
        location: options.locations[i % options.locations.length],
        lastUpdated: this.generateRandomDate(),
        size: this.generateRandomSize()
      };

      suppliers.push(supplier);
    }

    return suppliers;
  }

  // 📊 สร้างข้อมูลสำหรับ Bulk Update
  public generateBulkUpdateData(plantCount: number, supplierCount: number): Array<{
    plantId: string;
    supplierId: string;
    newPrice: number;
  }> {
    const updates: Array<{
      plantId: string;
      supplierId: string;
      newPrice: number;
    }> = [];

    const plants = databaseService.getPlants();
    if (plants.length === 0) {
      throw new Error('ไม่มีข้อมูลต้นไม้ในระบบ');
    }

    for (let i = 0; i < plantCount; i++) {
      const plant = plants[i % plants.length];
      if (plant.suppliers.length === 0) continue;

      for (let j = 0; j < Math.min(supplierCount, plant.suppliers.length); j++) {
        const supplier = plant.suppliers[j];
        updates.push({
          plantId: plant.id,
          supplierId: supplier.id,
          newPrice: this.generateRandomPrice({ min: 50, max: 2000 })
        });
      }
    }

    return updates;
  }

  // 🎯 สร้างข้อมูลตัวอย่างตามหมวดหมู่
  public generateSampleDataByCategory(category: string, count: number): Plant[] {
    const options: BulkDataOptions = {
      plantCount: count,
      suppliersPerPlant: 3,
      categories: [category],
      locations: ['กรุงเทพฯ', 'นครปฐม', 'สมุทรสาคร', 'นนทบุรี', 'ปทุมธานี'],
      priceRange: { min: 100, max: 1000 }
    };

    return this.generateBulkPlants(options);
  }

  // 📈 สร้างข้อมูลสถิติสำหรับทดสอบ
  public generateStatisticsData(): {
    plants: Plant[];
    totalSuppliers: number;
    averagePrice: number;
    categoryDistribution: Record<string, number>;
  } {
    const plants = databaseService.getPlants();
    const allSuppliers: Supplier[] = [];
    let totalPrice = 0;
    let priceCount = 0;
    const categoryDistribution: Record<string, number> = {};

    plants.forEach(plant => {
      // นับหมวดหมู่
      categoryDistribution[plant.category] = (categoryDistribution[plant.category] || 0) + 1;
      
      // รวมผู้จัดจำหน่าย
      plant.suppliers.forEach(supplier => {
        allSuppliers.push(supplier);
        totalPrice += supplier.price;
        priceCount++;
      });
    });

    return {
      plants,
      totalSuppliers: allSuppliers.length,
      averagePrice: priceCount > 0 ? totalPrice / priceCount : 0,
      categoryDistribution
    };
  }

  // Private helper methods
  private getPlantNames(): string[] {
    return [
      'มอนสเตอร่า', 'ไทรใบสัก', 'กุหลาบแดง', 'แคคตัสบอล', 'ไผ่สีสุก',
      'บอนไซไทร', 'ฟิโลเดนดรอน', 'กล้วยไม้แคทลียา', 'ไทรเกาหลี', 'กันเกรา',
      'หญ้าแฝก', 'มะลิ', 'ชวนชม', 'เฟิร์น', 'ปาล์ม', 'ยูคาลิปตัส',
      'จามจุรี', 'ประดู่', 'สัก', 'ยางนา', 'ตะเคียน', 'มะขาม'
    ];
  }

  private getScientificNames(): string[] {
    return [
      'Monstera deliciosa', 'Ficus lyrata', 'Rosa sp.', 'Echinocactus grusonii',
      'Bambusa vulgaris', 'Ficus microcarpa', 'Philodendron sp.', 'Cattleya sp.',
      'Tectona grandis', 'Vetiveria zizanioides', 'Jasminum sambac', 'Adenium obesum',
      'Nephrolepis exaltata', 'Chamaedorea elegans', 'Eucalyptus globulus',
      'Samanea saman', 'Pterocarpus macrocarpus', 'Tectona grandis', 'Dipterocarpus alatus',
      'Hopea odorata', 'Tamarindus indica'
    ];
  }

  private getSupplierNames(): string[] {
    return [
      'สวนปณีตา', 'ฟาร์มต้นไม้สวย', 'สวนไม้ประดับไทย', 'สวนแคคตัสไทย',
      'ฟาร์มแคคตัสสวย', 'สวนไผ่ไทย', 'ฟาร์มไผ่สวย', 'สวนบอนไซไทย',
      'ฟาร์มบอนไซสวย', 'สวนกล้วยไม้ไทย', 'ฟาร์มกล้วยไม้สวย', 'สวนไม้ล้อมไทย',
      'ฟาร์มไม้ล้อมสวย', 'สวนไม้คลุมดิน', 'ฟาร์มไม้คลุมดินสวย', 'ตลาดดอกไม้ปากคลองตลาด',
      'สวนกุหลาบสายไหม', 'ฟาร์มดอกไม้ราชบุรี', 'สวนไม้ประดับนครปฐม', 'ฟาร์มต้นไม้สมุทรสาคร'
    ];
  }

  private generatePhoneNumbers(count: number): string[] {
    const phones: string[] = [];
    for (let i = 0; i < count; i++) {
      const areaCode = ['02', '032', '033', '034', '035', '036', '037', '038', '039', '040'];
      const randomArea = areaCode[Math.floor(Math.random() * areaCode.length)];
      const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
      phones.push(`${randomArea}-${number.slice(0, 3)}-${number.slice(3)}`);
    }
    return phones;
  }

  private generateRandomPrice(range: { min: number; max: number }): number {
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  private generateRandomDate(): string {
    const start = new Date(2024, 0, 1);
    const end = new Date();
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString();
  }

  private generateRandomSize(): string {
    const sizes = ['1m', '1.2m', '1.5m', '1.8m', '2m', '2.5m', '3m', '3 นิ้ว', '4 นิ้ว', '6 นิ้ว'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  private getPlantTypeFromCategory(category: string): 'ไม้ประดับ' | 'ไม้ล้อม' | 'ไม้คลุมดิน' | 'ไม้ดอก' | 'ไม้ใบ' | 'แคคตัส' | 'บอนไซ' | 'กล้วยไม้' {
    const typeMap: Record<string, 'ไม้ประดับ' | 'ไม้ล้อม' | 'ไม้คลุมดิน' | 'ไม้ดอก' | 'ไม้ใบ' | 'แคคตัส' | 'บอนไซ' | 'กล้วยไม้'> = {
      'ไม้ใบ': 'ไม้ประดับ',
      'ไม้ดอก': 'ไม้ดอก',
      'ไม้ล้อม': 'ไม้ล้อม',
      'ไม้คลุมดิน': 'ไม้คลุมดิน',
      'แคคตัส': 'แคคตัส',
      'บอนไซ': 'บอนไซ',
      'กล้วยไม้': 'กล้วยไม้',
      'ไม้ไผ่': 'ไม้ล้อม'
    };
    return typeMap[category] || 'ไม้ประดับ';
  }

  private getMeasurementTypeFromCategory(category: string): 'ความสูง' | 'ขนาดลำต้น' | 'ขนาดถุงดำ' | 'ขนาดกระถาง' | 'จำนวนกิ่ง' {
    const measurementMap: Record<string, 'ความสูง' | 'ขนาดลำต้น' | 'ขนาดถุงดำ' | 'ขนาดกระถาง' | 'จำนวนกิ่ง'> = {
      'ไม้ใบ': 'ความสูง',
      'ไม้ดอก': 'ขนาดกระถาง',
      'ไม้ล้อม': 'ขนาดลำต้น',
      'ไม้คลุมดิน': 'ขนาดถุงดำ',
      'แคคตัส': 'ขนาดกระถาง',
      'บอนไซ': 'ขนาดกระถาง',
      'กล้วยไม้': 'ขนาดกระถาง',
      'ไม้ไผ่': 'ขนาดลำต้น'
    };
    return measurementMap[category] || 'ความสูง';
  }
}

// Export singleton instance
export const bulkDataGenerator = BulkDataGenerator.getInstance();
