const fs = require('fs');

// ข้อมูลต้นไม้ตัวอย่าง
const plantCategories = {
  'ไม้ประดับ': {
    'ไม้ใบ': [
      'มอนสเตอร่า เดลิซิโอซ่า', 'ไทรใบสัก', 'ฟิโลเดนดรอน', 'ยางอินเดีย', 'ยางใบเล็ก',
      'ยางใบใหญ่', 'ยางใบสัก', 'ยางใบกลม', 'ยางใบแหลม', 'ยางใบหยัก',
      'ยางใบเรียบ', 'ยางใบขรุขระ', 'ยางใบมัน', 'ยางใบด้าน', 'ยางใบหนา',
      'ยางใบบาง', 'ยางใบแข็ง', 'ยางใบนุ่ม', 'ยางใบยาว', 'ยางใบสั้น'
    ],
    'ไม้ดอก': [
      'กุหลาบแดง', 'กุหลาบขาว', 'กุหลาบเหลือง', 'กุหลาบชมพู', 'กุหลาบส้ม',
      'กุหลาบม่วง', 'กุหลาบดำ', 'กุหลาบสองสี', 'กุหลาบสามสี', 'กุหลาบลาย',
      'กุหลาบหอม', 'กุหลาบไร้หนาม', 'กุหลาบหนาม', 'กุหลาบใหญ่', 'กุหลาบเล็ก',
      'กุหลาบกลาง', 'กุหลาบสูง', 'กุหลาบเตี้ย', 'กุหลาบแคระ', 'กุหลาบยักษ์'
    ]
  },
  'ไม้ล้อม': {
    'ไม้ล้อม': [
      'ไทรเกาหลี', 'กันเกรา', 'ไผ่สีสุก', 'ไผ่ดำ', 'ไผ่เหลือง',
      'ไผ่เขียว', 'ไผ่แดง', 'ไผ่ขาว', 'ไผ่ลาย', 'ไผ่หอม',
      'ไผ่ใหญ่', 'ไผ่เล็ก', 'ไผ่กลาง', 'ไผ่สูง', 'ไผ่เตี้ย',
      'ไผ่แคระ', 'ไผ่ยักษ์', 'ไผ่หนา', 'ไผ่บาง', 'ไผ่แข็ง'
    ]
  },
  'ไม้คลุมดิน': {
    'ไม้คลุมดิน': [
      'หญ้าแฝก', 'หญ้าญี่ปุ่น', 'หญ้าจีน', 'หญ้าไทย', 'หญ้าอเมริกัน',
      'หญ้าแอฟริกัน', 'หญ้าเอเชีย', 'หญ้ายุโรป', 'หญ้าออสเตรเลีย', 'หญ้าแคนาดา',
      'หญ้าใหญ่', 'หญ้าเล็ก', 'หญ้ากลาง', 'หญ้าสูง', 'หญ้าเตี้ย',
      'หญ้าแคระ', 'หญ้ายักษ์', 'หญ้าหนา', 'หญ้าบาง', 'หญ้าแข็ง'
    ]
  },
  'แคคตัส': {
    'แคคตัส': [
      'แคคตัสบอล', 'แคคตัสเสา', 'แคคตัสแบน', 'แคคตัสกลม', 'แคคตัสยาว',
      'แคคตัสสั้น', 'แคคตัสใหญ่', 'แคคตัสเล็ก', 'แคคตัสกลาง', 'แคคตัสสูง',
      'แคคตัสเตี้ย', 'แคคตัสแคระ', 'แคคตัสยักษ์', 'แคคตัสหนา', 'แคคตัสบาง',
      'แคคตัสแข็ง', 'แคคตัสนุ่ม', 'แคคตัสแหลม', 'แคคตัสเรียบ', 'แคคตัสขรุขระ'
    ]
  },
  'บอนไซ': {
    'บอนไซ': [
      'บอนไซไทร', 'บอนไซสน', 'บอนไซมะขาม', 'บอนไซไผ่', 'บอนไซยาง',
      'บอนไซกุหลาบ', 'บอนไซชบา', 'บอนไซชวนชม', 'บอนไซเข็ม', 'บอนไซเข็มแดง',
      'บอนไซเข็มขาว', 'บอนไซเข็มเหลือง', 'บอนไซเข็มชมพู', 'บอนไซเข็มม่วง', 'บอนไซเข็มส้ม',
      'บอนไซเข็มดำ', 'บอนไซเข็มสองสี', 'บอนไซเข็มสามสี', 'บอนไซเข็มลาย', 'บอนไซเข็มหอม'
    ]
  },
  'กล้วยไม้': {
    'กล้วยไม้': [
      'กล้วยไม้แคทลียา', 'กล้วยไม้หวาย', 'กล้วยไม้รองเท้านารี', 'กล้วยไม้ฟาแลน', 'กล้วยไม้แวนดา',
      'กล้วยไม้ออนซิเดียม', 'กล้วยไม้เดนโดรเบียม', 'กล้วยไม้ซิมบิเดียม', 'กล้วยไม้อีพิเดนดรัม', 'กล้วยไม้บราสซาโวลา',
      'กล้วยไม้ใหญ่', 'กล้วยไม้เล็ก', 'กล้วยไม้กลาง', 'กล้วยไม้สูง', 'กล้วยไม้เตี้ย',
      'กล้วยไม้แคระ', 'กล้วยไม้ยักษ์', 'กล้วยไม้หนา', 'กล้วยไม้บาง', 'กล้วยไม้แข็ง'
    ]
  }
};

