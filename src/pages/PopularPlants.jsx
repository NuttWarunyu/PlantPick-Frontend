import React, { useState, useEffect } from "react";
import "../PopularPlants.css";

function PopularPlants() {
  const [popularPlants, setPopularPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularPlants = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/popular-plants`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch popular plants");
        }
        const data = await response.json();
        setPopularPlants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPlants();
  }, []);

  if (loading) {
    return <div className="container">กำลังหาดีลเด็ด ๆ ให้อยู่นะ...</div>;
  }

  if (error) {
    return <div className="container">เกิดข้อผิดพลาด: {error}</div>;
  }

  return (
    <div className="container">
      <section className="intro-section">
        <h2>ต้นไม้สุดฮิตที่ทุกคนรัก 🌟</h2>
        <p>
          เราคัดดีลเด็ด ๆ มาให้แล้ว! หาต้นไม้ถูกสุด ส่งไวสุด
          ไม่ต้องไปหาที่ไหนไกลเลย
        </p>
      </section>

      <section className="popular-plants-section">
        <ul>
          {popularPlants.map((plant, index) => (
            <li key={index} className="plant-card">
              <h3>{plant.name}</h3>
              <p>ลักษณะ: {plant.description}</p>
              <p className="deal-info">
                <span className="deal-label">ดีลเด็ดจาก:</span> {plant.shopName}
              </p>
              <p className="deal-info">
                <span className="deal-label">ถูกสุดแค่:</span> {plant.price}
              </p>
              <p className="deal-info">
                <span className="deal-label">ส่งไวสุด:</span>{" "}
                {plant.shippingTime}
              </p>
              <a
                href={plant.link}
                target="_blank"
                rel="noopener noreferrer"
                className="buy-link"
              >
                ไปช้อปเลยที่ Shopee 🌱
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="affiliate-link">
        <a
          href="https://shopee.co.th/search?keyword=อุปกรณ์ทำสวน"
          target="_blank"
          rel="noopener noreferrer"
        >
          อยากได้อุปกรณ์ทำสวน? ไปช้อปที่ Shopee กัน 🌿
        </a>
      </div>
    </div>
  );
}

export default PopularPlants;
