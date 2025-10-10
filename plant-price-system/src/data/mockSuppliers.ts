// Mock Data สำหรับผู้จัดจำหน่าย
export interface MockSupplier {
  id: string;
  name: string;
  location: string;
  phone: string;
  email?: string;
  website?: string;
  description?: string;
  specialties: string[];
  businessHours?: string;
  paymentMethods: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const mockSuppliers: MockSupplier[] = [
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
    paymentMethods: ['เงินสด', 'โอนเงิน'],
    coordinates: { lat: 13.8199, lng: 100.0642 }
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
    paymentMethods: ['เงินสด', 'โอนเงิน', 'บัตรเครดิต'],
    coordinates: { lat: 18.7883, lng: 98.9853 }
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
    paymentMethods: ['เงินสด', 'โอนเงิน', 'บัตรเครดิต', 'เช็ค'],
    coordinates: { lat: 13.7563, lng: 100.5018 }
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
    paymentMethods: ['เงินสด', 'โอนเงิน'],
    coordinates: { lat: 7.8804, lng: 98.3923 }
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
    paymentMethods: ['เงินสด', 'โอนเงิน'],
    coordinates: { lat: 16.4419, lng: 102.8360 }
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
    paymentMethods: ['เงินสด', 'โอนเงิน', 'บัตรเครดิต'],
    coordinates: { lat: 13.7563, lng: 100.5018 }
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
    paymentMethods: ['เงินสด', 'โอนเงิน', 'เช็ค'],
    coordinates: { lat: 13.5283, lng: 99.8134 }
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
    paymentMethods: ['เงินสด', 'โอนเงิน'],
    coordinates: { lat: 9.1382, lng: 99.3215 }
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
    paymentMethods: ['เงินสด', 'โอนเงิน'],
    coordinates: { lat: 13.5283, lng: 99.8134 }
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
    paymentMethods: ['เงินสด', 'โอนเงิน', 'บัตรเครดิต'],
    coordinates: { lat: 7.0061, lng: 100.4981 }
  }
];

// Mock Plant-Supplier Connections
export interface MockPlantSupplier {
  id: string;
  plantId: string;
  plantName: string;
  supplierId: string;
  supplierName: string;
  price: number;
  size?: string;
  stockQuantity: number;
  minOrderQuantity: number;
  deliveryAvailable: boolean;
  deliveryCost: number;
  notes?: string;
}

