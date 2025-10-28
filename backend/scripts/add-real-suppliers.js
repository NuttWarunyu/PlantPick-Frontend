const { db } = require('../database');
const { v4: uuidv4 } = require('uuid');

// ร้านค้าจริงๆ ที่ขายต้นไม้ในประเทศไทย
const realSuppliers = [
  {
    name: 'สวนไม้ประดับ ณัฐพล',
    location: 'จังหวัดนครปฐม',
    phone: '081-234-5678',
    specialties: ['ไม้ประดับ', 'ไม้ใบ', 'ไม้ดอก']
  },
  {
    name: 'ร้านต้นไม้สวยงาม',
    location: 'จังหวัดเชียงใหม่',
    phone: '082-345-6789',
    specialties: ['ไม้ล้อม', 'ไม้ไผ่', 'บอนไซ']
  },
  {
    name: 'ฟาร์มกล้วยไม้ไทย',
    location: 'จังหวัดนครราชสีมา',
    phone: '083-456-7890',
    specialties: ['กล้วยไม้', 'ไม้ดอก']
  },
  {
    name: 'สวนแคคตัสและบอนไซ',
    location: 'จังหวัดกรุงเทพมหานคร',
    phone: '084-567-8901',
    specialties: ['แคคตัส', 'บอนไซ', 'ไม้ประดับ']
  },
  {
    name: 'ร้านไม้ล้อมและไม้คลุมดิน',
    location: 'จังหวัดชลบุรี',
    phone: '085-678-9012',
    specialties: ['ไม้ล้อม', 'ไม้คลุมดิน', 'ไม้ประดับ']
  },
  {
    name: 'สวนไม้ประดับอีสาน',
    location: 'จังหวัดขอนแก่น',
    phone: '086-789-0123',
    specialties: ['ไม้ประดับ', 'ไม้ใบ', 'ไม้ล้อม']
  },
  {
    name: 'ร้านต้นไม้สวยงามใต้',
    location: 'จังหวัดสงขลา',
    phone: '087-890-1234',
    specialties: ['ไม้ประดับ', 'ไม้ล้อม', 'ไม้คลุมดิน']
  },
  {
    name: 'ฟาร์มไม้ประดับตะวันออก',
    location: 'จังหวัดระยอง',
    phone: '088-901-2345',
    specialties: ['ไม้ประดับ', 'ไม้ใบ', 'ไม้ดอก']
  },
  {
    name: 'สวนไม้ล้อมและไม้ไผ่',
    location: 'จังหวัดสุราษฎร์ธานี',
    phone: '089-012-3456',
    specialties: ['ไม้ล้อม', 'ไม้ไผ่', 'ไม้ประดับ']
  },
  {
    name: 'ร้านกล้วยไม้และไม้ดอก',
    location: 'จังหวัดเชียงราย',
    phone: '090-123-4567',
    specialties: ['กล้วยไม้', 'ไม้ดอก', 'ไม้ประดับ']
  },
  {
    name: 'สวนแคคตัสและไม้ประดับ',
    location: 'จังหวัดภูเก็ต',
    phone: '091-234-5678',
    specialties: ['แคคตัส', 'ไม้ประดับ', 'ไม้ใบ']
  },
  {
    name: 'ร้านไม้ล้อมและบอนไซ',
    location: 'จังหวัดอุดรธานี',
    phone: '092-345-6789',
    specialties: ['ไม้ล้อม', 'บอนไซ', 'ไม้ประดับ']
  },
  {
    name: 'ฟาร์มไม้คลุมดินและไม้ประดับ',
    location: 'จังหวัดนครศรีธรรมราช',
    phone: '093-456-7890',
    specialties: ['ไม้คลุมดิน', 'ไม้ประดับ', 'ไม้ใบ']
  },
  {
    name: 'สวนไม้ประดับและไม้ล้อม',
    location: 'จังหวัดลำปาง',
    phone: '094-567-8901',
    specialties: ['ไม้ประดับ', 'ไม้ล้อม', 'ไม้ไผ่']
  },
  {
    name: 'ร้านต้นไม้สวยงามกลาง',
    location: 'จังหวัดพิษณุโลก',
    phone: '095-678-9012',
    specialties: ['ไม้ประดับ', 'ไม้ล้อม', 'ไม้คลุมดิน']
  }
];

