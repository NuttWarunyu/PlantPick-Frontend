import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle, FiStar, FiUsers, FiClock } from "react-icons/fi";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-green-600">AI จัดสวน</span> ในฝัน
              <br />
              <span className="text-2xl md:text-3xl text-gray-600 font-normal">
                ใช้ปัญญาประดิษฐ์ออกแบบสวนสวยจากภาพบ้านจริง
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              เปลี่ยนพื้นที่ว่างให้เป็นสวนในฝันด้วย AI ที่วิเคราะห์แสง ทิศทางลม และสภาพแวดล้อม 
              ให้คุณได้สวนที่สวยงามและเหมาะสมกับบ้านของคุณ
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/design-studio"
                className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
              >
                เริ่มออกแบบสวนฟรี
                <FiArrowRight className="ml-2" />
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-bold text-lg rounded-full border-2 border-green-600 hover:bg-green-50 transition-all">
                ดูตัวอย่างผลงาน
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
              <div className="flex items-center gap-2">
                <FiUsers className="text-green-500" />
                <span>ผู้ใช้ 1,000+ คน</span>
              </div>
              <div className="flex items-center gap-2">
                <FiStar className="text-yellow-500" />
                <span>คะแนน 4.8/5</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="text-blue-500" />
                <span>เสร็จใน 1 นาที</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ทำไมต้องเลือก <span className="text-green-600">AI จัดสวน</span> PlantPick?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              เทคโนโลยี AI ล้ำสมัยที่เข้าใจความต้องการของคุณและสภาพแวดล้อมของบ้าน
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-green-50">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI วิเคราะห์อัจฉริยะ</h3>
              <p className="text-gray-600">
                วิเคราะห์แสง ทิศทางลม และสภาพแวดล้อมจากภาพถ่าย เพื่อออกแบบสวนที่เหมาะสมที่สุด
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-blue-50">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">สไตล์หลากหลาย</h3>
              <p className="text-gray-600">
                เลือกสไตล์สวนได้ตามใจชอบ ทั้งสวนไทย สวนโมเดิร์น สวนญี่ปุ่น สวนอังกฤษ และสวนทรอปิคอล
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-orange-50">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ประเมินงบประมาณ</h3>
              <p className="text-gray-600">
                ได้รายการของและราคาประเมิน (BOM) ที่แม่นยำ ช่วยวางแผนงบประมาณได้อย่างชัดเจน
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              วิธีใช้ <span className="text-green-600">AI จัดสวน</span> ง่ายๆ 3 ขั้นตอน
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">อัปโหลดภาพบ้าน</h3>
              <p className="text-gray-600">
                ถ่ายภาพบริเวณที่ต้องการจัดสวน อัปโหลดเข้ามาในระบบ
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ระบายพื้นที่สวน</h3>
              <p className="text-gray-600">
                ใช้เครื่องมือระบายสีในบริเวณที่ต้องการให้เป็นสวน
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ได้สวนในฝัน</h3>
              <p className="text-gray-600">
                AI จะสร้างภาพสวนสวยและรายการของให้คุณทันที
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              บริการ <span className="text-green-600">จัดสวน</span> ด้วย AI ที่ครบครันที่สุด
            </h2>
            
            <div className="space-y-6 text-gray-700">
              <p>
                <strong>PlantPick</strong> คือแพลตฟอร์ม <strong>AI จัดสวน</strong> ที่ใช้เทคโนโลยีปัญญาประดิษฐ์ล้ำสมัย 
                เพื่อช่วยให้คุณได้สวนในฝันอย่างง่ายดาย โดยไม่ต้องมีประสบการณ์ในการจัดสวนมาก่อน
              </p>
              
              <h3 className="text-xl font-bold text-green-600">บริการจัดสวนที่แตกต่าง</h3>
              <p>
                เราไม่ใช่แค่บริการ <strong>จัดสวน</strong> ธรรมดา แต่เป็น <strong>AI จัดสวน</strong> ที่เข้าใจความต้องการของคุณ 
                และสภาพแวดล้อมของบ้าน โดยวิเคราะห์จากภาพถ่ายจริง เพื่อออกแบบสวนที่เหมาะสมที่สุด
              </p>
              
              <h3 className="text-xl font-bold text-green-600">สไตล์สวนที่หลากหลาย</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>สวนไทย</strong> - สวยงามด้วยไม้ดอกไม้ประดับแบบไทย</li>
                <li><strong>สวนโมเดิร์น</strong> - เรียบง่าย สะอาดตา เหมาะกับบ้านสมัยใหม่</li>
                <li><strong>สวนญี่ปุ่น</strong> - สงบเงียบ เน้นธรรมชาติและความสมดุล</li>
                <li><strong>สวนอังกฤษ</strong> - โรแมนติก ด้วยไม้ดอกหลากสีสัน</li>
                <li><strong>สวนทรอปิคอล</strong> - ร่มรื่น เหมาะกับสภาพอากาศเมืองไทย</li>
              </ul>
              
              <h3 className="text-xl font-bold text-green-600">ทำไมต้องเลือก AI จัดสวน?</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>ประหยัดเวลา</strong> - ไม่ต้องรอช่างจัดสวน ใช้เวลาเพียง 1 นาที</li>
                <li><strong>ประหยัดเงิน</strong> - ไม่มีค่าใช้จ่าย ฟรีตลอดการใช้งาน</li>
                <li><strong>แม่นยำ</strong> - AI วิเคราะห์สภาพแวดล้อมได้แม่นยำกว่ามนุษย์</li>
                <li><strong>หลากหลาย</strong> - ได้ไอเดียการจัดสวนมากมายในครั้งเดียว</li>
                <li><strong>ใช้งานง่าย</strong> - ไม่ต้องมีความรู้ด้านการจัดสวน</li>
              </ul>
              
              <h3 className="text-xl font-bold text-green-600">บริการจัดสวนครบวงจร</h3>
              <p>
                นอกจาก <strong>AI จัดสวน</strong> แล้ว เรายังให้บริการวิเคราะห์ภาพสวนจริง 
                ค้นหาพรรณไม้ และประเมินงบประมาณการจัดสวน เพื่อให้คุณได้สวนที่สมบูรณ์แบบที่สุด
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            พร้อมเริ่ม <span className="text-yellow-300">จัดสวน</span> ในฝันแล้วหรือยัง?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            ใช้ AI จัดสวน PlantPick ฟรี ไม่มีค่าใช้จ่าย เริ่มต้นได้ทันที
          </p>
          <Link
            to="/design-studio"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-bold text-lg rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            เริ่มออกแบบสวนฟรี
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
} 