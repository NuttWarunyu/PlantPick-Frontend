// src/pages/BomResultPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../components/ui/BOMSection.css"; // ปรับ path ตามโครงสร้าง

const BomResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bomData, setBomData] = useState(null);

  useEffect(() => {
    if (location.state && location.state.bom) {
      setBomData(location.state.bom);
    } else {
      navigate("/"); // กลับหน้าแรก ถ้าไม่มีข้อมูล
    }
  }, [location, navigate]);

  return (
    <div style={{ padding: "24px" }}>
      <h1>🧾 รายการวัสดุจัดสวน</h1>

      {bomData ? (
        <div style={{ marginTop: "20px" }}>
          <table
            border="1"
            cellPadding="8"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>รายการ</th>
                <th>จำนวน</th>
                <th>ราคา</th>
              </tr>
            </thead>
            <tbody>
              {bomData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price} บาท</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "32px" }}>
            <h2>📞 สนใจให้เราจัดสวนให้จริง?</h2>
            <p>ติดต่อเราผ่านช่องทางใดก็ได้:</p>
            <ul>
              <li>
                <a
                  href="https://line.me/ti/p/..."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Line
                </a>
              </li>
              <li>
                <a href="/contact-form">แบบฟอร์มติดต่อ</a>
              </li>
              <li>
                <a href="tel:0912345678">โทร: 091-234-5678</a>
              </li>
              <li>
                <a
                  href="https://wa.me/66912345678"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <p>กำลังโหลดข้อมูล...</p>
      )}
    </div>
  );
};

export default BomResultPage;
