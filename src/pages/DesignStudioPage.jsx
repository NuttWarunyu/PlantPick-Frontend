import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import Konva from "konva";
import {
  FiUploadCloud,
  FiTrash2,
  FiSend,
  FiThumbsUp,
  FiHome,
  FiTool,
  FiSun,
  FiDroplet,
  FiCheckCircle,
} from "react-icons/fi";
import useImage from "use-image";

// --- Components & Data ---

const EngagingLoadingScreen = ({ predictionId }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    {
      icon: <FiTool className="text-purple-500" />,
      text: "กำลังปลุก AI นักออกแบบของเราให้ตื่น...",
    },
    {
      icon: <FiUploadCloud className="text-blue-500" />,
      text: "กำลังส่งภาพของคุณขึ้นไปบนคลาวด์...",
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
  }, []);

  return (
    <div className="w-full bg-gray-50 p-8 rounded-2xl text-center transition-all duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-center text-xl md:text-2xl font-bold text-gray-700">
        <div className="animate-spin text-4xl mb-4 sm:mb-0 sm:mr-4">
          {steps[currentStep].icon}
        </div>
        <p>{steps[currentStep].text}</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-6 overflow-hidden">
        <div
          className="bg-green-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-4">โดยปกติใช้เวลาไม่เกิน 1 นาที</p>
      {predictionId && (
        <p className="text-xs text-gray-400 mt-2">ID: {predictionId}</p>
      )}
    </div>
  );
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

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

// ปรับ budgetOptions เหลือ 3 ตัวเลือก
const budgetOptions = [
  { label: "50,000", value: 50000, level: 1, color: "from-green-400 to-green-600" },
  { label: "50,000 - 100,000", value: 100000, level: 2, color: "from-orange-400 to-orange-600" },
  { label: "> 100,000", value: 200000, level: 3, color: "from-blue-400 to-blue-600" },
];

// --- Main Component ---