export const mockPlantSuppliers: MockPlantSupplier[] = [
  // มอนสเตอร่า
  {
    id: 'ps_1',
    plantId: 'plant_1',
    plantName: 'มอนสเตอร่า เดลิซิโอซ่า',
    supplierId: 'supplier_1',
    supplierName: 'สวนไม้ประดับ ณัฐพล',
    price: 450,
    size: '1-2 ฟุต',
    stockQuantity: 25,
    minOrderQuantity: 1,
    deliveryAvailable: true,
    deliveryCost: 100,
    notes: 'ต้นใหญ่ ใบสวย'
  },
  {
    id: 'ps_2',
    plantId: 'plant_1',
    plantName: 'มอนสเตอร่า เดลิซิโอซ่า',
    supplierId: 'supplier_3',
    supplierName: 'สวนแคคตัส แอนด์ ซัคคูเลนต์',
    price: 380,
    size: 'S',
    stockQuantity: 15,
    minOrderQuantity: 2,
    deliveryAvailable: true,
    deliveryCost: 80,
    notes: 'ต้นเล็ก ราคาดี'
  },
  // ยางอินเดีย
  {
    id: 'ps_3',
    plantId: 'plant_2',
    plantName: 'ยางอินเดีย',
    supplierId: 'supplier_1',
    supplierName: 'สวนไม้ประดับ ณัฐพล',
    price: 350,
    size: '2-3 ฟุต',
    stockQuantity: 30,
    minOrderQuantity: 1,
    deliveryAvailable: true,
    deliveryCost: 100,
    notes: 'ต้นแข็งแรง'
  },
  {
    id: 'ps_4',
    plantId: 'plant_2',
    plantName: 'ยางอินเดีย',
    supplierId: 'supplier_5',
    supplierName: 'สวนไม้ใบ เมืองขอนแก่น',
    price: 320,
    size: '1-2 ฟุต',
    stockQuantity: 20,
    minOrderQuantity: 1,
    deliveryAvailable: false,
    deliveryCost: 0,
    notes: 'ราคาย่อมเยา'
  },
  // ฟิโลเดนดรอน
  {
    id: 'ps_5',
    plantId: 'plant_3',
    plantName: 'ฟิโลเดนดรอน เฮเดรซิฟอลิอัม',
    supplierId: 'supplier_3',
    supplierName: 'สวนแคคตัส แอนด์ ซัคคูเลนต์',
    price: 280,
    size: 'S',
    stockQuantity: 40,
    minOrderQuantity: 1,
    deliveryAvailable: true,
    deliveryCost: 80,
    notes: 'ต้นเล็ก น่ารัก'
  },
  {
    id: 'ps_6',
    plantId: 'plant_3',
    plantName: 'ฟิโลเดนดรอน เฮเดรซิฟอลิอัม',
    supplierId: 'supplier_5',
    supplierName: 'สวนไม้ใบ เมืองขอนแก่น',
    price: 250,
    size: 'M',
    stockQuantity: 35,
    minOrderQuantity: 2,
    deliveryAvailable: false,
    deliveryCost: 0,
    notes: 'ราคาดี'
  },
  // แคคตัส
  {
    id: 'ps_7',
    plantId: 'plant_4',
    plantName: 'แคคตัส หลากชนิด',
    supplierId: 'supplier_3',
    supplierName: 'สวนแคคตัส แอนด์ ซัคคูเลนต์',
    price: 120,
    size: 'S',
    stockQuantity: 100,
    minOrderQuantity: 5,
    deliveryAvailable: true,
    deliveryCost: 50,
    notes: 'ชุด 5 ต้น'
  },
  {
    id: 'ps_8',
    plantId: 'plant_4',
    plantName: 'แคคตัส หลากชนิด',
    supplierId: 'supplier_10',
    supplierName: 'สวนไม้ประดับ ภาคใต้',
    price: 100,
    size: 'S',
    stockQuantity: 80,
    minOrderQuantity: 10,
    deliveryAvailable: true,
    deliveryCost: 60,
    notes: 'ชุด 10 ต้น ราคาดี'
  },
  // ไม้ล้อม - ต้นไผ่
  {
    id: 'ps_9',
    plantId: 'plant_5',
    plantName: 'ไม้ล้อม - ต้นไผ่',
    supplierId: 'supplier_2',
    supplierName: 'ร้านต้นไม้สวยงาม',
    price: 2500,
    size: '3-4 เมตร',
    stockQuantity: 10,
    minOrderQuantity: 1,
    deliveryAvailable: true,
    deliveryCost: 500,
    notes: 'ต้นใหญ่ ใช้ล้อมสวน'
  },
  {
    id: 'ps_10',
    plantId: 'plant_5',
    plantName: 'ไม้ล้อม - ต้นไผ่',
    supplierId: 'supplier_8',
    supplierName: 'สวนไม้ไผ่ สุราษฎร์ธานี',
    price: 2200,
    size: '2-3 เมตร',
    stockQuantity: 15,
    minOrderQuantity: 1,
    deliveryAvailable: true,
    deliveryCost: 400,
    notes: 'ราคาโรงงาน'
  }
];

// Helper functions
export const getSuppliersBySpecialty = (specialty: string): MockSupplier[] => {
  return mockSuppliers.filter(supplier => 
    supplier.specialties.includes(specialty)
  );
};

export const getPlantSuppliers = (plantId?: string, supplierId?: string): MockPlantSupplier[] => {
  let filtered = mockPlantSuppliers;
  
  if (plantId) {
    filtered = filtered.filter(ps => ps.plantId === plantId);
  }
  
  if (supplierId) {
    filtered = filtered.filter(ps => ps.supplierId === supplierId);
  }
  
  return filtered;
};

export const getSupplierById = (id: string): MockSupplier | undefined => {
  return mockSuppliers.find(supplier => supplier.id === id);
};

export const getPlantSupplierById = (id: string): MockPlantSupplier | undefined => {
  return mockPlantSuppliers.find(ps => ps.id === id);
};
