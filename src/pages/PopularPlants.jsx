import React from "react";
import "../styles.css";

function PopularPlants() {
  // Mock data for popular plants and garden decor
  const popularPlants = [
    { name: "ไทรใบสัก", price: 150 },
    { name: "ยางอินเดีย", price: 200 },
    { name: "ลิ้นมังกร", price: 120 },
    { name: "มอนสเตร่า", price: 300 },
    { name: "เฟิร์นบอสตัน", price: 180 },
    { name: "พลูด่าง", price: 250 },
    { name: "เดหลี", price: 90 },
    { name: "บอนสี", price: 220 },
    { name: "ว่านสี่ทิศ", price: 160 },
  ];

  const gardenDecor = [
    { name: "กระถางเซรามิก", price: 100 },
    { name: "ที่ตั้งต้นไม้", price: 250 },
    { name: "น้ำพุ mini", price: 400 },
    { name: "หินตกแต่ง", price: 80 },
    { name: "ไฟประดับสวน", price: 150 },
    { name: "เก้าอี้สวน", price: 300 },
    { name: "โต๊ะไม้เล็ก", price: 200 },
    { name: "กรรไกรตัดแต่ง", price: 120 },
    { name: "ปุ๋ยออแกนิค", price: 90 },
  ];

  return (
    <div className="popular-plants-page">
      <section className="popular-plants mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">ต้นไม้ยอดนิยม</h2>
        <div className="grid grid-cols-3 gap-4">
          {popularPlants.map((plant, index) => (
            <div
              key={index}
              className="popular-card bg-white p-4 rounded shadow text-center"
            >
              <h4 className="font-bold">{plant.name}</h4>
              <p>{plant.price} บาท</p>
            </div>
          ))}
        </div>
      </section>

      <section className="garden-decor mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">ตกแต่งสวน</h2>
        <div className="grid grid-cols-3 gap-4">
          {gardenDecor.map((item, index) => (
            <div
              key={index}
              className="decor-card bg-white p-4 rounded shadow text-center"
            >
              <h4 className="font-bold">{item.name}</h4>
              <p>{item.price} บาท</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PopularPlants;
