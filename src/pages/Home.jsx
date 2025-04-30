import { useState } from "react";
import { identifyPlant } from "../api/identify.js";

function Home() {
  const [plantInfo, setPlantInfo] = useState(null);
  const [relatedPlants, setRelatedPlants] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log("Rendering Home.jsx: Before input and button");

  const handleFileChange = (event) => {
    console.log("File selected:", event.target.files[0]);
    setImage(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) return alert("📸 กรุณาเลือกไฟล์รูปภาพ");

    setLoading(true);
    console.log("Uploading image...");
    const result = await identifyPlant(image);
    setLoading(false);

    if (result.plant_info) {
      // ตรวจสอบว่า plantInfo เป็น string หรือ object
      if (typeof result.plant_info === "string") {
        setPlantInfo({
          name: result.plant_info.includes("ไม่สามารถระบุ")
            ? "ไม่สามารถระบุได้"
            : result.plant_info.split("\n")[0] || "ไม่สามารถระบุได้",
          price: "ไม่มีข้อมูล",
          description: result.plant_info,
          careInstructions: result.plant_info.includes("การดูแล")
            ? result.plant_info.split("การดูแล")[1]
            : "ไม่มีข้อมูล",
          gardenIdeas: result.plant_info.includes("เหมาะสำหรับ")
            ? result.plant_info.split("เหมาะสำหรับ")[1]
            : "ไม่มีข้อมูล",
          affiliateLink: "https://shopee.co.th/plant-link",
        });
      } else {
        setPlantInfo(result.plant_info);
      }
      setRelatedPlants(result.related_plants || []);
    } else {
      alert(
        "❌ ไม่สามารถวิเคราะห์ภาพได้: " + (result.error || "ไม่ทราบสาเหตุ")
      );
    }
  };

  return (
    <div className="container">
      {/* Intro Section (ก่อนอัปโหลด) */}
      {!plantInfo && (
        <section className="intro-section">
          <h2>ค้นหาต้นไม้จากรูปภาพ 🌳</h2>
          <p>อัปโหลดรูปต้นไม้เพื่อระบุชื่อ ราคา และวิธีดูแล</p>
        </section>
      )}

      {/* Upload Section */}
      <section className="upload-section">
        {console.log("Rendering input and button")}
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "🔄 กำลังค้นหา..." : "🔍 ค้นหา"}
        </button>
      </section>

      {/* Result Section (หลังค้นหา) */}
      {plantInfo && (
        <section className="result-section">
          {plantInfo.imageUrl && (
            <img
              src={plantInfo.imageUrl}
              alt={plantInfo.name}
              className="plant-image"
            />
          )}
          {plantInfo.name === "ไม่สามารถระบุได้" ? (
            <h2>🌿 ไม่สามารถระบุต้นไม้จากภาพนี้ได้</h2>
          ) : (
            <h2>
              <span role="img" aria-label="Plant">
                🌿
              </span>{" "}
              {plantInfo.name}
            </h2>
          )}
          <p className="price">ราคา: {plantInfo.price || "ไม่มีข้อมูล"}</p>
          <p className="description">
            ลักษณะ: {plantInfo.description || "ไม่มีข้อมูล"}
          </p>
          <p className="care">
            วิธีดูแล: {plantInfo.careInstructions || "ไม่มีข้อมูล"}
          </p>
          <p className="garden-ideas">
            ไอเดียจัดสวน: {plantInfo.gardenIdeas || "ไม่มีข้อมูล"}
          </p>
          {plantInfo.name !== "ไม่สามารถระบุได้" && (
            <a
              href={plantInfo.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="buy-link"
            >
              ซื้อที่ Shopee 🌱
            </a>
          )}
          <div className="share-buttons">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              แชร์ไปยัง Facebook 📷
            </a>
            <a
              href={`https://www.instagram.com/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              แชร์ไปยัง Instagram 📷
            </a>
          </div>
          <p className="reference">
            อ้างอิง: กรมวิชาการเกษตร และราคาเฉลี่ยจาก Shopee (เมษายน 2568)
          </p>
        </section>
      )}

      {/* Related Plants Section */}
      {relatedPlants.length > 0 && (
        <section className="related-plants-section">
          <h3>ต้นไม้ใกล้เคียง:</h3>
          <ul>
            {relatedPlants.map((plant, index) => (
              <li key={index}>
                {plant.name} ({plant.price})
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Affiliate Link */}
      {plantInfo && (
        <div className="affiliate-link">
          <a
            href="https://shopee.co.th/affiliate-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            ซื้ออุปกรณ์ทำสวนที่ Shopee 🌿
          </a>
        </div>
      )}
    </div>
  );
}

export default Home;
