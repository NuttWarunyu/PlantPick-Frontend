import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle, AlertCircle, RefreshCw, Store, ChevronDown, ChevronUp } from 'lucide-react';
import { aiService, BillScanResult } from '../services/aiService';

// ใช้ interface จาก aiService

interface OtherSupplier {
  id: string;
  name: string;
  location: string;
  phone: string | null;
  current_price: number | null;
  size: string | null;
  price_updated_at: string | null;
}

const BillScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<BillScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<any | null>(null);
  const [otherSuppliers, setOtherSuppliers] = useState<Record<string, OtherSupplier[]>>({});
  const [selectedSuppliers, setSelectedSuppliers] = useState<Record<string, string[]>>({});
  const [expandedPlants, setExpandedPlants] = useState<Record<string, boolean>>({});
  const [loadingOtherSuppliers, setLoadingOtherSuppliers] = useState<Record<string, boolean>>({});
  const [scannedSupplierId, setScannedSupplierId] = useState<string | null>(null);

  // รับไฟล์จาก Dashboard ถ้ามี
  useEffect(() => {
    const imageFile = (location.state as any)?.imageFile;
    if (imageFile && imageFile instanceof File) {
      setImage(imageFile);
      setImagePreview(URL.createObjectURL(imageFile));
    }
  }, [location.state]);

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
    setOtherSuppliers({});
    setSelectedSuppliers({});
    setExpandedPlants({});
    setScannedSupplierId(null);

    try {
      // ใช้ AIService จริง
      const result = await aiService.scanBill(image);
      setScanResult(result);
      
      // หลังจากสแกนสำเร็จ ให้ดึงร้านค้าอื่นๆ สำหรับแต่ละต้นไม้
      // (จะทำหลังจากบันทึกสำเร็จ เพราะต้องมี plantId ก่อน)
    } catch (err: any) {
      // แสดง error message ที่ชัดเจนสำหรับ mobile
      const errorMessage = err.message || 'เกิดข้อผิดพลาดในการสแกนใบเสร็จ';
      
      // ตรวจสอบ error type และปรับ message ให้เข้าใจง่ายขึ้น
      let displayMessage = '';
      
      if (errorMessage.includes('timeout')) {
        displayMessage = '⏱️ การสแกนใช้เวลานานเกินไป\n\n💡 คำแนะนำ:\n- ลองเลือกรูปภาพที่มีขนาดเล็กลง\n- ตรวจสอบสัญญาณอินเทอร์เน็ต\n- ลองใหม่อีกครั้ง';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        displayMessage = '📡 ปัญหาการเชื่อมต่อ\n\n💡 คำแนะนำ:\n- ตรวจสอบสัญญาณอินเทอร์เน็ต\n- ลองปิด/เปิด WiFi หรือ Mobile Data\n- ลองใหม่อีกครั้ง';
      } else if (errorMessage.includes('500') || errorMessage.includes('Backend')) {
        displayMessage = `⚠️ เกิดข้อผิดพลาดจาก Server\n\n💡 คำแนะนำ:\n- ลองใหม่อีกครั้งในภายหลัง\n- หรือติดต่อผู้ดูแลระบบ`;
      } else if (errorMessage.includes('400')) {
        displayMessage = `⚠️ ข้อมูลไม่ถูกต้อง\n\n${errorMessage}\n\n💡 คำแนะนำ:\n- ตรวจสอบว่ารูปภาพชัดเจน\n- ลองเลือกรูปภาพอื่น`;
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        displayMessage = `⚠️ ปัญหาการเข้าถึง\n\n${errorMessage}\n\n💡 คำแนะนำ:\n- กรุณาตรวจสอบ API Key ใน Railway`;
      } else {
        displayMessage = `❌ ${errorMessage}`;
      }
      
      setError(displayMessage);
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // ดึงร้านค้าอื่นๆ ที่มีต้นไม้เดียวกัน
  const loadOtherSuppliers = async (plantName: string, plantId: string, excludeSupplierId: string | null) => {
    if (loadingOtherSuppliers[plantId]) return;
    
    setLoadingOtherSuppliers(prev => ({ ...prev, [plantId]: true }));
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');
      
      const url = `${backendUrl}/api/plants/${plantId}/other-suppliers${excludeSupplierId ? `?excludeSupplierId=${excludeSupplierId}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setOtherSuppliers(prev => ({ ...prev, [plantId]: data.data }));
        setExpandedPlants(prev => ({ ...prev, [plantId]: true })); // Auto-expand ถ้ามีร้านอื่น
      }
    } catch (err) {
      console.error('Error loading other suppliers:', err);
    } finally {
      setLoadingOtherSuppliers(prev => ({ ...prev, [plantId]: false }));
    }
  };

  // Toggle selection ของร้านค้า (แค่เลือกไว้ ไม่ได้อัพเดตราคา)
  const toggleSupplierSelection = (plantId: string, supplierId: string) => {
    const current = selectedSuppliers[plantId] || [];
    const isSelected = current.includes(supplierId);
    
    // อัพเดต state (แค่เลือกไว้)
    setSelectedSuppliers(prev => ({
      ...prev,
      [plantId]: isSelected
        ? current.filter(id => id !== supplierId)
        : [...current, supplierId]
    }));
  };

  // Toggle expand/collapse
  const togglePlantExpand = (plantId: string) => {
    setExpandedPlants(prev => ({ ...prev, [plantId]: !prev[plantId] }));
  };

  // เพิ่มต้นไม้ให้ร้านค้าที่เลือก (ไม่มีราคา - Admin จะต้องเช็คและ approve ราคาเอง)
  const addPlantsToSelectedSuppliers = async () => {
    if (!saveResult || !saveResult.processedItems) return;
    
    const hasSelection = Object.values(selectedSuppliers).some(arr => arr.length > 0);
    if (!hasSelection) {
      alert('กรุณาเลือกร้านค้าที่ต้องการเพิ่มต้นไม้');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      // เพิ่ม plant_supplier relationship สำหรับแต่ละต้นไม้และร้านที่เลือก
      for (const item of saveResult.processedItems) {
        if (!item.plantId) continue;
        
        const selectedSupplierIds = selectedSuppliers[item.plantId] || [];
        
        for (const supplierId of selectedSupplierIds) {
          try {
            const response = await fetch(`${backendUrl}/api/plant-suppliers`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                plantId: item.plantId,
                supplierId: supplierId,
                price: null, // ไม่มีราคา - Admin จะต้องเช็คและ approve ราคาเอง
                size: null,
                stockQuantity: 0,
                minOrderQuantity: 1,
                deliveryAvailable: false,
                deliveryCost: 0,
                notes: `เพิ่มจากใบเสร็จ ${scanResult?.supplierName || ''} - รอ Admin approve ราคา`
              }),
            });
            
            const data = await response.json();
            
            if (data.success) {
              successCount++;
              console.log(`✅ เพิ่ม ${item.plantName} ให้ร้าน ${supplierId} สำเร็จ`);
            } else {
              errorCount++;
              errors.push(`${item.plantName}: ${data.message}`);
            }
          } catch (err: any) {
            errorCount++;
            errors.push(`${item.plantName}: ${err.message}`);
          }
        }
      }
      
      if (successCount > 0) {
        alert(`✅ เพิ่มต้นไม้ให้ร้านค้าที่เลือกสำเร็จ ${successCount} รายการ${errorCount > 0 ? `\n⚠️ ล้มเหลว ${errorCount} รายการ` : ''}`);
        // Clear selections
        setSelectedSuppliers({});
      } else {
        alert(`❌ ไม่สามารถเพิ่มต้นไม้ได้: ${errors.join(', ')}`);
      }
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsSaving(false);
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

      // บันทึกบิลก่อน (เพื่อให้ได้ plantId และ supplierId)
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
          imageUrl: imagePreview,
          applyToOtherSuppliers: selectedSuppliers // ส่ง selectedSuppliers ไปด้วย (ถ้ามีการเลือกไว้ก่อน)
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSaveResult(data.data);
        setScannedSupplierId(data.data.bill?.supplierId || null);
        
        // ดึงร้านค้าอื่นๆ สำหรับแต่ละต้นไม้ (ถ้ายังไม่ได้ดึง)
        if (data.data.processedItems) {
          for (const item of data.data.processedItems) {
            if (item.plantId && !otherSuppliers[item.plantId]) {
              await loadOtherSuppliers(item.plantName, item.plantId, data.data.bill?.supplierId || null);
            }
          }
        }
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
    setOtherSuppliers({});
    setSelectedSuppliers({});
    setExpandedPlants({});
    setScannedSupplierId(null);
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
                  <div className="space-y-3">
                    {scanResult.items.map((item, index) => {
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Plant Item Header */}
                          <div className="flex items-center justify-between p-3 bg-green-50">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.plantName}</p>
                              <div className="text-sm text-gray-600">
                                <span>จำนวน: {item.quantity}</span>
                                {item.size && <span className="ml-2">ไซต์: {item.size}</span>}
                                {item.notes && <span className="ml-2">({item.notes})</span>}
                              </div>
                            </div>
                            <div className="text-right mr-3">
                              <p className="font-semibold text-gray-900">{item.total.toLocaleString()} ฿</p>
                              <p className="text-sm text-gray-600">{item.price.toLocaleString()} ฿/ต้น</p>
                            </div>
                          </div>
                          
                          {/* Other Suppliers Section */}
                          {saveResult && saveResult.processedItems && (() => {
                            const processedItem = saveResult.processedItems.find((pi: any) => pi.plantName === item.plantName);
                            if (!processedItem || !processedItem.plantId) return null;
                            
                            const realPlantId = processedItem.plantId;
                            const realOtherSuppliers = otherSuppliers[realPlantId] || [];
                            const realSelectedSuppliers = selectedSuppliers[realPlantId] || [];
                            const realIsExpanded = expandedPlants[realPlantId] || false;
                            const realIsLoading = loadingOtherSuppliers[realPlantId] || false;
                            
                            // Auto-load ถ้ายังไม่ได้โหลด
                            if (realOtherSuppliers.length === 0 && !realIsLoading && scannedSupplierId) {
                              setTimeout(() => {
                                loadOtherSuppliers(item.plantName, realPlantId, scannedSupplierId);
                              }, 100);
                            }
                            
                            if (realOtherSuppliers.length === 0) return null;
                            
                            return (
                              <div className="border-t border-gray-200 bg-gray-50">
                                <button
                                  onClick={() => togglePlantExpand(realPlantId)}
                                  className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center space-x-2">
                                    <Store className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                      ร้านค้าอื่นๆ ที่มี {item.plantName} ({realOtherSuppliers.length} ร้าน)
                                    </span>
                                    {realSelectedSuppliers.length > 0 && (
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        เลือกแล้ว {realSelectedSuppliers.length} ร้าน
                                      </span>
                                    )}
                                  </div>
                                  {realIsExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                  )}
                                </button>
                                
                                {realIsExpanded && (
                                  <div className="px-3 pb-3 space-y-2">
                                    {realOtherSuppliers.map((supplier) => {
                                      const isSelected = realSelectedSuppliers.includes(supplier.id);
                                      return (
                                        <label
                                          key={supplier.id}
                                          className={`flex items-start space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                            isSelected ? 'bg-green-100 border-2 border-green-500' : 'bg-white border border-gray-200 hover:bg-gray-50'
                                          }`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSupplierSelection(realPlantId, supplier.id)}
                                            className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                          />
                                          <div className="flex-1">
                                            <p className="font-medium text-gray-900">{supplier.name}</p>
                                            <p className="text-xs text-gray-600">{supplier.location}</p>
                                            {supplier.current_price && (
                                              <p className="text-xs text-gray-500 mt-1">
                                                ราคาปัจจุบัน: {supplier.current_price.toLocaleString()} ฿
                                                {supplier.size && ` (${supplier.size})`}
                                              </p>
                                            )}
                                          </div>
                                          <div className="text-right">
                                            {supplier.current_price ? (
                                              <p className="text-xs text-gray-500">
                                                ราคาเดิม: {supplier.current_price.toLocaleString()} ฿
                                              </p>
                                            ) : (
                                              <p className="text-xs text-gray-500">
                                                ยังไม่มีราคา
                                              </p>
                                            )}
                                          </div>
                                        </label>
                                      );
                                    })}
                                    <p className="text-xs text-gray-500 mt-2 px-2">
                                      💡 เลือกร้านค้าที่ต้องการเพิ่ม {item.plantName} เข้าไป (Admin จะต้องเช็คและ approve ราคาเอง)
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
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
                  </div>
                )}

                {/* Actions - Mobile Optimized */}
                <div className="flex flex-col gap-3 mt-6">
                  {!saveResult ? (
                    <button
                      onClick={handleSaveToDatabase}
                      disabled={isSaving}
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
                  ) : (
                    <>
                      {/* Button to add plants to selected suppliers */}
                      {Object.values(selectedSuppliers).some(arr => arr.length > 0) && (
                        <button
                          onClick={addPlantsToSelectedSuppliers}
                          disabled={isSaving}
                          className="flex-1 bg-blue-600 text-white py-4 sm:py-3 px-4 rounded-xl active:bg-blue-700 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-base sm:text-sm font-semibold"
                          style={{ minHeight: '52px' }}
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-5 h-5 sm:w-4 sm:h-4 inline animate-spin mr-2" />
                              กำลังเพิ่ม...
                            </>
                          ) : (
                            <>
                              ➕ เพิ่มต้นไม้ให้ร้านที่เลือก
                            </>
                          )}
                        </button>
                      )}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => navigate('/bill-list')}
                          className="flex-1 px-6 sm:px-4 py-4 sm:py-3 bg-gray-200 text-gray-700 rounded-xl active:bg-gray-300 hover:bg-gray-300 transition-colors touch-manipulation text-base sm:text-sm font-medium"
                          style={{ minHeight: '52px' }}
                        >
                          ดูรายการบิล
                        </button>
                        <button
                          onClick={() => navigate('/')}
                          className="flex-1 px-6 sm:px-4 py-4 sm:py-3 bg-green-100 text-green-700 rounded-xl active:bg-green-200 hover:bg-green-200 transition-colors touch-manipulation text-base sm:text-sm font-medium"
                          style={{ minHeight: '52px' }}
                        >
                          สแกนบิลใหม่
                        </button>
                      </div>
                    </>
                  )}
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
