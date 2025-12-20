import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload,
  Image,
  Receipt,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import { aiService, BillScanResult } from '../services/aiService';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const gardenFileInputRef = useRef<HTMLInputElement>(null);
  const billFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'garden' | 'bill'>('garden');
  const [billImage, setBillImage] = useState<File | null>(null);
  const [billImagePreview, setBillImagePreview] = useState<string | null>(null);
  const [isScanningBill, setIsScanningBill] = useState(false);
  const [billScanResult, setBillScanResult] = useState<BillScanResult | null>(null);
  const [billError, setBillError] = useState<string | null>(null);

  const handleGardenUpload = () => {
    gardenFileInputRef.current?.click();
  };

  const handleBillUpload = () => {
    billFileInputRef.current?.click();
  };

  const handleGardenFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleBillFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // สำหรับ User: สแกนบิลเพื่อดูรายการต้นไม้ (ไม่บันทึกลงฐานข้อมูล)
      setBillImage(file);
      setBillImagePreview(URL.createObjectURL(file));
      setBillScanResult(null);
      setBillError(null);
    }
  };

  const handleScanBill = async () => {
    if (!billImage) return;

    setIsScanningBill(true);
    setBillError(null);
    setBillScanResult(null);

    try {
      const result = await aiService.scanBill(billImage);
      setBillScanResult(result);
    } catch (err: any) {
      setBillError(err.message || 'เกิดข้อผิดพลาดในการสแกนบิล');
      console.error('Bill scan error:', err);
    } finally {
      setIsScanningBill(false);
    }
  };

  const handleResetBill = () => {
    setBillImage(null);
    setBillImagePreview(null);
    setBillScanResult(null);
    setBillError(null);
    if (billFileInputRef.current) {
      billFileInputRef.current.value = '';
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

        {/* Main Upload Section - โฟกัสหลัก */}
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-green-100">
          <div className="text-center">
            {/* Toggle Buttons */}
            <div className="flex gap-2 mb-8 justify-center">
              <button
                onClick={() => setUploadType('garden')}
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                  uploadType === 'garden'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Image className="w-4 h-4 inline mr-2" />
                รูปสวน
              </button>
              <button
                onClick={() => setUploadType('bill')}
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                  uploadType === 'bill'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Receipt className="w-4 h-4 inline mr-2" />
                ใบเสนอราคา
              </button>
            </div>

            {/* Icon and Title based on type */}
            {uploadType === 'garden' ? (
              <>
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
                  ref={gardenFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGardenFileSelect}
                  className="hidden"
                />
                
                <button
                  onClick={handleGardenUpload}
                  className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-12 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg sm:text-xl font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Upload className="w-6 h-6 sm:w-7 sm:h-7 mr-3 group-hover:animate-bounce" />
                  <span>อัปโหลดรูปภาพ</span>
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <Receipt className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                  สแกนใบเสนอราคาเพื่อสั่งซื้อ
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-md mx-auto">
                  AI จะสแกนและจัดระเบียบรายการต้นไม้จากบิลให้คุณ เพื่อเปรียบเทียบราคาและสั่งซื้อ
                </p>
                
                <input
                  ref={billFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBillFileSelect}
                  className="hidden"
                />
                
                {!billImagePreview ? (
                  <button
                    onClick={handleBillUpload}
                    className="group relative inline-flex items-center justify-center px-8 py-4 sm:px-12 sm:py-5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-lg sm:text-xl font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Upload className="w-6 h-6 sm:w-7 sm:h-7 mr-3 group-hover:animate-bounce" />
                    <span>อัปโหลดบิล</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* Preview Image */}
                    <div className="mb-4">
                      <img
                        src={billImagePreview}
                        alt="Bill preview"
                        className="max-w-full max-h-64 mx-auto rounded-xl shadow-md border-2 border-blue-100"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleResetBill}
                        className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                      >
                        เปลี่ยนรูป
                      </button>
                      <button
                        onClick={handleScanBill}
                        disabled={isScanningBill}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                      >
                        {isScanningBill ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>กำลังสแกน...</span>
                          </>
                        ) : (
                          <>
                            <Receipt className="w-5 h-5" />
                            <span>สแกนบิล</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Bill Scan Results - แสดงผลลัพธ์การสแกนบิล (สำหรับ User) */}
            {uploadType === 'bill' && billError && (
              <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{billError}</p>
                </div>
              </div>
            )}
            
            {uploadType === 'bill' && billScanResult && (
              <div className="mt-6 bg-white rounded-xl border-2 border-blue-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <h4 className="text-lg font-bold text-gray-800">ผลการสแกนบิล</h4>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <span className="font-semibold text-gray-700">ร้านค้า:</span> {billScanResult.supplierName}
                  </div>
                  {billScanResult.supplierPhone && (
                    <div>
                      <span className="font-semibold text-gray-700">เบอร์โทร:</span> {billScanResult.supplierPhone}
                    </div>
                  )}
                  {billScanResult.supplierLocation && (
                    <div>
                      <span className="font-semibold text-gray-700">ที่อยู่:</span> {billScanResult.supplierLocation}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-gray-700">วันที่:</span> {billScanResult.billDate}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">ยอดรวม:</span> {billScanResult.totalAmount.toLocaleString()} บาท
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="font-semibold text-gray-800 mb-3">รายการต้นไม้ ({billScanResult.items.length} รายการ)</h5>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {billScanResult.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{item.plantName}</p>
                            <div className="text-sm text-gray-600 mt-1">
                              <span>จำนวน: {item.quantity}</span>
                              {item.size && <span className="ml-3">ขนาด: {item.size}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">{item.total.toLocaleString()} บาท</p>
                            <p className="text-xs text-gray-500">({item.price.toLocaleString()} บาท/หน่วย)</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/search', { state: { billItems: billScanResult.items } })}
                  className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>เปรียบเทียบราคาและสั่งซื้อ</span>
                </button>
              </div>
            )}
            
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
