import React, { useState, useEffect } from "react";

function PopularPlants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularPlants = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://plantpick-backend.up.railway.app/popular-plants",
          {
            headers: { accept: "application/json" },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch popular plants");
        }
        const data = await response.json();
        setPlants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPlants();
  }, []);

  if (loading) {
    return <div className="loading">กำลังโหลดดีลยอดนิยม...</div>;
  }

  if (error) {
    return <div className="error">เกิดข้อผิดพลาด: {error}</div>;
  }

  return (
    <div className="popular-plants">
      <h2>ดีลยอดนิยม</h2>
      <div className="deal-cards">
        {plants.map((plant, index) => (
          <div key={index} className="deal-card">
            <h3>{plant.name}</h3>
            <p>
              <strong>ร้าน:</strong> {plant.shop_name}
            </p>
            <p>
              <strong>ราคา:</strong> {plant.price} บาท
            </p>
            <p>
              <strong>คะแนน:</strong> {plant.rating}/5
            </p>
            <a href={plant.link} target="_blank" rel="noopener noreferrer">
              ดูดีลนี้
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PopularPlants;
