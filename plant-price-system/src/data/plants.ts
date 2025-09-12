import { Plant } from '../types';

export const plantsData: Plant[] = [
  {
    id: '1',
    name: 'มอนสเตอร่า เดลิซิโอซ่า',
    scientificName: 'Monstera deliciosa',
    category: 'ไม้ใบ',
    plantType: 'ไม้ประดับ',
    measurementType: 'ความสูง',
    suppliers: [
      {
        id: 's1',
        name: 'สวนปณีตา',
        price: 350,
        phone: '087-167-7250',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15'
      },
      {
        id: 's2',
        name: 'ฟาร์มต้นไม้สวย',
        price: 380,
        phone: '081-234-5678',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14'
      },
      {
        id: 's3',
        name: 'สวนไม้ประดับไทย',
        price: 320,
        phone: '089-876-5432',
        location: 'นนทบุรี',
        lastUpdated: '2024-01-13'
      }
    ]
  },
  {
    id: '2',
    name: 'ไทรใบสัก',
    scientificName: 'Ficus lyrata',
    category: 'ไม้ใบ',
    plantType: 'ไม้ประดับ',
    measurementType: 'ความสูง',
    suppliers: [
      {
        id: 's4',
        name: 'สวนปณีตา',
        price: 1200,
        phone: '087-167-7250',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15'
      },
      {
        id: 's5',
        name: 'ฟาร์มต้นไม้สวย',
        price: 1350,
        phone: '081-234-5678',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14'
      }
    ]
  },
  {
    id: '3',
    name: 'กุหลาบแดง',
    scientificName: 'Rosa sp.',
    category: 'ไม้ดอก',
    plantType: 'ไม้ดอก',
    measurementType: 'ขนาดกระถาง',
    suppliers: [
      {
        id: 's6',
        name: 'สวนดอกไม้ไทย',
        price: 150,
        phone: '082-345-6789',
        location: 'ปทุมธานี',
        lastUpdated: '2024-01-15'
      },
      {
        id: 's7',
        name: 'ฟาร์มกุหลาบสวย',
        price: 180,
        phone: '083-456-7890',
        location: 'นครนายก',
        lastUpdated: '2024-01-14'
      },
      {
        id: 's18',
        name: 'ตลาดดอกไม้ปากคลองตลาด',
        price: 120,
        phone: '02-xxx-xxxx',
        location: 'กรุงเทพฯ',
        lastUpdated: '2024-01-13'
      },
      {
        id: 's19',
        name: 'สวนกุหลาบสายไหม',
        price: 200,
        phone: '081-xxx-xxxx',
        location: 'นครปฐม',
        lastUpdated: '2024-01-12'
      },
      {
        id: 's20',
        name: 'ฟาร์มดอกไม้ราชบุรี',
        price: 160,
        phone: '032-xxx-xxxx',
        location: 'ราชบุรี',
        lastUpdated: '2024-01-11'
      }
    ]
  },
  {
    id: '4',
    name: 'แคคตัสบอล',
    scientificName: 'Echinocactus grusonii',
    category: 'แคคตัส',
    plantType: 'แคคตัส',
    measurementType: 'ขนาดกระถาง',
    suppliers: [
      {
        id: 's8',
        name: 'สวนแคคตัสไทย',
        price: 250,
        phone: '084-567-8901',
        location: 'ชลบุรี',
        lastUpdated: '2024-01-15'
      },
      {
        id: 's9',
        name: 'ฟาร์มแคคตัสสวย',
        price: 280,
        phone: '085-678-9012',
        location: 'ระยอง',
        lastUpdated: '2024-01-14'
      }
    ]
  },
  {
    id: '5',
    name: 'ไผ่สีสุก',
    scientificName: 'Bambusa vulgaris',
    category: 'ไม้ไผ่',
    plantType: 'ไม้ล้อม',
    measurementType: 'ขนาดลำต้น',
    suppliers: [
      {
        id: 's10',
        name: 'สวนไผ่ไทย',
        price: 450,
        phone: '086-789-0123',
        location: 'สุพรรณบุรี',
        lastUpdated: '2024-01-15'
      },
      {
        id: 's11',
        name: 'ฟาร์มไผ่สวย',
        price: 480,
        phone: '087-890-1234',
        location: 'กาญจนบุรี',
        lastUpdated: '2024-01-14'
      }
    ]
  },
  {
    id: '6',
    name: 'บอนไซไทร',
    scientificName: 'Ficus microcarpa',
    category: 'บอนไซ',
    plantType: 'บอนไซ',
    measurementType: 'ขนาดกระถาง',
    suppliers: [
      {
        id: 's12',
        name: 'สวนบอนไซไทย',
        price: 800,
        phone: '088-901-2345',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15'
      },
      {
        id: 's13',
        name: 'ฟาร์มบอนไซสวย',
        price: 850,
        phone: '089-012-3456',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14'
      }
    ]
  },
  {
    id: '7',
    name: 'ฟิโลเดนดรอน',
    scientificName: 'Philodendron sp.',
    category: 'ไม้ใบ',
    plantType: 'ไม้ประดับ',
    measurementType: 'ความสูง',
    suppliers: [
      {
        id: 's14',
        name: 'สวนปณีตา',
        price: 280,
        phone: '087-167-7250',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15'
      },
      {
        id: 's15',
        name: 'ฟาร์มต้นไม้สวย',
        price: 300,
        phone: '081-234-5678',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14'
      }
    ]
  },
  {
    id: '8',
    name: 'กล้วยไม้แคทลียา',
    scientificName: 'Cattleya sp.',
    category: 'กล้วยไม้',
    plantType: 'กล้วยไม้',
    measurementType: 'ขนาดกระถาง',
    suppliers: [
      {
        id: 's16',
        name: 'สวนกล้วยไม้ไทย',
        price: 650,
        phone: '090-123-4567',
        location: 'นครนายก',
        lastUpdated: '2024-01-15'
      },
      {
        id: 's17',
        name: 'ฟาร์มกล้วยไม้สวย',
        price: 700,
        phone: '091-234-5678',
        location: 'ปทุมธานี',
        lastUpdated: '2024-01-14'
      }
    ]
  },
  {
    id: '9',
    name: 'ไทรเกาหลี',
    scientificName: 'Ficus microcarpa',
    category: 'ไม้ใบ',
    plantType: 'ไม้ล้อม',
    measurementType: 'ความสูง',
    suppliers: [
      {
        id: 's18',
        name: 'สวนปณีตา',
        price: 120,
        phone: '087-167-7250',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15',
        size: '1m'
      },
      {
        id: 's19',
        name: 'สวนปณีตา',
        price: 180,
        phone: '087-167-7250',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15',
        size: '1.2m'
      },
      {
        id: 's20',
        name: 'สวนปณีตา',
        price: 250,
        phone: '087-167-7250',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15',
        size: '1.5m'
      },
      {
        id: 's21',
        name: 'สวนปณีตา',
        price: 350,
        phone: '087-167-7250',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15',
        size: '1.8m'
      },
      {
        id: 's22',
        name: 'สวนปณีตา',
        price: 450,
        phone: '087-167-7250',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15',
        size: '2m'
      },
      {
        id: 's23',
        name: 'สวนปณีตา',
        price: 650,
        phone: '087-167-7250',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15',
        size: '2.5m'
      },
      {
        id: 's24',
        name: 'สวนปณีตา',
        price: 850,
        phone: '087-167-7250',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15',
        size: '3m'
      },
      {
        id: 's25',
        name: 'ฟาร์มต้นไม้สวย',
        price: 130,
        phone: '081-234-5678',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14',
        size: '1m'
      },
      {
        id: 's26',
        name: 'ฟาร์มต้นไม้สวย',
        price: 190,
        phone: '081-234-5678',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14',
        size: '1.2m'
      },
      {
        id: 's27',
        name: 'ฟาร์มต้นไม้สวย',
        price: 270,
        phone: '081-234-5678',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14',
        size: '1.5m'
      },
      {
        id: 's28',
        name: 'ฟาร์มต้นไม้สวย',
        price: 380,
        phone: '081-234-5678',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14',
        size: '1.8m'
      },
      {
        id: 's29',
        name: 'ฟาร์มต้นไม้สวย',
        price: 480,
        phone: '081-234-5678',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14',
        size: '2m'
      },
      {
        id: 's30',
        name: 'ฟาร์มต้นไม้สวย',
        price: 680,
        phone: '081-234-5678',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14',
        size: '2.5m'
      },
      {
        id: 's31',
        name: 'ฟาร์มต้นไม้สวย',
        price: 880,
        phone: '081-234-5678',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14',
        size: '3m'
      }
    ]
  },
  {
    id: '10',
    name: 'กันเกรา',
    scientificName: 'Tectona grandis',
    category: 'ไม้ล้อม',
    plantType: 'ไม้ล้อม',
    measurementType: 'ขนาดลำต้น',
    suppliers: [
      {
        id: 's32',
        name: 'สวนไม้ล้อมไทย',
        price: 1500,
        phone: '089-123-4567',
        location: 'กาญจนบุรี',
        lastUpdated: '2024-01-15',
        size: '3 นิ้ว'
      },
      {
        id: 's33',
        name: 'สวนไม้ล้อมไทย',
        price: 2500,
        phone: '089-123-4567',
        location: 'กาญจนบุรี',
        lastUpdated: '2024-01-15',
        size: '4 นิ้ว'
      },
      {
        id: 's34',
        name: 'สวนไม้ล้อมไทย',
        price: 4000,
        phone: '089-123-4567',
        location: 'กาญจนบุรี',
        lastUpdated: '2024-01-15',
        size: '6 นิ้ว'
      },
      {
        id: 's35',
        name: 'ฟาร์มไม้ล้อมสวย',
        price: 1600,
        phone: '090-234-5678',
        location: 'ราชบุรี',
        lastUpdated: '2024-01-14',
        size: '3 นิ้ว'
      },
      {
        id: 's36',
        name: 'ฟาร์มไม้ล้อมสวย',
        price: 2700,
        phone: '090-234-5678',
        location: 'ราชบุรี',
        lastUpdated: '2024-01-14',
        size: '4 นิ้ว'
      },
      {
        id: 's37',
        name: 'ฟาร์มไม้ล้อมสวย',
        price: 4200,
        phone: '090-234-5678',
        location: 'ราชบุรี',
        lastUpdated: '2024-01-14',
        size: '6 นิ้ว'
      }
    ]
  },
  {
    id: '11',
    name: 'หญ้าแฝก',
    scientificName: 'Vetiveria zizanioides',
    category: 'ไม้คลุมดิน',
    plantType: 'ไม้คลุมดิน',
    measurementType: 'ขนาดถุงดำ',
    suppliers: [
      {
        id: 's38',
        name: 'สวนไม้คลุมดิน',
        price: 15,
        phone: '091-345-6789',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15',
        size: '3 นิ้ว'
      },
      {
        id: 's39',
        name: 'สวนไม้คลุมดิน',
        price: 25,
        phone: '091-345-6789',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15',
        size: '4 นิ้ว'
      },
      {
        id: 's40',
        name: 'สวนไม้คลุมดิน',
        price: 35,
        phone: '091-345-6789',
        location: 'นครปฐม',
        lastUpdated: '2024-01-15',
        size: '6 นิ้ว'
      },
      {
        id: 's41',
        name: 'ฟาร์มไม้คลุมดินสวย',
        price: 18,
        phone: '092-456-7890',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14',
        size: '3 นิ้ว'
      },
      {
        id: 's42',
        name: 'ฟาร์มไม้คลุมดินสวย',
        price: 28,
        phone: '092-456-7890',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14',
        size: '4 นิ้ว'
      },
      {
        id: 's43',
        name: 'ฟาร์มไม้คลุมดินสวย',
        price: 38,
        phone: '092-456-7890',
        location: 'สมุทรสาคร',
        lastUpdated: '2024-01-14',
        size: '6 นิ้ว'
      }
    ]
  }
];
