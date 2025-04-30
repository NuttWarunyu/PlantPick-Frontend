import { useState } from "react";
import { identifyPlant } from "../api/identify.js";
import "../Home.css"; // ย้อนขึ้นไป 1 ระดับจาก /src/pages ไป /src

function Home() {
  const [searchMode, setSearchMode] = useState("image"); // "image" หรือ "name"
  const [plantInfo, setPlantInfo] = useState(null);
  const [relatedPlants, setRelatedPlants] = useState([]);
  const [image, setImage] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    console.log("File selected:", event.target.files[0]);
    setImage(event.target.files[0]);
  };

  const handleNameChange = (event) => {
    setSearchName(event.target.value);
  };

  const handleImageSearch = async () => {
    if (!image) return alert("📸 กรุณาเลือกไฟล์รูปภาพ");

    setLoading(true);
    console.log("Uploading image...");
    const result = await identifyPlant(image);
    setLoading(false);

    if (result.plant_info) {
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

  const handleNameSearch = async () => {
    if (!searchName) return alert("🌳 กรุณาป้อนชื่อต้นไม้");

    setLoading(true);
    console.log("Searching by name:", searchName);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/search-by-name?name=${encodeURIComponent(searchName)}`
      );
      if (!response.ok) {
        throw new Error("Failed to search plant by name");
      }
      const result = await response.json();
      setPlantInfo(result.plant_info);
      setRelatedPlants(result.related_plants || []);
    } catch (error) {
      console.error("Error searching plant by name:", error);
      alert("❌ ไม่สามารถค้นหาด้วยชื่อได้: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Intro Section */}
      {!plantInfo && (
        <section className="intro-section">
          <h2>ค้นหาต้นไม้ 🌳</h2>
          <p>ค้นหาด้วยรูปภาพหรือชื่อต้นไม้เพื่อดูข้อมูลและแหล่งซื้อ</p>
        </section>
      )}

      {/* Search Mode Selection */}
      <section className="search-mode-section">
        <label>
          <input
            type="radio"
            value="image"
            checked={searchMode === "image"}
            onChange={() => setSearchMode("image")}
          />
          ค้นหาด้วยรูปภาพ
        </label>
        <label>
          <input
            type="radio"
            value="name"
            checked={searchMode === "name"}
            onChange={() => setSearchMode("name")}
          />
          ค้นหาด้วยชื่อ
        </label>
      </section>

      {/* Search Input Section */}
      <section className="search-section">
        {searchMode === "image" ? (
          <div className="search-input-group">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleImageSearch} disabled={loading}>
              {loading ? (
                "🔄 กำลังค้นหา..."
              ) : (
                <>
                  <span className="search-icon">🔍</span> ค้นหา
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="search-input-group">
            <input
              type="text"
              placeholder="ป้อนชื่อต้นไม้ (เช่น เฟื่องฟ้า)"
              value={searchName}
              onChange={handleNameChange}
            />
            <button onClick={handleNameSearch} disabled={loading}>
              {loading ? (
                "🔄 กำลังค้นหา..."
              ) : (
                <>
                  <span className="search-icon">🔍</span> ค้นหา
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* Result Section */}
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
