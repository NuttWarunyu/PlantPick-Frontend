import React from "react";
import "../PopularPlants.css"; // ปรับ path ให้ถูกต้อง

function PopularPlants() {
  const popularPlants = [
    {
      name: "เฟื่องฟ้า (Bougainvillea)",
      price: "~150 บาท",
      description: "ดอกสีชมพูสดใส ทนต่อสภาพอากาศร้อนและแห้งแล้ง",
      link: "https://shopee.co.th/plant-link",
    },
    {
      name: "ลีลาวดี (Plumbago auriculata)",
      price: "~100 บาท",
      description: "ดอกสีขาว ไม้พุ่มขนาดเล็กถึงขนาดกลาง",
      link: "https://shopee.co.th/plant-link",
    },
    {
      name: "ชบา (Hibiscus)",
      price: "~150 บาท",
      description: "ดอกสีแดงหรือชมพู เหมาะสำหรับสวนทุกสไตล์",
      link: "https://shopee.co.th/plant-link",
    },
  ];

  return (
    <div className="container">
      <section className="intro-section">
        <h2>สำรวจต้นไม้ยอดนิยม 🌟</h2>
        <p>ต้นไม้ที่คนนิยมปลูกและดูแลง่าย</p>
      </section>

      <section className="popular-plants-section">
        <ul>
          {popularPlants.map((plant, index) => (
            <li key={index} className="plant-card">
              <h3>{plant.name}</h3>
              <p>ราคา: {plant.price}</p>
              <p>ลักษณะ: {plant.description}</p>
              <a
                href={plant.link}
                target="_blank"
                rel="noopener noreferrer"
                className="buy-link"
              >
                ซื้อที่ Shopee 🌱
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="affiliate-link">
        <a
          href="https://shopee.co.th/affiliate-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          ซื้ออุปกรณ์ทำสวนที่ Shopee 🌿
        </a>
      </div>
    </div>
  );
}

export default PopularPlants;
