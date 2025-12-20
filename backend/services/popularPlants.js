// 🌿 คลังต้นไม้ยอดนิยมในประเทศไทย - ดึงจากฐานข้อมูลจริง

const { db } = require('../database');

// Mapping จาก category ของ AI ไปยัง category/plantType ในฐานข้อมูล
const CATEGORY_MAPPING = {
  'focal_tree': ['ไม้ล้อม', 'ไม้ประดับ'], // ไม้ยืนต้นหลัก
  'columnar': ['ไม้ล้อม', 'ไม้ประดับ'], // ไม้ทรงเสา
  'round_shrub': ['ไม้ประดับ', 'ไม้ล้อม'], // ไม้พุ่มทรงกลม
  'silver_unique': ['ไม้ประดับ'], // ไม้ใบเงิน/ฟอร์มแปลก
  'low_shrub_groundcover': ['ไม้คลุมดิน', 'ไม้ประดับ'], // ไม้พุ่มเตี้ย/คลุมดิน
  'flowering': ['ไม้ดอก'], // ไม้ดอก
  'fence': ['ไม้ล้อม', 'ไม้ประดับ'] // ไม้รั้ว
};

// Cache สำหรับเก็บต้นไม้ยอดนิยม (refresh ทุก 1 ชั่วโมง)
let popularPlantsCache = {
  data: {},
  timestamp: null,
  TTL: 60 * 60 * 1000 // 1 ชั่วโมง
};

// ฟังก์ชันดึงต้นไม้ยอดนิยมจากฐานข้อมูล (พร้อม cache)
async function getPopularPlantsFromDB(category) {
  const now = Date.now();
  
  // ตรวจสอบ cache
  if (popularPlantsCache.data[category] && 
      popularPlantsCache.timestamp && 
      (now - popularPlantsCache.timestamp) < popularPlantsCache.TTL) {
    return popularPlantsCache.data[category];
  }
  
  try {
    // ดึงต้นไม้ยอดนิยมตามหมวดหมู่
    const categories = CATEGORY_MAPPING[category] || ['ไม้ประดับ', 'ไม้ล้อม', 'ไม้ดอก', 'ไม้คลุมดิน'];
    
    // ใช้ getPopularPlantsByCategories เพื่อดึงหลายหมวดหมู่พร้อมกัน
    const allPlants = await db.getPopularPlantsByCategories(categories, 20);
    
    // เรียงตาม popularity (supplier count)
    allPlants.sort((a, b) => {
      const aScore = a.popularity?.supplierCount || 0;
      const bScore = b.popularity?.supplierCount || 0;
      return bScore - aScore;
    });
    
    // เก็บใน cache
    popularPlantsCache.data[category] = allPlants;
    popularPlantsCache.timestamp = now;
    
    console.log(`📊 ดึงต้นไม้ยอดนิยมสำหรับหมวดหมู่ "${category}": ${allPlants.length} ต้น`);
    
    return allPlants;
  } catch (error) {
    console.error('❌ Error fetching popular plants from database:', error);
    return [];
  }
}

// ฟังก์ชันหาต้นไม้ที่ใกล้เคียงจากคลัง (ดึงจากฐานข้อมูล)
async function findSimilarPlant(plantName, category) {
  if (!plantName || !category) return null;
  
  try {
    const popularPlants = await getPopularPlantsFromDB(category);
    
    if (popularPlants.length === 0) return null;
    
    // หาต้นไม้ที่ชื่อตรงกันหรือใกล้เคียง
    const normalizedName = plantName.toLowerCase().trim();
    
    // ตรวจสอบชื่อตรงกัน
    for (const plant of popularPlants) {
      if (plant.name.toLowerCase() === normalizedName) {
        return plant.name;
      }
    }
    
    // ตรวจสอบชื่อที่คล้ายกัน (มีคำบางส่วนตรงกัน)
    for (const plant of popularPlants) {
      const normalizedPlant = plant.name.toLowerCase();
      if (normalizedName.includes(normalizedPlant) || normalizedPlant.includes(normalizedName)) {
        return plant.name;
      }
    }
    
    // ถ้าไม่เจอ ให้คืนต้นไม้ยอดนิยมที่สุดในหมวดหมู่ (มี suppliers มากที่สุด)
    return popularPlants[0]?.name || null;
  } catch (error) {
    console.error('❌ Error finding similar plant:', error);
    return null;
  }
}

// ฟังก์ชันดึงต้นไม้ยอดนิยมตามหมวดหมู่
async function getPopularPlantsByCategory(category, limit = 5) {
  try {
    const plants = await getPopularPlantsFromDB(category);
    return plants.slice(0, limit).map(p => p.name);
  } catch (error) {
    console.error('❌ Error getting popular plants by category:', error);
    return [];
  }
}

// ฟังก์ชันดึงต้นไม้ทั้งหมดในหมวดหมู่พร้อม popularity
async function getAllPlantsByCategory(category) {
  try {
    return await getPopularPlantsFromDB(category);
  } catch (error) {
    console.error('❌ Error getting all plants by category:', error);
    return [];
  }
}

module.exports = {
  findSimilarPlant,
  getPopularPlantsByCategory,
  getAllPlantsByCategory,
  getPopularPlantsFromDB
};

