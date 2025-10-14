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

    try {
      // ใช้ AIService จริง
      const result = await aiService.scanBill(image);
      setScanResult(result);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการสแกนใบเสร็จ กรุณาลองใหม่อีกครั้ง');
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!scanResult) return;

    try {
      // บันทึกข้อมูลลงฐานข้อมูล
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bills`, {
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
          items: scanResult.items,
          imageUrl: imagePreview
        }),
      });

      if (response.ok) {
        alert('บันทึกข้อมูลใบเสร็จสำเร็จ!');
        navigate('/bill-list');
      } else {
        throw new Error('Failed to save bill');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      console.error('Save error:', err);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setImagePreview(null);
    setScanResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📸 สแกนใบเสร็จอัตโนมัติ</h1>
            <p className="text-gray-600 mt-2">ใช้ AI อ่านใบเสร็จและอัปเดตราคาล่าสุด</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            กลับหน้าหลัก
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📷 อัปโหลดใบเสร็จ</h2>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="bill-upload"
                  />
                  <label htmlFor="bill-upload" className="cursor-pointer">
                    <div className="text-6xl mb-4">📷</div>
                    <div className="text-xl font-medium text-gray-700 mb-2">ถ่ายรูปใบเสร็จ</div>
                    <div className="text-gray-500 mb-4">หรือเลือกจากอัลบั้ม</div>
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <Camera className="w-5 h-5" />
                      <span>เปิดกล้อง</span>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="ใบเสร็จ" 
                    className="w-full rounded-lg shadow-sm"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleScan}
                      disabled={isScanning}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>AI กำลังอ่านใบเสร็จ...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>✨ สแกนด้วย AI</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetScanner}
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
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

                {/* Actions */}
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleSaveToDatabase}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    💾 บันทึกข้อมูล
                  </button>
                  <button
                    onClick={() => navigate('/bill-list')}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
