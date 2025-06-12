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
  const [budgetLevel, setBudgetLevel] = useState("medium");
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const stylePrompts = {
    english:
      "Create a professional English garden design in the masked area, featuring well-planned walkways, lush rose bushes, white picket fences, brick paths, lavender flowers, and a large lawn. Include a clear focal point visible from the house window, such as a charming fountain or seating area. Use realistic perspective. Preserve the house, roof, and its original color and structure. Do not alter the house in any way. Keep the sky and surroundings unchanged.",
    tropical:
      "Design a professional tropical garden in the masked area with curved pathways, stepping stones, palm trees, and balanced greenery. Include a focal point visible from the house window, such as a small fountain, flowering tree, or cozy seating area. Emphasize harmony and natural aesthetics. Preserve the house, roof, and its original color and structure. Do not alter the house. Keep the sky and surroundings unchanged.",
    japanese:
      "Create a professional Japanese Zen garden in the masked area using moss, raked gravel, bonsai, stone lanterns, and koi ponds. Include a focal point visible from the house window, such as a calm stone arrangement or water feature. Apply asymmetry and a serene composition. Preserve the house, roof, and its original color and structure. Do not alter the house. Keep the sky and surroundings unchanged.",
    modern:
      "Design a professional modern garden in the masked area with clean lines, minimalistic plants, geometric shapes, and water features. Include a focal point visible from the house window, such as a sculptural water feature or modern seating area. Emphasize contrast and symmetry. Preserve the house, roof, and its original color and structure. Do not alter the house. Keep the sky and surroundings unchanged.",
  };

  const budgetPrompts = {
    low: "Use affordable materials, minimal decoration, native plants, and a simple layout. Avoid luxury features. Focus on easy maintenance.",
    medium:
      "Use a balanced mix of cost-effective and aesthetic elements. Include a focal point like a small fountain or bench. Moderate decoration.",
    high: "Use premium materials, advanced landscaping, decorative lighting, water features, and artistic elements. Showcase luxurious garden design.",
  };

  const getFullPrompt = (style, budget) => {
    return `${stylePrompts[style]} ${budgetPrompts[budget]}`;
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

    setLoading(true);

    try {
      let formData = new FormData();
      formData.append("image", image);
      formData.append("prompt", getFullPrompt(selectedStyle, budgetLevel));

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
      setLoading(false);
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
              disabled={loading}
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
              disabled={loading}
            >
              <option value="english">สวนอังกฤษ</option>
              <option value="tropical">สวน Tropical</option>
              <option value="modern">สวน Modern</option>
              <option value="japanese">สวนญี่ปุ่น</option>
            </select>
          </div>

          <div className="space-y-4 mt-4">
            <Label className="text-lg font-semibold text-gray-700">
              เลือกระดับงบประมาณในการจัดสวน
            </Label>
            <select
              value={budgetLevel}
              onChange={(e) => setBudgetLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={loading}
            >
              <option value="low">งบจำกัด</option>
              <option value="medium">งบปานกลาง</option>
              <option value="high">งบสูง</option>
            </select>
          </div>

          <div className="flex space-x-2 mt-6">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 text-xl px-6 py-3 rounded-xl shadow-md w-full transition duration-300"
            >
              🌿 Generate Garden
            </Button>
          </div>

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
              <div>กำลังสร้างภาพสวน กรุณารอสักครู่...</div>
              <div className="text-sm text-gray-600">
                * ระบบจะใช้เวลาประมวลผลประมาณ <b>2 นาที</b>{" "}
                สำหรับการสร้างครั้งแรกเท่านั้น
                <br />
                ครั้งต่อไปจะเร็วขึ้น ใช้เวลาประมาณ <b>5 วินาที</b>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <Button
                  onClick={() => window.open("https://shopee.co.th", "_blank")}
                  className="h-20 text-xl font-semibold bg-white text-green-700 border-2 border-green-500 hover:bg-green-100 rounded-2xl shadow-lg transition-all"
                >
                  🛒 ซื้อของจัดสวนเอง
                </Button>
                <Button
                  onClick={() => (window.location.href = "/contact")}
                  className="h-20 text-xl font-semibold bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 rounded-2xl shadow-lg transition-all"
                >
                  📄 ขอใบเสนอราคาจัดสวน
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
