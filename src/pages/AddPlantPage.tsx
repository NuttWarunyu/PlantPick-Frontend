import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save } from 'lucide-react';

const AddPlantPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [plantData, setPlantData] = useState({
    name: '',
    scientificName: '',
    category: '',
    plantType: '',
    measurementType: '',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlantData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/plants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plantData),
      });

      const result = await response.json();

      if (result.success) {
        alert('เพิ่มข้อมูลต้นไม้สำเร็จ!');
        navigate('/');
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.message);
      }
    } catch (error) {
      console.error('Error adding plant:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูลต้นไม้');
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">เพิ่มข้อมูลต้นไม้</h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อต้นไม้ *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={plantData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="เช่น ต้นยางอินเดีย"
                />
              </div>

              <div>
                <label htmlFor="scientificName" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อวิทยาศาสตร์
                </label>
                <input
                  type="text"
                  id="scientificName"
                  name="scientificName"
                  value={plantData.scientificName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="เช่น Ficus elastica"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่ *
                </label>
                <select
                  id="category"
                  name="category"
                  value={plantData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  <option value="ไม้ประดับ">ไม้ประดับ</option>
                  <option value="ไม้ล้อม">ไม้ล้อม</option>
                  <option value="ไม้คลุมดิน">ไม้คลุมดิน</option>
                  <option value="ไม้ผล">ไม้ผล</option>
                  <option value="ไม้ดอก">ไม้ดอก</option>
                </select>
              </div>

              <div>
                <label htmlFor="plantType" className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภท *
                </label>
                <select
                  id="plantType"
                  name="plantType"
                  value={plantData.plantType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">เลือกประเภท</option>
                  <option value="ไม้ประดับ">ไม้ประดับ</option>
                  <option value="ไม้ล้อม">ไม้ล้อม</option>
                  <option value="ไม้คลุมดิน">ไม้คลุมดิน</option>
                  <option value="ไม้ผล">ไม้ผล</option>
                  <option value="ไม้ดอก">ไม้ดอก</option>
                </select>
              </div>

              <div>
                <label htmlFor="measurementType" className="block text-sm font-medium text-gray-700 mb-2">
                  หน่วยวัด *
                </label>
                <select
                  id="measurementType"
                  name="measurementType"
                  value={plantData.measurementType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">เลือกหน่วยวัด</option>
                  <option value="ความสูง">ความสูง</option>
                  <option value="เส้นรอบวง">เส้นรอบวง</option>
                  <option value="จำนวนใบ">จำนวนใบ</option>
                  <option value="น้ำหนัก">น้ำหนัก</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                คำอธิบาย
              </label>
              <textarea
                id="description"
                name="description"
                value={plantData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="อธิบายเกี่ยวกับต้นไม้..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>บันทึกข้อมูล</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPlantPage;
