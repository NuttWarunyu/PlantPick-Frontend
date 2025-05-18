import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles.css";

function SearchResults() {
  const [plantInfo, setPlantInfo] = useState(null);
  const [affiliateOffers, setAffiliateOffers] = useState([]);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(true); // เพิ่ม state loading
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const plantName = searchParams.get("name");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchPlantInfo = async () => {
      setLoading(true); // เริ่มโหลด
      if (!plantName) {
        setPlantInfo({
          name: "กรุณากรอกชื่อต้นไม้",
          price: "ไม่มีข้อมูล",
          description: "ไม่มีข้อมูล",
          careInstructions: "ไม่มีข้อมูล",
          gardenIdeas: "ไม่มีข้อมูล",
          affiliateLink: "https://shopee.co.th/plant-link",
        });
        setAffiliateOffers([]);
        setImageBase64(null);
        setLoading(false); // หยุดโหลดถ้าไม่มีชื่อ
        return;
      }
      const encodedPlantName = encodeURIComponent(plantName);
      try {
        const response = await fetch(
          `${API_URL}/identify/?name=${encodedPlantName}`,
          {
            mode: "cors",
            credentials: "include",
          }
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
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
        setAffiliateOffers(data.affiliate_offers || []);
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
        setLoading(false); // หยุดโหลดไม่ว่าผลจะสำเร็จหรือล้มเหลว
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

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    ); // แสดง spinner ขณะโหลด
  }

  if (!plantInfo) return <div>ไม่พบข้อมูลต้นไม้</div>;

  // เรียงลำดับ affiliateOffers จากราคาถูกสุดไปแพงสุด (จำกัด 5 อันดับแรก)
  const sortedOffers = [...affiliateOffers]
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    .slice(0, 5);

  return (
    <div className="home">
      <div className="home-container">
        {/* ส่วนที่ 1: สรุปต้นไม้หลัก */}
        <div className="category-section plant-main">
          <h3 className="category-title">
            <span className="category-icon">🌱</span> {plantInfo.name}
          </h3>
          <div className="plant-card">
            {imageBase64 && (
              <img
                src={`data:image/jpeg;base64,${imageBase64}`}
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
                  <p className="offer-shop">
                    {offer.shopName || "Shopee Store"}
                  </p>
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
            ค้นหาด้วยรูป
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchResults;
