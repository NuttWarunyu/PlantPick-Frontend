import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiClock,
  FiBell,
  FiTrendingUp,
  FiStar,
  FiUsers,
  FiZap
} from "react-icons/fi";

export default function PriceTrackerPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 pt-16">
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full text-sm font-medium mb-8 animate-pulse">
            <FiClock className="text-sm" />
            <span>🚧 กำลังพัฒนา 🚧</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            <span className="text-yellow-600">ติดตามราคา</span> ต้นไม้
            <br />
            <span className="text-2xl md:text-3xl font-normal text-gray-600">
              💰 เร็วๆ นี้ 💰
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            เปรียบเทียบราคาต้นไม้จากร้านค้าต่างๆ 
            รับการแจ้งเตือนเมื่อราคาลด และประหยัดเงิน
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg">
              <span className="text-2xl mr-2">🏪</span>
              <span className="font-semibold text-gray-800">50+ ร้านค้า</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg">
              <span className="text-2xl mr-2">🌿</span>
              <span className="font-semibold text-gray-800">1,000+ ต้นไม้</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg">
              <span className="text-2xl mr-2">💰</span>
              <span className="font-semibold text-gray-800">ประหยัด 30%</span>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-yellow-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTrendingUp className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">ติดตามราคา Real-time</h3>
              <p className="text-gray-600 mb-6">
                ติดตามราคาต้นไม้แบบ Real-time จากร้านค้าต่างๆ 
                เปรียบเทียบราคาและเลือกซื้อที่ถูกที่สุด
              </p>
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                ⏰ เร็วๆ นี้
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-yellow-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBell className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">แจ้งเตือนราคาลด</h3>
              <p className="text-gray-600 mb-6">
                ตั้งการแจ้งเตือนเมื่อราคาต้นไม้ที่คุณสนใจลดลง 
                รับการแจ้งเตือนทันทีผ่าน LINE หรือ Email
              </p>
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                ⏰ เร็วๆ นี้
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-yellow-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiStar className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">รีวิวและคะแนน</h3>
              <p className="text-gray-600 mb-6">
                ดูรีวิวจากผู้ซื้อจริง คะแนนความพึงพอใจ 
                และคำแนะนำจากผู้เชี่ยวชาญ
              </p>
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                ⏰ เร็วๆ นี้
              </div>
            </div>
          </div>
        </div>

        {/* Notify Me Section */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          {/* Floating Elements */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-6 right-6 w-6 h-6 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-8 w-4 h-4 bg-white/40 rounded-full animate-bounce"></div>
          
          <h2 className="text-4xl font-bold mb-6">
            🚀 อยากใช้ฟีเจอร์นี้เป็นคนแรก?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            ลงทะเบียนรับการแจ้งเตือนเมื่อเปิดใช้งาน
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="อีเมลของคุณ"
              className="flex-1 px-6 py-4 rounded-2xl text-gray-800 font-medium focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <button className="bg-white text-yellow-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-3">
              <FiBell className="text-xl" />
              <span>แจ้งเตือน</span>
            </button>
          </div>
          
          <p className="text-sm opacity-75 mt-4">
            เราจะแจ้งเตือนเมื่อเปิดใช้งานฟีเจอร์นี้
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-16">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
          >
            <FiHome className="text-xl" />
            <span>กลับหน้าหลัก</span>
          </button>
        </div>
      </div>
    </div>
  );
} 