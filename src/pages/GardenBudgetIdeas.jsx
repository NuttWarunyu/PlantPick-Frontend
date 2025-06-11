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
  const [loading, setLoading] = useState(false); // เพิ่ม loading state

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const stylePrompts = {
    english:
      "Design an English garden in the masked area only, with rose bushes, white fences, brick paths, lavender flowers, and a large lawn. Add a romantic atmosphere. Use realistic perspective. Preserve the house, sky, and surroundings.",
    tropical:
      "Design a tropical garden in the masked area only that connects a pathway from the visible door to the garden area. Add a focal point visible from the house window, such as a small fountain, a tree with flowers, or a seating area. Use curved paths, stepping stones, and balanced greenery. Keep the house and sky untouched.",
    japanese:
      "Design a Japanese Zen garden in the masked area only using moss, raked gravel, bonsai, stone lanterns, and koi ponds. Use asymmetry and calm composition. Preserve the house, sky, and surroundings.",
    modern:
      "Design a modern garden in the masked area only with clean lines, minimal plants, architectural shapes, and water features. Emphasize symmetry and contrast. Preserve the house, sky, and surroundings.",
  };

  useEffect(() => {
    if (!imageRef.current || !containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      const img = imageRef.current;
      const container = containerRef.current;

      if (!img || !container) return;
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [imagePreview, resultImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleSubmit = async () => {
    if (!image) return;

    setLoading(true); // เริ่มแสดง loading

    try {
      let formData = new FormData();
      formData.append("image", image);
      formData.append("prompt", stylePrompts[selectedStyle]);
      // ไม่มี mask และ bounding box เพราะไม่ได้ลากกรอบแล้ว
      formData.append("view_angle", viewAngle);

      const response = await axios.post(
        "https://plantpick-backend.up.railway.app/garden/generate-garden",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResultImage(response.data.result_url);
    } catch (error) {
      alert("Error generating garden: " + error.message);
    } finally {
      setLoading(false); // ปิด loading หลังจบ
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
              disabled={loading} // ปิดตอน loading
            />
          </div>

          {imagePreview && (
            <div
              ref={containerRef}
              className="canvasWrapper bg-gray-100 rounded-lg shadow-md p-4 mt-4"
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
            </div>
          )}

          <div className="space-y-4 mt-6">
            <Label className="text-lg font-semibold text-gray-700">
              เลือกสไตล์สวน
            </Label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading} // ปิดตอน loading
            >
              <option value="english">สวนอังกฤษ</option>
              <option value="tropical">สวน Tropical</option>
              <option value="modern">สวน Modern</option>
              <option value="japanese">สวนญี่ปุ่น</option>
            </select>
          </div>

          <div className="space-y-4 mt-4">
            <Label className="text-lg font-semibold text-gray-700">
              เลือกมุมมอง
            </Label>
            <select
              value={viewAngle}
              onChange={(e) => setViewAngle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading} // ปิดตอน loading
            >
              <option value="front">มุมหน้า</option>
              <option value="side">มุมข้าง</option>
              <option value="back">มุมหลัง</option>
            </select>
          </div>

          <div className="flex space-x-2 mt-6">
            <Button
              onClick={handleSubmit}
              disabled={loading} // ปิดปุ่มตอน loading
              className="bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 text-xl px-6 py-3 rounded-xl shadow-md w-full transition duration-300"
            >
              🌿 Generate Garden
            </Button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="mt-6 text-center text-green-700 font-semibold">
              <svg
                className="animate-spin h-8 w-8 mx-auto mb-2 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              กำลังสร้างภาพสวน กรุณารอสักครู่...
            </div>
          )}
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
