import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../components/ui/BOMSection.css"; // ปรับ path ตามโครงสร้าง

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const resultImage = state?.resultImage || null;

  const handleShare = () => {
    if (resultImage) {
      // ใช้ API Web Share (ถ้าเบราว์เซอร์รองรับ) หรือให้ลิงก์ดาวน์โหลด
      if (navigator.share) {
        navigator
          .share({
            title: "สวนที่ออกแบบโดย PlantPick",
            text: "ดูสวนที่ฉันออกแบบได้เลย!",
            url: resultImage,
          })
          .catch((error) => console.log("Error sharing:", error));
      } else {
        // กรณีไม่รองรับ Web Share ให้เปิดภาพในแท็บใหม่
        window.open(resultImage, "_blank");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-700">
          🎉 ขอบคุณที่ใช้บริการ!
        </h1>
        <p className="text-gray-600 mb-6">
          การออกแบบสวนของคุณเสร็จสมบูรณ์แล้ว เราหวังว่าคุณจะชอบ!
        </p>

        {resultImage && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              ภาพสวนของคุณ
            </h2>
            <img
              src={resultImage}
              alt="Your Designed Garden"
              className="w-full h-64 object-cover rounded-lg shadow-md mx-auto"
            />
            <Button
              onClick={handleShare}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              📤 แชร์ภาพสวน
            </Button>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            สิทธิพิเศษสำหรับคุณ
          </h2>
          <p className="text-gray-600">
            กลับมาใช้บริการซ้ำภายใน 30 วัน รับส่วนลด 10%
            สำหรับการออกแบบครั้งถัดไป!
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            จัดสวนจริงกับพันธมิตรของเรา
          </h2>
          <p className="text-gray-600 mb-4">
            สนใจให้ทีมมืออาชีพจัดสวนให้จริง?
            ติดต่อพันธมิตรของเราเพื่อรับใบเสนอราคา:
          </p>
          <a
            href="https://example.com/partners"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            ดูรายละเอียดพันธมิตร
          </a>
        </div>

        <Button
          onClick={() => navigate("/")}
          className="mt-6 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          กลับสู่หน้าหลัก
        </Button>
      </div>
    </div>
  );
};

// คอมโพเนนต์ Button (ถ้ายังไม่มีในโปรเจกต์)
const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={className}>
    {children}
  </button>
);

export default ThankYouPage;
