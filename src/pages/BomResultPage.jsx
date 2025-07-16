import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // <-- Import axios
import {
  FiMessageSquare,
  FiShoppingCart,
  FiHome,
  FiMapPin,
  FiPlusCircle,
  FiThumbsUp,
  FiZap,
} from "react-icons/fi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const BomResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    bom: mainBom,
    suggestions: initialSuggestions,
    resultImage: initialImage,
    projectId,
  } = location.state || {};

  const [bomItems, setBomItems] = useState(mainBom || []);
  const [suggestions, setSuggestions] = useState(initialSuggestions || {});
  // === จุดแก้ไขที่ 1: เพิ่ม State สำหรับจัดการ Loading ของปุ่ม ===
  const [fetchingLink, setFetchingLink] = useState(null); // เก็บชื่อ item ที่กำลังโหลด
  // === จุดแก้ไขที่ 2: เพิ่ม State สำหรับเก็บ affiliate link ที่ได้จาก API ===
  const [affiliateLinks, setAffiliateLinks] = useState({}); // { [itemName]: offerLink }

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

  // === จุดแก้ไขที่ 3: ปรับฟังก์ชัน handleFindDeal ให้แค่ fetch ลิงก์และเก็บไว้ ไม่เปิดลิงก์ทันที ===
  const handleFindDeal = async (itemName) => {
    setFetchingLink(itemName); // เริ่ม Loading
    try {
      const res = await axios.get(`${API_BASE_URL}/garden/get-affiliate-link`, {
        params: { item_name: itemName },
      });
      if (res.data && res.data.offerLink) {
        setAffiliateLinks((prev) => ({ ...prev, [itemName]: res.data.offerLink }));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Failed to fetch affiliate link:", error);
      alert("ขออภัยค่ะ ไม่สามารถค้นหาดีลได้ในขณะนี้");
    } finally {
      setFetchingLink(null); // หยุด Loading
    }
  };

  const handleAddSuggestion = (categoryOfSuggestion, itemToAdd) => {
    const isAlreadyInBom = bomItems.some(
      (item) => item.material_name === itemToAdd.material_name
    );

    if (isAlreadyInBom) {
      alert(`'${itemToAdd.material_name}' มีอยู่ในรายการแล้ว`);
      return;
    }

    const newItem = {
      ...itemToAdd,
      unit_price: itemToAdd.unit_price_thb,
      quantity: 1,
      estimated_cost: itemToAdd.unit_price_thb,
    };

    setBomItems((prevItems) => [...prevItems, newItem]);

    setSuggestions((prevSuggestions) => {
      const newSuggestions = { ...prevSuggestions };
      newSuggestions[categoryOfSuggestion] = newSuggestions[
        categoryOfSuggestion
      ].filter((item) => item.material_name !== itemToAdd.material_name);
      if (newSuggestions[categoryOfSuggestion].length === 0) {
        delete newSuggestions[categoryOfSuggestion];
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
                {/* === ปุ่มเดียว เปลี่ยนสถานะ/สี/animation ตาม state === */}
                <div className="flex flex-col items-center w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (affiliateLinks[item.material_name]) {
                        window.open(affiliateLinks[item.material_name], "_blank");
                      } else {
                        handleFindDeal(item.material_name);
                      }
                    }}
                    disabled={fetchingLink === item.material_name}
                    className={
                      (affiliateLinks[item.material_name]
                        ? "bg-orange-600 hover:bg-orange-700"
                        : fetchingLink === item.material_name
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600") +
                      " text-white text-sm font-semibold py-2 px-4 rounded-full transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto shadow-md transform hover:scale-105"
                    }
                    style={{ minWidth: 120 }}
                  >
                    {fetchingLink === item.material_name ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        กำลังค้นหา...
                      </>
                    ) : affiliateLinks[item.material_name] ? (
                      <>
                        <FiShoppingCart size={14} /> ไปยัง Shopee
                      </>
                    ) : (
                      <>
                        <FiShoppingCart size={14} /> หาซื้อเอง
                      </>
                    )}
                  </button>
                  {/* ข้อความแจ้งเตือนใต้ปุ่มเมื่อได้ลิงก์ */}
                  {affiliateLinks[item.material_name] && (
                    <p className="text-xs text-green-600 mt-1 animate-fade-in">คลิกปุ่มเพื่อไปยัง Shopee</p>
                  )}
                </div>
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

      {/* ส่วน "คำแนะนำเพิ่มเติม" */}
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
