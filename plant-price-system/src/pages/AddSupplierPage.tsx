import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Store, MapPin, Phone, DollarSign, Package } from 'lucide-react';

const AddSupplierPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [supplierData, setSupplierData] = useState({
    name: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    specialties: [] as string[],
    businessHours: '',
    paymentMethods: [] as string[]
  });

  const plantTypes = [
    'ไม้ประดับ', 'ไม้ล้อม', 'ไม้คลุมดิน', 'ไม้ดอก', 
    'ไม้ใบ', 'แคคตัส', 'บอนไซ', 'กล้วยไม้', 'ไม้ไผ่'
  ];

  const paymentOptions = [
    'เงินสด', 'โอนเงิน', 'บัตรเครดิต', 'ผ่อนชำระ', 'เช็ค'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSupplierData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSupplierData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setSupplierData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplierData.name || !supplierData.location || !supplierData.phone) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    if (supplierData.specialties.length === 0) {
      alert('กรุณาเลือกความเชี่ยวชาญอย่างน้อย 1 อย่าง');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });

      const result = await response.json();

      if (result.success) {
        alert('เพิ่มข้อมูลร้านค้าสำเร็จ!');
        navigate('/');
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.message);
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูลร้านค้า');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>กลับ</span>
          </button>
          <div className="flex items-center space-x-3">
            <Store className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">เพิ่มร้านค้าจริง</h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ข้อมูลพื้นฐาน</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อร้านค้า *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={supplierData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="เช่น สวนไม้ประดับ ABC"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={supplierData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="เช่น 081-234-5678"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    ที่อยู่ *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={supplierData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="เช่น 123 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={supplierData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="เช่น info@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    เว็บไซต์
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={supplierData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="เช่น https://www.example.com"
                  />
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ความเชี่ยวชาญ *</h2>
              <p className="text-sm text-gray-600 mb-4">เลือกประเภทต้นไม้ที่ร้านค้าขาย</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {plantTypes.map(plantType => (
                  <label key={plantType} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={supplierData.specialties.includes(plantType)}
                      onChange={() => handleSpecialtyChange(plantType)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{plantType}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Business Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ข้อมูลธุรกิจ</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="businessHours" className="block text-sm font-medium text-gray-700 mb-2">
                    เวลาเปิด-ปิด
                  </label>
                  <input
                    type="text"
                    id="businessHours"
                    name="businessHours"
                    value={supplierData.businessHours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="เช่น จันทร์-เสาร์ 8:00-18:00, อาทิตย์ 9:00-17:00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วิธีการชำระเงิน
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {paymentOptions.map(method => (
                      <label key={method} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={supplierData.paymentMethods.includes(method)}
                          onChange={() => handlePaymentMethodChange(method)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบายร้านค้า
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={supplierData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="อธิบายเกี่ยวกับร้านค้า ความเชี่ยวชาญ และบริการ..."
                  />
                </div>
              </div>
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
                    <span>บันทึกข้อมูลร้านค้า</span>
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

export default AddSupplierPage;
