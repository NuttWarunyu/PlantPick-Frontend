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
  FiPlusCircle,
} from "react-icons/fi";

// === คอมโพเนนท์สำหรับหน้าจอ Loading (เหมือนเดิม) ===
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
      <div className="flex items-center justify-center text-xl md:text-2xl font-bold text-gray-700">
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

// === คอมโพเนนท์หลัก (มีการแก้ไขทั้งหมด) ===
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// === สร้างรายการแท็กและงบประมาณ ===
const styleTags = [
  { id: "tropical", name: "Tropical", emoji: "🌴" },
  { id: "english", name: "English", emoji: "🌹" },
  { id: "japanese", name: "Japanese", emoji: "⛩️" },
  { id: "modern", name: "Modern", emoji: "🏢" },
  { id: "minimal", name: "Minimal", emoji: "⚪" },
];

const featureTags = [
  { id: "waterfall", name: "มีน้ำตก", emoji: "💧" },
  { id: "pond", name: "มีบ่อปลา", emoji: "🐠" },
  { id: "easycare", name: "ดูแลง่าย", emoji: "👍" },
  { id: "seating", name: "มีมุมนั่งเล่น", emoji: "🪑" },
  { id: "pavilion", name: "มีศาลา", emoji: "🛖" },
  { id: "kid-friendly", name: "เหมาะกับเด็ก", emoji: "👧" },
  { id: "pet-friendly", name: "เลี้ยงสัตว์ได้", emoji: "🐶" },
];

const budgetOptions = [
  { label: "< 50,000", value: 50000, level: 1 },
  { label: "50,000 - 100,000", value: 100000, level: 2 },
  { label: "100,000 - 250,000", value: 250000, level: 3 },
  { label: "> 250,000", value: 500000, level: 4 },
];

export default function GardenImageMaskPage() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bomLoading, setBomLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [historyId, setHistoryId] = useState(null);
  const [error, setError] = useState(null);

  // === จุดแก้ไขที่ 1: แยก State สำหรับสไตล์ (เดี่ยว) และฟีเจอร์ (กลุ่ม) ===
  const [selectedStyle, setSelectedStyle] = useState("tropical");
  const [selectedFeatures, setSelectedFeatures] = useState(new Set());
  const [customKeywords, setCustomKeywords] = useState("");
  const [selectedBudgetLevel, setSelectedBudgetLevel] = useState(2);

  const handleFeatureTagToggle = (tagId) => {
    setSelectedFeatures((prevTags) => {
      const newTags = new Set(prevTags);
      if (newTags.has(tagId)) {
        newTags.delete(tagId);
      } else {
        newTags.add(tagId);
      }
      return newTags;
    });
  };

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

  const getFullPrompt = () => {
    const allTags = [selectedStyle, ...Array.from(selectedFeatures)];
    let prompt = `Design a beautiful, photorealistic garden for the provided house image. Incorporate the following styles and elements: ${allTags.join(
      ", "
    )}.`;
    if (customKeywords) {
      prompt += ` Also, specifically include: ${customKeywords}.`;
    }
    prompt +=
      " The design should be high-quality, professional, and aesthetically pleasing. Preserve the original house structure and color.";
    return prompt;
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
      const allTags = [selectedStyle, ...Array.from(selectedFeatures)];

      formData.append("image", image);
      formData.append("prompt", getFullPrompt());
      allTags.forEach((tag) => {
        formData.append("selected_tags", tag);
      });

      const res = await axios.post(
        `${API_BASE_URL}/garden/generate-garden`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
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
      const budgetInfo = budgetOptions.find(
        (opt) => opt.level === selectedBudgetLevel
      );
      const budget = budgetInfo ? budgetInfo.value : 100000;

      const res = await axios.post(
        `${API_BASE_URL}/garden/generate-bom`,
        {
          history_id: historyId,
          budget: budget,
          budget_level: selectedBudgetLevel,
        },
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
        <div className="p-6 space-y-8">
          {/* Section 1: Upload Image */}
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
              />
            </label>
          </div>
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

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center"
              role="alert"
            >
              <span className="font-bold">เกิดข้อผิดพลาด:</span>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {/* Section 2: Define Style */}
          <div className="space-y-6 pt-6 border-t">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                ขั้นตอนที่ 2: กำหนดสไตล์และความต้องการ
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                เลือกสไตล์หลัก 1 อย่าง และองค์ประกอบเสริมได้หลายอย่าง
              </p>
            </div>

            <div>
              <label className="font-semibold text-gray-700">
                สไตล์หลัก (เลือก 1 อย่าง)
              </label>
              <div className="flex flex-wrap gap-3 mt-2">
                {/* === จุดแก้ไขที่ 2: แยก Logic ปุ่มสไตล์ (Single-choice) === */}
                {styleTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedStyle(tag.id)}
                    className={`px-5 py-2.5 text-base font-semibold rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${
                      selectedStyle === tag.id
                        ? "bg-green-600 text-white shadow-md ring-2 ring-offset-2 ring-green-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag.emoji} {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-700">
                องค์ประกอบเพิ่มเติม (เลือกได้หลายอย่าง)
              </label>
              <div className="flex flex-wrap gap-3 mt-2">
                {/* === จุดแก้ไขที่ 3: แยก Logic ปุ่มฟีเจอร์ (Multi-choice) === */}
                {featureTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleFeatureTagToggle(tag.id)}
                    className={`px-5 py-2.5 text-base font-semibold rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${
                      selectedFeatures.has(tag.id)
                        ? "bg-blue-600 text-white shadow-md ring-2 ring-offset-2 ring-blue-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag.emoji} {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="custom-keywords"
                className="font-semibold text-gray-700"
              >
                เพิ่มความต้องการพิเศษ (ถ้ามี)
              </label>
              <input
                type="text"
                id="custom-keywords"
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                placeholder="เช่น 'มุมสำหรับบาร์บีคิว', 'ที่เล่นสำหรับสุนัข'"
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Section 3: Generate */}
          <div className="pt-6 border-t">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                ขั้นตอนที่ 3: สร้างสวน!
              </h2>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!image}
                className="bg-green-600 text-white font-bold text-lg py-4 px-12 rounded-full shadow-lg transform transition-all hover:bg-green-700 hover:scale-105 disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
              >
                🌿 สร้างสวนในฝัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Section */}
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

            <div className="pt-4 border-t">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  ขั้นตอนสุดท้าย: กำหนดงบประมาณ
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  เลือกช่วงงบประมาณของคุณเพื่อดูรายการของและราคาประเมิน
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {budgetOptions.map((opt) => (
                  <button
                    key={opt.level}
                    onClick={() => setSelectedBudgetLevel(opt.level)}
                    className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${
                      selectedBudgetLevel === opt.level
                        ? "bg-green-600 text-white shadow-lg ring-2 ring-offset-2 ring-green-500"
                        : "bg-white text-gray-800 border hover:bg-green-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

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
