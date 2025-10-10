const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Mock Suppliers Data
const mockSuppliers = [
  {
    id: 'supplier_1',
    name: 'สวนไม้ประดับ ณัฐพล',
    location: 'นครปฐม',
    phone: '081-234-5678',
    email: 'nattapon.garden@example.com',
    website: 'www.nattapongarden.com',
    description: 'จำหน่ายไม้ประดับ ไม้ใบ และไม้ดอกคุณภาพดี มีประสบการณ์กว่า 10 ปี',
    specialties: ['ไม้ประดับ', 'ไม้ใบ', 'ไม้ดอก'],
    businessHours: 'จันทร์-อาทิตย์ 8:00-18:00',
    paymentMethods: ['เงินสด', 'โอนเงิน']
  },
  {
    id: 'supplier_2',
    name: 'ร้านต้นไม้สวยงาม',
    location: 'เชียงใหม่',
    phone: '089-876-5432',
    email: 'beautiful.plants@example.com',
    website: 'www.beautifulplants.co.th',
    description: 'แหล่งรวมไม้ล้อม ไม้ไผ่ และบอนไซหายาก พร้อมบริการจัดส่งทั่วประเทศ',
    specialties: ['ไม้ล้อม', 'ไม้ไผ่', 'บอนไซ'],
    businessHours: 'อังคาร-อาทิตย์ 9:00-17:00',
    paymentMethods: ['เงินสด', 'โอนเงิน', 'บัตรเครดิต']
  },
  {
    id: 'supplier_3',
    name: 'สวนแคคตัส แอนด์ ซัคคูเลนต์',
    location: 'กรุงเทพมหานคร',
    phone: '082-345-6789',
    email: 'cactus.garden@example.com',
    website: 'www.cactusgarden.co.th',
    description: 'เชี่ยวชาญด้านแคคตัสและซัคคูเลนต์ หลากหลายสายพันธุ์หายาก',
    specialties: ['แคคตัส', 'ซัคคูเลนต์', 'ไม้ใบ'],
    businessHours: 'จันทร์-เสาร์ 10:00-19:00',
    paymentMethods: ['เงินสด', 'โอนเงิน', 'บัตรเครดิต', 'เช็ค']
  },
  {
    id: 'supplier_4',
    name: 'สวนกล้วยไม้ ภูเก็ต',
    location: 'ภูเก็ต',
    phone: '083-456-7890',
    email: 'phuket.orchids@example.com',
    website: 'www.phuketorchids.com',
    description: 'ผู้เชี่ยวชาญด้านกล้วยไม้และไม้ดอกเมืองร้อน รับประกันคุณภาพ',
    specialties: ['กล้วยไม้', 'ไม้ดอก', 'ไม้ประดับ'],
    businessHours: 'จันทร์-อาทิตย์ 7:00-18:00',
    paymentMethods: ['เงินสด', 'โอนเงิน']
  },
  {
    id: 'supplier_5',
    name: 'สวนไม้ใบ เมืองขอนแก่น',
    location: 'ขอนแก่น',
    phone: '084-567-8901',
    email: 'khonkaen.leaves@example.com',
    website: 'www.khonkaenleaves.co.th',
    description: 'จำหน่ายไม้ใบและไม้ประดับในร่ม ราคาย่อมเยา คุณภาพดี',
    specialties: ['ไม้ใบ', 'ไม้ประดับ', 'ไม้ในร่ม'],
    businessHours: 'จันทร์-เสาร์ 8:30-17:30',
    paymentMethods: ['เงินสด', 'โอนเงิน']
  },
  {
    id: 'supplier_6',
    name: 'สวนบอนไซ ญี่ปุ่น',
    location: 'กรุงเทพมหานคร',
    phone: '085-678-9012',
    email: 'japanese.bonsai@example.com',
    website: 'www.japanesebonsai.co.th',
    description: 'เชี่ยวชาญด้านบอนไซและไม้แคระ สไตล์ญี่ปุ่นแท้',
    specialties: ['บอนไซ', 'ไม้แคระ', 'ไม้ประดับ'],
    businessHours: 'อังคาร-อาทิตย์ 9:00-18:00',
    paymentMethods: ['เงินสด', 'โอนเงิน', 'บัตรเครดิต']
  },
  {
    id: 'supplier_7',
    name: 'สวนไม้ล้อม ราชบุรี',
    location: 'ราชบุรี',
    phone: '086-789-0123',
    email: 'ratchaburi.trees@example.com',
    website: 'www.ratchaburitrees.co.th',
    description: 'จำหน่ายไม้ล้อม ไม้ใหญ่ และไม้ยืนต้น สำหรับสวนสาธารณะ',
    specialties: ['ไม้ล้อม', 'ไม้ใหญ่', 'ไม้ยืนต้น'],
    businessHours: 'จันทร์-เสาร์ 7:00-17:00',
    paymentMethods: ['เงินสด', 'โอนเงิน', 'เช็ค']
  },
  {
    id: 'supplier_8',
    name: 'สวนไม้ไผ่ สุราษฎร์ธานี',
    location: 'สุราษฎร์ธานี',
    phone: '087-890-1234',
    email: 'surat.bamboo@example.com',
    website: 'www.suratbamboo.co.th',
    description: 'เชี่ยวชาญด้านไม้ไผ่และไม้คลุมดิน ราคาโรงงาน',
    specialties: ['ไม้ไผ่', 'ไม้คลุมดิน', 'ไม้ประดับ'],
    businessHours: 'จันทร์-อาทิตย์ 6:00-18:00',
    paymentMethods: ['เงินสด', 'โอนเงิน']
  },
  {
    id: 'supplier_9',
    name: 'สวนไม้ดอก ราชบุรี',
    location: 'ราชบุรี',
    phone: '088-901-2345',
    email: 'ratchaburi.flowers@example.com',
    website: 'www.ratchaburiflowers.co.th',
    description: 'จำหน่ายไม้ดอกและไม้ประดับหลากสีสัน ราคาย่อมเยา',
    specialties: ['ไม้ดอก', 'ไม้ประดับ', 'ไม้คลุมดิน'],
    businessHours: 'จันทร์-อาทิตย์ 8:00-17:00',
    paymentMethods: ['เงินสด', 'โอนเงิน']
  },
  {
    id: 'supplier_10',
    name: 'สวนไม้ประดับ ภาคใต้',
    location: 'สงขลา',
    phone: '089-012-3456',
    email: 'south.garden@example.com',
    website: 'www.southgarden.co.th',
    description: 'จำหน่ายไม้ประดับและไม้เมืองร้อน รับประกันคุณภาพ',
    specialties: ['ไม้ประดับ', 'ไม้เมืองร้อน', 'ไม้ใบ'],
    businessHours: 'จันทร์-เสาร์ 8:00-18:00',
    paymentMethods: ['เงินสด', 'โอนเงิน', 'บัตรเครดิต']
  }
];

