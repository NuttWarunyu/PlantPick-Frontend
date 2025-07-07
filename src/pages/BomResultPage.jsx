import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMessageSquare, FiShoppingCart, FiHome } from "react-icons/fi";

const BomResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    bom: initialBom,
    resultImage: initialImage,
    projectId,
  } = location.state || {};

  const totalCost = useMemo(() => {
    if (!initialBom) return 0;
    // แก้ไข: ไม่มีการคูณ 33 แล้ว เพราะถือว่า Backend ส่งราคา THB มาแล้ว
    return initialBom.reduce((sum, item) => sum + item.estimated_cost, 0);
  }, [initialBom]);

  useEffect(() => {
    if (!initialBom || !initialImage) {
      navigate("/");
    }
  }, [initialBom, initialImage, navigate]);

  const handleRequestDIYLinks = () => {
    alert("ฟีเจอร์ขอลิงก์สำหรับซื้อเองกำลังจะมาเร็วๆ นี้!");
  };

  const lineOA_URL = "https://line.me/ti/p/@025hcugd";

  if (!initialBom || !initialImage) {
    return <div className="text-center p-10">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
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

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-green-100">
                  <th className="border p-3 text-left text-gray-700 font-semibold">
                    รายการ
                  </th>
                  <th className="border p-3 text-center text-gray-700 font-semibold">
                    จำนวน
                  </th>
                  <th className="border p-3 text-right text-gray-700 font-semibold">
                    ราคาประมาณ (บาท)
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialBom.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="border p-3 text-gray-800">
                      {item.material_name}
                    </td>
                    <td className="border p-3 text-gray-600 text-center">
                      {item.quantity} {item.unit || ""} {/* แสดงหน่วย */}
                    </td>
                    <td className="border p-3 text-gray-800 text-right font-mono">
                      {item.estimated_cost.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-200 font-bold">
                  <td
                    colSpan="2"
                    className="border p-3 text-right text-green-900"
                  >
                    ยอดรวมประมาณการ
                  </td>
                  <td className="border p-3 text-right text-green-900 text-xl font-mono">
                    {totalCost.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* === เริ่มต้นส่วน Call to Action ใหม่ (นำโค้ดนี้ไปทับของเดิม) === */}
          <div className="mt-10 pt-6 border-t-2 border-dashed border-gray-300">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              ขั้นตอนต่อไป
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* การ์ด 1: บริการครบวงจร (เน้นเป็นพิเศษ) */}
              <div className="bg-green-50 p-6 rounded-2xl shadow-lg flex flex-col border-2 border-green-600 transition-transform hover:scale-[1.02]">
                <div className="flex-grow">
                  <FiMessageSquare className="text-4xl text-green-600 mb-3" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    ให้มืออาชีพดูแล
                  </h3>
                  <p className="text-gray-600 mb-4">
                    สะดวกสบาย ครบวงจร ให้ทีมงานของเราจัดการให้ทั้งหมด
                    ตั้งแต่สั่งของจนถึงจัดสวนให้สวยตรงตามแบบ
                  </p>
                </div>
                <a
                  href={lineOA_URL} // lineOA_URL ที่ประกาศไว้ด้านบน
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
                    สำหรับคนรักสวนที่อยากลงมือทำด้วยตัวเอง
                    เราจะช่วยหาลิงก์สำหรับสั่งซื้อของทั้งหมดให้คุณ
                  </p>
                </div>
                <button
                  onClick={handleRequestDIYLinks} // handleRequestDIYLinks ที่ประกาศไว้ด้านบน
                  className="w-full mt-4 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  <FiShoppingCart />
                  ขอลิงก์สำหรับสั่งซื้อ
                </button>
              </div>
            </div>
          </div>
          {/* === จบส่วน Call to Action ใหม่ === */}
        </div>
        <div className="text-center mt-8">
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

export default BomResultPage;
