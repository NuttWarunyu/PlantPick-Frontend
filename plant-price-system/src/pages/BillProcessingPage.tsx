import React, { useState, useRef } from 'react';
import { Upload, FileText, Edit, Check, X, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { BillData, BillItem } from '../types';

const BillProcessingPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [billData, setBillData] = useState<BillData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<BillData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setOcrText('');
        setBillData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageWithOCR = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    try {
      // OCR Processing with Tesseract.js
      const result = await Tesseract.recognize(uploadedImage, 'tha+eng', {
        logger: m => console.log(m)
      });

      const extractedText = result.data.text;
      setOcrText(extractedText);

      // Simulate AI processing (in real app, this would call ChatGPT API)
      const mockBillData = await simulateAIParsing(extractedText);
      setBillData(mockBillData);
      setEditData(mockBillData);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('เกิดข้อผิดพลาดในการประมวลผลภาพ');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateAIParsing = async (text: string): Promise<BillData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI parsing logic
    // const lines = text.split('\n').filter(line => line.trim());
    
    // Extract supplier info (mock)
    const supplierInfo = {
      name: 'สวนปณีตา',
      phone: '087-167-7250',
      province: 'นครปฐม'
    };

    // Extract items (mock)
    const items: BillItem[] = [
      {
        name: 'มอนสเตอร่า เดลิซิโอซ่า',
        price: 350,
        quantity: 2,
        confidenceScore: 0.95
      },
      {
        name: 'ไทรใบสัก',
        price: 1200,
        quantity: 1,
        confidenceScore: 0.88
      },
      {
        name: 'กุหลาบแดง',
        price: 150,
        quantity: 5,
        confidenceScore: 0.92
      }
    ];

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      supplierInfo,
      items,
      totalAmount,
      date: new Date().toISOString().split('T')[0]
    };
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(billData);
  };

  const handleSave = () => {
    if (editData) {
      setBillData(editData);
      setIsEditing(false);
      
      // Save to localStorage
      const savedBills = localStorage.getItem('plantBills');
      const bills = savedBills ? JSON.parse(savedBills) : [];
      bills.unshift(editData); // Add new bill to the beginning
      localStorage.setItem('plantBills', JSON.stringify(bills));
      
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(billData);
  };

  const updateItem = (index: number, field: keyof BillItem, value: any) => {
    if (!editData) return;
    
    const newItems = [...editData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    const newTotalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setEditData({
      ...editData,
      items: newItems,
      totalAmount: newTotalAmount
    });
  };

  const updateSupplierInfo = (field: 'name' | 'phone' | 'province', value: string) => {
    if (!editData) return;
    
    setEditData({
      ...editData,
      supplierInfo: {
        ...editData.supplierInfo,
        [field]: value
      }
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-100';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-4">
          ประมวลผลใบเสร็จ
        </h1>
        <p className="text-green-600">
          อัปโหลดภาพใบเสร็จเพื่อประมวลผลด้วย OCR และ AI
        </p>
      </div>

      {/* Image Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 mb-8">
        <div className="text-center">
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span>เลือกภาพใบเสร็จ</span>
            </button>
          </div>
          
          {uploadedImage && (
            <div className="mt-4">
              <img
                src={uploadedImage}
                alt="Uploaded bill"
                className="max-w-md mx-auto rounded-lg shadow-sm"
              />
              <div className="mt-4">
                <button
                  onClick={processImageWithOCR}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>กำลังประมวลผล...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      <span>เริ่มประมวลผล OCR</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OCR Results */}
      {ocrText && (
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-green-800 mb-4">
            ผลการประมวลผล OCR
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {ocrText}
            </pre>
          </div>
        </div>
      )}

      {/* Parsed Bill Data */}
      {billData && (
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-green-800">
              ข้อมูลที่ประมวลผลได้
            </h3>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>แก้ไข</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>บันทึก</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>ยกเลิก</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Supplier Information */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">ข้อมูลผู้จัดจำหน่าย:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  ชื่อร้าน
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData?.supplierInfo.name || ''}
                    onChange={(e) => updateSupplierInfo('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    {billData.supplierInfo.name}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  เบอร์โทร
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData?.supplierInfo.phone || ''}
                    onChange={(e) => updateSupplierInfo('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    {billData.supplierInfo.phone}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  จังหวัด
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData?.supplierInfo.province || ''}
                    onChange={(e) => updateSupplierInfo('province', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    {billData.supplierInfo.province}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">รายการสินค้า:</h4>
            <div className="space-y-3">
              {(isEditing ? editData : billData)?.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          ชื่อสินค้า
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-white rounded-lg">
                            {item.name}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          ราคา
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-white rounded-lg">
                            ฿{item.price.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          จำนวน
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-white rounded-lg">
                            {item.quantity}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          ความแม่นยำ
                        </label>
                        <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium ${getConfidenceColor(item.confidenceScore)}`}>
                          {(item.confidenceScore * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium text-gray-700">
                ราคารวมทั้งหมด: ฿{(isEditing ? editData : billData)?.totalAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                วันที่: {(isEditing ? editData : billData)?.date}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!uploadedImage && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            วิธีการใช้งาน
          </h3>
          <div className="text-blue-700 space-y-2">
            <p>1. อัปโหลดภาพใบเสร็จจากผู้จัดจำหน่าย</p>
            <p>2. ระบบจะประมวลผลด้วย OCR เพื่อแปลงข้อความเป็นตัวอักษร</p>
            <p>3. AI จะวิเคราะห์และจัดระเบียบข้อมูลให้อัตโนมัติ</p>
            <p>4. ตรวจสอบและแก้ไขข้อมูลหากจำเป็น</p>
            <p>5. บันทึกข้อมูลเพื่ออัปเดตราคาในระบบ</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillProcessingPage;
