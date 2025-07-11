import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import { FiUploadCloud, FiTrash2, FiSend } from "react-icons/fi";

export default function InpaintingPage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [lines, setLines] = useState([]);
  const [brushSize, setBrushSize] = useState(30);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const imageRef = useRef(null); // Ref สำหรับอ้างอิงถึง <img>

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setLines([]); // เคลียร์เส้นเก่าเมื่อเปลี่ยนรูป
      };
      reader.readAsDataURL(file);
    }
  };

  // ฟังก์ชันสำหรับอัปเดตขนาด Canvas เมื่อรูปโหลดเสร็จ
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

  const handleSubmit = () => {
    // ฟังก์ชันนี้จะยังไม่ทำงานจริงในเวอร์ชันนี้
    alert("ทดสอบการส่งข้อมูล (ยังไม่เชื่อมต่อ API)");
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

      {/* ส่วนควบคุม */}
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

      {/* === จุดแก้ไขหลัก: ใช้ relative และ absolute เพื่อซ้อนทับ === */}
      <div className="w-full flex justify-center items-center bg-gray-100 rounded-lg p-2 min-h-[400px]">
        {imagePreview ? (
          <div className="relative inline-block">
            {/* 1. รูปภาพจะถูกแสดงผลตามสัดส่วนจริง */}
            <img
              ref={imageRef}
              src={imagePreview}
              alt="Uploaded preview"
              onLoad={handleImageLoad}
              className="block max-w-full h-auto max-h-[70vh] rounded-md"
            />
            {/* 2. Canvas จะถูกสร้างขึ้นมาซ้อนทับ โดยมีขนาดเท่ากับรูปภาพที่แสดงผล */}
            <div
              className="absolute top-0 left-0 border-2 border-dashed border-pink-500"
              style={{ width: canvasSize.width, height: canvasSize.height }}
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
            className="flex items-center gap-3 bg-blue-600 text-white font-bold text-lg py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-all"
          >
            <FiSend /> ทดสอบโมเดล Inpainting
          </button>
        </div>
      )}
    </div>
  );
}
