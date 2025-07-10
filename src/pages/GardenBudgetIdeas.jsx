"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiUploadCloud,
  FiTool,
  FiSun,
  FiDroplet,
  FiCheckCircle,
} from "react-icons/fi";

// === คอมโพเนนท์สำหรับหน้าจอ Loading ที่น่าสนใจ (เหมือนเดิม) ===
const EngagingLoadingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    {
      icon: <FiUploadCloud className="text-blue-500" />,
      text: "กำลังส่งภาพบ้านของคุณขึ้นไปบนคลาวด์...",
    },
    {
      icon: <FiTool className="text-purple-500" />,
      text: "กำลังปลุก AI นักออกแบบของเราให้ตื่น...",
    },
    {
      icon: <FiSun className="text-yellow-500" />,
      text: "AI กำลังวิเคราะห์แสงและเงา...",
    },
    {
      icon: <FiDroplet className="text-cyan-500" />,
      text: "กำลังร่างแบบสวนและเลือกพรรณไม้...",
    },
    {
      icon: <FiCheckCircle className="text-green-500" />,
      text: "ใกล้เสร็จแล้ว! กำลังลงสีและเก็บรายละเอียด...",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="w-full bg-gray-50 p-8 rounded-2xl text-center transition-all duration-500">
      <div className="flex items-center justify-center text-2xl font-bold text-gray-700">
        <div className="animate-spin text-3xl mr-4">
          {steps[currentStep].icon}
        </div>
        <p>{steps[currentStep].text}</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-6">
        <div
          className="bg-green-500 h-2.5 rounded-full transition-all duration-1000"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        กระบวนการนี้อาจใช้เวลา 2-4 นาที ขึ้นอยู่กับความซับซ้อนของภาพ
      </p>
    </div>
  );
};

