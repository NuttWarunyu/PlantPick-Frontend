import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-lg bg-white rounded-xl">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-green-700 text-center">
            🌿 เกี่ยวกับ PlantPick
          </h1>

          <p className="text-gray-700 text-lg leading-relaxed">
            <strong>PlantPick</strong> คือแพลตฟอร์มที่ช่วยให้คุณสามารถออกแบบสวน
            และค้นหาไอเดียการจัดสวนที่เหมาะกับบ้านของคุณ
            ด้วยเทคโนโลยีปัญญาประดิษฐ์และภาพถ่ายจริงของบ้านคุณเอง
          </p>

          <p className="text-gray-700 text-lg leading-relaxed">
            เราเชื่อว่า “ทุกบ้านควรมีสวนที่สวยในแบบของตัวเอง”
            ไม่ว่าคุณจะมีงบจำกัด หรืออยากจ้างทีมจัดสวนมืออาชีพ
            เราก็มีทางเลือกให้คุณตั้งแต่:
          </p>

          <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
            <li>✨ ออกแบบสวนด้วย AI เพียงอัปโหลดภาพบ้านของคุณ</li>
            <li>🛒 เปรียบเทียบราคาสินค้าใน Shopee, Lazada, TikTok</li>
            <li>📄 ขอใบเสนอราคาจัดสวนจากทีมงานมืออาชีพ</li>
          </ul>

          <p className="text-gray-700 text-lg leading-relaxed">
            ไม่ว่าคุณจะจัดสวนเอง หรือให้เราช่วยดูแล PlantPick
            พร้อมเป็นเพื่อนร่วมทางในทุกขั้นตอนของการเปลี่ยนบ้านให้กลายเป็นพื้นที่สีเขียวที่คุณฝันไว้
            💚
          </p>

          <div className="text-center pt-4">
            <span className="text-sm text-gray-500">
              Developed with 💚 by the PlantPick Team
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
