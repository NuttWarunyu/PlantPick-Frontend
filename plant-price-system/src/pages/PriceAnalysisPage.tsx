import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, BarChart3, AlertCircle } from 'lucide-react';
import { aiService, PriceAnalysis } from '../services/aiService';

const PriceAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PriceAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ข้อมูลต้นไม้ตัวอย่าง
  const samplePlants = [
    { id: '1', name: 'มอนสเตอร่า เดลิซิโอซ่า', currentPrice: 450 },
    { id: '2', name: 'ยางอินเดีย', currentPrice: 350 },
    { id: '3', name: 'ฟิโลเดนดรอน เฮเดรซิฟอลิอัม', currentPrice: 280 },
    { id: '4', name: 'แคคตัส หลากชนิด', currentPrice: 120 },
    { id: '5', name: 'ไม้ล้อม - ต้นไผ่', currentPrice: 2500 }
  ];

  const handleAnalyze = async () => {
    if (!selectedPlant) {
      setError('กรุณาเลือกต้นไม้ที่ต้องการวิเคราะห์');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const plant = samplePlants.find(p => p.id === selectedPlant);
      if (!plant) {
        throw new Error('ไม่พบข้อมูลต้นไม้');
      }

      // สร้างข้อมูลราคาย้อนหลังจำลอง
      const historicalPrices = Array.from({ length: 12 }, () => 
        plant.currentPrice * (0.7 + Math.random() * 0.6)
      );

      const result = await aiService.analyzePrice(
        plant.id,
        plant.name,
        plant.currentPrice,
        historicalPrices
      );

      setAnalysisResult(result);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการวิเคราะห์ราคา');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-red-600 bg-red-100';
      case 'down':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'ราคาขึ้น';
      case 'down':
        return 'ราคาลง';
      default:
        return 'ราคาเสถียร';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 วิเคราะห์ราคาต้นไม้</h1>
            <p className="text-gray-600 mt-2">ใช้ AI วิเคราะห์เทรนด์ราคาและให้คำแนะนำ</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            กลับหน้าหลัก
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plant Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🌱 เลือกต้นไม้</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ต้นไม้ที่ต้องการวิเคราะห์
                </label>
                <select
                  value={selectedPlant}
                  onChange={(e) => setSelectedPlant(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">เลือกต้นไม้</option>
                  {samplePlants.map(plant => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name} - ฿{plant.currentPrice.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!selectedPlant || isAnalyzing}
                className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>กำลังวิเคราะห์...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    <span>วิเคราะห์ราคา</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 ผลการวิเคราะห์</h2>
            
            {analysisResult ? (
              <div className="space-y-6">
                {/* Plant Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{analysisResult.plantName}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ราคาปัจจุบัน:</span>
                      <span className="ml-2 font-semibold">฿{analysisResult.currentPrice.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ราคาเฉลี่ย:</span>
                      <span className="ml-2 font-semibold">฿{analysisResult.averagePrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Price Change */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(analysisResult.trend)}
                    <span className="font-medium text-gray-900">
                      {getTrendText(analysisResult.trend)}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(analysisResult.trend)}`}>
                    {analysisResult.priceChangePercent > 0 ? '+' : ''}{analysisResult.priceChangePercent.toFixed(1)}%
                  </div>
                </div>

                {/* Price Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">การเปลี่ยนแปลงราคา:</span>
                    <span className={`font-semibold ${analysisResult.priceChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {analysisResult.priceChange > 0 ? '+' : ''}฿{Math.abs(analysisResult.priceChange).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">เทรนด์ราคา:</span>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(analysisResult.trend)}
                      <span className="text-sm">{getTrendText(analysisResult.trend)}</span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">🤖 คำแนะนำจาก AI</h4>
                  <p className="text-green-800 text-sm leading-relaxed">
                    {analysisResult.recommendation}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    เปรียบเทียบราคา
                  </button>
                  <button
                    onClick={() => navigate('/project')}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    เพิ่มในโปรเจกต์
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>เลือกต้นไม้และกดวิเคราะห์เพื่อดูผลลัพธ์</p>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 เคล็ดลับการวิเคราะห์ราคา</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• AI จะวิเคราะห์ราคาย้อนหลัง 12 เดือน</li>
            <li>• ราคาขึ้น &gt; 5% = เทรนด์ขึ้น, ราคาลง &gt; 5% = เทรนด์ลง</li>
            <li>• คำแนะนำจะพิจารณาจากปัจจัยหลายอย่าง</li>
            <li>• ควรเปรียบเทียบกับหลายร้านค้าก่อนตัดสินใจ</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PriceAnalysisPage;
