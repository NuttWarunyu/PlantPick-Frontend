import React, { useState, useCallback } from "react";
import "../styles.css";

function TestShopeeAPI() {
  const [keyword, setKeyword] = useState("ต้นพยับหมอก");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchShopeeProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/shopee/shopee-products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword, page: 0 }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setProducts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [keyword, API_URL]);

  return (
    <div className="home">
      <div className="home-container">
        <h3>ทดสอบ Shopee Affiliate API</h3>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="กรอกชื่อต้นไม้ (เช่น ต้นพยับหมอก)"
          className="search-bar"
        />
        <button onClick={fetchShopeeProducts} disabled={loading}>
          {loading ? "กำลังโหลด..." : "ค้นหา"}
        </button>

        {error && (
          <div className="notification notification-error">{error}</div>
        )}

        {products.length > 0 && (
          <div className="category-section">
            <h4>ผลลัพธ์สินค้า ({products.length} รายการ):</h4>
            <div className="cute-items">
              {products.map((product, index) => (
                <div key={index} className="cute-card">
                  <h4>{product.productLink.split("/").pop()}</h4>
                  <p>ราคา: {product.price} บาท</p> {/* ลบการหาร 100000 */}
                  <p>
                    คอมมิชชัน:{" "}
                    {(parseFloat(product.commissionRate) * 100).toFixed(2)}%
                  </p>
                  <a
                    href={product.offerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cute-button"
                  >
                    ซื้อที่ Shopee
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestShopeeAPI;
