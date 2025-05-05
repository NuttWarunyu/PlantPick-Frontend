import React, { useState } from "react";
import { identifyPlant } from "../api/identify.js";

function Home() {
  const [plantName, setPlantName] = useState("");
  const [deals, setDeals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [identifyResult, setIdentifyResult] = useState(null);

  // เสิร์ชชื่อ
  const searchPlant = async () => {
    if (!plantName.trim()) {
      alert("กรุณากรอกชื่อต้นไม้");
      return;
    }

    setLoading(true);
    setError(null);
    setDeals(null);
    try {
      console.log(
        "Sending request to:",
        `https://plantpick-backend.up.railway.app/search-by-name?name=${encodeURIComponent(
          plantName
        )}`
      );
      const response = await fetch(
        `https://plantpick-backend.up.railway.app/search-by-name?name=${encodeURIComponent(
          plantName
        )}`,
        {
          headers: { accept: "application/json" },
        }
      );
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API Response for search-by-name:", data);
      setDeals(data);
    } catch (error) {
      console.error("Error searching plant:", error);
      setError("เกิดข้อผิดพลาดในการค้นหาดีล: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    console.log("Search button clicked with plantName:", plantName);
    searchPlant();
  };

  // เสิร์ชรูป
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      console.log(
        "File selected:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type
      );
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      alert("📸 กรุณาเลือกไฟล์รูปภาพ");
      return;
    }

    setLoading(true);
    setError(null);
    setIdentifyResult(null);
    try {
      console.log("Uploading image...");
      const result = await identifyPlant(imageFile);
      if (result.error) {
        throw new Error(result.error);
      }
      console.log("API response:", result);
      setIdentifyResult(result);

      if (result.plant_info && result.plant_info.name) {
        setPlantName(result.plant_info.name);
        console.log("Searching by name:", result.plant_info.name);
        searchPlant();
      }
    } catch (error) {
      console.error("Error identifying plant:", error);
      setError("เกิดข้อผิดพลาดในการระบุต้นไม้: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <section className="search-section">
        <h2>ค้นหาดีลเดี๋ยวนี้!</h2>
        <input
          type="text"
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)}
          placeholder="เช่น ไทรใบสัก"
        />
        <button onClick={handleSearch} disabled={loading || !plantName.trim()}>
          {loading ? "กำลังค้นหา..." : "ค้นหาดีล"}
        </button>
      </section>

      <section className="upload-section">
        <h2>หรืออัพโหลดรูปภาพเพื่อระบุต้นไม้</h2>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button onClick={handleUpload} disabled={loading || !imageFile}>
          {loading ? "🔄 กำลังระบุ..." : "🔍 ระบุต้นไม้"}
        </button>
      </section>

      {loading && <div className="loading">กำลังโหลด...</div>}
      {error && <div className="error">{error}</div>}

      {identifyResult && identifyResult.plant_info ? (
        <section className="identify-results">
          <h2>ผลการระบุต้นไม้</h2>
          <div className="identify-card">
            <h3>{identifyResult.plant_info.name}</h3>
            <p>
              <strong>ราคา:</strong> {identifyResult.plant_info.price}
            </p>
            <p>
              <strong>คำอธิบาย:</strong> {identifyResult.plant_info.description}
            </p>
            <p>
              <strong>การดูแล:</strong>{" "}
              {identifyResult.plant_info.careInstructions}
            </p>
            <p>
              <strong>ไอเดียจัดสวน:</strong>{" "}
              {identifyResult.plant_info.gardenIdeas}
            </p>
          </div>
          {identifyResult.related_plants &&
            identifyResult.related_plants.length > 0 && (
              <>
                <h3>ต้นไม้ที่เกี่ยวข้อง</h3>
                <div className="related-plants">
                  {identifyResult.related_plants.map((plant, index) => (
                    <div key={index} className="related-card">
                      <h4>{plant.name}</h4>
                      <p>
                        <strong>ราคา:</strong> {plant.price}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
        </section>
      ) : null}

      {deals ? (
        deals.best_deal ? (
          <section className="results">
            <h2>ดีลที่ดีที่สุดสำหรับคุณ!</h2>
            <div className="deal-card best-deal">
              <h3>{deals.best_deal.plant_name}</h3>
              <p>
                <strong>ร้าน:</strong> {deals.best_deal.shop_name}
              </p>
              <p>
                <strong>ราคา:</strong> {deals.best_deal.price} บาท
              </p>
              <p>
                <strong>คะแนน:</strong> {deals.best_deal.rating}/5
              </p>
              <a
                href={deals.best_deal.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                ซื้อเลย!
              </a>
            </div>
            <h3>ดีลอื่น ๆ ที่น่าสนใจ</h3>
            <div className="deal-cards">
              {deals.related_deals && deals.related_deals.length > 0 ? (
                deals.related_deals.map((deal, index) => (
                  <div key={index} className="deal-card">
                    <h4>{deal.plant_name}</h4>
                    <p>
                      <strong>ร้าน:</strong> {deal.shop_name}
                    </p>
                    <p>
                      <strong>ราคา:</strong> {deal.price} บาท
                    </p>
                    <p>
                      <strong>คะแนน:</strong> {deal.rating}/5
                    </p>
                    <a
                      href={deal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ดูดีลนี้
                    </a>
                  </div>
                ))
              ) : (
                <div className="no-related">ไม่มีดีลอื่น ๆ</div>
              )}
            </div>
          </section>
        ) : (
          <div className="no-results">ไม่พบดีลสำหรับ {plantName}</div>
        )
      ) : (
        !loading &&
        !error && <div className="no-results">กรุณาค้นหาดีลเพื่อดูผลลัพธ์</div>
      )}
    </div>
  );
}

export default Home;
