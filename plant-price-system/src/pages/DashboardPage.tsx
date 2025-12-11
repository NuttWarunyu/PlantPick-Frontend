import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload,
  Image,
  Sparkles
} from 'lucide-react';
import { apiService } from '../services/api';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalPlants: 0,
    totalSuppliers: 0
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const statisticsResponse = await apiService.getStatistics();
      
      if (statisticsResponse.success) {
        setStatistics({
          totalPlants: statisticsResponse.data.totalPlants,
          totalSuppliers: statisticsResponse.data.totalSuppliers
        });
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = () => {
    // TODO: Navigate to garden design page or open upload modal
    // For now, just show alert
    alert('ฟีเจอร์นี้กำลังพัฒนา - อัปโหลดรูปหน้าบ้านเพื่อให้ AI ออกแบบสวนและเสนอราคา');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-5xl sm:text-6xl animate-bounce">🌱</div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ออกแบบสวนด้วย AI
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mt-2">
                อัปโหลดรูปหน้าบ้านของคุณ เราเสนอราคาจากร้านค้าจริง
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Simple */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border-2 border-green-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-3 shadow-md">
                <span className="text-2xl">🌿</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">ต้นไม้ทั้งหมด</p>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {statistics.totalPlants.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border-2 border-blue-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 shadow-md">
                <span className="text-2xl">🏪</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">ร้านค้า</p>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {statistics.totalSuppliers}
              </p>
            </div>
          </div>
        </div>

        {/* Main Upload Button */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">เริ่มต้นใช้งาน</h2>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border-2 border-green-200">
            <div className="text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Image className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                อัปโหลดรูปหน้าบ้านของคุณ
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto">
                AI จะวิเคราะห์พื้นที่และออกแบบสวนให้คุณ พร้อมเสนอราคาจากร้านค้าจริง
              </p>
              
              <button
                onClick={handleImageUpload}
                className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-12 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg sm:text-xl font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Upload className="w-6 h-6 sm:w-7 sm:h-7 mr-3 group-hover:animate-bounce" />
                <span>อัปโหลดรูปภาพ</span>
              </button>
              
              <p className="text-sm text-gray-500 mt-6">
                รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-white rounded-xl p-5 shadow-md border-2 border-green-100">
            <div className="text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h4 className="font-bold text-gray-800 mb-2">AI ออกแบบ</h4>
              <p className="text-sm text-gray-600">AI วิเคราะห์พื้นที่และออกแบบสวนให้เหมาะกับคุณ</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-md border-2 border-blue-100">
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h4 className="font-bold text-gray-800 mb-2">เสนอราคาจริง</h4>
              <p className="text-sm text-gray-600">ราคาจากร้านค้าจริงที่มีในระบบ</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-md border-2 border-purple-100">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold text-gray-800 mb-2">รวดเร็ว</h4>
              <p className="text-sm text-gray-600">ได้ผลลัพธ์ในเวลาไม่กี่นาที</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
