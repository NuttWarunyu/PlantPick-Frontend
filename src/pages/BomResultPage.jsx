import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiMessageSquare,
  FiShoppingCart,
  FiHome,
  FiMapPin,
  FiPlusCircle,
  FiThumbsUp,
  FiZap,
} from "react-icons/fi";

const BomResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    bom: mainBom,
    suggestions: initialSuggestions, // <-- เปลี่ยนชื่อเพื่อไม่ให้สับสน
    resultImage: initialImage,
    projectId,
  } = location.state || {};

  const [bomItems, setBomItems] = useState(mainBom || []);
  // === จุดแก้ไขที่ 1: สร้าง State ใหม่สำหรับจัดการ Suggestions ===
  const [suggestions, setSuggestions] = useState(initialSuggestions || {});

  const totalCost = useMemo(() => {
    if (!bomItems) return 0;
    return bomItems.reduce((sum, item) => sum + item.estimated_cost, 0);
  }, [bomItems]);

  useEffect(() => {
    if (!mainBom || !initialImage) {
      navigate("/");
    }
  }, [mainBom, initialImage, navigate]);

  const lineOA_URL = "https://line.me/ti/p/@025hcugd";

  const createSearchLink = (itemName) => {
    const encodedItem = encodeURIComponent(itemName);
    return `https://www.shopee.co.th/search?keyword=${encodedItem}`;
  };

  // === จุดแก้ไขที่ 2: อัปเกรดฟังก์ชัน handleAddSuggestion ===
  const handleAddSuggestion = (category, suggestedItem) => {
    const isAlreadyInBom = bomItems.some(
      (item) => item.material_name === suggestedItem.material_name
    );

    if (isAlreadyInBom) {
      alert(`'${suggestedItem.material_name}' มีอยู่ในรายการแล้ว`);
      return;
    }

    const newItem = {
      ...suggestedItem,
      unit_price: suggestedItem.unit_price_thb,
      quantity: 1,
      estimated_cost: suggestedItem.unit_price_thb,
    };

    // 1. เพิ่มลงใน BOM หลัก
    setBomItems((prevItems) => [...prevItems, newItem]);

    // 2. ลบออกจาก Suggestions State
    setSuggestions((prevSuggestions) => {
      const newSuggestions = { ...prevSuggestions };
      // กรอง item ที่ถูกเพิ่มออกไปจาก category นั้นๆ
      newSuggestions[category] = newSuggestions[category].filter(
        (item) => item.material_name !== suggestedItem.material_name
      );
      // ถ้าใน category นั้นไม่เหลือ item แล้ว ให้ลบ category นั้นทิ้งไปเลย
      if (newSuggestions[category].length === 0) {
        delete newSuggestions[category];
      }
      return newSuggestions;
    });
  };

  if (!bomItems || !initialImage) {
    return <div className="text-center p-10">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="w-full space-y-8">
      {/* ส่วนสรุปโปรเจค */}
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
          🧾 สรุปโปรเจคสวนของคุณ
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
          className="w-full h-auto max-h-[450px] object-cover rounded-xl shadow-md mx-auto"
        />
      </div>

      {/* ส่วนรายการวัสดุหลัก */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          รายการวัสดุที่แนะนำ
        </h2>
        <div className="space-y-3">
          {bomItems.length > 0 ? (
            bomItems.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex-grow">
                  <p className="font-bold text-gray-800">
                    {item.material_name}
                  </p>
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
                  <FiShoppingCart size={14} /> หาซื้อเอง
                </a>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              ไม่มีรายการวัสดุที่แนะนำในงบประมาณนี้
            </p>
          )}
        </div>
        <div className="flex justify-end items-center mt-6 pt-4 border-t">
          <span className="text-gray-600 font-bold mr-4">ยอดรวมประมาณการ:</span>
          <span className="text-2xl font-bold text-green-700 font-mono">
            {totalCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* === จุดแก้ไขที่ 3: แสดงผลจาก State ของ Suggestions === */}
      {suggestions && Object.keys(suggestions).length > 0 && (
        <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
            <FiZap /> คำแนะนำเพิ่มเติมจากนักออกแบบ
          </h3>
          <div className="space-y-4">
            {Object.entries(suggestions).map(([category, suggestedItems]) => (
              <div key={category}>
                <p className="font-semibold text-gray-700">{category}:</p>
                <div className="mt-2 space-y-2">
                  {suggestedItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg flex items-center justify-between gap-4 hover:bg-green-50 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-gray-800">
                          {item.material_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          จาก: {item.vendor_name} -{" "}
                          <strong>
                            {item.unit_price_thb.toLocaleString("th-TH")} บาท/
                            {item.unit_type}
                          </strong>
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddSuggestion(category, item)}
                        className="bg-green-100 text-green-800 text-sm font-bold p-2 rounded-full hover:bg-green-200 transition-transform transform hover:scale-110"
                      >
                        <FiPlusCircle size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ส่วน Call to Action */}
      <div className="bg-green-50 p-8 rounded-2xl shadow-lg text-center border border-green-200">
        <FiThumbsUp className="text-5xl text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-800">
          พร้อมเปลี่ยนฝันให้เป็นจริงหรือยัง?
        </h2>
        <p className="text-gray-600 mt-2 mb-6 max-w-2xl mx-auto">
          ให้ทีมงานมืออาชีพของเราดูแลทุกขั้นตอน ตั้งแต่การจัดหาวัสดุคุณภาพ
          จนถึงเนรมิตสวนสวยให้คุณถึงบ้าน
        </p>
        <a
          href={lineOA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-bold text-lg py-3 px-10 rounded-full shadow-lg transform transition-all hover:bg-green-700 hover:scale-105"
        >
          <FiMessageSquare /> ปรึกษาทีมออกแบบ (ฟรี!)
        </a>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-green-700 font-semibold flex items-center justify-center gap-2 mx-auto"
        >
          <FiHome /> กลับไปออกแบบใหม่
        </button>
      </div>
    </div>
  );
};

export default BomResultPage;
