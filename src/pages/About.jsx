import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-lg bg-white rounded-xl">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-green-700 text-center">
            🌿 เกี่ยวกับ PlantPick
          </h1>

          <p className="text-gray-700 text-lg leading-relaxed">
            <strong>PlantPick</strong> คือแพลตฟอร์มที่ช่วยให้คุณออกแบบสวน
            และค้นหาไอเดียการจัดสวนที่เหมาะกับบ้านของคุณ
            ด้วยเทคโนโลยีปัญญาประดิษฐ์ (AI) และภาพถ่ายจริงของบ้านคุณเอง
          </p>

          <p className="text-gray-700 text-lg leading-relaxed">
            เราเชื่อว่า “ทุกบ้านควรมีสวนที่สวยในแบบของตัวเอง”
            ไม่ว่าคุณจะมีงบจำกัด หรืออยากจ้างทีมจัดสวนมืออาชีพ PlantPick
            มีทางเลือกให้คุณตั้งแต่:
          </p>

          <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
            <li>✨ ออกแบบสวนด้วย AI เพียงอัปโหลดภาพบ้านของคุณ</li>
            <li>🛒 เปรียบเทียบราคาสินค้าใน Shopee, Lazada, TikTok</li>
            <li>📄 ขอใบเสนอราคาจัดสวนจากทีมงานมืออาชีพ</li>
          </ul>

          <p className="text-gray-700 text-lg leading-relaxed">
            ไม่ว่าคุณจะจัดสวนเอง หรือให้เราช่วยดูแล PlantPick
            พร้อมเป็นเพื่อนร่วมทางในทุกขั้นตอน
            ของการเปลี่ยนบ้านให้กลายเป็นพื้นที่สีเขียวที่คุณฝันไว้ 💚
          </p>

          <div className="text-center pt-6">
            <Button
              className="bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-lg"
              onClick={() => navigate("/")}
            >
              🚀 เริ่มต้นใช้งาน
            </Button>
          </div>

          <div className="text-center pt-8">
            <span className="text-sm text-gray-500">
              Developed with 💚 by the PlantPick Team
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
