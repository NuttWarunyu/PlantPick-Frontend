import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiUploadCloud,
  FiCamera,
  FiSearch,
  FiHeart,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiDroplet,
  FiSun,
  FiThermometer,
  FiShield,
  FiMessageSquare,
  FiArrowRight,
  FiHome,
  FiStar,
  FiUsers,
  FiAward,
  FiZap
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Loading Animation Component
const LoadingAnimation = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="relative">
      {/* Animated Leaf */}
      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
        <FiZap className="text-white text-2xl animate-bounce" />
      </div>
      {/* Rotating Ring */}
      <div className="absolute inset-0 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
    <div className="flex space-x-1 mt-2">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  </div>
);

// Disease Card Component
const DiseaseCard = ({ disease, severity, symptoms, treatment }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <FiAlertCircle className="text-red-500 text-xl" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{disease}</h3>
          <span className="text-sm text-red-600 font-medium">ความรุนแรง: {severity}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
          ต้องรักษา
        </span>
      </div>
    </div>
    
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">อาการที่พบ:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {symptoms.map((symptom, index) => (
            <li key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              {symptom}
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">วิธีรักษา:</h4>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">{treatment}</p>
        </div>
      </div>
    </div>
  </div>
);

// Treatment Plan Component
const TreatmentPlan = ({ plan }) => (
  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-200">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
        <FiCheckCircle className="text-white text-xl" />
      </div>
      <div>
        <h3 className="font-bold text-gray-800 text-xl">แผนการรักษา</h3>
        <p className="text-sm text-gray-600">ติดตามการรักษาและผลลัพธ์</p>
      </div>
    </div>
    
    <div className="space-y-4">
      {plan.map((step, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {index + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">{step.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            {step.duration && (
              <div className="flex items-center gap-2 mt-2">
                <FiClock className="text-green-500 text-sm" />
                <span className="text-xs text-green-600 font-medium">{step.duration}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function PlantDoctorPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("กรุณาเลือกรูปภาพก่อน");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post(`${API_BASE_URL}/plant/analyze-disease`, formData);
      setAnalysis(response.data);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-16">

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FiAward className="text-sm" />
            <span>AI วิเคราะห์โรคต้นไม้ #1 ในไทย</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            <span className="text-green-600">AI หมอต้นไม้</span>
            <br />
            วิเคราะห์โรคใน 30 วินาที
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            อัปโหลดรูปต้นไม้ป่วย ใช้ AI วิเคราะห์โรค แมลง และวิธีรักษา
            พร้อมแผนการดูแลที่แม่นยำ
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">99%</div>
              <div className="text-sm text-gray-600">ความแม่นยำ</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">30s</div>
              <div className="text-sm text-gray-600">เวลาวิเคราะห์</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-sm text-gray-600">โรคที่รู้จัก</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-green-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                อัปโหลดรูปต้นไม้
              </h2>

              {/* Upload Area */}
              <div className="space-y-4">
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-green-300 rounded-2xl p-8 text-center hover:border-green-400 transition-colors">
                    <FiUploadCloud className="text-4xl text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      คลิกเพื่ออัปโหลดรูป
                    </h3>
                    <p className="text-gray-500 mb-4">
                      หรือลากไฟล์มาวาง (PNG, JPG, JPEG)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
                    >
                      เลือกไฟล์
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                    <button
                      onClick={resetAnalysis}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FiAlertCircle className="text-sm" />
                    </button>
                  </div>
                )}

                {/* Camera Button */}
                <button
                  onClick={handleCameraCapture}
                  className="w-full bg-blue-500 text-white py-4 rounded-2xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FiCamera className="text-xl" />
                  ถ่ายภาพต้นไม้
                </button>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      กำลังวิเคราะห์...
                    </>
                  ) : (
                    <>
                      <FiSearch className="text-xl" />
                      วิเคราะห์โรคต้นไม้
                    </>
                  )}
                </button>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">💡 เคล็ดลับการถ่ายภาพ</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• ถ่ายภาพใบไม้ที่ป่วยให้ชัดเจน</li>
                  <li>• ใช้แสงธรรมชาติ ไม่มีเงา</li>
                  <li>• ถ่ายหลายมุมเพื่อความแม่นยำ</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {loading && (
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <LoadingAnimation message="AI กำลังวิเคราะห์โรคต้นไม้..." />
              </div>
            )}

            {error && (
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="text-center">
                  <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={resetAnalysis}
                    className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
                  >
                    ลองใหม่
                  </button>
                </div>
              </div>
            )}

            {analysis && (
              <div className="space-y-6">
                {/* Plant Info */}
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <FiZap className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">ข้อมูลต้นไม้</h3>
                      <p className="text-gray-600">ผลการวิเคราะห์จาก AI</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <FiSun className="text-green-500" />
                      <div>
                        <div className="text-sm text-gray-600">ความต้องการแสง</div>
                        <div className="font-semibold text-gray-800">{analysis.light || "ปานกลาง"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <FiDroplet className="text-blue-500" />
                      <div>
                        <div className="text-sm text-gray-600">ความต้องการน้ำ</div>
                        <div className="font-semibold text-gray-800">{analysis.water || "ปานกลาง"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disease Analysis */}
                {analysis.diseases && analysis.diseases.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">ผลการวิเคราะห์โรค</h3>
                    {analysis.diseases.map((disease, index) => (
                      <DiseaseCard
                        key={index}
                        disease={disease.name}
                        severity={disease.severity}
                        symptoms={disease.symptoms}
                        treatment={disease.treatment}
                      />
                    ))}
                  </div>
                )}

                {/* Treatment Plan */}
                {analysis.treatmentPlan && (
                  <TreatmentPlan plan={analysis.treatmentPlan} />
                )}

                {/* Action Buttons */}
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                  <div className="flex gap-4">
                    <button className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                      <FiMessageSquare />
                      ปรึกษาผู้เชี่ยวชาญ
                    </button>
                    <button className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                      <FiHeart />
                      บันทึกผลการวิเคราะห์
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Default State */}
            {!loading && !error && !analysis && (
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiZap className="text-green-500 text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    พร้อมวิเคราะห์โรคต้นไม้
                  </h3>
                  <p className="text-gray-600">
                    อัปโหลดรูปต้นไม้ที่ป่วยเพื่อเริ่มการวิเคราะห์
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            ทำไมต้องใช้ AI Plant Doctor?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">วิเคราะห์แม่นยำ</h3>
              <p className="text-gray-600">
                AI วิเคราะห์โรคได้แม่นยำ 99% จากฐานข้อมูลโรคต้นไม้กว่า 500 ชนิด
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClock className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">เร็วทันใจ</h3>
              <p className="text-gray-600">
                วิเคราะห์โรคได้ใน 30 วินาที พร้อมแผนการรักษาที่ชัดเจน
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">ป้องกันล่วงหน้า</h3>
              <p className="text-gray-600">
                แนะวิธีป้องกันโรคและแมลงก่อนเกิดปัญหา
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 