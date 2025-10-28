import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Store, Search, Plus, Bot, Zap, AlertCircle } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  location: string;
  phone: string;
  specialties?: string[];
}

const AddPlantPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [plantData, setPlantData] = useState({
    name: '',
    scientificName: '',
    category: '',
    plantType: '',
    measurementType: '',
    description: ''
  });
  const [supplierData, setSupplierData] = useState({
    supplierId: '',
    price: '',
    size: '',
    stockQuantity: '',
    notes: ''
  });
  const [addSupplier, setAddSupplier] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [duplicateCheck, setDuplicateCheck] = useState<{isDuplicate: boolean, similarPlants: any[]}>({isDuplicate: false, similarPlants: []});
  const [suppliersToShow, setSuppliersToShow] = useState<Supplier[]>([]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    let filtered = suppliers;

    // Filter by search term
    if (supplierSearchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        supplier.location.toLowerCase().includes(supplierSearchTerm.toLowerCase())
      );
    }

    // Filter by plant type specialty
    if (plantData.plantType && plantData.plantType !== '') {
      filtered = filtered.filter(supplier =>
        !supplier.specialties || supplier.specialties.includes(plantData.plantType)
      );
    }

    setSuppliersToShow(filtered);
  }, [suppliers, supplierSearchTerm, plantData.plantType]);

  useEffect(() => {
    // AI Data Entry Helper - Auto-complete and suggestions
    if (plantData.name) {
      generateAISuggestions();
      checkForDuplicates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantData.name, plantData.plantType]);

  const loadSuppliers = async () => {
    try {
      // ใช้ข้อมูลจาก localStorage แทนการเรียก API
      const storedSuppliers = localStorage.getItem('suppliers');
      if (storedSuppliers) {
        const suppliers = JSON.parse(storedSuppliers);
        setSuppliers(suppliers);
      } else {
        // ถ้าไม่มีข้อมูล ให้ใช้ข้อมูลตัวอย่าง
        setSuppliers([
          {
            id: 'supplier_1',
            name: 'ร้านตัวอย่าง A',
            location: 'กรุงเทพฯ',
            phone: '081-234-5678',
            specialties: ['ไม้ประดับ', 'ไม้ล้อม']
          },
          {
            id: 'supplier_2', 
            name: 'ร้านตัวอย่าง B',
            location: 'นครปฐม',
            phone: '082-345-6789',
            specialties: ['ไม้ดอก', 'แคคตัส']
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const generateAISuggestions = () => {
    const suggestions: string[] = [];
    
    // Auto-complete suggestions for plant name
    if (plantData.name && plantData.name.length > 2) {
      const existingPlants = JSON.parse(localStorage.getItem('plantsData') || '[]');
      const similarNames = existingPlants
        .filter((plant: any) => 
          plant.name.toLowerCase().includes(plantData.name.toLowerCase()) ||
          plant.scientificName.toLowerCase().includes(plantData.name.toLowerCase())
        )
        .slice(0, 3)
        .map((plant: any) => plant.name);
      
      if (similarNames.length > 0) {
        suggestions.push(`💡 ชื่อต้นไม้ที่คล้ายกัน: ${similarNames.join(', ')}`);
      }
    }
    
    // Price suggestions based on plant type
    if (plantData.plantType && supplierData.price) {
      const price = parseFloat(supplierData.price);
      const suggestions = getPriceSuggestions(plantData.plantType, price);
      if (suggestions.length > 0) {
        suggestions.push(...suggestions);
      }
    }
    
    // Size suggestions
    if (plantData.plantType && !supplierData.size) {
      const sizeSuggestions = getSizeSuggestions(plantData.plantType);
      if (sizeSuggestions.length > 0) {
        suggestions.push(`📏 ขนาดที่แนะนำ: ${sizeSuggestions.join(', ')}`);
      }
    }
    
    setAiSuggestions(suggestions);
  };

  const checkForDuplicates = () => {
    if (!plantData.name || plantData.name.length < 3) return;
    
    const existingPlants = JSON.parse(localStorage.getItem('plantsData') || '[]');
    const similarPlants = existingPlants.filter((plant: any) => 
      plant.name.toLowerCase() === plantData.name.toLowerCase() ||
      plant.scientificName.toLowerCase() === plantData.scientificName.toLowerCase()
    );
    
    setDuplicateCheck({
      isDuplicate: similarPlants.length > 0,
      similarPlants: similarPlants
    });
  };

  const getPriceSuggestions = (plantType: string, currentPrice: number): string[] => {
    const suggestions: string[] = [];
    
    // Price ranges for different plant types
    const priceRanges: { [key: string]: { min: number; max: number; avg: number } } = {
      'ไม้ประดับ': { min: 50, max: 2000, avg: 500 },
      'ไม้ล้อม': { min: 200, max: 5000, avg: 1000 },
      'ไม้คลุมดิน': { min: 20, max: 200, avg: 80 },
      'ไม้ดอก': { min: 30, max: 800, avg: 200 },
      'ไม้ใบ': { min: 100, max: 3000, avg: 800 },
      'แคคตัส': { min: 50, max: 1500, avg: 300 },
      'บอนไซ': { min: 500, max: 10000, avg: 2000 },
      'กล้วยไม้': { min: 100, max: 2000, avg: 600 }
    };
    
    const range = priceRanges[plantType];
    if (range) {
      if (currentPrice < range.min) {
        suggestions.push(`💰 ราคาต่ำกว่าปกติ - ราคาเฉลี่ย ${plantType}: ${range.avg} บาท`);
      } else if (currentPrice > range.max) {
        suggestions.push(`💸 ราคาสูงกว่าปกติ - ราคาเฉลี่ย ${plantType}: ${range.avg} บาท`);
      } else {
        suggestions.push(`✅ ราคาอยู่ในเกณฑ์ปกติ - ราคาเฉลี่ย ${plantType}: ${range.avg} บาท`);
      }
    }
    
    return suggestions;
  };

  const getSizeSuggestions = (plantType: string): string[] => {
    const sizeSuggestions: { [key: string]: string[] } = {
      'ไม้ประดับ': ['S', 'M', 'L', '1-2 ฟุต', '2-3 ฟุต'],
      'ไม้ล้อม': ['1-2 เมตร', '2-3 เมตร', '3-4 เมตร'],
      'ไม้คลุมดิน': ['3 นิ้ว', '4 นิ้ว', '6 นิ้ว'],
      'ไม้ดอก': ['3 นิ้ว', '4 นิ้ว', '6 นิ้ว', '8 นิ้ว'],
      'ไม้ใบ': ['S', 'M', 'L', '1-2 ฟุต'],
      'แคคตัส': ['3 นิ้ว', '4 นิ้ว', '6 นิ้ว'],
      'บอนไซ': ['S', 'M', 'L', 'Mini'],
      'กล้วยไม้': ['3 นิ้ว', '4 นิ้ว', '6 นิ้ว']
    };
    
    return sizeSuggestions[plantType] || [];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlantData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSupplierInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSupplierData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. เพิ่มต้นไม้ใน localStorage
      const newPlant = {
        id: `plant_${Date.now()}`,
        name: plantData.name,
        scientificName: plantData.scientificName,
        category: plantData.category,
        plantType: plantData.plantType,
        measurementType: plantData.measurementType,
        description: plantData.description,
        suppliers: [],
        hasSuppliers: false
      };

      // บันทึกต้นไม้ใน localStorage
      const existingPlants = JSON.parse(localStorage.getItem('plantsData') || '[]');
      existingPlants.push(newPlant);
      localStorage.setItem('plantsData', JSON.stringify(existingPlants));

      // 2. ถ้ามีการเพิ่มร้านค้า ให้เชื่อมต่อต้นไม้กับร้านค้า
      if (addSupplier && supplierData.supplierId && supplierData.price) {
        const selectedSupplier = suppliers.find(s => s.id === supplierData.supplierId);
        if (selectedSupplier) {
          const supplierConnection = {
            id: `supplier_${Date.now()}`,
            name: selectedSupplier.name,
            price: parseFloat(supplierData.price),
            phone: selectedSupplier.phone,
            location: selectedSupplier.location,
            lastUpdated: new Date().toISOString(),
            size: supplierData.size || undefined
          };

          // อัปเดตต้นไม้ใน localStorage
          const updatedPlants = JSON.parse(localStorage.getItem('plantsData') || '[]');
          const plantIndex = updatedPlants.findIndex((p: any) => p.id === newPlant.id);
          if (plantIndex !== -1) {
            updatedPlants[plantIndex].suppliers.push(supplierConnection);
            updatedPlants[plantIndex].hasSuppliers = true;
            localStorage.setItem('plantsData', JSON.stringify(updatedPlants));
          }
        }
      }

      alert('เพิ่มข้อมูลต้นไม้สำเร็จ!');
      navigate('/');
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

            {/* AI Suggestions */}
            {(aiSuggestions.length > 0 || duplicateCheck.isDuplicate) && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">🤖 คำแนะนำจาก AI</h4>
                </div>
                
                {/* Duplicate Warning */}
                {duplicateCheck.isDuplicate && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">⚠️ พบข้อมูลซ้ำ!</p>
                        <p className="text-sm text-red-700">
                          มีต้นไม้ชื่อ "{plantData.name}" ในระบบแล้ว
                        </p>
                        {duplicateCheck.similarPlants.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-red-600">ต้นไม้ที่คล้ายกัน:</p>
                            <ul className="text-xs text-red-600 list-disc list-inside">
                              {duplicateCheck.similarPlants.slice(0, 3).map((plant: any, index: number) => (
                                <li key={index}>{plant.name} ({plant.category})</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* AI Suggestions */}
                {aiSuggestions.length > 0 && (
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border border-blue-200">
                        <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-800">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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

            {/* Supplier Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <Store className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">ข้อมูลร้านค้า (ไม่บังคับ)</h3>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="addSupplier"
                  checked={addSupplier}
                  onChange={(e) => setAddSupplier(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="addSupplier" className="text-sm font-medium text-gray-700">
                  เพิ่มข้อมูลร้านค้าและราคา
                </label>
              </div>

              {addSupplier && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  {/* Supplier Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ค้นหาหรือเลือกร้านค้า
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={supplierSearchTerm}
                        onChange={(e) => setSupplierSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="ค้นหาชื่อร้านค้าหรือสถานที่..."
                      />
                    </div>
                    
                    {/* Supplier List */}
                    <div className="mt-3 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                      {suppliersToShow.length > 0 ? (
                        suppliersToShow.map(supplier => (
                          <div
                            key={supplier.id}
                            className={`p-3 cursor-pointer hover:bg-green-50 border-b border-gray-100 ${
                              supplierData.supplierId === supplier.id ? 'bg-green-100 border-green-300' : ''
                            }`}
                            onClick={() => setSupplierData(prev => ({ ...prev, supplierId: supplier.id }))}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{supplier.name}</div>
                                <div className="text-sm text-gray-600">{supplier.location}</div>
                                <div className="text-xs text-gray-500">{supplier.phone}</div>
                              </div>
                              {supplier.specialties && (
                                <div className="flex flex-wrap gap-1">
                                  {supplier.specialties.slice(0, 2).map(specialty => (
                                    <span key={specialty} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          ไม่พบร้านค้า
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => navigate('/add-supplier')}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              <Plus className="w-4 h-4 inline mr-1" />
                              เพิ่มร้านค้าใหม่
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        ราคา (บาท) *
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={supplierData.price}
                        onChange={handleSupplierInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="เช่น 150"
                      />
                    </div>

                    <div>
                      <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                        ไซต์ต้นไม้
                      </label>
                      <input
                        type="text"
                        id="size"
                        name="size"
                        value={supplierData.size}
                        onChange={handleSupplierInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="เช่น 1-2 ฟุต, S, M, L"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                        จำนวนสต็อก
                      </label>
                      <input
                        type="number"
                        id="stockQuantity"
                        name="stockQuantity"
                        value={supplierData.stockQuantity}
                        onChange={handleSupplierInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="เช่น 50"
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                        หมายเหตุ
                      </label>
                      <input
                        type="text"
                        id="notes"
                        name="notes"
                        value={supplierData.notes}
                        onChange={handleSupplierInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="ข้อมูลเพิ่มเติม..."
                      />
                    </div>
                  </div>
                </div>
              )}
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
