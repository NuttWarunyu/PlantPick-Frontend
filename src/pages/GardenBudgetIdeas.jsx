import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function GardenImageMaskPage() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState("english");
  const [resultImage, setResultImage] = useState(null);
  const [viewAngle, setViewAngle] = useState("front");
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const history = useRef([]);
  const [points, setPoints] = useState([]);
  const [bbox, setBbox] = useState(null);
  const [scale, setScale] = useState(1);

  const stylePrompts = {
    english:
      "In the masked area only, design a photorealistic English garden using botanically accurate trees and plants such as Rosa rugosa, English boxwood, and oak. Include curved stone pathways and a vintage fountain in the lower area. For side angles, add low hedges along edges and ensure balance with the house structure. For front angles, emphasize symmetry and a central focal point. The composition should resemble a real garden designed by a landscape architect, with balance and harmony. Avoid fantasy or surreal elements. Keep house, sky, and surroundings unchanged.",
    tropical:
      "In the masked area only, design a realistic tropical garden using botanically accurate species like coconut palms, banana plants, bird of paradise, and heliconia. Include a natural stone pathway and a small pond or water feature in the lower section. For side angles, add dense foliage along edges. For front angles, create a layered tropical layout. The layout should reflect real landscape design principles with focal points and flow. Avoid fantasy or imaginary trees. Keep house, sky, and surroundings unchanged.",
    japanese:
      "In the masked area only, design a realistic Japanese Zen garden with elements such as moss, raked gravel, bonsai, stone lanterns, and koi ponds. Include asymmetrical composition and calm atmosphere. For side angles, extend gravel patterns along the edge. For front angles, emphasize a central Zen feature. No fantasy or surreal elements. Keep house, sky, and surroundings unchanged.",
    modern:
      "In the masked area only, design a minimalist modern garden with clean lines, ornamental grasses, architectural plants, concrete or wooden decking, and a water feature. Emphasize structure and geometry. For side angles, add vertical plant elements. For front angles, focus on symmetrical layouts. Avoid fantasy or surreal elements. Keep house, sky, and surroundings unchanged.",
  };

  useEffect(() => {
    if (!imageRef.current || !canvasRef.current || !containerRef.current)
      return;

    const resizeObserver = new ResizeObserver(() => {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      const container = containerRef.current;

      if (!img || !canvas || !container) return;

      const realWidth = img.naturalWidth;
      const displayWidth = container.offsetWidth;
      const ratio = displayWidth / realWidth;

      setScale(ratio);

      canvas.width = realWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      ctx.setLineDash([]);
      history.current = [];
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [imagePreview, resultImage]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const getPosition = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (e.touches && e.touches.length > 0) {
        return {
          x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
          y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height),
        };
      } else {
        const x =
          (e.offsetX !== undefined ? e.offsetX : e.clientX - rect.left) *
          (canvas.width / rect.width);
        const y =
          (e.offsetY !== undefined ? e.offsetY : e.clientY - rect.top) *
          (canvas.height / rect.height);
        return { x, y };
      }
    };

    const handleStartDraw = (e) => {
      if (!isDrawing || (e.touches && e.touches.length > 0 && !isDrawing))
        return;
      e.preventDefault();
      const { x, y } = getPosition(e);
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
      history.current.push(canvas.toDataURL());
      setPoints((prev) => [...prev, [x, y]]);
    };

    const handleDraw = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const { x, y } = getPosition(e);
      setPoints((prev) => [...prev, [x, y]]);

      ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.globalCompositeOperation = "source-over";
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);

      if (points.length > 0) {
        const xs = points.map(([px]) => px).concat([x]);
        const ys = points.map(([, py]) => py).concat([y]);
        const newBbox = [
          Math.min(...xs),
          Math.min(...ys),
          Math.max(...xs),
          Math.max(...ys),
        ];
        setBbox(newBbox);

        const last = history.current[history.current.length - 1];
        if (last) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            ctx.setLineDash([]);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i][0], points[i][1]);
            }
            ctx.lineTo(x, y);
            ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.strokeStyle = "rgba(255, 0, 0, 1)";
            ctx.lineWidth = 2;
            ctx.strokeRect(
              newBbox[0],
              newBbox[1],
              newBbox[2] - newBbox[0],
              newBbox[3] - newBbox[1]
            );
          };
          img.src = last;
        }
      }
    };

    const handleEndDraw = () => {
      if (!isDrawing) return;
      ctx.closePath();
      setIsDrawing(false);
      if (points.length > 0) {
        history.current.push(canvas.toDataURL());
      }
    };

    canvas.addEventListener("mousedown", handleStartDraw, { passive: false });
    canvas.addEventListener("mousemove", handleDraw, { passive: false });
    canvas.addEventListener("mouseup", handleEndDraw, { passive: false });
    canvas.addEventListener("mouseleave", handleEndDraw, { passive: false });
    canvas.addEventListener("touchstart", handleStartDraw, { passive: false });
    canvas.addEventListener("touchmove", handleDraw, { passive: false });
    canvas.addEventListener("touchend", handleEndDraw, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", handleStartDraw);
      canvas.removeEventListener("mousemove", handleDraw);
      canvas.removeEventListener("mouseup", handleEndDraw);
      canvas.removeEventListener("mouseleave", handleEndDraw);
      canvas.removeEventListener("touchstart", handleStartDraw);
      canvas.removeEventListener("touchmove", handleDraw);
      canvas.removeEventListener("touchend", handleEndDraw);
    };
  }, [isDrawing, points]);

  const clearMask = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.setLineDash([]);
    history.current = [];
    setPoints([]);
    setBbox(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResultImage(null);
      setPoints([]);
      setBbox(null);
    }
  };

  const handleSubmit = async () => {
    if (!image || !canvasRef.current) return;

    try {
      let formData = new FormData();
      canvasRef.current.toBlob(async (blob) => {
        formData.append("image", image);
        formData.append("mask", blob);
        formData.append("prompt", stylePrompts[selectedStyle]);
        if (bbox) {
          const normalizedBbox = [
            bbox[0] / canvasRef.current.width,
            bbox[1] / canvasRef.current.height,
            bbox[2] / canvasRef.current.width,
            bbox[3] / canvasRef.current.height,
          ];
          formData.append("bounding_box", JSON.stringify(normalizedBbox));
        }
        formData.append("view_angle", viewAngle);

        const response = await axios.post(
          "https://plantpick-backend.up.railway.app/garden/generate-garden-mask",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setResultImage(response.data.result_url);
      }, "image/png");
    } catch (error) {
      alert("Error generating garden: " + error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <Card className="mb-6 shadow-lg bg-white rounded-xl">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-700">
              อัปโหลดภาพบ้าน
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border-gray-300 rounded-lg"
            />
          </div>

          {imagePreview && (
            <>
              <div className="flex space-x-4 mt-4">
                <Button
                  onClick={() => setIsDrawing(!isDrawing)}
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 text-xl px-6 py-3 rounded-xl shadow-md transition duration-300"
                >
                  📏 ลากกรอบ
                </Button>
                <Button
                  onClick={clearMask}
                  className="bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700 text-xl px-6 py-3 rounded-xl shadow-md transition duration-300"
                >
                  🔄 Reset กรอบ
                </Button>
              </div>

              <p className="text-sm text-gray-600 mt-2">
                <span title="ลากกรอบครอบส่วนที่ต้องการคงไว้ (เช่น บ้าน) ส่วนที่เหลือจะเปลี่ยนเป็นสวน">
                  🎨 ลากกรอบครอบส่วนที่ต้องการคงไว้ (เช่น บ้าน)
                  (ส่วนที่เหลือจะเปลี่ยนเป็นสวน)
                </span>
              </p>

              <div
                ref={containerRef}
                className="canvasWrapper bg-gray-100 rounded-lg shadow-md p-4"
                style={{
                  width: "100%",
                  position: "relative",
                  userSelect: "none",
                  maxHeight: "70vh",
                  overflow: "auto",
                }}
              >
                <img
                  ref={imageRef}
                  src={imagePreview}
                  alt="Uploaded Preview"
                  className="rounded w-full h-auto block"
                  draggable={false}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="canvas"
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    touchAction: isDrawing ? "none" : "auto",
                    cursor: isDrawing ? "crosshair" : "default",
                    zIndex: 10,
                  }}
                />
              </div>
            </>
          )}

          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-700">
              เลือกสไตล์สวน
            </Label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="english">สวนอังกฤษ</option>
              <option value="tropical">สวน Tropical</option>
              <option value="modern">สวน Modern</option>
              <option value="japanese">สวนญี่ปุ่น</option>
            </select>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-700">
              เลือกมุมมอง
            </Label>
            <select
              value={viewAngle}
              onChange={(e) => setViewAngle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="front">มุมหน้า</option>
              <option value="side">มุมข้าง</option>
              <option value="back">มุมหลัง</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 text-xl px-6 py-3 rounded-xl shadow-md w-full transition duration-300"
            >
              🌿 Generate Garden
            </Button>
          </div>
        </CardContent>
      </Card>

      {resultImage && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-center text-green-800 mb-4">
            ผลลัพธ์
          </h2>
          <Card className="shadow-lg bg-white rounded-xl">
            <CardContent className="p-6">
              <div
                ref={containerRef}
                className="canvasWrapper bg-gray-100 rounded-lg shadow-md p-4"
                style={{
                  width: "100%",
                  position: "relative",
                  userSelect: "none",
                  maxHeight: "70vh",
                  overflow: "auto",
                }}
              >
                <img
                  src={resultImage}
                  alt="Generated Garden"
                  className="rounded block"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div className="flex space-x-2 mt-4">
                <Button
                  onClick={() => window.open("https://shopee.co.th", "_blank")}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 text-xl px-6 py-3 rounded-xl shadow-md w-full transition duration-300"
                >
                  สั่งซื้ออุปกรณ์สวน
                </Button>
                <Button
                  onClick={() => (window.location.href = "/contact")}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 text-xl px-6 py-3 rounded-xl shadow-md w-full transition duration-300"
                >
                  จ้างออกแบบสวน
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
