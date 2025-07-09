import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiMessageSquare,
  FiShoppingCart,
  FiHome,
  FiTag,
  FiMapPin,
} from "react-icons/fi";

const BomResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    bom: initialBom,
    resultImage: initialImage,
    projectId,
  } = location.state || {};

  // คำนวณราคารวมจากข้อมูล BOM ที่ได้รับมา
  const totalCost = useMemo(() => {
    if (!initialBom) return 0;
    return initialBom.reduce((sum, item) => sum + item.estimated_cost, 0);
  }, [initialBom]);

  // Redirect กลับหน้าแรกหากไม่มีข้อมูล
  useEffect(() => {
    if (!initialBom || !initialImage) {
      navigate("/");
    }
  }, [initialBom, initialImage, navigate]);

  const lineOA_URL = "https://line.me/ti/p/@025hcugd";

  if (!initialBom || !initialImage) {
    return <div className="text-center p-10">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="w-full">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-2 text-center">
          🧾 สรุปรายการและงบประมาณ
        </h1>

        <div className="text-center mb-6">
          <p className="text-gray-600">รหัสโปรเจคสำหรับอ้างอิง:</p>
          <p className="text-xl font-bold text-green-700 bg-green-100 rounded-md px-2 py-1 inline-block">
            {projectId || "N/A"}
          </p>
        </div>

        <img
          src={initialImage}
          alt="Designed Garden"
          className="w-full h-auto max-h-[400px] object-cover rounded-xl shadow-md mx-auto mb-6"
        />

        {/* === จุดแก้ไขหลัก: การแสดงผลตาราง BOM ใหม่ === */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-green-100 p-3 rounded-t-lg font-semibold text-gray-700">
            <span className="w-2/5">รายการ (จากร้านค้า)</span>
            <span className="w-1/5 text-center">จำนวน</span>
            <span className="w-2/5 text-right">ราคารวม (บาท)</span>
          </div>

          {initialBom.map((item, index) => (
            <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                {/* ส่วนชื่อวัสดุและร้านค้า */}
                <div className="w-2/5">
                  <p className="font-bold text-gray-800">
                    {item.material_name}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FiMapPin size={12} /> {item.vendor_name}
                  </p>
                </div>
                {/* ส่วนจำนวน */}
                <div className="w-1/5 text-center">
                  <p className="text-gray-800">{item.quantity}</p>
                  <p className="text-xs text-gray-400">{item.unit_type}</p>
                </div>
                {/* ส่วนราคา */}
                <div className="w-2/5 text-right">
                  <p className="font-mono font-semibold text-gray-800">
                    {item.estimated_cost.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    (@ {item.unit_price.toLocaleString("th-TH")} /{" "}
                    {item.unit_type})
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* ยอดรวม */}
          <div className="flex justify-between items-center bg-green-200 p-3 rounded-b-lg font-bold text-green-900">
            <span className="w-3/5 text-right">ยอดรวมประมาณการ</span>
            <span className="w-2/5 text-right text-xl font-mono">
              {totalCost.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* ส่วน Call to Action */}
        <div className="mt-10 pt-6 border-t-2 border-dashed border-gray-300">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            ขั้นตอนต่อไป
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* การ์ด 1: บริการครบวงจร */}
            <div className="bg-green-50 p-6 rounded-2xl shadow-lg flex flex-col border-2 border-green-600 transition-transform hover:scale-[1.02]">
              <div className="flex-grow">
                <FiMessageSquare className="text-4xl text-green-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  ให้มืออาชีพดูแล
                </h3>
                <p className="text-gray-600 mb-4">
                  สนใจให้ทีมงานของเราเข้าประเมินหน้างานและรับใบเสนอราคาเต็มรูปแบบ?
                  ติดต่อเราได้เลย
                </p>
              </div>
              <a
                href={lineOA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-4 bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-center hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <FiMessageSquare />
                ปรึกษาทีมงานผ่าน LINE
              </a>
            </div>
            {/* การ์ด 2: จัดเอง (DIY) */}
            <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col transition-transform hover:scale-[1.02]">
              <div className="flex-grow">
                <FiShoppingCart className="text-4xl text-orange-500 mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  สั่งของไปจัดเอง
                </h3>
                <p className="text-gray-600 mb-4">
                  รับรายการสินค้าพร้อมลิงก์สำหรับสั่งซื้อ
                  เพื่อนำไปจัดสวนสวยด้วยตัวคุณเอง
                </p>
              </div>
              <button
                onClick={() =>
                  alert("ฟีเจอร์ขอลิงก์สำหรับซื้อเองกำลังจะมาเร็วๆ นี้!")
                }
                className="w-full mt-4 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                <FiShoppingCart />
                ขอลิงก์สำหรับสั่งซื้อ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BomResultPage;