// === คอมโพเนนท์หลัก (มีการแก้ไข) ===
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function GardenImageMaskPage() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState("tropical");
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bomLoading, setBomLoading] = useState(false);
  const [historyId, setHistoryId] = useState(null);
  const [error, setError] = useState(null);

  // === จุดแก้ไขที่ 1: ลบ useRef และ useEffect ที่ซับซ้อนออกไป ===
  // ไม่จำเป็นต้องใช้ useRef และ ResizeObserver อีกต่อไป
  // const containerRef = useRef(null);
  // const imageRef = useRef(null);

  const stylePrompts = {
    english:
      "Create a professional English garden design in the masked area, featuring natural-looking flowers (such as roses and lavender in realistic colors), a large lawn, white picket fences, and well-defined pathways blending modern design with brick or smooth concrete. Include a clear focal point visible from the house window, such as a charming fountain or seating area. Ensure pathways are always present and incorporate modern elements like clean lines or geometric stone layouts. Use realistic perspective. Suggest materials like roses, lavender, white picket fences, brick or smooth concrete pathways, and geometric stones for the BOM. Preserve the house, roof, and its original color and structure. Do not alter the house. Keep the sky and surroundings unchanged.",
    tropical:
      "Design a professional tropical garden in the masked area with curved pathways, stepping stones, palm trees, and balanced greenery. Include a focal point visible from the house window, such as a small fountain, flowering tree, or cozy seating area. Emphasize harmony and natural aesthetics. Suggest materials like palm trees, hibiscus, and stepping stones for the BOM. Preserve the house, roof, and its original color and structure. Do not alter the house. Keep the sky and surroundings unchanged.",
    japanese:
      "Create a professional Japanese Zen garden in the masked area using moss, raked gravel, bonsai, stone lanterns, and koi ponds. Include a focal point visible from the house window, such as a calm stone arrangement or water feature. Apply asymmetry and a serene composition. Suggest materials like moss, gravel, bonsai, and stone lanterns for the BOM. Preserve the house, roof, and its original color and structure. Do not alter the house. Keep the sky and surroundings unchanged.",
  };

  const budgetPrompts = {
    "under-100k":
      "Use a simple and affordable garden layout with large grass areas, minimal decorations, and a few low-cost plants like small shrubs or native flowers. Avoid luxury features, hardscape beyond basic pathways, lighting, or water systems. Suggest affordable materials like grass, small shrubs (e.g., สนฉัตร, สนมังกร), and gravel for the BOM. Ensure the total cost does not exceed 100,000 บาท. Maintain realistic proportions and avoid overcrowding.",
  };

  const budgetValues = {
    "under-100k": 100000,
  };

  const getBudgetValue = () => {
    return budgetValues["under-100k"];
  };

  const getFullPrompt = (style) => {
    return `${stylePrompts[style]} ${budgetPrompts["under-100k"]}`;
  };

  // === จุดแก้ไขที่ 2: ลบ useEffect ของ ResizeObserver ออกไปทั้งหมด ===
  /*
  useEffect(() => {
    if (!imageRef.current || !containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (imageRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        imageRef.current.style.width = `${containerWidth}px`;
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [imagePreview, resultImage]);
  */

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResultImage(null);
      setHistoryId(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("prompt", getFullPrompt(selectedStyle));

      const res = await axios.post(
        `${API_BASE_URL}/garden/generate-garden`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResultImage(res.data.result_url);
      setHistoryId(res.data.history_id);
    } catch (err) {
      setError(
        "Error generating image: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBOM = async () => {
    if (!historyId) {
      setError("Please generate a garden image first.");
      return;
    }
    setBomLoading(true);
    setError(null);
    try {
      const budget = getBudgetValue();
      const res = await axios.post(
        `${API_BASE_URL}/garden/generate-bom`,
        { history_id: historyId, budget: budget },
        { headers: { "Content-Type": "application/json" } }
      );
      const bomDetails = res.data.bom_details || [];
      navigate("/bom-result", {
        state: {
          bom: bomDetails,
          resultImage: resultImage,
          projectId: historyId,
        },
      });
    } catch (err) {
      setError(
        "Error generating BOM: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setBomLoading(false);
    }
  };

  return (
    <div className="w-full shadow-2xl bg-white rounded-2xl overflow-hidden">
      {loading ? (
        <EngagingLoadingScreen />
      ) : (
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              ขั้นตอนที่ 1: อัปโหลดภาพบ้าน
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              เพื่อให้ AI ช่วยออกแบบสวนที่เข้ากับบ้านของคุณ
            </p>
          </div>

          <div className="w-full">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-8 text-center transition-colors hover:border-green-500 hover:bg-green-50"
            >
              <FiUploadCloud className="w-12 h-12 text-gray-400" />
              <span className="mt-2 block text-lg font-semibold text-green-600">
                คลิกเพื่ออัปโหลด
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                หรือลากไฟล์มาวาง (PNG, JPG)
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
              />
            </label>
          </div>

          {/* === จุดแก้ไขที่ 3: แก้ไขส่วนแสดงภาพพรีวิว === */}
          {imagePreview && (
            <div className="text-center">
              <p className="font-semibold text-gray-700 mb-2">
                ภาพที่คุณเลือก:
              </p>
              <div className="mt-2 inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-auto max-h-80 rounded-lg shadow-md object-contain"
                />
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              ขั้นตอนที่ 2: เลือกสไตล์
            </h2>
            <div>
              <label className="font-semibold text-gray-700">
                เลือกสไตล์สวน
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={loading}
              >
                <option value="tropical">สวน Tropical</option>
                <option value="english">สวนอังกฤษ</option>
                <option value="japanese">สวนญี่ปุ่น</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700">
                ระดับงบประมาณ
              </label>
              <p className="p-2 text-gray-600 bg-gray-100 rounded-lg mt-1">
                ภาพที่สร้างจะอยู่ในงบประมาณไม่เกิน 100,000 บาท
              </p>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
              ขั้นตอนที่ 3: สร้างสวน!
            </h2>
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={loading || !image}
                className="bg-green-600 text-white font-bold text-lg py-4 px-12 rounded-full shadow-lg transform transition-all hover:bg-green-700 hover:scale-105 disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
              >
                🌿 สร้างสวน AI
              </button>
            </div>
          </div>
        </div>
      )}

      {resultImage && !loading && (
        <div className="bg-green-50/50">
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 text-center">
              ผลลัพธ์การออกแบบสวน
            </h2>
            <img
              src={resultImage}
              alt="Generated Garden"
              className="w-full rounded-lg object-cover shadow-md"
            />

            <div className="pt-4 flex justify-center">
              <button
                onClick={handleGenerateBOM}
                disabled={bomLoading}
                className="bg-orange-500 text-white font-bold text-lg py-3 px-10 rounded-full shadow-lg transform transition-all hover:bg-orange-600 hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
              >
                🌱 ขอรายการของและราคา
              </button>
            </div>

            {bomLoading && (
              <p className="text-center text-orange-600 animate-pulse font-semibold">
                กำลังวิเคราะห์รายการ... 📝
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
