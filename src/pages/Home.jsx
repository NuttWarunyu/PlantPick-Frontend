import React, { useState } from "react";
import { identifyPlant } from "../api/identify.js";
import "../styles.css";

function Home() {
  const [plantName, setPlantName] = useState("");
  const [deals, setDeals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [identifyResult, setIdentifyResult] = useState(null);
  const [specialDealLink, setSpecialDealLink] = useState("");

  const searchPlant = async (searchName) => {
    const nameToSearch = searchName || plantName;
    if (!nameToSearch.trim()) {
      alert("กรุณากรอกชื่อต้นไม้");
      return;
    }

    setLoading(true);
    setError(null);
    setDeals(null);
    try {
      // ดึงข้อมูลต้นไม้จาก OpenAI ผ่าน identifyPlant
      const result = await identifyPlant(nameToSearch, false);
      if (result.error) {
        throw new Error(result.error);
      }
      setIdentifyResult(result);

      // ดึงดีลจาก API เดิม
      const response = await fetch(
        `https://plantpick-backend.up.railway.app/search-by-name?name=${encodeURIComponent(
          nameToSearch
        )}`,
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      console.error("Error searching plant:", error);
      setError("เกิดข้อผิดพลาดในการค้นหา: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchPlant();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return alert("📸 กรุณาเลือกไฟล์รูปภาพ");

    setLoading(true);
    setError(null);
    setIdentifyResult(null);
    try {
      const result = await identifyPlant(imageFile, true);
      if (result.error) {
        throw new Error(result.error);
      }
      setIdentifyResult(result);
      if (result.plant_info && result.plant_info.name) {
        setPlantName(result.plant_info.name);
        searchPlant(result.plant_info.name);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการระบุต้นไม้: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addSpecialDeal = () => {
    if (specialDealLink.includes("shopee")) {
      alert("กำลังพัฒนาการเชื่อมต่อ Shopee API...");
    } else {
      alert("กรุณาใส่ลิงก์จาก Shopee เท่านั้น");
    }
  };

  return (
    <div className="home">
      <section className="search-section">
        <h2>ค้นหาต้นไม้เดี๋ยวนี้!</h2>
        <input
          type="text"
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)}
          placeholder="เช่น ไทรใบสัก"
          className="border p-2 rounded"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !plantName.trim()}
          className="ml-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {loading ? "กำลังค้นหา..." : "ค้นหา"}
        </button>
      </section>

      <section className="upload-section">
        <h2>หรืออัพโหลดรูปภาพเพื่อระบุต้นไม้</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-2"
        />
        <button
          onClick={handleUpload}
          disabled={loading || !imageFile}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          {loading ? "🔄 กำลังระบุ..." : "🔍 ระบุต้นไม้"}
        </button>
      </section>

      {loading && <div className="loading">กำลังโหลด...</div>}
      {error && <div className="error text-red-500">{error}</div>}

      {identifyResult && identifyResult.plant_info && (
        <section className="identify-results mt-4 flex justify-center">
          <div className="identify-card bg-white p-4 rounded shadow-md w-1/2">
            <h2 className="text-xl font-bold mb-2">ผลการระบุต้นไม้</h2>
            <h3>{identifyResult.plant_info.name}</h3>
            <p>
              <strong>ราคาตลาด:</strong> {identifyResult.plant_info.price}
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
              <div className="mt-4">
                <h3 className="text-lg font-bold">ต้นไม้ที่เกี่ยวข้อง</h3>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {identifyResult.related_plants.map((plant, index) => (
                    <div
                      key={index}
                      className="related-card bg-white p-2 rounded shadow"
                    >
                      <h4>{plant.name}</h4>
                      <p>
                        <strong>ราคา:</strong> {plant.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </section>
      )}

      {deals && deals.best_deal && (
        <section className="results mt-4 flex justify-center">
          <div className="deal-card best-deal bg-white p-4 rounded shadow-md w-1/2">
            <h2 className="text-xl font-bold mb-2">ผลลัพธ์การค้นหา</h2>
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
              className="text-blue-500 underline"
            >
              ซื้อเลย!
            </a>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold">ดีลที่เกี่ยวข้อง</h3>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {deals.related_deals && deals.related_deals.length > 0 ? (
                deals.related_deals.map((deal, index) => (
                  <div
                    key={index}
                    className="deal-card bg-white p-2 rounded shadow"
                  >
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
                      className="text-blue-500 underline"
                    >
                      ดูดีลนี้
                    </a>
                  </div>
                ))
              ) : (
                <div className="no-related">ไม่มีดีลที่เกี่ยวข้อง</div>
              )}
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={specialDealLink}
                onChange={(e) => setSpecialDealLink(e.target.value)}
                placeholder="ใส่ลิงก์ Shopee"
                className="border p-2 rounded w-full"
              />
              <button
                onClick={addSpecialDeal}
                className="mt-2 bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
              >
                เพิ่มดีลพิเศษ
              </button>
            </div>
          </div>
        </section>
      )}

      {!loading && !error && !deals && !identifyResult && (
        <div className="no-results mt-4 text-center">
          กรุณาค้นหาต้นไม้เพื่อดูผลลัพธ์
        </div>
      )}
    </div>
  );
}

export default Home;
