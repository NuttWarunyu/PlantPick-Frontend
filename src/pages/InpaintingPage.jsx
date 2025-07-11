import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { FiUploadCloud, FiTrash2, FiSend } from "react-icons/fi";

// (เราสามารถนำ EngagingLoadingScreen มาใช้ซ้ำได้)
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

export default function InpaintingPage() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [lines, setLines] = useState([]);
  const [brushSize, setBrushSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const [predictionId, setPredictionId] = useState(null);

  const isDrawing = useRef(false);
  const stageRef = useRef(null);

  useEffect(() => {
    if (!predictionId || !loading) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/garden/check-prediction/${predictionId}`
        );
        const { status, result_url, error: predictionError } = res.data;

        if (status === "succeeded") {
          setResultImage(result_url);
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
        // === จุดแก้ไข: เพิ่มการใช้งานตัวแปร err ===
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
        setImage(file);
        setImagePreview(event.target.result);
        setLines([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool: "pen", points: [pos.x, pos.y], brushSize }]);
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
      width: stage.width(),
      height: stage.height(),
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
    if (!image) {
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
      formData.append("image", image);
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

  return (
    <div className="w-full space-y-6">
      <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-800">
          🧪 ห้องทดลอง: โหมดสมจริง (Inpainting)
        </h1>
        <p className="text-gray-600 mt-1">
          ระบายพื้นที่ที่คุณต้องการให้ AI สร้างสวนทับลงไป
        </p>
      </div>

      {loading ? (
        <EngagingLoadingScreen predictionId={predictionId} />
      ) : (
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

          <div className="relative w-full flex justify-center items-center bg-gray-200 rounded-lg">
            {imagePreview ? (
              <div
                style={{
                  backgroundImage: `url(${imagePreview})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <Stage
                  width={512}
                  height={512}
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
                      />
                    ))}
                  </Layer>
                </Stage>
              </div>
            ) : (
              <div className="w-full h-80 flex items-center justify-center text-gray-400">
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
                <FiSend /> {loading ? "กำลังทดสอบ..." : "ทดสอบโมเดล Inpainting"}
              </button>
            </div>
          )}
        </>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {resultImage && (
        <div className="text-center mt-6">
          <h2 className="text-xl font-bold">ผลลัพธ์จากโมเดล Inpainting:</h2>
          <img
            src={resultImage}
            alt="Inpainting result"
            className="mt-4 max-w-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
