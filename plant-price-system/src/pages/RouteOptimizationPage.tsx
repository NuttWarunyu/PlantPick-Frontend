import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Navigation, Route } from 'lucide-react';
import { aiService, RouteOptimization } from '../services/aiService';

const RouteOptimizationPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [projectLocation, setProjectLocation] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<RouteOptimization | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ข้อมูลร้านค้าตัวอย่าง
  const sampleSuppliers = [
    { id: '1', name: 'สวนไม้ประดับ ณัฐพล', location: 'นครปฐม', phone: '081-234-5678', plants: ['มอนสเตอร่า', 'ยางอินเดีย'] },
    { id: '2', name: 'ร้านต้นไม้สวยงาม', location: 'เชียงใหม่', phone: '089-876-5432', plants: ['ไม้ล้อม', 'ไม้ไผ่'] },
    { id: '3', name: 'สวนแคคตัส', location: 'กรุงเทพฯ', phone: '082-345-6789', plants: ['แคคตัส', 'บอนไซ'] },
    { id: '4', name: 'สวนกล้วยไม้', location: 'ภูเก็ต', phone: '083-456-7890', plants: ['กล้วยไม้', 'ไม้ดอก'] },
    { id: '5', name: 'สวนไม้ใบ', location: 'ขอนแก่น', phone: '084-567-8901', plants: ['ฟิโลเดนดรอน', 'ไม้ใบ'] }
  ];

  const handleSupplierToggle = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleOptimize = async () => {
    if (selectedSuppliers.length === 0) {
      setError('กรุณาเลือกร้านค้าอย่างน้อย 1 ร้าน');
      return;
    }

    if (!projectLocation.trim()) {
      setError('กรุณากรอกที่ตั้งโปรเจกต์');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const suppliers = sampleSuppliers.filter(s => selectedSuppliers.includes(s.id));
      const result = await aiService.optimizeRoute(suppliers, projectLocation);
      setOptimizationResult(result);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการวางแผนเส้นทาง');
      console.error('Route optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} ชม. ${mins} นาที` : `${mins} นาที`;
  };

  const formatDistance = (km: number) => {
    return `${km.toFixed(1)} กม.`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🗺️ วางแผนเส้นทาง</h1>
            <p className="text-gray-600 mt-2">ใช้ AI หาเส้นทางที่ประหยัดที่สุด</p>
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
          {/* Configuration */}
          <div className="space-y-6">
            {/* Project Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📍 ที่ตั้งโปรเจกต์</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ที่อยู่โปรเจกต์
                </label>
                <input
                  type="text"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  placeholder="เช่น 123 ถนนสุขุมวิท, กรุงเทพมหานคร"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Supplier Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🏪 เลือกร้านค้า</h2>
              <div className="space-y-3">
                {sampleSuppliers.map(supplier => (
                  <div
                    key={supplier.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSuppliers.includes(supplier.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSupplierToggle(supplier.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                        <p className="text-sm text-gray-600">{supplier.location}</p>
                        <p className="text-sm text-gray-500">{supplier.phone}</p>
                        <div className="mt-1">
                          <span className="text-xs text-gray-500">ต้นไม้: </span>
                          <span className="text-xs text-green-600">{supplier.plants.join(', ')}</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedSuppliers.includes(supplier.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedSuppliers.includes(supplier.id) && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleOptimize}
                disabled={selectedSuppliers.length === 0 || !projectLocation.trim() || isOptimizing}
                className="w-full mt-4 flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>กำลังวางแผน...</span>
                  </>
                ) : (
                  <>
                    <Route className="w-4 h-4" />
                    <span>วางแผนเส้นทาง</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {optimizationResult ? (
              <>
                {/* Summary */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 สรุปผลการวางแผน</h2>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Navigation className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-900">
                        {formatDistance(optimizationResult.totalDistance)}
                      </div>
                      <div className="text-sm text-blue-700">ระยะทางรวม</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-900">
                        {formatTime(optimizationResult.totalTime)}
                      </div>
                      <div className="text-sm text-green-700">เวลารวม</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <DollarSign className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-900">
                        ฿{optimizationResult.totalCost.toLocaleString()}
                      </div>
                      <div className="text-sm text-purple-700">ค่าใช้จ่าย</div>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">💰 ประหยัดได้</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-yellow-700">ระยะทาง:</span>
                        <span className="ml-2 font-semibold text-yellow-900">
                          -{formatDistance(optimizationResult.savings.distance)}
                        </span>
                      </div>
                      <div>
                        <span className="text-yellow-700">เวลา:</span>
                        <span className="ml-2 font-semibold text-yellow-900">
                          -{formatTime(optimizationResult.savings.time)}
                        </span>
                      </div>
                      <div>
                        <span className="text-yellow-700">ค่าใช้จ่าย:</span>
                        <span className="ml-2 font-semibold text-yellow-900">
                          -฿{optimizationResult.savings.cost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Route Steps */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">🗺️ เส้นทางที่แนะนำ</h2>
                  
                  <div className="space-y-4">
                    {optimizationResult.optimizedRoute.map((step, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{step.supplierName}</h3>
                          <p className="text-sm text-gray-600">{step.address}</p>
                          <p className="text-sm text-gray-500">{step.phone}</p>
                          
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(step.estimatedTime)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>฿{step.estimatedCost.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          {step.plants.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">ต้นไม้: </span>
                              <span className="text-xs text-green-600">{step.plants.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center py-8 text-gray-500">
                  <Route className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>เลือกร้านค้าและกดวางแผนเพื่อดูเส้นทางที่แนะนำ</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">💡 เคล็ดลับการวางแผนเส้นทาง</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• AI จะพิจารณาจากระยะทาง เวลา และการจราจร</li>
            <li>• เลือกร้านค้าที่มีต้นไม้ที่ต้องการครบถ้วน</li>
            <li>• ควรเริ่มต้นจากร้านที่ไกลที่สุดก่อน</li>
            <li>• ตรวจสอบเวลาทำการของร้านค้าก่อนออกเดินทาง</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizationPage;
