import React, { useState } from "react";
import { identifyPlant } from "../api/identify.js";
import "../styles.css";

function Home() {
  const [plantName, setPlantName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isUploading, setIsUploading] = useState(false);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      showNotification("ไฟล์รูปภาพถูกเลือกแล้ว", "info");
      handleUpload(); // เรียก handleUpload ทันทีหลังเลือกไฟล์
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      showNotification("กรุณาเลือกไฟล์รูปภาพ", "error");
      return;
    }
    setIsUploading(true);
    try {
      const result = await identifyPlant(imageFile, true);
      if (result.error) {
        throw new Error(result.error);
      }
      showNotification("ระบุต้นไม้สำเร็จ!", "success");
      window.location.href = `/identify-result?name=${encodeURIComponent(
        result.plant_info.name
      )}`;
    } catch {
      showNotification("เกิดข้อผิดพลาดในการระบุต้นไม้", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = () => {
    if (!plantName.trim()) {
      showNotification("กรุณากรอกชื่อต้นไม้", "error");
      return;
    }
    window.location.href = `/search-result?name=${encodeURIComponent(
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
              <span className="icon">📸</span> ใช้กล้อง
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