export default function DesignStudioPage() {
  const navigate = useNavigate();
  const [originalFile, setOriginalFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [lines, setLines] = useState([]);
  const [brushSize, setBrushSize] = useState(30);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const [predictionId, setPredictionId] = useState(null);
  const [historyId, setHistoryId] = useState(null);
  const [bomLoading, setBomLoading] = useState(false);

  // States for new prompt system
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [selectedFeatures, setSelectedFeatures] = useState(new Set());
  const [customKeywords, setCustomKeywords] = useState("");
  const [selectedBudgetLevel, setSelectedBudgetLevel] = useState(2);

  // เพิ่ม state สำหรับ insight
  const [gardenInsights, setGardenInsights] = useState([]);
  const [analyzingInsights, setAnalyzingInsights] = useState(false);
  const [selectedInsights, setSelectedInsights] = useState([]);
  
  // เพิ่ม state สำหรับแสดงจำนวนครั้งที่เหลือ
  const [dailyUsage, setDailyUsage] = useState({ used: 0, limit: 10 });
  const [loadingUsage, setLoadingUsage] = useState(false);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // ฟังก์ชันดึงข้อมูลจำนวนครั้งที่เหลือ
  const fetchDailyUsage = async () => {
    setLoadingUsage(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/garden/daily-usage`);
      setDailyUsage(response.data);
    } catch (error) {
      console.error('Failed to fetch daily usage:', error);
      // ถ้า API ไม่มี ให้ใช้ค่า default
      setDailyUsage({ used: 0, limit: 10 });
    } finally {
      setLoadingUsage(false);
    }
  };

  // ดึงข้อมูลจำนวนครั้งที่เหลือเมื่อโหลดหน้า
  useEffect(() => {
    fetchDailyUsage();
  }, []);

  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const [imageForCanvas] = useImage(imagePreview, "Anonymous");
  const containerRef = useRef(null);

  // Effect to update canvas size based on container width
  useEffect(() => {
    if (imageForCanvas && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const scale = containerWidth / imageForCanvas.width;
      setCanvasSize({
        width: containerWidth,
        height: imageForCanvas.height * scale,
      });
    }
  }, [imageForCanvas, imagePreview]);

  // Polling effect
  useEffect(() => {
    if (!predictionId || !loading) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/garden/check-prediction/${predictionId}`
        );
        const {
          status,
          result_url,
          history_id,
          error: predictionError,
        } = res.data;
        if (status === "succeeded") {
          setResultImage(result_url);
          setHistoryId(history_id);
          setLoading(false);
          setPredictionId(null);
          clearInterval(interval);
          // อัปเดตจำนวนครั้งที่เหลือหลังจากสร้างสำเร็จ
          fetchDailyUsage();
        } else if (status === "failed") {
          setError(`การสร้างภาพล้มเหลว: ${predictionError}`);
          setLoading(false);
          setPredictionId(null);
          clearInterval(interval);
        }
      } catch (err) {
        setError(
          "เกิดข้อผิดพลาดในการตรวจสอบสถานะ: " +
            (err.response?.data?.detail || err.message)
        );
        setLoading(false);
        setPredictionId(null);
        clearInterval(interval);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [predictionId, loading]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalFile(file);
        setImagePreview(event.target.result);
        setLines([]);
        setResultImage(null);
        // === เรียก API วิเคราะห์สวนจริง ===
        setAnalyzingInsights(true);
        setGardenInsights([]);
        setSelectedInsights([]);
        const formData = new FormData();
        formData.append("image", file);
        axios
          .post(`${API_BASE_URL}/garden/analyze-garden`, formData)
          .then((res) => {
            setGardenInsights(res.data.suggestions || []);
          })
          .catch(() => {
            setGardenInsights([]);
          })
          .finally(() => setAnalyzingInsights(false));
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y], brushSize }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };
  const handleClearMask = () => {
    setLines([]);
  };

  const exportMaskAsFile = () => {
    const stage = stageRef.current;
    if (!stage) return null;
    const maskLayer = new Konva.Layer();
    lines.forEach((line) => {
      maskLayer.add(
        new Konva.Line({
          points: line.points,
          stroke: "white",
          strokeWidth: line.brushSize,
          tension: 0.5,
          lineCap: "round",
          lineJoin: "round",
        })
      );
    });
    const tempStage = new Konva.Stage({
      width: canvasSize.width,
      height: canvasSize.height,
      container: document.createElement("div"),
    });
    tempStage.add(maskLayer);
    const dataURL = tempStage.toDataURL({ mimeType: "image/png" });
    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    return new File([blob], "mask.png", { type: "image/png" });
  };

  const getFullPrompt = () => {
    const allTags = [selectedStyle, ...Array.from(selectedFeatures)];
    const featuresString = allTags.join(", ");

    let prompt =
      "masterpiece, best quality, 8k, photorealistic, professional photography, cinematic lighting, ";
    prompt += `a beautiful and lush garden with ${featuresString} style. `;
    prompt +=
      "The garden must have a clear, logical pathway leading to the house entrance. ";
    prompt += "It features a distinct focal point. ";
    prompt +=
      "Use a variety of plants and flowers suitable for Thailand's tropical climate, with layered planting and rich textures. ";

    if (customKeywords) {
      prompt += `Specifically include these elements: ${customKeywords}.`;
    }
    if (selectedInsights.length > 0) {
      prompt += ` Please address these suggestions: ${selectedInsights.join(", ")}.`;
    }
    return prompt;
  };

  const handleSubmit = async () => {
    if (!originalFile) {
      setError("กรุณาอัปโหลดรูปภาพก่อน");
      return;
    }
    if (lines.length === 0) {
      setError("กรุณาระบายพื้นที่ที่ต้องการให้เป็นสวน");
      return;
    }

    setLoading(true);
    setError(null);
    setResultImage(null);

    const maskFile = exportMaskAsFile();
    if (!maskFile) {
      setError("ไม่สามารถสร้างไฟล์ Mask ได้");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      const allTags = [selectedStyle, ...Array.from(selectedFeatures)];
      formData.append("image", originalFile);
      formData.append("mask", maskFile);
      formData.append("prompt", getFullPrompt());
      allTags.forEach((tag) => {
        formData.append("selected_tags", tag);
      });

      const res = await axios.post(
        `${API_BASE_URL}/garden/generate-garden`,
        formData
      );

      if (res.data.status === "processing" && res.data.prediction_id) {
        setPredictionId(res.data.prediction_id);
      } else {
        throw new Error("Did not receive a valid prediction ID.");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด: " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const handleGenerateBOM = async () => {
    if (!historyId) {
      setError("เกิดข้อผิดพลาด: ไม่พบ History ID");
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
      const suggestions = res.data.suggestions || {};
      navigate("/bom-result", {
        state: {
          bom: bomDetails,
          suggestions,
          resultImage,
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
    <div className="w-full space-y-6">
      {/* แสดงจำนวนครั้งที่เหลือ */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🎯</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800">จำนวนครั้งที่เหลือวันนี้</h3>
              <p className="text-sm text-blue-600">
                {loadingUsage ? (
                  "กำลังโหลด..."
                ) : (
                  `${dailyUsage.used}/${dailyUsage.limit} ครั้ง`
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {dailyUsage.limit - dailyUsage.used}
            </div>
            <div className="text-xs text-blue-500">ครั้งที่เหลือ</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(dailyUsage.used / dailyUsage.limit) * 100}%` }}
          ></div>
        </div>
        {dailyUsage.used >= dailyUsage.limit && (
          <div className="mt-2 text-center text-red-600 text-sm font-medium">
            ⚠️ คุณใช้จำนวนครั้งครบแล้ววันนี้ กรุณาลองใหม่พรุ่งนี้
          </div>
        )}
      </div>

      {/* Section: About */}
      <section id="about" className="mt-10 mb-8">
        <h2 className="text-2xl font-bold text-green-700 mb-2">เกี่ยวกับ PlantPick</h2>
        <p className="text-gray-700">PlantPick คือแพลตฟอร์ม AI สำหรับออกแบบสวนและวิเคราะห์ภาพสวนจริง ช่วยให้คุณได้สวนในฝันอย่างง่ายดาย</p>
      </section>

      {/* Section: Features */}
      <section id="features" className="mb-8">
        <h2 className="text-2xl font-bold text-green-700 mb-2">ฟีเจอร์เด่น</h2>
        <ul className="list-disc ml-6 text-gray-700">
          <li>AI ออกแบบสวนตามภาพบ้านจริง</li>
          <li>วิเคราะห์แสง ทิศทางลม และข้อจำกัดจากภาพถ่าย</li>
          <li>เลือกสไตล์และฟีเจอร์สวนได้เอง</li>
          <li>ขอรายการของและราคาประเมิน (BOM)</li>
        </ul>
      </section>




      {loading ? (
        <EngagingLoadingScreen predictionId={predictionId} />
      ) : (
        <>
          {!resultImage && (
            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-8">
              {/* === ขั้นตอนที่ 1: อัปโหลด === */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  ขั้นตอนที่ 1: อัปโหลดภาพบ้าน
                </h2>
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

              {/* === แสดง insight/suggestions จาก AI หลังอัปโหลดรูป === */}
              {imagePreview && (
                <div className="my-4">
                  {analyzingInsights ? (
                    <div className="text-center text-blue-500">AI กำลังวิเคราะห์สวนของคุณ...</div>
                  ) : gardenInsights.length > 0 ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl">
                      <h3 className="font-bold text-yellow-800 mb-2">คำแนะนำเบื้องต้นจาก AI</h3>
                      <ul className="list-disc ml-6 text-gray-700">
                        {gardenInsights.map((s, i) => (
                          <li key={i} className="mb-1">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedInsights.includes(s)}
                                onChange={() => {
                                  setSelectedInsights((prev) =>
                                    prev.includes(s)
                                      ? prev.filter((x) => x !== s)
                                      : [...prev, s]
                                  );
                                }}
                                className="accent-green-600"
                              />
                              <span>{s}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">เลือกข้อเสนอแนะที่ต้องการให้ AI นำไปใช้ในการออกแบบสวนใหม่</p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* === ขั้นตอนที่ 2: ระบายสี === */}
              <div
                className={`pt-6 border-t transition-opacity duration-500 ${
                  !imagePreview
                    ? "opacity-40 cursor-not-allowed"
                    : "opacity-100"
                }`}
              >
                <div
                  className={`${!imagePreview ? "pointer-events-none" : ""}`}
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    ขั้นตอนที่ 2: ระบายพื้นที่สวน
                  </h2>
                  <div className="flex items-center gap-4 mb-4">
                    <span>ขนาดพู่กัน:</span>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-48"
                      disabled={!imagePreview}
                    />
                    <button
                      onClick={handleClearMask}
                      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800"
                      disabled={!imagePreview}
                    >
                      <FiTrash2 /> ล้างทั้งหมด
                    </button>
                  </div>
                  <div
                    ref={containerRef}
                    className="w-full flex justify-center items-center bg-gray-100 rounded-lg p-2"
                  >
                    <div className="border-2 border-dashed border-pink-500">
                      <Stage
                        width={canvasSize.width}
                        height={canvasSize.height}
                        onMouseDown={handleMouseDown}
                        onMousemove={handleMouseMove}
                        onMouseup={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={handleMouseUp}
                        ref={stageRef}
                      >
                        <Layer>
                          <KonvaImage
                            image={imageForCanvas}
                            width={canvasSize.width}
                            height={canvasSize.height}
                          />
                        </Layer>
                        <Layer>
                          {lines.map((line, i) => (
                            <Line
                              key={i}
                              points={line.points}
                              stroke="#ff00ff"
                              strokeWidth={line.brushSize}
                              tension={0.5}
                              lineCap="round"
                              lineJoin="round"
                              globalCompositeOperation={"source-over"}
                              opacity={0.5}
                            />
                          ))}
                        </Layer>
                      </Stage>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`space-y-6 pt-6 border-t transition-opacity duration-500 ${
                  !imagePreview
                    ? "opacity-40 cursor-not-allowed"
                    : "opacity-100"
                }`}
              >
                <div
                  className={`${!imagePreview ? "pointer-events-none" : ""}`}
                >
                  {/* === ขั้นตอนที่ 3: กำหนดสไตล์และสร้าง! === */}
                  <h2 className="text-xl font-bold text-gray-800">
                    ขั้นตอนที่ 3: กำหนดสไตล์และความต้องการ
                  </h2>
                  <div>
                    <label className="font-semibold text-gray-700">
                      สไตล์หลัก (เลือก 1 อย่าง)
                    </label>
                    <div className="flex flex-wrap gap-3 mt-2">
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
                      className="w-full mt-1 p-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={!imagePreview || dailyUsage.used >= dailyUsage.limit}
                      className="w-full sm:w-auto text-2xl font-extrabold text-white bg-gradient-to-r from-green-500 to-lime-400 rounded-full shadow-2xl px-16 py-5 transform transition-all hover:from-green-600 hover:to-lime-500 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-4 my-8"
                    >
                      <FiSend size={28} /> 
                      {dailyUsage.used >= dailyUsage.limit ? 'ใช้ครบจำนวนครั้งแล้ว' : 'สร้างสวนในฝัน'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {resultImage && (
        <div className="text-center mt-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              ผลลัพธ์จากโหมดสมจริง
            </h2>
            <img
              src={resultImage}
              alt="Inpainting result"
              className="mt-4 max-w-full rounded-lg shadow-lg mx-auto"
            />
            {/* ปุ่มรีเฟรช/สร้างใหม่ ใต้รูป */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => {
                  setResultImage(null);
                  setError(null);
                }}
                className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-lg py-3 px-10 rounded-full shadow transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center justify-center gap-2"
              >
                🔄 สร้างใหม่ (สุ่มใหม่)
              </button>
            </div>
          </div>
          <div className="pt-6 border-t">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                ขั้นตอนสุดท้าย: กำหนดงบประมาณ
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                เลือกช่วงงบประมาณของคุณเพื่อดูรายการของและราคาประเมิน
              </p>
            </div>
            {/* ปุ่มงบประมาณแนวนอน */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {budgetOptions.map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => setSelectedBudgetLevel(opt.level)}
                  className={
                    `px-5 py-3 text-xl font-bold rounded-full transition-all duration-200 ` +
                    (selectedBudgetLevel === opt.level
                      ? "bg-green-600 text-white shadow-lg scale-105 ring-4 ring-green-200"
                      : "bg-white text-gray-800 border hover:bg-green-50")
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* ปุ่มขอรายการของและราคา ล่างสุด เด่นสุด */}
          <div className="pt-8 flex justify-center">
            <button
              onClick={handleGenerateBOM}
              disabled={bomLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-500 text-white font-extrabold text-2xl py-5 px-16 rounded-full shadow-2xl hover:from-orange-600 hover:to-pink-600 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-orange-200 flex items-center justify-center gap-4 my-8 disabled:bg-gray-400"
            >
              {bomLoading ? (
                <>
                  <FiSend size={28} className="animate-spin" /> กำลังวิเคราะห์...
                </>
              ) : (
                <>
                  🌱 ขอรายการของและราคา
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
