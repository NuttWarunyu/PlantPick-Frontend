import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function IdentifyResult() {
  const [plantInfo, setPlantInfo] = useState(null);
  const [affiliateOffers, setAffiliateOffers] = useState([]);
  const [imageBase64, setImageBase64] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false); // เพิ่ม state สำหรับการโหลด
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const plantName = searchParams.get("name");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true); // เริ่มโหลด
    try {
      const response = await fetch(`${API_URL}/identify/`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: formData,
      });
      const data = await response.json();
      setPlantInfo(data.plant_info);
      setAffiliateOffers(data.affiliate_offers);
      setImageBase64(data.image_base64);
      setUploadedImage(URL.createObjectURL(file));
    } catch (error) {
      console.error("Error uploading image:", error);
      setPlantInfo({
        name: "ไม่สามารถระบุได้",
        price: "ไม่มีข้อมูล",
        description: "ไม่มีข้อมูล",
        careInstructions: "ไม่มีข้อมูล",
        gardenIdeas: "ไม่มีข้อมูล",
        affiliateLink: "https://shopee.co.th/plant-link",
      });
      setAffiliateOffers([]);
      setImageBase64(null);
    } finally {
      setLoading(false); // หยุดโหลดเมื่อเสร็จ
    }
  };

  useEffect(() => {
    const fetchPlantInfo = async () => {
      if (!plantName) return;
      const encodedPlantName = encodeURIComponent(plantName);
      setLoading(true); // เริ่มโหลด
      try {
        const response = await fetch(
          `${API_URL}/identify/?name=${encodedPlantName}`,
          {
            mode: "cors",
            credentials: "include",
          }
        );
        const data = await response.json();
        setPlantInfo(data.plant_info);
        setAffiliateOffers(data.affiliate_offers);
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
        setAffiliateOffers([]);
        setImageBase64(null);
      } finally {
        setLoading(false); // หยุดโหลดเมื่อเสร็จ
      }
    };

    fetchPlantInfo();
  }, [plantName, API_URL]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `พบต้นไม้: ${plantInfo?.name}`,
          text: `มาดูข้อมูลต้นไม้ ${plantInfo?.name} กัน!`,
          url: window.location.href,
        })
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("ฟังก์ชันแชร์ไม่รองรับในเบราว์เซอร์นี้");
    }
  };

  // แสดง spinner ขณะโหลด
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!plantInfo) return <div>Loading...</div>;

  // เรียงลำดับ affiliateOffers จากราคาถูกสุดไปแพงสุด (จำกัด 5 อันดับแรก)
  const sortedOffers = [...affiliateOffers]
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    .slice(0, 5);

  return (
    <div className="home">
      <div className="home-container">
        {/* ฟอร์มอัปโหลดรูปและการค้นหา */}
        <div className="search-section">
          <input
            type="text"
            className="search-bar"
            placeholder="ค้นหาชื่อต้นไม้..."
            value={plantName || ""}
            onChange={(e) =>
              navigate(
                `/search-results?name=${encodeURIComponent(e.target.value)}`
              )
            }
          />
          <div className="action-buttons">
            <label className="action-button camera-button">
              <span>กล้อง</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
            </label>
            <button
              className="action-button search-button"
              onClick={() =>
                navigate(
                  `/search-results?name=${encodeURIComponent(plantName || "")}`
                )
              }
            >
              ค้นหา
            </button>
          </div>
        </div>

        {/* ส่วนที่ 1: สรุปต้นไม้หลัก */}
        <div className="category-section plant-main">
          <h3 className="category-title">
            <span className="category-icon">🌱</span> {plantInfo.name}
          </h3>
          <div className="plant-card">
            {(imageBase64 || uploadedImage) && (
              <img
                src={
                  imageBase64
                    ? `data:image/jpeg;base64,${imageBase64}`
                    : uploadedImage
                }
                alt="Plant"
                className="plant-image"
              />
            )}
            <div className="plant-info">
              <h4 className="plant-price">ราคา: {plantInfo.price}</h4>
              <p className="plant-description">
                <strong>ลักษณะ:</strong> {plantInfo.description}
              </p>
              <p className="plant-description">
                <strong>วิธีดูแล:</strong> {plantInfo.careInstructions}
              </p>
              <p className="plant-description">
                <strong>ไอเดียจัดสวน:</strong> {plantInfo.gardenIdeas}
              </p>
            </div>
          </div>
        </div>

        {/* ส่วนที่ 2: เปรียบเทียบสินค้า (Affiliate Offers) */}
        {sortedOffers.length > 0 && (
          <div className="category-section affiliate-offers">
            <h3 className="category-title">
              <span className="category-icon">📊</span> เปรียบเทียบดีล
            </h3>
            <div className="offers-grid">
              {sortedOffers.map((offer, index) => (
                <div
                  key={index}
                  className={`offer-card ${index === 0 ? "best-deal" : ""}`}
                >
                  <h4 className="offer-price">{offer.price}</h4>
                  <p className="offer-shop">{offer.shopName}</p>
                  <a
                    href={offer.offerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="offer-button"
                  >
                    ดูดีล
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ส่วนที่ 3: เสริม (Optional) */}
        <div className="category-section actions">
          <button className="action-button share-button" onClick={handleShare}>
            แชร์
          </button>
          <button
            className="action-button search-again-button"
            onClick={() => navigate("/identify-result")}
          >
            ค้นหาด้วยรูปใหม่
          </button>
        </div>
      </div>
    </div>
  );
}

export default IdentifyResult;
