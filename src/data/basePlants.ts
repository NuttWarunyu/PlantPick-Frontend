// ข้อมูลพื้นฐานต้นไม้ (เริ่มต้น)
// ข้อมูลจะแน่นขึ้นเรื่อยๆ ตามการใช้งาน

import { PlantData } from '../services/api';

export const basePlants: PlantData[] = [
  {
    id: 'plant_1',
    name: 'กุหลาบแดง',
    scientificName: 'Rosa rubiginosa',
    category: 'ไม้ดอก',
    plantType: 'ไม้ดอก',
    measurementType: 'ความสูง',
    suppliers: [],
    hasSuppliers: false
  },
  {
    id: 'plant_2',
    name: 'ไทรเกาหลี',
    scientificName: 'Ficus microcarpa',
    category: 'ไม้ล้อม',
    plantType: 'ไม้ล้อม',
    measurementType: 'ความสูง',
    suppliers: [],
    hasSuppliers: false
  },
  {
    id: 'plant_3',
    name: 'กันเกรา',
    scientificName: 'Mimusops elengi',
    category: 'ไม้ล้อม',
    plantType: 'ไม้ล้อม',
    measurementType: 'ขนาดลำต้น',
    suppliers: [],
    hasSuppliers: false
  },
  {
    id: 'plant_4',
    name: 'หญ้าแฝก',
    scientificName: 'Vetiveria zizanioides',
    category: 'ไม้คลุมดิน',
    plantType: 'ไม้คลุมดิน',
    measurementType: 'ขนาดถุงดำ',
    suppliers: [],
    hasSuppliers: false
  },
  {
    id: 'plant_5',
    name: 'มะขามป้อม',
    scientificName: 'Phyllanthus emblica',
    category: 'ไม้ล้อม',
    plantType: 'ไม้ล้อม',
    measurementType: 'ขนาดลำต้น',
    suppliers: [],
    hasSuppliers: false
  },
  {
    id: 'plant_6',
    name: 'ชบา',
    scientificName: 'Hibiscus rosa-sinensis',
    category: 'ไม้ประดับ',
    plantType: 'ไม้ประดับ',
    measurementType: 'ความสูง',
    suppliers: [],
    hasSuppliers: false
  },
  {
    id: 'plant_7',
    name: 'บอนไซ',
    scientificName: 'Bonsai',
    category: 'บอนไซ',
    plantType: 'บอนไซ',
    measurementType: 'ความสูง',
    suppliers: [],
    hasSuppliers: false
  },
  {
    id: 'plant_8',
    name: 'แคคตัส',
    scientificName: 'Cactaceae',
    category: 'แคคตัส',
    plantType: 'แคคตัส',
    measurementType: 'ขนาดกระถาง',
    suppliers: [],
    hasSuppliers: false
  },
  {
    id: 'plant_9',
    name: 'กล้วยไม้',
    scientificName: 'Orchidaceae',
    category: 'กล้วยไม้',
    plantType: 'กล้วยไม้',
    measurementType: 'จำนวนกิ่ง',
    suppliers: [],
    hasSuppliers: false
  },
  {
    id: 'plant_10',
    name: 'ไม้ใบ',
    scientificName: 'Foliage Plants',
    category: 'ไม้ใบ',
    plantType: 'ไม้ใบ',
    measurementType: 'ความสูง',
    suppliers: [],
    hasSuppliers: false
  }
];

// ฟังก์ชันสำหรับเริ่มต้นข้อมูล
export const initializeBasePlants = (): void => {
  const existingData = localStorage.getItem('plantsData');
  if (!existingData) {
    localStorage.setItem('plantsData', JSON.stringify(basePlants));
    console.log('เริ่มต้นข้อมูลพื้นฐานต้นไม้แล้ว');
  }
};
