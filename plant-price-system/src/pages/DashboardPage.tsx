import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload,
  Image
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }

      // ตรวจสอบขนาดไฟล์ (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('ไฟล์มีขนาดใหญ่เกินไป (ขนาดสูงสุด 10MB)');
        return;
      }

      // Navigate ไปหน้า Garden Analysis พร้อมส่งไฟล์
      navigate('/garden-analysis', { state: { imageFile: file } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="max-w-2xl w-full">
        {/* Header - เล็กลงและเรียบง่าย */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            PlantPick
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Smart Analysis, Best Prices
          </p>
        </div>

        {/* Main Upload Button - โฟกัสหลัก */}
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-green-100">
          <div className="text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <Image className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
              อัปโหลดรูปหน้าบ้านของคุณ
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-md mx-auto">
              AI จะวิเคราะห์พื้นที่และออกแบบสวนให้คุณ พร้อมเสนอราคาจากร้านค้าจริง
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              onClick={handleImageUpload}
              className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-12 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg sm:text-xl font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Upload className="w-6 h-6 sm:w-7 sm:h-7 mr-3 group-hover:animate-bounce" />
              <span>อัปโหลดรูปภาพ</span>
            </button>
            
            <p className="text-xs sm:text-sm text-gray-500 mt-6">
              รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 10MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
