import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import {
  FiUploadCloud,
  FiTrash2,
  FiSend,
  FiShoppingCart,
  FiMessageSquare,
  FiThumbsUp,
  FiHome,
} from "react-icons/fi";

const EngagingLoadingScreen = ({ predictionId }) => (
  <div className="w-full bg-gray-50 p-8 rounded-2xl text-center">
    <p className="text-xl font-bold text-gray-700 animate-pulse">
      กำลังสร้างสรรค์สวนในฝันของคุณ...
    </p>
    <p className="text-sm text-gray-500 mt-2">
      กระบวนการนี้อาจใช้เวลา 2-4 นาที
    </p>
    {predictionId && (
      <p className="text-xs text-gray-400 mt-2">ID: {predictionId}</p>
    )}
  </div>
);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const budgetOptions = [
  { label: "< 50,000", value: 50000, level: 1 },
  { label: "50,000 - 100,000", value: 100000, level: 2 },
  { label: "100,000 - 250,000", value: 250000, level: 3 },
  { label: "> 250,000", value: 500000, level: 4 },
];

export default function InpaintingPage() {
  const navigate = useNavigate();
  const [originalFile, setOriginalFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [lines, setLines] = useState([]);
  const [brushSize, setBrushSize] = useState(25);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const [predictionId, setPredictionId] = useState(null);

  const [historyId, setHistoryId] = useState(null);
  const [bomLoading, setBomLoading] = useState(false);
  const [selectedBudgetLevel, setSelectedBudgetLevel] = useState(2);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const imageRef = useRef(null); // Ref for the <img> tag

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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      const { clientWidth, clientHeight } = imageRef.current;
      setCanvasSize({ width: clientWidth, height: clientHeight });
    }
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
      formData.append("image", originalFile);
      formData.append("mask", maskFile);
      formData.append(
        "prompt",
        "A beautiful, lush, photorealistic garden with a modern style"
      );
      formData.append("selected_tags", "inpainting-test");

      const res = await axios.post(
        `${API_BASE_URL}/garden/generate-inpainting`,
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
      <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-800">
          🧪 ห้องทดลอง: โหมดสมจริง (Inpainting)
        </h1>
        <p className="text-gray-600 mt-1">
          ระบายพื้นที่ที่คุณต้องการให้ AI สร้างสวน
        </p>
      </div>

      {loading ? (
        <EngagingLoadingScreen predictionId={predictionId} />
      ) : (
        <>
          {!resultImage && (
            <>
              <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
                <div>
                  <label htmlFor="file-upload" className="font-semibold">
                    1. อัปโหลดรูปบ้านของคุณ:
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 hover:file:bg-gray-200"
                  />
                </div>
                {imagePreview && (
                  <div>
                    <label className="font-semibold">
                      2. ระบายพื้นที่สวน (ใช้เมาส์วาด):
                    </label>
                    <div className="flex items-center gap-4 mt-2">
                      <span>ขนาดพู่กัน:</span>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-48"
                      />
                      <button
                        onClick={handleClearMask}
                        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 /> ล้างทั้งหมด
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full flex justify-center items-center bg-gray-100 rounded-lg p-2 min-h-[400px]">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      ref={imageRef}
                      src={imagePreview}
                      alt="Uploaded preview"
                      onLoad={handleImageLoad}
                      className="block max-w-full h-auto max-h-[70vh] rounded-md"
                    />
                    <div
                      className="absolute top-0 left-0 border-2 border-dashed border-pink-500"
                      style={{
                        width: canvasSize.width,
                        height: canvasSize.height,
                      }}
                    >
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
                ) : (
                  <div className="text-gray-400">
                    <p>โปรดอัปโหลดรูปภาพเพื่อเริ่มใช้งาน</p>
                  </div>
                )}
              </div>

              {imagePreview && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-3 bg-blue-600 text-white font-bold text-lg py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-all"
                  >
                    <FiSend />{" "}
                    {loading ? "กำลังทดสอบ..." : "ทดสอบโมเดล Inpainting"}
                  </button>
                </div>
              )}
            </>
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
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {budgetOptions.map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => setSelectedBudgetLevel(opt.level)}
                  className={`px-5 py-2 text-sm font-bold rounded-full transition-all ${
                    selectedBudgetLevel === opt.level
                      ? "bg-green-600 text-white shadow-lg"
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
              className="bg-orange-500 text-white font-bold text-lg py-3 px-10 rounded-full shadow-lg hover:bg-orange-600 disabled:bg-gray-400"
            >
              {bomLoading ? "กำลังวิเคราะห์..." : "🌱 ขอรายการของและราคา"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