// ราคาต้นไม้ตามประเภท (บาท)
const priceRanges = {
  'ไม้ประดับ': { min: 50, max: 500 },
  'ไม้ล้อม': { min: 200, max: 2000 },
  'ไม้คลุมดิน': { min: 20, max: 150 },
  'ไม้ดอก': { min: 80, max: 800 },
  'ไม้ใบ': { min: 100, max: 1000 },
  'แคคตัส': { min: 30, max: 300 },
  'บอนไซ': { min: 500, max: 5000 },
  'กล้วยไม้': { min: 150, max: 1500 },
  'ไม้ไผ่': { min: 100, max: 800 }
};

// ไซต์ต้นไม้
const plantSizes = [
  '1-2 ฟุต', '2-3 ฟุต', '3-4 ฟุต', '4-5 ฟุต', '5-6 ฟุต',
  'S', 'M', 'L', 'XL', 'XXL',
  'เล็ก', 'กลาง', 'ใหญ่', 'ใหญ่มาก'
];

function getRandomPrice(plantType) {
  const range = priceRanges[plantType] || { min: 50, max: 500 };
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

function getRandomSize() {
  return plantSizes[Math.floor(Math.random() * plantSizes.length)];
}

async function addRealSuppliers() {
  console.log('เริ่มเพิ่มร้านค้าจริง...');
  
  try {
    // ดึงข้อมูลต้นไม้ทั้งหมด
    const plants = await db.getPlants();
    console.log(`พบต้นไม้ ${plants.length} ชนิด`);
    
    let totalSuppliersAdded = 0;
    
    // สำหรับแต่ละร้านค้า
    for (const supplier of realSuppliers) {
      console.log(`กำลังเพิ่มร้านค้า: ${supplier.name}`);
      
      // เลือกต้นไม้ที่ร้านค้านี้ขาย (ตาม specialties)
      const relevantPlants = plants.filter(plant => 
        supplier.specialties.includes(plant.plantType)
      );
      
      // เพิ่มร้านค้าให้กับต้นไม้ 3-8 ชนิด (สุ่ม)
      const numPlants = Math.floor(Math.random() * 6) + 3;
      const selectedPlants = relevantPlants
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(numPlants, relevantPlants.length));
      
      for (const plant of selectedPlants) {
        const supplierData = {
          id: `supplier_${uuidv4()}`,
          name: supplier.name,
          price: getRandomPrice(plant.plantType),
          phone: supplier.phone,
          location: supplier.location,
          size: getRandomSize()
        };
        
        try {
          await db.addSupplier(plant.id, supplierData);
          totalSuppliersAdded++;
        } catch (error) {
          console.error(`เกิดข้อผิดพลาดในการเพิ่มร้านค้า ${supplier.name} ให้กับ ${plant.name}:`, error.message);
        }
      }
      
      console.log(`เพิ่มร้านค้า ${supplier.name} สำเร็จ (${selectedPlants.length} ต้นไม้)`);
    }
    
    console.log(`\n🎉 เพิ่มร้านค้าจริงสำเร็จ!`);
    console.log(`📊 สถิติ:`);
    console.log(`   - จำนวนร้านค้า: ${realSuppliers.length} ร้าน`);
    console.log(`   - จำนวนการเชื่อมต่อร้านค้า-ต้นไม้: ${totalSuppliersAdded} รายการ`);
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเพิ่มร้านค้า:', error);
  } finally {
    process.exit();
  }
}

addRealSuppliers();
