"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import "../components/ui/BOMSection.css";

export default function GardenImageMaskPage() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState("english");
  const [budgetLevel, setBudgetLevel] = useState("medium");
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bomLoading, setBomLoading] = useState(false);
  const [historyId, setHistoryId] = useState(null);
  const [error, setError] = useState(null);

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
    low: "Use a simple and affordable garden layout with large grass areas and minimal decorations. Include only a few low-cost, native plants such as small shrubs or bushes. Avoid luxury features, hardscape, lighting, or water systems. Emphasize open space and easy maintenance.",
    medium:
      "Create a balanced garden with a mix of greenery and decorative elements. Include a moderate number of medium-sized plants, flower beds, and a simple pathway such as stepping stones. Add one focal point like a small fountain, bench, or garden arch. Avoid excessive luxury. Focus on aesthetics and functionality.",
    high: "Design a luxurious and professionally landscaped garden. Use a variety of trees, flowering plants, decorative stones, and well-designed pathways. Add premium features like lighting systems, sculptural elements, fountains, and automatic irrigation. Showcase a rich and elegant garden style with attention to detail.",
  };

  const budgetValues = {
    low: 50000,
    medium: 100000,
    high: 200000,
  };

  const getBudgetValue = (budgetLevel) => {
    return budgetValues[budgetLevel] || 200000;
  };

  const getFullPrompt = (style, budget) => {
    return `${stylePrompts[style]} ${budgetPrompts[budget]}`;
  };

  useEffect(() => {
    if (!imageRef.current || !containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (imageRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        imageRef.current.style.width = `${containerWidth}px`;
      }
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
      setHistoryId(null);
      setError(null);
    }
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
      formData.append("image", image);
      formData.append("prompt", getFullPrompt(selectedStyle, budgetLevel));

      const res = await axios.post(
        "https://plantpick-backend.up.railway.app/garden/generate-garden",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
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
      const budget = getBudgetValue(budgetLevel);
      const res = await axios.post(
        "https://plantpick-backend.up.railway.app/garden/generate-bom",
        { history_id: historyId, budget: budget },
        { headers: { "Content-Type": "application/json" } }
      );
      const bomDetails = res.data.bom_details || [];
      // ส่งทั้ง resultImage และ bomDetails ไปหน้า BomResultPage
      navigate("/bom-result", { state: { bom: bomDetails, resultImage } });
    } catch (err) {
      setError(
        "Error generating BOM: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setBomLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <Card className="mb-6 shadow-lg bg-white rounded-xl">
        <CardContent className="p-6 space-y-6">
          <Label className="text-lg font-semibold text-gray-700">
            อัปโหลดภาพบ้าน
          </Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
            className="w-full"
          />

          {imagePreview && (
            <div
              ref={containerRef}
              className="bg-gray-100 rounded-lg p-4 mt-4 overflow-hidden"
            >
              <img
                ref={imageRef}
                src={imagePreview}
                alt="Preview"
                className="w-full rounded object-cover"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-center">{error}</p>}

          <div>
            <Label>สไตล์สวน</Label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value="english">สวนอังกฤษ</option>
              <option value="tropical">สวน Tropical</option>
              <option value="modern">สวน Modern</option>
              <option value="japanese">สวนญี่ปุ่น</option>
            </select>
          </div>

          <div>
            <Label>ระดับงบประมาณ</Label>
            <select
              value={budgetLevel}
              onChange={(e) => setBudgetLevel(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value="low">ไม่เกิน 50,000 บาท</option>
              <option value="medium">ไม่เกิน 200,000 บาท</option>
              <option value="high">งบจัดเต็ม</option>
            </select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            🌿 Generate Garden
          </Button>

          {loading && (
            <p className="text-center text-gray-600 animate-pulse">
              กำลังสร้างภาพ...
            </p>
          )}
        </CardContent>
      </Card>

      {resultImage && (
        <Card className="shadow-lg bg-white rounded-xl mb-6">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-700">
              ผลลัพธ์การออกแบบสวน
            </h2>
            <img
              src={resultImage}
              alt="Generated Garden"
              className="w-full rounded object-cover"
            />

            <Button
              onClick={handleGenerateBOM}
              disabled={bomLoading}
              className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              🌱 ขอรายการของที่ใช้จัดสวน
            </Button>

            {bomLoading && (
              <p className="text-center text-gray-600 animate-pulse">
                กำลังวิเคราะห์...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}
    </div>
  );
}
