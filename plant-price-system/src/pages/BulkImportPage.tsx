import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const BulkImportPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/plants/bulk-import`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);
    } catch (error) {
      console.error('Error importing plants:', error);
      setImportResult({
        success: 0,
        failed: 0,
        errors: ['เกิดข้อผิดพลาดในการอัปโหลดไฟล์']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,scientificName,category,plantType,measurementType,description
มอนสเตอร่า เดลิซิโอซ่า,Monstera deliciosa,ไม้ใบ,ไม้ประดับ,ความสูง,ไม้ประดับใบสวย เหมาะสำหรับตกแต่งภายใน
ไทรใบสัก,Ficus lyrata,ไม้ใบ,ไม้ประดับ,ความสูง,ไม้ประดับใบใหญ่ เหมาะสำหรับตกแต่งห้อง
กุหลาบแดง,Rosa sp.,ไม้ดอก,ไม้ดอก,ขนาดกระถาง,ไม้ดอกสวยงาม เหมาะสำหรับจัดสวน
แคคตัสบอล,Echinocactus grusonii,แคคตัส,แคคตัส,ขนาดกระถาง,แคคตัสทรงกลม เหมาะสำหรับตกแต่งโต๊ะทำงาน`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plant_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>กลับ</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">นำเข้าข้อมูลต้นไม้จำนวนมาก</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">อัปโหลดไฟล์ CSV</h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">เลือกไฟล์ CSV ที่มีข้อมูลต้นไม้</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  เลือกไฟล์
                </button>
              </div>

              {selectedFile && (
                <div className="flex items-center space-x-2 text-green-600">
                  <FileText className="w-4 h-4" />
                  <span>{selectedFile.name}</span>
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!selectedFile || isLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>กำลังนำเข้า...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>นำเข้าข้อมูล</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Template Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ดาวน์โหลด Template</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">รูปแบบไฟล์ CSV</h3>
                <p className="text-sm text-gray-600 mb-3">
                  ไฟล์ CSV ต้องมีคอลัมน์ดังนี้:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>name</strong> - ชื่อต้นไม้ (จำเป็น)</li>
                  <li>• <strong>scientificName</strong> - ชื่อวิทยาศาสตร์</li>
                  <li>• <strong>category</strong> - หมวดหมู่ (จำเป็น)</li>
                  <li>• <strong>plantType</strong> - ประเภท (จำเป็น)</li>
                  <li>• <strong>measurementType</strong> - หน่วยวัด (จำเป็น)</li>
                  <li>• <strong>description</strong> - คำอธิบาย</li>
                </ul>
              </div>

              <button
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {importResult && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ผลการนำเข้า</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>สำเร็จ: {importResult.success} รายการ</span>
              </div>
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>ล้มเหลว: {importResult.failed} รายการ</span>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2">ข้อผิดพลาด:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-800 mb-2">คำแนะนำการใช้งาน</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• ใช้ไฟล์ CSV ที่มี encoding เป็น UTF-8</li>
            <li>• ตรวจสอบให้แน่ใจว่าข้อมูลในคอลัมน์จำเป็น (name, category, plantType, measurementType) ไม่ว่าง</li>
            <li>• หมวดหมู่และประเภทต้องตรงกับตัวเลือกที่มีในระบบ</li>
            <li>• สามารถเพิ่มข้อมูลได้ครั้งละไม่เกิน 1,000 รายการ</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BulkImportPage;