// Mock Plant-Supplier Connections
const mockPlantSuppliers = [
  {
    plantId: 'plant_001',
    supplierId: 'supplier_1',
    price: 450,
    size: '1-2 ฟุต',
    stockQuantity: 25,
    minOrderQuantity: 1,
    deliveryAvailable: true,
    deliveryCost: 100,
    notes: 'ต้นใหญ่ ใบสวย'
  },
  {
    plantId: 'plant_001',
    supplierId: 'supplier_3',
    price: 380,
    size: 'S',
    stockQuantity: 15,
    minOrderQuantity: 2,
    deliveryAvailable: true,
    deliveryCost: 80,
    notes: 'ต้นเล็ก ราคาดี'
  },
  {
    plantId: 'plant_002',
    supplierId: 'supplier_1',
    price: 350,
    size: '2-3 ฟุต',
    stockQuantity: 30,
    minOrderQuantity: 1,
    deliveryAvailable: true,
    deliveryCost: 100,
    notes: 'ต้นแข็งแรง'
  },
  {
    plantId: 'plant_002',
    supplierId: 'supplier_5',
    price: 320,
    size: '1-2 ฟุต',
    stockQuantity: 20,
    minOrderQuantity: 1,
    deliveryAvailable: false,
    deliveryCost: 0,
    notes: 'ราคาย่อมเยา'
  },
  {
    plantId: 'plant_003',
    supplierId: 'supplier_3',
    price: 280,
    size: 'S',
    stockQuantity: 40,
    minOrderQuantity: 1,
    deliveryAvailable: true,
    deliveryCost: 80,
    notes: 'ต้นเล็ก น่ารัก'
  },
  {
    plantId: 'plant_003',
    supplierId: 'supplier_5',
    price: 250,
    size: 'M',
    stockQuantity: 35,
    minOrderQuantity: 2,
    deliveryAvailable: false,
    deliveryCost: 0,
    notes: 'ราคาดี'
  },
  {
    plantId: 'plant_004',
    supplierId: 'supplier_3',
    price: 120,
    size: 'S',
    stockQuantity: 100,
    minOrderQuantity: 5,
    deliveryAvailable: true,
    deliveryCost: 50,
    notes: 'ชุด 5 ต้น'
  },
  {
    plantId: 'plant_004',
    supplierId: 'supplier_10',
    price: 100,
    size: 'S',
    stockQuantity: 80,
    minOrderQuantity: 10,
    deliveryAvailable: true,
    deliveryCost: 60,
    notes: 'ชุด 10 ต้น ราคาดี'
  },
  {
    plantId: 'plant_005',
    supplierId: 'supplier_2',
    price: 2500,
    size: '3-4 เมตร',
    stockQuantity: 10,
    minOrderQuantity: 1,
    deliveryAvailable: true,
    deliveryCost: 500,
    notes: 'ต้นใหญ่ ใช้ล้อมสวน'
  },
  {
    plantId: 'plant_005',
    supplierId: 'supplier_8',
    price: 2200,
    size: '2-3 เมตร',
    stockQuantity: 15,
    minOrderQuantity: 1,
    deliveryAvailable: true,
    deliveryCost: 400,
    notes: 'ราคาโรงงาน'
  }
];

