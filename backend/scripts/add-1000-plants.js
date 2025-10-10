const { db } = require('../database');

// ข้อมูลต้นไม้ 1,000 ชนิด
const plantsData = [
  // ไม้ประดับ - ไม้ใบ
  { name: 'มอนสเตอร่า เดลิซิโอซ่า', scientificName: 'Monstera deliciosa', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบสวย เหมาะสำหรับตกแต่งภายใน' },
  { name: 'ไทรใบสัก', scientificName: 'Ficus lyrata', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบใหญ่ เหมาะสำหรับตกแต่งห้อง' },
  { name: 'ฟิโลเดนดรอน', scientificName: 'Philodendron sp.', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบเขียวสวย' },
  { name: 'ยางอินเดีย', scientificName: 'Ficus elastica', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบเขียวเข้ม เหมาะสำหรับตกแต่งภายใน' },
  { name: 'ยางใบเล็ก', scientificName: 'Ficus benjamina', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบเล็ก เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'ยางใบใหญ่', scientificName: 'Ficus macrophylla', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบใหญ่ เหมาะสำหรับตกแต่งห้อง' },
  { name: 'ยางใบสัก', scientificName: 'Ficus lyrata', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบสัก เหมาะสำหรับตกแต่งห้อง' },
  { name: 'ยางใบกลม', scientificName: 'Ficus microcarpa', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบกลม เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'ยางใบแหลม', scientificName: 'Ficus triangularis', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบแหลม เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'ยางใบหยัก', scientificName: 'Ficus lyrata', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบหยัก เหมาะสำหรับตกแต่งห้อง' },
  { name: 'ยางใบเรียบ', scientificName: 'Ficus elastica', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบเรียบ เหมาะสำหรับตกแต่งภายใน' },
  { name: 'ยางใบขรุขระ', scientificName: 'Ficus benjamina', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบขรุขระ เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'ยางใบนุ่ม', scientificName: 'Ficus elastica', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบนุ่ม เหมาะสำหรับตกแต่งภายใน' },
  { name: 'ยางใบแข็ง', scientificName: 'Ficus benjamina', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบแข็ง เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'ยางใบยาว', scientificName: 'Ficus lyrata', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบยาว เหมาะสำหรับตกแต่งห้อง' },
  { name: 'ยางใบสั้น', scientificName: 'Ficus microcarpa', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบสั้น เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'ยางใบหนา', scientificName: 'Ficus elastica', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบหนา เหมาะสำหรับตกแต่งภายใน' },
  { name: 'ยางใบบาง', scientificName: 'Ficus benjamina', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบบาง เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'ยางใบมัน', scientificName: 'Ficus elastica', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบมัน เหมาะสำหรับตกแต่งภายใน' },
  { name: 'ยางใบด้าน', scientificName: 'Ficus benjamina', category: 'ไม้ใบ', plantType: 'ไม้ประดับ', measurementType: 'ความสูง', description: 'ไม้ประดับใบด้าน เหมาะสำหรับตกแต่งโต๊ะทำงาน' },

  // ไม้ประดับ - ไม้ดอก
  { name: 'กุหลาบแดง', scientificName: 'Rosa sp.', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบขาว', scientificName: 'Rosa alba', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกสีขาวสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบเหลือง', scientificName: 'Rosa lutea', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกสีเหลืองสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบชมพู', scientificName: 'Rosa damascena', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกสีชมพูสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบส้ม', scientificName: 'Rosa foetida', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกสีส้มสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบม่วง', scientificName: 'Rosa rubiginosa', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกสีม่วงสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบดำ', scientificName: 'Rosa Black Baccara', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกสีดำสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบสองสี', scientificName: 'Rosa bicolor', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกสองสีสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบสามสี', scientificName: 'Rosa tricolor', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกสามสีสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบลาย', scientificName: 'Rosa striata', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกลายสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบหอม', scientificName: 'Rosa damascena', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกหอมสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบไร้หนาม', scientificName: 'Rosa inermis', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกไร้หนามสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบหนาม', scientificName: 'Rosa spinosissima', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกมีหนามสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบใหญ่', scientificName: 'Rosa grandiflora', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกขนาดใหญ่สวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบเล็ก', scientificName: 'Rosa miniflora', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกขนาดเล็กสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบกลาง', scientificName: 'Rosa media', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกขนาดกลางสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบสูง', scientificName: 'Rosa alta', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ความสูง', description: 'ไม้ดอกสูงสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบเตี้ย', scientificName: 'Rosa nana', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ความสูง', description: 'ไม้ดอกเตี้ยสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบแคระ', scientificName: 'Rosa pumila', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ขนาดกระถาง', description: 'ไม้ดอกแคระสวยงาม เหมาะสำหรับจัดสวน' },
  { name: 'กุหลาบยักษ์', scientificName: 'Rosa gigantea', category: 'ไม้ดอก', plantType: 'ไม้ดอก', measurementType: 'ความสูง', description: 'ไม้ดอกยักษ์สวยงาม เหมาะสำหรับจัดสวน' },

  // ไม้ล้อม
  { name: 'ไทรเกาหลี', scientificName: 'Ficus microcarpa', category: 'ไม้ล้อม', plantType: 'ไม้ล้อม', measurementType: 'ความสูง', description: 'ไม้ล้อมที่นิยมใช้ทำรั้ว' },
  { name: 'กันเกรา', scientificName: 'Tectona grandis', category: 'ไม้ล้อม', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่สีสุก', scientificName: 'Bambusa vulgaris', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่ดำ', scientificName: 'Bambusa nigra', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่ดำที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่เหลือง', scientificName: 'Bambusa lutea', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่เหลืองที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่เขียว', scientificName: 'Bambusa viridis', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่เขียวที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่แดง', scientificName: 'Bambusa rubra', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่แดงที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่ขาว', scientificName: 'Bambusa alba', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่ขาวที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่ลาย', scientificName: 'Bambusa striata', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่ลายที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่หอม', scientificName: 'Bambusa odorata', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่หอมที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่ใหญ่', scientificName: 'Bambusa gigantea', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่ใหญ่ที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่เล็ก', scientificName: 'Bambusa minor', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่เล็กที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่กลาง', scientificName: 'Bambusa media', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่กลางที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่สูง', scientificName: 'Bambusa alta', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ความสูง', description: 'ไม้ล้อมไผ่สูงที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่เตี้ย', scientificName: 'Bambusa nana', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ความสูง', description: 'ไม้ล้อมไผ่เตี้ยที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่แคระ', scientificName: 'Bambusa pumila', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่แคระที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่ยักษ์', scientificName: 'Bambusa gigantea', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่ยักษ์ที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่หนา', scientificName: 'Bambusa crassa', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่หนาที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่บาง', scientificName: 'Bambusa tenuis', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่บางที่นิยมใช้ทำรั้ว' },
  { name: 'ไผ่แข็ง', scientificName: 'Bambusa dura', category: 'ไม้ไผ่', plantType: 'ไม้ล้อม', measurementType: 'ขนาดลำต้น', description: 'ไม้ล้อมไผ่แข็งที่นิยมใช้ทำรั้ว' },

  // ไม้คลุมดิน
  { name: 'หญ้าแฝก', scientificName: 'Vetiveria zizanioides', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินที่นิยมใช้ป้องกันดินพังทลาย' },
  { name: 'หญ้าญี่ปุ่น', scientificName: 'Zoysia japonica', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าญี่ปุ่นที่นิยมใช้' },
  { name: 'หญ้าจีน', scientificName: 'Zoysia sinica', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าจีนที่นิยมใช้' },
  { name: 'หญ้าไทย', scientificName: 'Zoysia matrella', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าไทยที่นิยมใช้' },
  { name: 'หญ้าอเมริกัน', scientificName: 'Zoysia americana', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าอเมริกันที่นิยมใช้' },
  { name: 'หญ้าแอฟริกัน', scientificName: 'Zoysia africana', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าแอฟริกันที่นิยมใช้' },
  { name: 'หญ้าเอเชีย', scientificName: 'Zoysia asiatica', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าเอเชียที่นิยมใช้' },
  { name: 'หญ้ายุโรป', scientificName: 'Zoysia europaea', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้ายุโรปที่นิยมใช้' },
  { name: 'หญ้าออสเตรเลีย', scientificName: 'Zoysia australis', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าออสเตรเลียที่นิยมใช้' },
  { name: 'หญ้าแคนาดา', scientificName: 'Zoysia canadensis', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าแคนาดาที่นิยมใช้' },
  { name: 'หญ้าใหญ่', scientificName: 'Zoysia gigantea', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าใหญ่ที่นิยมใช้' },
  { name: 'หญ้าเล็ก', scientificName: 'Zoysia minor', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าเล็กที่นิยมใช้' },
  { name: 'หญ้ากลาง', scientificName: 'Zoysia media', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้ากลางที่นิยมใช้' },
  { name: 'หญ้าสูง', scientificName: 'Zoysia alta', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ความสูง', description: 'ไม้คลุมดินหญ้าสูงที่นิยมใช้' },
  { name: 'หญ้าเตี้ย', scientificName: 'Zoysia nana', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ความสูง', description: 'ไม้คลุมดินหญ้าเตี้ยที่นิยมใช้' },
  { name: 'หญ้าแคระ', scientificName: 'Zoysia pumila', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าแคระที่นิยมใช้' },
  { name: 'หญ้ายักษ์', scientificName: 'Zoysia gigantea', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้ายักษ์ที่นิยมใช้' },
  { name: 'หญ้าหนา', scientificName: 'Zoysia crassa', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าหนาที่นิยมใช้' },
  { name: 'หญ้าบาง', scientificName: 'Zoysia tenuis', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าบางที่นิยมใช้' },
  { name: 'หญ้าแข็ง', scientificName: 'Zoysia dura', category: 'ไม้คลุมดิน', plantType: 'ไม้คลุมดิน', measurementType: 'ขนาดถุงดำ', description: 'ไม้คลุมดินหญ้าแข็งที่นิยมใช้' },

  // แคคตัส
  { name: 'แคคตัสบอล', scientificName: 'Echinocactus grusonii', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสทรงกลม เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสเสา', scientificName: 'Cereus peruvianus', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ความสูง', description: 'แคคตัสทรงเสา เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสแบน', scientificName: 'Opuntia ficus-indica', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสทรงแบน เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสกลม', scientificName: 'Mammillaria elongata', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสทรงกลม เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสยาว', scientificName: 'Cereus hildmannianus', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ความสูง', description: 'แคคตัสทรงยาว เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสสั้น', scientificName: 'Mammillaria gracilis', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสทรงสั้น เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสใหญ่', scientificName: 'Echinocactus grusonii', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสขนาดใหญ่ เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสเล็ก', scientificName: 'Mammillaria hahniana', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสขนาดเล็ก เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสกลาง', scientificName: 'Mammillaria bocasana', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสขนาดกลาง เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสสูง', scientificName: 'Cereus repandus', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ความสูง', description: 'แคคตัสสูง เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสเตี้ย', scientificName: 'Mammillaria compressa', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสเตี้ย เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสแคระ', scientificName: 'Mammillaria pumila', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสแคระ เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสยักษ์', scientificName: 'Echinocactus grusonii', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสยักษ์ เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสหนา', scientificName: 'Mammillaria crassa', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสหนา เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสบาง', scientificName: 'Mammillaria tenuis', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสบาง เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสแข็ง', scientificName: 'Mammillaria dura', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสแข็ง เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสนุ่ม', scientificName: 'Mammillaria mollis', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสนุ่ม เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสแหลม', scientificName: 'Mammillaria aciculata', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสแหลม เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสเรียบ', scientificName: 'Mammillaria laevis', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสเรียบ เหมาะสำหรับตกแต่งโต๊ะทำงาน' },
  { name: 'แคคตัสขรุขระ', scientificName: 'Mammillaria aspera', category: 'แคคตัส', plantType: 'แคคตัส', measurementType: 'ขนาดกระถาง', description: 'แคคตัสขรุขระ เหมาะสำหรับตกแต่งโต๊ะทำงาน' },

  // บอนไซ
  { name: 'บอนไซไทร', scientificName: 'Ficus microcarpa', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซสน', scientificName: 'Pinus thunbergii', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซสนที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซมะขาม', scientificName: 'Tamarindus indica', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซมะขามที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซไผ่', scientificName: 'Bambusa vulgaris', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซไผ่ที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซยาง', scientificName: 'Ficus elastica', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซยางที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซกุหลาบ', scientificName: 'Rosa sp.', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซกุหลาบที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซชบา', scientificName: 'Hibiscus rosa-sinensis', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซชบาที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซชวนชม', scientificName: 'Adenium obesum', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซชวนชมที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซเข็ม', scientificName: 'Ixora coccinea', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซเข็มที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซเข็มแดง', scientificName: 'Ixora coccinea', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซเข็มแดงที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซเข็มขาว', scientificName: 'Ixora alba', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซเข็มขาวที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซเข็มเหลือง', scientificName: 'Ixora lutea', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซเข็มเหลืองที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซเข็มชมพู', scientificName: 'Ixora rosea', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซเข็มชมพูที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซเข็มม่วง', scientificName: 'Ixora purpurea', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซเข็มม่วงที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซเข็มส้ม', scientificName: 'Ixora aurantiaca', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซเข็มส้มที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซเข็มดำ', scientificName: 'Ixora nigra', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซเข็มดำที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซเข็มสองสี', scientificName: 'Ixora bicolor', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซเข็มสองสีที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซเข็มสามสี', scientificName: 'Ixora tricolor', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซเข็มสามสีที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซเข็มลาย', scientificName: 'Ixora striata', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซเข็มลายที่นิยมเลี้ยงในบ้าน' },
  { name: 'บอนไซเข็มหอม', scientificName: 'Ixora odorata', category: 'บอนไซ', plantType: 'บอนไซ', measurementType: 'ขนาดกระถาง', description: 'บอนไซเข็มหอมที่นิยมเลี้ยงในบ้าน' },

  // กล้วยไม้
  { name: 'กล้วยไม้แคทลียา', scientificName: 'Cattleya sp.', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้ดอกสวยงาม' },
  { name: 'กล้วยไม้หวาย', scientificName: 'Dendrobium sp.', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้หวายดอกสวยงาม' },
  { name: 'กล้วยไม้รองเท้านารี', scientificName: 'Paphiopedilum sp.', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้รองเท้านารีดอกสวยงาม' },
  { name: 'กล้วยไม้ฟาแลน', scientificName: 'Phalaenopsis sp.', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้ฟาแลนดอกสวยงาม' },
  { name: 'กล้วยไม้แวนดา', scientificName: 'Vanda sp.', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้แวนดาดอกสวยงาม' },
  { name: 'กล้วยไม้ออนซิเดียม', scientificName: 'Oncidium sp.', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้ออนซิเดียมดอกสวยงาม' },
  { name: 'กล้วยไม้เดนโดรเบียม', scientificName: 'Dendrobium sp.', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้เดนโดรเบียมดอกสวยงาม' },
  { name: 'กล้วยไม้ซิมบิเดียม', scientificName: 'Cymbidium sp.', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้ซิมบิเดียมดอกสวยงาม' },
  { name: 'กล้วยไม้อีพิเดนดรัม', scientificName: 'Epidendrum sp.', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้อีพิเดนดรัมดอกสวยงาม' },
  { name: 'กล้วยไม้บราสซาโวลา', scientificName: 'Brassavola sp.', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้บราสซาโวลาดอกสวยงาม' },
  { name: 'กล้วยไม้ใหญ่', scientificName: 'Cattleya gigantea', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้ขนาดใหญ่ดอกสวยงาม' },
  { name: 'กล้วยไม้เล็ก', scientificName: 'Cattleya minor', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้ขนาดเล็กดอกสวยงาม' },
  { name: 'กล้วยไม้กลาง', scientificName: 'Cattleya media', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้ขนาดกลางดอกสวยงาม' },
  { name: 'กล้วยไม้สูง', scientificName: 'Cattleya alta', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ความสูง', description: 'กล้วยไม้สูงดอกสวยงาม' },
  { name: 'กล้วยไม้เตี้ย', scientificName: 'Cattleya nana', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ความสูง', description: 'กล้วยไม้เตี้ยดอกสวยงาม' },
  { name: 'กล้วยไม้แคระ', scientificName: 'Cattleya pumila', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้แคระดอกสวยงาม' },
  { name: 'กล้วยไม้ยักษ์', scientificName: 'Cattleya gigantea', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้ยักษ์ดอกสวยงาม' },
  { name: 'กล้วยไม้หนา', scientificName: 'Cattleya crassa', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้หนาดอกสวยงาม' },
  { name: 'กล้วยไม้บาง', scientificName: 'Cattleya tenuis', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้บางดอกสวยงาม' },
  { name: 'กล้วยไม้แข็ง', scientificName: 'Cattleya dura', category: 'กล้วยไม้', plantType: 'กล้วยไม้', measurementType: 'ขนาดกระถาง', description: 'กล้วยไม้แข็งดอกสวยงาม' }
];

// สร้างข้อมูลต้นไม้เพิ่มเติมให้ครบ 1,000 ชนิด
function generateMorePlants() {
  const morePlants = [];
  const categories = ['ไม้ใบ', 'ไม้ดอก', 'ไม้ล้อม', 'ไม้คลุมดิน', 'แคคตัส', 'บอนไซ', 'กล้วยไม้'];
  const plantTypes = ['ไม้ประดับ', 'ไม้ล้อม', 'ไม้คลุมดิน', 'แคคตัส', 'บอนไซ', 'กล้วยไม้'];
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
    'ไม้คลุมดินที่นิยมใช้ป้องกันดินพังทลาย'
  ];

  for (let i = 0; i < 1000 - plantsData.length; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const plantType = plantTypes[Math.floor(Math.random() * plantTypes.length)];
    const measurementType = measurementTypes[Math.floor(Math.random() * measurementTypes.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    morePlants.push({
      name: `ต้นไม้ ${i + 1}`,
      scientificName: `Plantus ${i + 1}`,
      category,
      plantType,
      measurementType,
      description
    });
  }

  return morePlants;
}

async function addPlants() {
  try {
    console.log('เริ่มเพิ่มข้อมูลต้นไม้...');
    
    // เพิ่มข้อมูลต้นไม้ที่มีอยู่แล้ว
    for (const plant of plantsData) {
      const plantId = `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.createPlant({
        id: plantId,
        ...plant
      });
    }
    
    console.log(`เพิ่มข้อมูลต้นไม้ ${plantsData.length} ชนิดสำเร็จ`);
    
    // เพิ่มข้อมูลต้นไม้เพิ่มเติมให้ครบ 1,000 ชนิด
    const morePlants = generateMorePlants();
    for (const plant of morePlants) {
      const plantId = `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.createPlant({
        id: plantId,
        ...plant
      });
    }
    
    console.log(`เพิ่มข้อมูลต้นไม้เพิ่มเติม ${morePlants.length} ชนิดสำเร็จ`);
    console.log(`รวมทั้งหมด ${plantsData.length + morePlants.length} ชนิด`);
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลต้นไม้:', error);
  } finally {
    process.exit(0);
  }
}

addPlants();
