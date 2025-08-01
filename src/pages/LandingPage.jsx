import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiZap,
  FiSearch,
  FiHeart,
  FiClock,
  FiUsers,
  FiStar,
  FiAward,
  FiHome,
  FiCamera,
  FiUploadCloud,
  FiShield,
  FiDroplet,
  FiSun,
  FiThermometer,
  FiMessageSquare,
  FiArrowRight,
  FiPlay,
  FiCheckCircle,
  FiTrendingUp,
  FiTarget,
  FiSmartphone,
  FiGlobe
} from "react-icons/fi";

export default function LandingPage() {
  const navigate = useNavigate();

  // ฟีเจอร์หลักของแพลตฟอร์ม
  const mainFeatures = [
    {
      id: "design-studio",
      title: "AI ออกแบบสวน",
      description: "ใช้ AI ออกแบบสวนในฝันจากภาพบ้านจริง",
      icon: FiZap,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      stats: "1,234 สวนที่ออกแบบแล้ว",
      features: ["วิเคราะห์แสงและทิศทาง", "เลือกสไตล์สวน 5 แบบ", "สร้างภาพสวนสวยด้วย AI"],
      path: "/design-studio"
    },
    {
      id: "plant-doctor",
      title: "AI หมอต้นไม้",
      description: "วิเคราะห์โรคต้นไม้และให้คำแนะนำการรักษา",
      icon: FiShield,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      stats: "2,567 ต้นไม้ที่รักษาแล้ว",
      features: ["วิเคราะห์โรค 500+ ชนิด", "แผนการรักษาแม่นยำ", "ปรึกษาผู้เชี่ยวชาญ"],
      path: "/plant-doctor"
    },
    {
      id: "price-tracker",
      title: "ติดตามราคาต้นไม้",
      description: "เปรียบเทียบราคาต้นไม้จากร้านค้าต่างๆ",
      icon: FiTrendingUp,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      stats: "5,678 ต้นไม้ที่ติดตาม",
      features: ["ติดตามราคาแบบ Real-time", "แจ้งเตือนราคาลด", "เปรียบเทียบร้านค้า"],
      path: "/price-tracker"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-16">
      
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <FiZap className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">PlantPick</h1>
                <p className="text-sm text-gray-600">ศูนย์กลาง AI ด้านสวน #1 ของไทย</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <FiUsers className="text-sm" />
                  <span>10,000+ คนใช้แล้ว</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <FiStar className="text-sm" />
                  <span>4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-8 py-16 text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🌿✨</div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            <span className="text-green-600">PlantPick</span>
            <br />
            <span className="text-2xl md:text-3xl font-normal text-gray-600">
              ศูนย์กลาง AI ด้านสวน #1 ของไทย 🌱
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            ออกแบบสวนด้วย AI วิเคราะห์โรคต้นไม้ ติดตามราคาต้นไม้ 
            ใช้ปัญญาประดิษฐ์แก้ปัญหาสวนครบวงจร
          </p>
          

          

        </div>
      </div>

      {/* ฟีเจอร์หลัก */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
          ✨ ฟีเจอร์หลัก ✨
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-full px-4 md:px-8 lg:px-12">
          {mainFeatures.map((feature) => (
            <div
              key={feature.id}
              className={`${feature.bgColor} ${feature.borderColor} border-2 rounded-3xl p-10 hover:shadow-2xl transition-all duration-500 cursor-pointer group transform hover:scale-105 shadow-lg hover:shadow-3xl`}
              onClick={() => navigate(feature.path)}
            >
              {/* Floating Elements */}
              <div className="relative overflow-hidden">
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-white/30 rounded-full animate-pulse"></div>
                
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-24 h-24 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="text-white text-4xl" />
                  </div>
                  <div className="text-right">
                    <div className="text-5xl animate-bounce">🎯</div>
                    <FiArrowRight className="text-gray-400 group-hover:text-gray-600 transition-colors text-2xl" />
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-800 mb-4 group-hover:text-green-600 transition-colors text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 text-xl leading-relaxed">{feature.description}</p>
                
                <div className="mb-8">
                  <div className="text-base text-gray-500 mb-4 flex items-center gap-3">
                    <span className="text-3xl">📊</span>
                    <span className="font-semibold text-lg">{feature.stats}</span>
                  </div>
                  <ul className="space-y-4">
                    {feature.features.map((item, index) => (
                      <li key={index} className="flex items-center gap-4 text-base text-gray-700 group-hover:text-gray-800 transition-colors">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <FiCheckCircle className="text-green-500 text-base" />
                        </div>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center mb-16">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-12 max-w-4xl mx-auto px-8 relative overflow-hidden">
          {/* Floating Elements */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-6 right-6 w-6 h-6 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-8 w-4 h-4 bg-white/40 rounded-full animate-bounce"></div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            🚀 ศูนย์กลาง AI ด้านสวน #1 ของไทย 🚀
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            ใช้ปัญญาประดิษฐ์แก้ปัญหาสวนครบวงจร - ออกแบบสวน หมอต้นไม้ ติดตามราคา
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-green-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-3">
              <span className="text-2xl">🎨</span>
              <span>ออกแบบสวนเลย!</span>
            </button>
            <button className="bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/30 transition-all duration-300 flex items-center gap-3 border border-white/30">
              <span className="text-2xl">💰</span>
              <span>ติดตามราคา</span>
              <div className="bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                Free!
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FiZap className="text-green-500 text-xl" />
              <span className="text-xl font-bold text-gray-800">PlantPick</span>
            </div>
            <p className="text-gray-600 mb-4">
              ศูนย์กลางของสวน - ครบทุกเรื่องที่คนรักสวนต้องการ
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <span>© 2025 PlantPick</span>
              <span>•</span>
              <span>นโยบายความเป็นส่วนตัว</span>
              <span>•</span>
              <span>เงื่อนไขการใช้งาน</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 