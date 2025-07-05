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
  const [selectedStyle, setSelectedStyle] = useState("tropical");
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bomLoading, setBomLoading] = useState(false);
  const [historyId, setHistoryId] = useState(null);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const stylePrompts = {
    english:
      "Create a professional English garden design in the masked area, featuring natural-looking flowers (such as roses and lavender in realistic colors), a large lawn, white picket fences, and well-defined pathways blending modern design with brick or smooth concrete. Include a clear focal point visible from the house window, such as a charming fountain or seating area. Ensure pathways are always present and incorporate modern elements like clean lines or geometric stone layouts. Use realistic perspective. Suggest materials like roses, lavender, white picket fences, brick or smooth concrete pathways, and geometric stones for the BOM. Preserve the house, roof, and its original color and structure. Do not alter the house. Keep the sky and surroundings unchanged.",
    tropical:
      "Design a professional tropical garden in the masked area with curved pathways, stepping stones, palm trees, and balanced greenery. Include a focal point visible from the house window, such as a small fountain, flowering tree, or cozy seating area. Emphasize harmony and natural aesthetics. Suggest materials like palm trees, hibiscus, and stepping stones for the BOM. Preserve the house, roof, and its original color and structure. Do not alter the house. Keep the sky and surroundings unchanged.",
    japanese:
      "Create a professional Japanese Zen garden in the masked area using moss, raked gravel, bonsai, stone lanterns, and koi ponds. Include a focal point visible from the house window, such as a calm stone arrangement or water feature. Apply asymmetry and a serene composition. Suggest materials like moss, gravel, bonsai, and stone lanterns for the BOM. Preserve the house, roof, and its original color and structure. Do not alter the house. Keep the sky and surroundings unchanged.",
  };

  const budgetPrompts = {
    "under-100k":
      "Use a simple and affordable garden layout with large grass areas, minimal decorations, and a few low-cost plants like small shrubs or native flowers. Avoid luxury features, hardscape beyond basic pathways, lighting, or water systems. Suggest affordable materials like grass, small shrubs (e.g., สนฉัตร, สนมังกร), and gravel for the BOM. Ensure the total cost does not exceed 100,000 บาท. Maintain realistic proportions and avoid overcrowding.",
  };

  const budgetValues = {
    "under-100k": 100000,
  };

  const getBudgetValue = () => {
    return budgetValues["under-100k"]; // คงที่ที่ 100,000
  };

  const getFullPrompt = (style) => {
    return `${stylePrompts[style]} ${budgetPrompts["under-100k"]}`;
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
      formData.append("prompt", getFullPrompt(selectedStyle));

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
      const budget = getBudgetValue();
      const res = await axios.post(
        "https://plantpick-backend.up.railway.app/garden/generate-bom",
        { history_id: historyId, budget: budget },
        { headers: { "Content-Type": "application/json" } }
      );
      const bomDetails = res.data.bom_details || [];
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
              <option value="tropical">สวน Tropical</option>
              <option value="english">สวนอังกฤษ</option>
              <option value="japanese">สวนญี่ปุ่น</option>
            </select>
          </div>

          <div>
            <Label>ระดับงบประมาณ</Label>
            <p className="p-2 text-gray-600">
              ภาพที่สร้างจะอยู่ในงบประมาณไม่เกิน 100,000 บาท
            </p>
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
