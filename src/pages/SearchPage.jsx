import React, { useState, useCallback } from "react";
import { identifyPlant } from "../api/identify.js";

function Home() {
  const [plantName, setPlantName] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isUploading, setIsUploading] = useState(false);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      showNotification("ไฟล์รูปภาพถูกเลือกแล้ว", "info");
      await handleUpload(file); // เรียก handleUpload ด้วยไฟล์ทันที
    }
  };

  const handleUpload = useCallback(async (file) => {
    if (!file) {
      showNotification("กรุณาเลือกไฟล์รูปภาพ", "error");
      return;
    }
    setIsUploading(true);
    try {
      const result = await identifyPlant(file, true);
      if (result.error) {
        throw new Error(result.error);
      }
      showNotification("ระบุต้นไม้สำเร็จ!", "success");
      window.location.href = `/identify-result?name=${encodeURIComponent(
        result.plant_info.name
      )}`;
    } catch (error) {
      console.error("Upload error:", error);
      showNotification("เกิดข้อผิดพลาดในการระบุต้นไม้", "error");
    } finally {
      setIsUploading(false);
    }
  }, []); // ใช้ useCallback เพื่อป้องกันการ re-render สูญเปล่า

  const handleSearch = () => {
    if (!plantName.trim()) {
      showNotification("กรุณากรอกชื่อต้นไม้", "error");
      return;
    }
    window.location.href = `/search-results?name=${encodeURIComponent(
      plantName
    )}`;
  };

  return (
    <div className="home">
      {notification.message && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="home-container">
        <div className="search-section">
          <input
            type="text"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            placeholder="ค้นหาต้นไม้หรืออัปโหลดภาพ..."
            className="search-bar"
          />
          <div className="action-buttons">
            <button
              className="action-button camera-button"
              disabled={isUploading}
            >
              <span className="icon">📸</span> อัพรูป
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
            </button>
            <button
              onClick={handleSearch}
              className="action-button search-button"
              disabled={isUploading}
            >
              <span className="icon">🔍</span> ค้นหาดีล
            </button>
          </div>

          {isUploading && (
            <div className="mt-4 text-center text-gray-500 animate-pulse">
              กำลังวิเคราะห์...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
