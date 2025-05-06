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
  const [notification, setNotification] = useState({ message: "", type: "" });

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const searchPlant = async (searchName) => {
    const nameToSearch = searchName || plantName;
    if (!nameToSearch.trim()) {
      showNotification("กรุณากรอกชื่อต้นไม้", "error");
      return;
    }

    setLoading(true);
    setError(null);
    setDeals(null);
    try {
      const result = await identifyPlant(nameToSearch, false);
      if (result.error) {
        throw new Error(result.error);
      }
      setIdentifyResult(result);

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
      showNotification("ค้นหาสำเร็จ!", "success");
    } catch (error) {
      console.error("Error searching plant:", error);
      setError("เกิดข้อผิดพลาดในการค้นหา: " + error.message);
      showNotification("เกิดข้อผิดพลาดในการค้นหา", "error");
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
      showNotification("ไฟล์รูปภาพถูกเลือกแล้ว", "info");
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return showNotification("กรุณาเลือกไฟล์รูปภาพ", "error");

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
      showNotification("ระบุต้นไม้สำเร็จ!", "success");
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการระบุต้นไม้: " + error.message);
      showNotification("เกิดข้อผิดพลาดในการระบุต้นไม้", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setPlantName("");
    setImageFile(null);
    setIdentifyResult(null);
    setDeals(null);
    setError(null);
    setSpecialDealLink("");
    showNotification("รีเซ็ตข้อมูลสำเร็จ", "info");
  };

  const addSpecialDeal = () => {
    if (specialDealLink.includes("shopee")) {
      showNotification("กำลังพัฒนาการเชื่อมต่อ Shopee API...", "info");
    } else {
      showNotification("กรุณาใส่ลิงก์จาก Shopee เท่านั้น", "error");
    }
  };

  return (
    <div className="home">
      {notification.message && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <section className="search-section">
        <h2 className="text-xl font-bold text-green-800">
          🌿 ค้นหาต้นไม้เดี๋ยวนี้!
        </h2>
        <div className="flex items-center mt-2 justify-center">
          <input
            type="text"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            placeholder="เช่น ไทรใบสัก"
            className="border p-2 rounded w-full max-w-md"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !plantName.trim()}
            className="ml-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center"
          >
            🔍 {loading ? "กำลังค้นหา..." : "ค้นหา"}
          </button>
          <button
            onClick={resetSearch}
            className="ml-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            รีเซ็ต
          </button>
        </div>
      </section>

      <section className="upload-section">
        <h2 className="text-xl font-bold text-green-800">
          📸 หรืออัพโหลดรูปภาพเพื่อระบุต้นไม้
        </h2>
        <div className="flex items-center mt-2 justify-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border p-2 rounded w-full max-w-md"
          />
          <button
            onClick={handleUpload}
            disabled={loading || !imageFile}
            className="ml-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center"
          >
            📸 {loading ? "🔄 กำลังระบุ..." : "🔍 ระบุต้นไม้"}
          </button>
        </div>
      </section>

      {loading && (
        <div className="loading text-center text-gray-600 mt-4">
          กำลังโหลด...
        </div>
      )}
      {error && (
        <div className="error text-red-500 text-center mt-4">{error}</div>
      )}

      {identifyResult && identifyResult.plant_info && (
        <section className="identify-results mt-4 flex justify-center">
          <div className="identify-card bg-white p-4 rounded shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-2 text-green-800">
              ผลการระบุต้นไม้
            </h2>
            <h3 className="text-lg font-semibold text-brown-700">
              {identifyResult.plant_info.name}
            </h3>
            <p className="text-gray-700">
              <strong>ราคาตลาด:</strong> {identifyResult.plant_info.price}
            </p>
            <p className="text-gray-700">
              <strong>คำอธิบาย:</strong> {identifyResult.plant_info.description}
            </p>
            <p className="text-gray-700">
              <strong>การดูแล:</strong>{" "}
              {identifyResult.plant_info.careInstructions}
            </p>
            <p className="text-gray-700">
              <strong>ไอเดียจัดสวน:</strong>{" "}
              {identifyResult.plant_info.gardenIdeas}
            </p>
          </div>
        </section>
      )}

      {identifyResult &&
        identifyResult.related_plants &&
        identifyResult.related_plants.length > 0 && (
          <section className="related-plants mt-4">
            <h3 className="text-lg font-bold text-green-800 text-center">
              ต้นไม้ที่เกี่ยวข้อง
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {identifyResult.related_plants.map((plant, index) => (
                <div
                  key={index}
                  className="related-card bg-white p-2 rounded shadow mx-auto max-w-xs"
                >
                  <h4 className="text-brown-700">{plant.name}</h4>
                  <p className="text-gray-600">
                    <strong>ราคา:</strong> {plant.price}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      {deals && deals.best_deal && (
        <section className="results mt-4 flex justify-center">
          <div className="deal-card best-deal bg-white p-4 rounded shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-2 text-green-800">
              ผลลัพธ์การค้นหา
            </h2>
            <h3 className="text-lg font-semibold text-brown-700">
              {deals.best_deal.plant_name}
            </h3>
            <p className="text-gray-700">
              <strong>ร้าน:</strong> {deals.best_deal.shop_name}
            </p>
            <p className="text-gray-700">
              <strong>ราคา:</strong> {deals.best_deal.price} บาท
            </p>
            <p className="text-gray-700">
              <strong>คะแนน:</strong> {deals.best_deal.rating}/5
            </p>
            <a
              href={deals.best_deal.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 underline hover:text-green-800"
            >
              ซื้อเลย!
            </a>
          </div>
        </section>
      )}

      {deals && (
        <section className="related-deals mt-4">
          <h3 className="text-lg font-bold text-green-800 text-center">
            ดีลที่เกี่ยวข้อง
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {deals.related_deals && deals.related_deals.length > 0 ? (
              deals.related_deals.map((deal, index) => (
                <div
                  key={index}
                  className="deal-card bg-white p-2 rounded shadow mx-auto max-w-xs"
                >
                  <h4 className="text-brown-700">{deal.plant_name}</h4>
                  <p className="text-gray-700">
                    <strong>ร้าน:</strong> {deal.shop_name}
                  </p>
                  <p className="text-gray-700">
                    <strong>ราคา:</strong> {deal.price} บาท
                  </p>
                  <p className="text-gray-700">
                    <strong>คะแนน:</strong> {deal.rating}/5
                  </p>
                  <a
                    href={deal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 underline hover:text-green-800"
                  >
                    ดูดีลนี้
                  </a>
                </div>
              ))
            ) : (
              <div className="no-related text-gray-600 text-center">
                ไม่มีดีลที่เกี่ยวข้อง
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-center">
            <input
              type="text"
              value={specialDealLink}
              onChange={(e) => setSpecialDealLink(e.target.value)}
              placeholder="ใส่ลิงก์ Shopee"
              className="border p-2 rounded w-full max-w-md"
            />
            <button
              onClick={addSpecialDeal}
              className="ml-2 bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
            >
              เพิ่มดีลพิเศษ
            </button>
          </div>
        </section>
      )}

      {!loading && !error && !deals && !identifyResult && (
        <div className="no-results mt-4 text-center text-gray-600">
          กรุณาค้นหาต้นไม้เพื่อดูผลลัพธ์
        </div>
      )}
    </div>
  );
}

export default Home;