async function addMockSuppliers() {
  try {
    console.log('🌱 เริ่มเพิ่ม Mock Suppliers...');
    
    for (const supplier of mockSuppliers) {
      const query = `
        INSERT INTO suppliers (id, name, location, phone, email, website, description, specialties, business_hours, payment_methods, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          location = EXCLUDED.location,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          website = EXCLUDED.website,
          description = EXCLUDED.description,
          specialties = EXCLUDED.specialties,
          business_hours = EXCLUDED.business_hours,
          payment_methods = EXCLUDED.payment_methods
      `;
      
      await pool.query(query, [
        supplier.id,
        supplier.name,
        supplier.location,
        supplier.phone,
        supplier.email,
        supplier.website,
        supplier.description,
        JSON.stringify(supplier.specialties),
        supplier.businessHours,
        JSON.stringify(supplier.paymentMethods)
      ]);
      
      console.log(`✅ เพิ่ม ${supplier.name} สำเร็จ`);
    }
    
    console.log('🎉 เพิ่ม Mock Suppliers เสร็จสิ้น!');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  }
}

async function addMockPlantSuppliers() {
  try {
    console.log('🔗 เริ่มเพิ่ม Mock Plant-Supplier Connections...');
    
    for (const connection of mockPlantSuppliers) {
      const connectionId = `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const query = `
        INSERT INTO plant_suppliers (id, plant_id, supplier_id, price, size, stock_quantity, min_order_quantity, delivery_available, delivery_cost, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          price = EXCLUDED.price,
          size = EXCLUDED.size,
          stock_quantity = EXCLUDED.stock_quantity,
          min_order_quantity = EXCLUDED.min_order_quantity,
          delivery_available = EXCLUDED.delivery_available,
          delivery_cost = EXCLUDED.delivery_cost,
          notes = EXCLUDED.notes
      `;
      
      await pool.query(query, [
        connectionId,
        connection.plantId,
        connection.supplierId,
        connection.price,
        connection.size,
        connection.stockQuantity,
        connection.minOrderQuantity,
        connection.deliveryAvailable,
        connection.deliveryCost,
        connection.notes
      ]);
      
      console.log(`✅ เชื่อมต่อ ${connection.plantId} กับ ${connection.supplierId} สำเร็จ`);
    }
    
    console.log('🎉 เพิ่ม Mock Plant-Supplier Connections เสร็จสิ้น!');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  }
}

async function main() {
  try {
    await addMockSuppliers();
    await addMockPlantSuppliers();
    console.log('🎊 เพิ่ม Mock Data ทั้งหมดเสร็จสิ้น!');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await pool.end();
  }
}

main();
