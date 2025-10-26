// 🧪 Test Data Generator - สร้างข้อมูลทดสอบ
// สำหรับทดสอบระบบจัดการฐานข้อมูล

import { databaseService } from '../services/databaseService';
import { bulkDataGenerator } from '../utils/bulkDataGenerator';

export class TestDataManager {
  private static instance: TestDataManager;

  private constructor() {}

  public static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  // 🌱 สร้างข้อมูลทดสอบพื้นฐาน
  public createBasicTestData(): void {
    console.log('🧪 สร้างข้อมูลทดสอบพื้นฐาน...');
    
    const testPlants = [
      {
        id: 'test_plant_1',
        name: 'มอนสเตอร่าทดสอบ',
        scientificName: 'Monstera test',
        category: 'ไม้ใบ',
        plantType: 'ไม้ประดับ' as const,
        measurementType: 'ความสูง' as const,
        suppliers: [
          {
            id: 'test_supplier_1',
            name: 'ร้านทดสอบ A',
            price: 300,
            phone: '081-234-5678',
            location: 'กรุงเทพฯ',
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'test_supplier_2',
            name: 'ร้านทดสอบ B',
            price: 350,
            phone: '082-345-6789',
            location: 'นครปฐม',
            lastUpdated: new Date().toISOString()
          }
        ],
        hasSuppliers: true
      },
      {
        id: 'test_plant_2',
        name: 'ไทรใบสักทดสอบ',
        scientificName: 'Ficus test',
        category: 'ไม้ใบ',
        plantType: 'ไม้ประดับ' as const,
        measurementType: 'ความสูง' as const,
        suppliers: [
          {
            id: 'test_supplier_3',
            name: 'ร้านทดสอบ C',
            price: 1200,
            phone: '083-456-7890',
            location: 'สมุทรสาคร',
            lastUpdated: new Date().toISOString()
          }
        ],
        hasSuppliers: true
      }
    ];

    // บันทึกข้อมูลทดสอบ
    const success = databaseService.savePlants(testPlants);
    if (success) {
      console.log('✅ สร้างข้อมูลทดสอบสำเร็จ');
    } else {
      console.log('❌ สร้างข้อมูลทดสอบล้มเหลว');
    }
  }

  // 📊 สร้างข้อมูลทดสอบจำนวนมาก
  public createBulkTestData(): void {
    console.log('🧪 สร้างข้อมูลทดสอบจำนวนมาก...');
    
    const options = {
      plantCount: 10,
      suppliersPerPlant: 3,
      categories: ['ไม้ใบ', 'ไม้ดอก', 'ไม้ล้อม'],
      locations: ['กรุงเทพฯ', 'นครปฐม', 'สมุทรสาคร', 'นนทบุรี'],
      priceRange: { min: 100, max: 2000 }
    };

    const bulkPlants = bulkDataGenerator.generateBulkPlants(options);
    const success = databaseService.savePlants(bulkPlants);
    
    if (success) {
      console.log('✅ สร้างข้อมูลทดสอบจำนวนมากสำเร็จ');
    } else {
      console.log('❌ สร้างข้อมูลทดสอบจำนวนมากล้มเหลว');
    }
  }

  // 🔄 สร้างข้อมูล Bulk Update
  public createBulkUpdateTestData(): string {
    console.log('🧪 สร้างข้อมูล Bulk Update...');
    
    const bulkUpdateData = bulkDataGenerator.generateBulkUpdateData(5, 2);
    const jsonString = JSON.stringify(bulkUpdateData, null, 2);
    
    console.log('✅ สร้างข้อมูล Bulk Update สำเร็จ');
    console.log('📋 ข้อมูล Bulk Update:');
    console.log(jsonString);
    
    return jsonString;
  }

  // 📥 สร้างไฟล์ทดสอบ Import
  public createImportTestFile(): void {
    console.log('🧪 สร้างไฟล์ทดสอบ Import...');
    
    const testData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      plants: [
        {
          id: 'import_plant_1',
          name: 'ต้นไม้ Import 1',
          scientificName: 'Import Plant 1',
          category: 'ไม้ใบ',
          plantType: 'ไม้ประดับ' as const,
          measurementType: 'ความสูง' as const,
          suppliers: [
            {
              id: 'import_supplier_1',
              name: 'ร้าน Import A',
              price: 400,
              phone: '084-567-8901',
              location: 'ปทุมธานี',
              lastUpdated: new Date().toISOString()
            }
          ],
          hasSuppliers: true
        }
      ],
      suppliers: [],
      metadata: {
        totalRecords: 1,
        dataSize: 500,
        checksum: 'test123'
      }
    };

    // สร้างไฟล์ JSON
    const blob = new Blob([JSON.stringify(testData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-import-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ สร้างไฟล์ทดสอบ Import สำเร็จ');
  }

  // 🧹 ล้างข้อมูลทดสอบ
  public clearTestData(): void {
    console.log('🧪 ล้างข้อมูลทดสอบ...');
    
    const success = databaseService.clearAllData();
    if (success) {
      console.log('✅ ล้างข้อมูลทดสอบสำเร็จ');
    } else {
      console.log('❌ ล้างข้อมูลทดสอบล้มเหลว');
    }
  }

  // 📊 แสดงสถิติทดสอบ
  public showTestStats(): void {
    console.log('📊 สถิติฐานข้อมูล:');
    const stats = databaseService.getDatabaseStats();
    console.log(stats);
  }

  // 🎯 รันการทดสอบทั้งหมด
  public runAllTests(): void {
    console.log('🚀 เริ่มการทดสอบทั้งหมด...');
    
    // 1. ล้างข้อมูลเก่า
    this.clearTestData();
    
    // 2. สร้างข้อมูลทดสอบพื้นฐาน
    this.createBasicTestData();
    
    // 3. แสดงสถิติ
    this.showTestStats();
    
    // 4. สร้างข้อมูลจำนวนมาก
    this.createBulkTestData();
    
    // 5. แสดงสถิติอีกครั้ง
    this.showTestStats();
    
    // 6. สร้างข้อมูล Bulk Update
    this.createBulkUpdateTestData();
    
    // 7. สร้างไฟล์ Import
    this.createImportTestFile();
    
    console.log('🎉 การทดสอบทั้งหมดเสร็จสิ้น!');
  }
}

// Export singleton instance
export const testDataManager = TestDataManager.getInstance();

// เพิ่มฟังก์ชันใน window object สำหรับการทดสอบ
if (typeof window !== 'undefined') {
  (window as any).testDataManager = testDataManager;
  (window as any).databaseService = databaseService;
  (window as any).bulkDataGenerator = bulkDataGenerator;
  
  console.log('🧪 Test Data Manager พร้อมใช้งาน!');
  console.log('📋 คำสั่งที่ใช้ได้:');
  console.log('- testDataManager.runAllTests() - รันการทดสอบทั้งหมด');
  console.log('- testDataManager.createBasicTestData() - สร้างข้อมูลทดสอบพื้นฐาน');
  console.log('- testDataManager.createBulkTestData() - สร้างข้อมูลทดสอบจำนวนมาก');
  console.log('- testDataManager.createBulkUpdateTestData() - สร้างข้อมูล Bulk Update');
  console.log('- testDataManager.createImportTestFile() - สร้างไฟล์ Import');
  console.log('- testDataManager.clearTestData() - ล้างข้อมูลทดสอบ');
  console.log('- testDataManager.showTestStats() - แสดงสถิติ');
}
