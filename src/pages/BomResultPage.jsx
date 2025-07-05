import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../components/ui/BOMSection.css";

const BomResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bomData, setBomData] = useState(null);
  const [resultImage, setResultImage] = useState(null);

  useEffect(() => {
    if (location.state && location.state.bom && location.state.resultImage) {
      setBomData(location.state.bom);
      setResultImage(location.state.resultImage);
    } else {
      navigate("/"); // กลับหน้าแรก ถ้าไม่มีข้อมูล
    }
  }, [location, navigate]);

  if (!bomData || !resultImage)
    return <p className="text-center text-gray-600">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🧾 รายการวัสดุจัดสวน</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        {/* แสดงรูปสวน */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            ภาพสวนที่ออกแบบ
          </h2>
          <img
            src={resultImage}
            alt="Designed Garden"
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
        </div>

        {/* ตาราง BOM */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-green-100">
                <th className="border p-3 text-left text-gray-700 font-semibold">
                  ลำดับ
                </th>
                <th className="border p-3 text-left text-gray-700 font-semibold">
                  รายการ
                </th>
                <th className="border p-3 text-left text-gray-700 font-semibold">
                  จำนวน
                </th>
                <th className="border p-3 text-left text-gray-700 font-semibold">
                  ราคา (บาท)
                </th>
              </tr>
            </thead>
            <tbody>
              {bomData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="border p-3 text-gray-600">{index + 1}</td>
                  <td className="border p-3 text-gray-600">
                    {item.material_name}
                  </td>
                  <td className="border p-3 text-gray-600">{item.quantity}</td>
                  <td className="border p-3 text-gray-600">
                    {(item.estimated_cost * 33).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold">📞 สนใจให้เราจัดสวนให้จริง?</h2>
          <p className="mb-4">ติดต่อเราผ่านช่องทางใดก็ได้:</p>
          <div className="space-y-2">
            <a
              href="https://line.me/ti/p/@PlantPick"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Line
            </a>
            <a
              href="/contact-form"
              className="block bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              แบบฟอร์มติดต่อ
            </a>
            <a
              href="tel:0912345678"
              className="block bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
            >
              โทร: 091-234-5678
            </a>
            <a
              href="https://wa.me/66912345678"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-green-700 text-white p-2 rounded hover:bg-green-800"
            >
              WhatsApp
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            * คลิกเพื่อขอใบเสนอราคาเต็มรูปแบบ อาจต้องสมัครสมาชิก
          </p>
        </div>
      </div>
    </div>
  );
};

export default BomResultPage;