const measurementTypes = ['ความสูง', 'ขนาดลำต้น', 'ขนาดถุงดำ', 'ขนาดกระถาง', 'จำนวนกิ่ง'];
const descriptions = [
  'ไม้ประดับใบสวย เหมาะสำหรับตกแต่งภายใน',
  'ไม้ประดับใบใหญ่ เหมาะสำหรับตกแต่งห้อง',
  'ไม้ดอกสวยงาม เหมาะสำหรับจัดสวน',
  'แคคตัสทรงกลม เหมาะสำหรับตกแต่งโต๊ะทำงาน',
  'ไม้ล้อมที่นิยมใช้ทำรั้ว',
  'บอนไซที่นิยมเลี้ยงในบ้าน',
  'ไม้ประดับใบเขียวสวย',
  'กล้วยไม้ดอกสวยงาม',
  'ไม้ล้อมที่นิยมใช้ทำรั้ว',
  'ไม้คลุมดินที่นิยมใช้ป้องกันดินพังทลาย'
];

function generateScientificName(plantName) {
  const genus = plantName.split(' ')[0];
  const species = plantName.split(' ').slice(1).join(' ').toLowerCase().replace(/\s+/g, '');
  return `${genus} ${species}`;
}

function generatePlants() {
  let plants = [];
  let id = 1;

  // สร้างข้อมูลต้นไม้ 1,000 ชนิด
  for (let i = 0; i < 1000; i++) {
    const categories = Object.keys(plantCategories);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const plantTypes = Object.keys(plantCategories[randomCategory]);
    const randomPlantType = plantTypes[Math.floor(Math.random() * plantTypes.length)];
    const plantNames = plantCategories[randomCategory][randomPlantType];
    const randomPlantName = plantNames[Math.floor(Math.random() * plantNames.length)];
    
    // เพิ่มหมายเลขเพื่อให้ชื่อไม่ซ้ำ
    const plantName = `${randomPlantName} ${i + 1}`;
    const scientificName = generateScientificName(plantName);
    const measurementType = measurementTypes[Math.floor(Math.random() * measurementTypes.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    plants.push({
      name: plantName,
      scientificName: scientificName,
      category: randomCategory,
      plantType: randomPlantType,
      measurementType: measurementType,
      description: description
    });
  }

  return plants;
}

function generateCSV() {
  const plants = generatePlants();
  const headers = ['name', 'scientificName', 'category', 'plantType', 'measurementType', 'description'];
  
  let csv = headers.join(',') + '\n';
  
  plants.forEach(plant => {
    const row = [
      plant.name,
      plant.scientificName,
      plant.category,
      plant.plantType,
      plant.measurementType,
      plant.description
    ].map(field => `"${field}"`).join(',');
    csv += row + '\n';
  });

  return csv;
}

// สร้างไฟล์ CSV
const csvContent = generateCSV();
fs.writeFileSync('plants1000.csv', csvContent, 'utf8');
console.log('สร้างไฟล์ plants1000.csv เรียบร้อยแล้ว');
console.log(`จำนวนต้นไม้: ${csvContent.split('\n').length - 2} ชนิด`);

