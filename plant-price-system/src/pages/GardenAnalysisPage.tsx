import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Upload, 
  Image, 
  Sparkles, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  Leaf,
  Circle,
  Square,
  Layers
} from 'lucide-react';
import { aiService, GardenAnalysisResult, GardenPlant } from '../services/aiService';
import { apiService } from '../services/api';

const GardenAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<GardenAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plantPrices, setPlantPrices] = useState<Record<string, { hasPrice: boolean; minPrice?: number; suppliers?: any[] }>>({});

  // ตรวจสอบว่ามีรูปภาพจาก location state หรือไม่ (กรณี navigate จาก Dashboard)
  React.useEffect(() => {
    if (location.state?.imageFile) {
      handleFileSelect(location.state.imageFile);
    }
  }, [location.state]);

  const handleFileSelect = (file: File) => {
    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    // ตรวจสอบขนาดไฟล์ (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('ไฟล์มีขนาดใหญ่เกินไป (ขนาดสูงสุด 10MB)');
      return;
    }

    setSelectedImage(file);
    setError(null);
    setAnalysisResult(null);

    // สร้าง preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('กรุณาเลือกรูปภาพก่อน');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setPlantPrices({});
    setAnalysisProgress('กำลังเตรียมรูปภาพ...');

    try {
      // Simulate progress steps
      setTimeout(() => setAnalysisProgress('กำลังส่งรูปภาพไปยัง AI...'), 500);
      setTimeout(() => setAnalysisProgress('กำลังวิเคราะห์ต้นไม้...'), 1500);
      setTimeout(() => setAnalysisProgress('กำลังวิเคราะห์องค์ประกอบสวน...'), 3000);
      setTimeout(() => setAnalysisProgress('กำลังประมวลผลผลลัพธ์...'), 5000);

      // 1. เรียก AI Service เพื่อวิเคราะห์รูปภาพก่อน
      const result = await aiService.analyzeGardenImage(selectedImage);
      setAnalysisProgress('กำลังค้นหาราคาต้นไม้...');
      setAnalysisResult(result);

      // 2. ค้นหาราคาต้นไม้ที่พบจากฐานข้อมูล
      // ถ้ามีราคาก็แสดง ถ้าไม่มีก็บอกว่ายังไม่มีราคา
      if (result.plants && result.plants.length > 0) {
        await loadPlantPrices(result.plants);
      }
      
      setAnalysisProgress('เสร็จสิ้น!');
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress('');
      }, 500);
    } catch (err: any) {
      console.error('Error analyzing garden:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ');
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const loadPlantPrices = async (plants: GardenPlant[]) => {
    try {
      const prices: Record<string, { hasPrice: boolean; minPrice?: number; suppliers?: any[] }> = {};
      
      // ค้นหาต้นไม้แต่ละชนิดจากฐานข้อมูล
      for (const plant of plants) {
        try {
          const response = await apiService.searchPlants(plant.name);
          if (response.success && response.data && response.data.length > 0) {
            // หาต้นไม้ที่ตรงกับชื่อมากที่สุด
            const matchedPlant = response.data[0];
            if (matchedPlant.suppliers && matchedPlant.suppliers.length > 0) {
              // มีราคา - แสดงราคาต่ำสุด
              const minPrice = Math.min(...matchedPlant.suppliers.map((s: any) => s.price));
              prices[plant.name] = {
                hasPrice: true,
                minPrice: minPrice,
                suppliers: matchedPlant.suppliers
              };
            } else {
              // ไม่มีราคา
              prices[plant.name] = {
                hasPrice: false
              };
            }
          } else {
            // ไม่พบต้นไม้ในฐานข้อมูล
            prices[plant.name] = {
              hasPrice: false
            };
          }
        } catch (err) {
          console.error(`Error loading prices for ${plant.name}:`, err);
          // ถ้าเกิด error ก็ถือว่าไม่มีราคา
          prices[plant.name] = {
            hasPrice: false
          };
        }
      }
      
      setPlantPrices(prices);
    } catch (err) {
      console.error('Error loading plant prices:', err);
    }
  };

  const handleSearchPlant = (plantName: string) => {
    navigate(`/search?q=${encodeURIComponent(plantName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>กลับไปหน้าหลัก</span>
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl sm:text-5xl">🌿</div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                วิเคราะห์ต้นไม้จากรูปภาพ
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mt-2">
                AI จะช่วยระบุต้นไม้ที่เห็นในภาพและจำนวนคร่าวๆ
              </p>
            </div>
          </div>
        </div>

        {/* Loading Animation - แสดงข้างบนเมื่อกำลังวิเคราะห์ */}
        {isAnalyzing && (
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-2xl p-8 mb-8 border-2 border-green-200 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10">
              {/* Main Loading Content */}
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Animated Icon */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg animate-pulse">
                    <Leaf className="w-12 h-12 text-white animate-bounce" />
                  </div>
                  {/* Rotating Rings */}
                  <div className="absolute inset-0 border-4 border-green-300 rounded-full animate-spin-slow opacity-50"></div>
                  <div className="absolute inset-2 border-4 border-emerald-300 rounded-full animate-spin-slow-reverse opacity-30"></div>
                </div>

                {/* Progress Text */}
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-gray-800 animate-pulse">
                    {analysisProgress || 'กำลังวิเคราะห์...'}
                  </h3>
                  <p className="text-gray-600">กรุณารอสักครู่ ระบบกำลังวิเคราะห์รูปภาพสวนของคุณ</p>
                </div>

                {/* Progress Steps */}
                <div className="w-full max-w-md space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full ${analysisProgress.includes('เตรียม') ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className={analysisProgress.includes('เตรียม') ? 'text-green-700 font-semibold' : 'text-gray-500'}>เตรียมรูปภาพ</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full ${analysisProgress.includes('ส่ง') ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className={analysisProgress.includes('ส่ง') ? 'text-green-700 font-semibold' : 'text-gray-500'}>ส่งรูปภาพไปยัง AI</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full ${analysisProgress.includes('วิเคราะห์ต้นไม้') ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className={analysisProgress.includes('วิเคราะห์ต้นไม้') ? 'text-green-700 font-semibold' : 'text-gray-500'}>วิเคราะห์ต้นไม้</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full ${analysisProgress.includes('วิเคราะห์องค์ประกอบ') ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className={analysisProgress.includes('วิเคราะห์องค์ประกอบ') ? 'text-green-700 font-semibold' : 'text-gray-500'}>วิเคราะห์องค์ประกอบสวน</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full ${analysisProgress.includes('ประมวลผล') ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className={analysisProgress.includes('ประมวลผล') ? 'text-green-700 font-semibold' : 'text-gray-500'}>ประมวลผลผลลัพธ์</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full ${analysisProgress.includes('ค้นหา') ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className={analysisProgress.includes('ค้นหา') ? 'text-green-700 font-semibold' : 'text-gray-500'}>ค้นหาราคาต้นไม้</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full animate-progress"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {!analysisResult && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border-2 border-green-200 mb-8">
            {!imagePreview ? (
              <div className="text-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Image className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                  อัปโหลดรูปภาพสวนหรือหน้าบ้าน
                </h3>
                <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 10MB
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-12 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg sm:text-xl font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Upload className="w-6 h-6 sm:w-7 sm:h-7 mr-3 group-hover:animate-bounce" />
                  <span>เลือกรูปภาพ</span>
                </button>
              </div>
            ) : (
              <div className="text-center">
                {/* ซ่อนรูปภาพเมื่อกำลังวิเคราะห์ */}
                {!isAnalyzing && (
                  <div className="mb-6">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full max-h-96 mx-auto rounded-2xl shadow-lg border-4 border-green-200"
                    />
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    เปลี่ยนรูปภาพ
                  </button>
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>กำลังวิเคราะห์...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>เริ่มวิเคราะห์</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800 mb-1">เกิดข้อผิดพลาด</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Image Preview - แสดงรูปภาพที่อัพโหลด */}
            {imagePreview && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-green-600" />
                  รูปภาพที่วิเคราะห์
                </h3>
                <div className="flex justify-center">
                  <img
                    src={imagePreview}
                    alt="Analyzed Garden"
                    className="max-w-full max-h-96 rounded-xl shadow-md border-2 border-green-100"
                  />
                </div>
              </div>
            )}

            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">ผลการวิเคราะห์</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-100">
                  <p className="text-sm text-gray-600 mb-1">ประเภทสวน</p>
                  <p className="text-lg font-bold text-green-700">{analysisResult.gardenType || 'ไม่ระบุ'}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">จำนวนต้นไม้รวม</p>
                  <p className="text-lg font-bold text-blue-700">{analysisResult.totalPlants} ต้น</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
                  <p className="text-sm text-gray-600 mb-1">ความแม่นยำ</p>
                  <p className="text-lg font-bold text-purple-700">{(analysisResult.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setSelectedImage(null);
                  setImagePreview(null);
                  setPlantPrices({});
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                วิเคราะห์รูปใหม่
              </button>
            </div>

            {/* Plants List - แสดงก่อนวัสดุ/หิน/อื่นๆ */}
            {analysisResult.plants && analysisResult.plants.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-green-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Leaf className="w-6 h-6 text-green-600" />
                  ต้นไม้ที่พบ ({analysisResult.plants.length} ชนิด)
                </h3>
                
                <div className="space-y-4">
                  {analysisResult.plants.map((plant, index) => {
                    const plantPriceInfo = plantPrices[plant.name] || { hasPrice: false };
                    return (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-lg sm:text-xl font-bold text-gray-800">{plant.name}</h4>
                                  {plant.fallbackUsed && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                                      จากคลังต้นไม้ยอดนิยม
                                    </span>
                                  )}
                                  {plant.plantNetVerified && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                      ✓ ยืนยันแล้ว
                                    </span>
                                  )}
                                </div>
                                {plant.scientificName && (
                                  <span className="text-sm text-gray-500 italic">({plant.scientificName})</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">จำนวน:</span>
                                <span>{plant.quantity} ต้น</span>
                              </div>
                              {plant.size && (
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">ขนาด:</span>
                                  <span>{plant.size}</span>
                                </div>
                              )}
                              {plant.location && (
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">ตำแหน่ง:</span>
                                  <span>{plant.location}</span>
                                </div>
                              )}
                            </div>
                            {plant.description && (
                              <p className="text-sm text-gray-600 mt-2">{plant.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {plantPriceInfo.hasPrice ? (
                              <>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">ราคาเริ่มต้น</p>
                                  <p className="text-lg font-bold text-green-600">
                                    {plantPriceInfo.minPrice?.toLocaleString()} บาท
                                  </p>
                                </div>
                                <button
                                  onClick={() => navigate(`/search?q=${encodeURIComponent(plant.name)}`)}
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                                >
                                  ดูราคาทั้งหมด
                                </button>
                              </>
                            ) : (
                              <div className="text-right">
                                <p className="text-xs text-gray-500">ราคาเริ่มต้น</p>
                                <p className="text-lg font-bold text-gray-400">0 บาท</p>
                                <p className="text-xs text-gray-500 mt-1">ยังไม่มีราคา</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-green-200">
                <p className="text-gray-600 text-center">ไม่พบต้นไม้ในภาพ</p>
              </div>
            )}

            {/* Lawn Section */}
            {analysisResult.lawn && analysisResult.lawn.type && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-green-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Circle className="w-6 h-6 text-green-600" />
                  สนามหญ้า
                </h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-2">{analysisResult.lawn.type}</h4>
                      {analysisResult.lawn.area && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">ขนาดโดยประมาณ:</span> {analysisResult.lawn.area}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pathways Section */}
            {analysisResult.pathways && analysisResult.pathways.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-green-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Square className="w-6 h-6 text-green-600" />
                  ทางเดิน/พื้นผิว ({analysisResult.pathways.length} จุด)
                </h3>
                <div className="space-y-4">
                  {analysisResult.pathways.map((pathway, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-100"
                    >
                      <h4 className="text-lg font-bold text-gray-800 mb-2">{pathway.material}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        {pathway.length && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">ความยาว:</span>
                            <span>{pathway.length}</span>
                          </div>
                        )}
                        {pathway.area && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">พื้นที่:</span>
                            <span>{pathway.area}</span>
                          </div>
                        )}
                        {pathway.location && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">ตำแหน่ง:</span>
                            <span>{pathway.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Elements Section */}
            {analysisResult.otherElements && analysisResult.otherElements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-green-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Layers className="w-6 h-6 text-green-600" />
                  องค์ประกอบอื่นๆ ({analysisResult.otherElements.length} รายการ)
                </h3>
                <div className="space-y-4">
                  {analysisResult.otherElements.map((element, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-100"
                    >
                      <h4 className="text-lg font-bold text-gray-800 mb-2">{element.type}</h4>
                      {element.description && (
                        <p className="text-sm text-gray-600 mb-2">{element.description}</p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        {element.quantity && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">จำนวน:</span>
                            <span>{element.quantity}</span>
                          </div>
                        )}
                        {element.location && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">ตำแหน่ง:</span>
                            <span>{element.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GardenAnalysisPage;