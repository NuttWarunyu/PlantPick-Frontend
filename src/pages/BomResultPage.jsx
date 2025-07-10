import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiMessageSquare,
  FiShoppingCart,
  FiHome,
  FiMapPin,
  FiArrowRight,
  FiThumbsUp,
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

  // ฟังก์ชันสำหรับสร้างลิงก์ค้นหาสินค้า
  const createSearchLink = (itemName) => {
    const encodedItem = encodeURIComponent(itemName);
    return `https://www.shopee.co.th/search?keyword=${encodedItem}`;
  };

  if (!initialBom || !initialImage) {
    return <div className="text-center p-10">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="w-full space-y-8">
      {/* === ส่วนที่ 1: สรุปโปรเจค (Project Summary) === */}
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
          สวนในฝันของคุณพร้อมแล้ว!
        </h1>
        <p className="text-gray-600 mb-4">
          นี่คือรายการวัสดุและราคาประเมินสำหรับโปรเจคของคุณ
        </p>
        <div className="mb-6">
          <p className="text-sm text-gray-500">รหัสโปรเจคสำหรับอ้างอิง:</p>
          <p className="text-xl font-bold text-green-700 bg-green-100 rounded-md px-2 py-1 inline-block">
            {projectId || "N/A"}
          </p>
        </div>
        <img
          src={initialImage}
          alt="Designed Garden"
          className="w-full h-auto max-h-[450px] object-cover rounded-xl shadow-md mx-auto"
        />
      </div>

      {/* === ส่วนที่ 2: รายการวัสดุแบบโต้ตอบได้ (Interactive BOM) === */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          รายการวัสดุ (สำหรับจัดสวนเอง)
        </h2>
        <div className="space-y-3">
          {initialBom.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-grow">
                <p className="font-bold text-gray-800">{item.material_name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FiMapPin size={12} /> {item.vendor_name}
                </p>
              </div>
              <div className="flex items-baseline gap-4 w-full sm:w-auto">
                <div className="flex-grow text-left sm:text-center">
                  <p className="text-gray-800 font-semibold">
                    {item.quantity}
                    <span className="text-xs text-gray-500 ml-1">
                      {item.unit_type}
                    </span>
                  </p>
                </div>
                <div className="flex-grow text-right">
                  <p className="font-mono font-semibold text-gray-800">
                    {item.estimated_cost.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    (@{item.unit_price.toLocaleString("th-TH")})
                  </p>
                </div>
              </div>
              <a
                href={createSearchLink(item.material_name)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 text-gray-700 text-sm font-semibold py-2 px-4 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <FiShoppingCart size={14} />
                หาซื้อเอง
              </a>
            </div>
          ))}
        </div>
        {/* ยอดรวม */}
        <div className="flex justify-end items-center mt-6 pt-4 border-t">
          <span className="text-gray-600 font-bold mr-4">ยอดรวมประมาณการ:</span>
          <span className="text-2xl font-bold text-green-700 font-mono">
            {totalCost.toLocaleString("th-TH", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* === ส่วนที่ 3: ข้อเสนอสำหรับบริการครบวงจร (Full-Service Offer) === */}
      <div className="bg-green-50 p-8 rounded-2xl shadow-lg text-center border border-green-200">
        <FiThumbsUp className="text-5xl text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-800">
          พร้อมเปลี่ยนฝันให้เป็นจริงหรือยัง?
        </h2>
        <p className="text-gray-600 mt-2 mb-6 max-w-2xl mx-auto">
          ให้ทีมงานมืออาชีพของเราดูแลทุกขั้นตอน ตั้งแต่การจัดหาวัสดุคุณภาพ
          จนถึงเนรมิตสวนสวยให้คุณถึงบ้าน สะดวกสบาย ได้ผลงานตรงตามแบบ
          พร้อมรับประกันความพึงพอใจ
        </p>
        <a
          href={lineOA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-bold text-lg py-3 px-10 rounded-full shadow-lg transform transition-all hover:bg-green-700 hover:scale-105"
        >
          <FiMessageSquare />
          ปรึกษาทีมออกแบบ (ฟรี!)
        </a>
      </div>

      {/* ส่วนท้าย: กลับไปออกแบบใหม่ */}
      <div className="text-center mt-4">
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-green-700 font-semibold flex items-center justify-center gap-2 mx-auto"
        >
          <FiHome />
          กลับไปออกแบบใหม่
        </button>
      </div>
    </div>
  );
};

export default BomResultPage;
