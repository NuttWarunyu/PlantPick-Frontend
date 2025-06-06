import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function GardenImageMaskPage() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState("english"); // Default style
  const [resultImage, setResultImage] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const history = useRef([]);
  const [points, setPoints] = useState([]); // เก็บจุดที่วาด
  const [bbox, setBbox] = useState(null); // เก็บ bounding box
  const [scale, setScale] = useState(1);

  // Define prompt templates for each style
  const stylePrompts = {
    english:
      "In the masked area only, design a photorealistic English garden using botanically accurate trees and plants such as Rosa rugosa, English boxwood, and oak. Include curved stone pathways and a vintage fountain in the lower area. The composition should resemble a real garden designed by a landscape architect, with balance, symmetry, and a clear focal point. Avoid fantasy or surreal elements. Keep house, sky, and surroundings unchanged.",
    tropical:
      "In the masked area only, design a realistic tropical garden using botanically accurate species like coconut palms, banana plants, bird of paradise, and heliconia. Include a natural stone pathway and a small pond or water feature in the lower section. The layout should reflect real landscape design principles with focal points and flow. Avoid fantasy or imaginary trees. Keep house, sky, and surroundings unchanged.",
    japanese:
      "In the masked area only, design a realistic Japanese Zen garden with elements such as moss, raked gravel, bonsai, stone lanterns, and koi ponds. Include asymmetrical composition, calm atmosphere, and harmony with nature. No fantasy or surreal elements. Keep house, sky, and surroundings unchanged.",
    modern:
      "In the masked area only, design a minimalist modern garden with clean lines, ornamental grasses, architectural plants, concrete or wooden decking, and a water feature. Emphasize structure, geometry, and simplicity. Avoid fantasy or surreal elements. Keep house, sky, and surroundings unchanged.",
  };

  useEffect(() => {
    if (!imageRef.current || !canvasRef.current || !containerRef.current)
      return;

    const resizeObserver = new ResizeObserver(() => {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      const container = containerRef.current;

      const realWidth = img.naturalWidth;
      const displayWidth = container.offsetWidth;
      const ratio = displayWidth / realWidth;

      setScale(ratio);

      canvas.width = realWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // วาดเส้นประรอบ canvas เพื่อบ่งบอกขอบเขตการทำงาน
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "rgba(128, 128, 128, 0.5)"; // เส้นประสีเทา
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      ctx.setLineDash([]); // รีเซ็ตเส้นประ
      history.current = [];
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [imagePreview]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const getPosition = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (e.touches && e.touches.length > 0) {
        // Handle touch events
        return {
          x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
          y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height),
        };
      } else {
        // Handle mouse events
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
      e.preventDefault();
      const { x, y } = getPosition(e);
      ctx.lineWidth = 1; // เส้นบางสำหรับเส้นประ
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
      history.current.push(canvas.toDataURL());
      setIsDrawing(true);
      setPoints((prev) => [...prev, [x, y]]);
    };

    const handleDraw = (e) => {
      if (!isDrawing) return;
      const { x, y } = getPosition(e);
      setPoints((prev) => [...prev, [x, y]]);

      if (tool === "pen") {
        ctx.strokeStyle = "rgba(128, 128, 128, 0.5)"; // เส้นประสีเทา
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]); // ทำให้เป็นเส้นประ
        ctx.globalCompositeOperation = "source-over";
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]); // รีเซ็ตเส้นประ
      } else if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 10; // ปรับขนาด eraser ให้เล็กลง
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      }

      // คำนวณและวาด Bounding Box แบบเรียลไทม์
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

        // รีวาดจาก history และวาด bbox
        const last = history.current[history.current.length - 1];
        if (last) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // วาดเส้นประรอบ canvas อีกครั้ง
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            ctx.setLineDash([]);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // วาดเส้นที่เพิ่งเพิ่ม
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

            // วาด Bounding Box
            ctx.strokeStyle = "rgba(255, 0, 0, 1)"; // สีแดงสำหรับ bbox
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
        history.current.push(canvas.toDataURL()); // บันทึกหลังวาดเสร็จ
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
  }, [isDrawing, tool, points]);

  const clearMask = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // วาดเส้นประรอบ canvas
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.setLineDash([]);
    history.current = [];
    setPoints([]);
    setBbox(null);
  };

  const undo = () => {
    const ctx = canvasRef.current?.getContext("2d");
    const last = history.current.pop();
    if (last && ctx) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        // วาดเส้นประรอบ canvas
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.setLineDash([]);
        ctx.drawImage(
          img,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        setPoints([]); // รีเซ็ต points
        setBbox(null); // รีเซ็ต bbox
      };
      img.src = last;
    }
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
        formData.append("prompt", stylePrompts[selectedStyle]); // ใช้ prompt จาก selected style
        if (bbox) {
          const normalizedBbox = [
            bbox[0] / canvasRef.current.width,
            bbox[1] / canvasRef.current.height,
            bbox[2] / canvasRef.current.width,
            bbox[3] / canvasRef.current.height,
          ];
          formData.append("bounding_box", JSON.stringify(normalizedBbox));
        }

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
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Garden Designer</h1>

      <Card className="mb-4">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Upload Your House Image</Label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {imagePreview && (
            <>
              <div className="flex space-x-2 mt-4">
                <Button
                  onClick={() => setTool("pen")}
                  variant={tool === "pen" ? "default" : "outline"}
                >
                  ✏️ Pen
                </Button>
                <Button
                  onClick={() => setTool("eraser")}
                  variant={tool === "eraser" ? "default" : "outline"}
                >
                  🧽 Eraser
                </Button>
                <Button onClick={undo} variant="outline">
                  ↩️ Undo
                </Button>
                <Button onClick={clearMask} variant="outline">
                  🗑 Clear
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                <span title="ลากเพื่อเลือกส่วนที่ต้องการคงไว้ เช่น ถ้าครอบบ้าน บ้านจะไม่เปลี่ยน แต่ส่วนที่ไม่ได้ครอบจะกลายเป็นสวนตามสไตล์ที่เลือก">
                  🎨 ลากเพื่อเลือกส่วนที่ต้องการคงไว้
                  (ส่วนที่ไม่ได้ลากจะเปลี่ยนเป็นสวน)
                </span>
              </p>

              <div
                ref={containerRef}
                className="canvasWrapper"
                style={{
                  width: "100%",
                  position: "relative",
                  userSelect: "none",
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
                    touchAction: "none",
                    cursor: "crosshair",
                    zIndex: 10,
                  }}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Select Garden Style</Label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="english">สวนอังกฤษ</option>
              <option value="tropical">สวน Tropical</option>
              <option value="modern">สวน Modern</option>
              <option value="japanese">สวนญี่ปุ่น</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSubmit}>🌿 Generate Garden</Button>
          </div>
        </CardContent>
      </Card>

      {resultImage && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Result</h2>
          <img
            src={resultImage}
            alt="Generated Garden"
            className="rounded w-full h-auto"
          />
          <div className="flex space-x-2 mt-2">
            <Button
              onClick={() => window.open("https://shopee.co.th", "_blank")}
            >
              สั่งซื้ออุปกรณ์สวน
            </Button>
            <Button onClick={() => (window.location.href = "/contact")}>
              จ้างออกแบบสวน
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
