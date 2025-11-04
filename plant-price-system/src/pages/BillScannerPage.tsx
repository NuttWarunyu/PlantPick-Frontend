import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { aiService, BillScanResult } from '../services/aiService';

// ใช้ interface จาก aiService

const BillScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<BillScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<any | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      setScanResult(null);
    }
  };

  const handleScan = async () => {
    if (!image) return;

    setIsScanning(true);
    setError(null);
    setScanResult(null); // Clear previous result

    try {
      // ใช้ AIService จริง
      const result = await aiService.scanBill(image);
      setScanResult(result);
    } catch (err: any) {
      // แสดง error message ที่ชัดเจน
      const errorMessage = err.message || 'เกิดข้อผิดพลาดในการสแกนใบเสร็จ';
      
      // ตรวจสอบ error type
      if (errorMessage.includes('500') || errorMessage.includes('Backend')) {
        setError(`⚠️ เกิดข้อผิดพลาดจาก Backend: ${errorMessage}\n\nอาจเป็นเพราะ:\n- ยังไม่ได้ตั้งค่า OPENAI_API_KEY ใน Railway\n- Backend service ยังไม่พร้อม\n- OpenAI API มีปัญหา`);
      } else if (errorMessage.includes('400')) {
        setError(`⚠️ ข้อมูลไม่ถูกต้อง: ${errorMessage}`);
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        setError(`⚠️ ปัญหาการเข้าถึง: ${errorMessage}\n\nกรุณาตรวจสอบ API Key ใน Railway`);
      } else {
        setError(`❌ ${errorMessage}`);
      }
      
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!scanResult) return;

    setIsSaving(true);
    setSaveResult(null);
    setError(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, ''); // ลบ /api ถ้ามี

      // บันทึกข้อมูลลงฐานข้อมูล
      const response = await fetch(`${backendUrl}/api/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierName: scanResult.supplierName,
          supplierPhone: scanResult.supplierPhone,
          supplierLocation: scanResult.supplierLocation,
          billDate: scanResult.billDate,
          totalAmount: scanResult.totalAmount,
          items: scanResult.items.map(item => ({
            plantName: item.plantName,
            name: item.plantName, // สำหรับ backward compatibility
            price: item.price,
            unitPrice: item.price, // สำหรับ backward compatibility
            quantity: item.quantity || 1,
            total: item.total || (item.price * (item.quantity || 1)),
            size: item.size || null,
            notes: item.notes || null
          })),
          imageUrl: imagePreview
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSaveResult(data.data);
        // รอ 3 วินาทีแล้วไปหน้าบิลลิสต์
        setTimeout(() => {
          navigate('/bill-list');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to save bill');
      }
    } catch (err: any) {
      setError(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${err.message}`);
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setImagePreview(null);
    setScanResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📸 สแกนใบเสร็จอัตโนมัติ</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">ใช้ AI อ่านใบเสร็จและอัปเดตราคาล่าสุด</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 border-2 border-gray-300 rounded-xl shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white active:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 touch-manipulation"
            style={{ minHeight: '48px' }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            กลับหน้าหลัก
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📷 อัปโหลดใบเสร็จ</h2>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center active:border-green-400 transition-colors touch-manipulation">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="bill-upload"
                  />
                  <label htmlFor="bill-upload" className="cursor-pointer block">
                    <div className="text-6xl sm:text-7xl mb-4">📷</div>
                    <div className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">เลือกรูปใบเสร็จ</div>
                    <div className="text-sm sm:text-base text-gray-500 mb-4">ถ่ายรูปใหม่หรือเลือกจากแกลลอรี่</div>
                    <div className="flex items-center justify-center space-x-2 text-green-600 text-base sm:text-lg font-medium">
                      <Camera className="w-6 h-6 sm:w-5 sm:h-5" />
                      <span>เลือกรูปภาพ</span>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="ใบเสร็จ" 
                    className="w-full rounded-xl shadow-sm"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleScan}
                      disabled={isScanning}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white py-4 sm:py-3 px-4 rounded-xl active:bg-blue-600 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-base sm:text-sm font-semibold"
                      style={{ minHeight: '52px' }}
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-6 h-6 sm:w-5 sm:h-5 animate-spin" />
                          <span>AI กำลังอ่านใบเสร็จ...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-6 h-6 sm:w-5 sm:h-5" />
                          <span>✨ สแกนด้วย AI</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetScanner}
                      className="px-6 sm:px-4 py-4 sm:py-3 bg-gray-200 text-gray-700 rounded-xl active:bg-gray-300 hover:bg-gray-300 touch-manipulation text-base sm:text-sm font-medium"
                      style={{ minHeight: '52px' }}
                    >
                      เปลี่ยนรูป
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 วิธีใช้</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• ถ่ายรูปใบเสร็จให้ชัดเจน</li>
                <li>• ตรวจสอบให้แน่ใจว่าข้อความอ่านได้</li>
                <li>• AI จะอ่านและแปลงเป็นข้อมูลอัตโนมัติ</li>
                <li>• ตรวจสอบข้อมูลก่อนบันทึก</li>
              </ul>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-700 whitespace-pre-line font-medium">{error}</p>
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-sm text-red-600">💡 วิธีแก้ไข:</p>
                      <ul className="text-sm text-red-600 mt-1 ml-4 list-disc">
                        <li>ตรวจสอบ Railway Logs เพื่อดู error detail</li>
                        <li>ตรวจสอบว่า OPENAI_API_KEY ถูกตั้งค่าใน Railway หรือยัง</li>
                        <li>ลองอัพโหลดรูปใหม่</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {scanResult && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">📋 ผลการสแกน</h2>
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>ความแม่นยำ: {Math.round(scanResult.confidence * 100)}%</span>
                  </div>
                </div>

                {/* Supplier Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🏪 ข้อมูลร้านค้า</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">ชื่อร้าน:</span> {scanResult.supplierName}</p>
                    {scanResult.supplierPhone && (
                      <p><span className="font-medium">โทร:</span> {scanResult.supplierPhone}</p>
                    )}
                    {scanResult.supplierLocation && (
                      <p><span className="font-medium">ที่อยู่:</span> {scanResult.supplierLocation}</p>
                    )}
                    <p><span className="font-medium">วันที่:</span> {scanResult.billDate}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  <h3 className="font-semibold text-gray-900">🌱 รายการต้นไม้</h3>
                  <div className="space-y-2">
                    {scanResult.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.plantName}</p>
                          <div className="text-sm text-gray-600">
                            <span>จำนวน: {item.quantity}</span>
                            {item.size && <span className="ml-2">ไซต์: {item.size}</span>}
                            {item.notes && <span className="ml-2">({item.notes})</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{item.total.toLocaleString()} ฿</p>
                          <p className="text-sm text-gray-600">{item.price.toLocaleString()} ฿/ต้น</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                    <span>ยอดรวม</span>
                    <span>{scanResult.totalAmount.toLocaleString()} ฿</span>
                  </div>
                </div>

                {/* Save Result */}
                {saveResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <h3 className="font-semibold text-green-900">บันทึกสำเร็จ!</h3>
                    </div>
                    <div className="text-sm text-green-800 space-y-1">
                      <p>✅ ร้านค้า: <span className="font-medium">{saveResult.bill?.supplierName || scanResult.supplierName}</span></p>
                      <p>✅ บันทึกรายการ: <span className="font-medium">{saveResult.summary?.itemsProcessed || 0}</span>/{saveResult.summary?.itemsTotal || scanResult.items.length} รายการ</p>
                      <p>✅ ราคารวม: <span className="font-medium">{scanResult.totalAmount.toLocaleString()} ฿</span></p>
                      {saveResult.summary?.errors && saveResult.summary.errors.length > 0 && (
                        <div className="mt-2 text-orange-700">
                          <p className="font-medium">⚠️ ข้อผิดพลาด:</p>
                          <ul className="list-disc list-inside">
                            {saveResult.summary.errors.map((err: string, idx: number) => (
                              <li key={idx}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-green-600 mt-2">กำลังนำไปยังหน้ารายการบิล...</p>
                  </div>
                )}

                {/* Actions - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleSaveToDatabase}
                    disabled={isSaving || !!saveResult}
                    className="flex-1 bg-green-600 text-white py-4 sm:py-3 px-4 rounded-xl active:bg-green-700 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-base sm:text-sm font-semibold"
                    style={{ minHeight: '52px' }}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-5 h-5 sm:w-4 sm:h-4 inline animate-spin mr-2" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        💾 บันทึกข้อมูล
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/bill-list')}
                    className="px-6 sm:px-4 py-4 sm:py-3 bg-gray-200 text-gray-700 rounded-xl active:bg-gray-300 hover:bg-gray-300 transition-colors touch-manipulation text-base sm:text-sm font-medium"
                    style={{ minHeight: '52px' }}
                  >
                    ดูรายการบิล
                  </button>
                </div>
              </div>
            )}

            {/* Tips */}
            {!scanResult && !error && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">💡 เคล็ดลับการถ่ายรูป</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• วางใบเสร็จบนพื้นเรียบ</li>
                  <li>• ใช้แสงธรรมชาติหรือไฟสว่าง</li>
                  <li>• ถ่ายให้เต็มกรอบ</li>
                  <li>• หลีกเลี่ยงเงาและสะท้อน</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillScannerPage;
