import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles.css";

function SearchResults() {
  const [plantInfo, setPlantInfo] = useState(null);
  const [relatedPlants, setRelatedPlants] = useState([]);
  const [imageBase64, setImageBase64] = useState(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const plantName = searchParams.get("name");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  console.log("API_URL being used:", API_URL);
  console.log("Plant name from search:", plantName);

  useEffect(() => {
    const fetchPlantInfo = async () => {
      if (!plantName) {
        console.log("No plant name provided");
        setPlantInfo({
          name: "กรุณากรอกชื่อต้นไม้",
          price: "ไม่มีข้อมูล",
          description: "ไม่มีข้อมูล",
          careInstructions: "ไม่มีข้อมูล",
          gardenIdeas: "ไม่มีข้อมูล",
          affiliateLink: "https://shopee.co.th/plant-link",
        });
        setRelatedPlants([]);
        setImageBase64(null);
        return;
      }
      const encodedPlantName = encodeURIComponent(plantName);
      console.log("Encoded plant name:", encodedPlantName);
      const url = `${API_URL}/identify/?name=${encodedPlantName}`;
      console.log("Fetching from:", url);
      try {
        const response = await fetch(url, {
          mode: "cors",
          credentials: "include",
        });
        console.log("Response status:", response.status);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("Parsed response data:", data);
        setPlantInfo(
          data.plant_info || {
            name: "ไม่พบข้อมูล",
            price: "ไม่มีข้อมูล",
            description: "ไม่มีข้อมูล",
            careInstructions: "ไม่มีข้อมูล",
            gardenIdeas: "ไม่มีข้อมูล",
            affiliateLink: "https://shopee.co.th/plant-link",
          }
        );
        setRelatedPlants(data.related_plants || []);
        setImageBase64(data.image_base64);
      } catch (error) {
        console.error("Error fetching plant info:", error);
        setPlantInfo({
          name: "ไม่สามารถระบุได้",
          price: "ไม่มีข้อมูล",
          description: "ไม่มีข้อมูล",
          careInstructions: "ไม่มีข้อมูล",
          gardenIdeas: "ไม่มีข้อมูล",
          affiliateLink: "https://shopee.co.th/plant-link",
        });
        setRelatedPlants([]);
        setImageBase64(null);
      }
    };

    fetchPlantInfo();
  }, [plantName, API_URL]);

  if (!plantInfo) return <div>Loading...</div>;

  return (
    <div className="home">
      <div className="home-container">
        <div className="category-section">
          <h3 className="category-title">
            <span className="category-icon">🔍</span> ผลการค้นหาต้นไม้:{" "}
            {plantInfo.name}
          </h3>
          <div className="cute-items">
            <div className="cute-card">
              {imageBase64 && (
                <img
                  src={`data:image/jpeg;base64,${imageBase64}`}
                  alt="Searched plant"
                  className="cute-image"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    marginBottom: "10px",
                  }}
                />
              )}
              <h4 className="cute-name">{plantInfo.name}</h4>
              <p className="cute-price">{plantInfo.price}</p>
              <p className="cute-description">{plantInfo.description}</p>
              <p className="cute-description">{plantInfo.careInstructions}</p>
              <p className="cute-description">{plantInfo.gardenIdeas}</p>
              <a
                href={plantInfo.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="cute-button"
              >
                ซื้อที่ Shopee
              </a>
            </div>
          </div>
        </div>

        {relatedPlants.length > 0 && (
          <div className="category-section">
            <h3 className="category-title">
              <span className="category-icon">🌿</span> ต้นไม้ที่เกี่ยวข้อง
            </h3>
            <div className="cute-items">
              {relatedPlants.map((plant, index) => (
                <div key={index} className="cute-card">
                  <h4 className="cute-name">{plant.name}</h4>
                  <p className="cute-price">{plant.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
