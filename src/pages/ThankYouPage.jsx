import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMessageSquare, FiShoppingCart, FiHome } from "react-icons/fi"; // ไอคอนสวยๆ จาก react-icons

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ดึงข้อมูลทั้งหมดจาก State ที่ส่งมา
  const { resultImage, projectId, bom } = location.state || {};

  // หากผู้ใช้เข้ามาหน้านี้โดยตรง (ไม่มี state) ให้เด้งกลับหน้าแรก
  useEffect(() => {
    if (!resultImage || !projectId) {
      console.log("No state found, redirecting to home.");
      navigate("/");
    }
  }, [resultImage, projectId, navigate]);

  const lineOA_URL = "https://lin.ee/SlB1T6L"; // <-- ใส่ลิงก์ LINE OA ของคุณที่ให้มา

  const handleNavigateToBom = () => {
    // ส่งข้อมูล BOM และรูปภาพไปที่หน้าแสดงรายการของ
    navigate("/bom-result", { state: { bom, resultImage } });
  };

  return (
    <div className="min-h-screen bg-green-50/50 font-sans">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-2">
            สวนในฝันของคุณพร้อมแล้ว!
          </h1>
          <p className="text-lg text-gray-600">ขั้นตอนต่อไปคืออะไร?</p>
        </div>

        {/* แสดงภาพและ Project ID ให้เด่นชัด */}
        {resultImage && (
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 text-center">
            <img
              src={resultImage}
              alt="Your Designed Garden"
              className="w-full h-auto max-h-[400px] object-cover rounded-xl shadow-md mx-auto"
            />
            <div className="mt-4 bg-gray-100 p-3 rounded-lg inline-block">
              <p className="text-gray-700">รหัสโปรเจคของคุณคือ:</p>
              <p className="text-2xl font-bold text-green-700 tracking-widest">
                {projectId || "N/A"}
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              (โปรดใช้รหัสนี้ในการติดต่อกับทีมงาน)
            </p>
          </div>
        )}

        {/* ทางแยก 2 ทางเลือก */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* การ์ดที่ 1: บริการครบวงจร */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col border-2 border-green-600">
            <div className="flex-grow">
              <FiMessageSquare className="text-4xl text-green-600 mb-3" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ให้มืออาชีพเนรมิตสวนให้
              </h2>
              <p className="text-gray-600 mb-4">
                สะดวกสบาย ครบวงจร ให้ทีมงานผู้เชี่ยวชาญของเราเข้าดูแล
                พร้อมรับประกันความสวยงามตรงตามแบบ
              </p>
            </div>
            <a
              href={lineOA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-4 bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-center hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <FiMessageSquare />
              คุยกับทีมออกแบบ (ฟรี!)
            </a>
          </div>

          {/* การ์ดที่ 2: จัดเอง (DIY) */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col">
            <div className="flex-grow">
              <FiShoppingCart className="text-4xl text-orange-500 mb-3" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ลุยจัดเอง (ฉบับประหยัด)
              </h2>
              <p className="text-gray-600 mb-4">
                เหมาะสำหรับคนรักสวนที่มีเวลาและต้องการคุมงบ
                เรารวบรวมรายการของทั้งหมดให้คุณไปช้อปเองได้เลย
              </p>
            </div>
            <button
              onClick={handleNavigateToBom}
              className="w-full mt-4 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <FiShoppingCart />
              ขอรายการของสำหรับซื้อเอง
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-green-700 font-semibold flex items-center justify-center gap-2 mx-auto"
          >
            <FiHome />
            กลับไปออกแบบใหม่
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
