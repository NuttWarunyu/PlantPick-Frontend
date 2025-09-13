import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Phone, FileText, Eye, Trash2, AlertCircle } from 'lucide-react';
import { Plant, SearchResult, BillData } from '../types';
import { syncService } from '../services/syncService';
import { initializeBasePlants } from '../data/basePlants';
import AddSupplierModal from '../components/AddSupplierModal';

interface SearchPageProps {
  selectedPlants: Plant[];
  setSelectedPlants: (plants: Plant[]) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ selectedPlants, setSelectedPlants }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [bills, setBills] = useState<BillData[]>([]);
  const [showBills, setShowBills] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [, setIsLoading] = useState(true);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [selectedPlantForSupplier, setSelectedPlantForSupplier] = useState<Plant | null>(null);

  // เริ่มต้นข้อมูลพื้นฐาน
  useEffect(() => {
    initializeBasePlants();
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      setIsLoading(true);
      const plantsData = await syncService.getPlants();
      setPlants(plantsData);
    } catch (error) {
      console.error('Error loading plants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load bills from localStorage on component mount
  useEffect(() => {
    const savedBills = localStorage.getItem('plantBills');
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    }
  }, []);

  // Filter plants based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const filtered = plants
      .filter(plant => 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(plant => ({
        plant: plant as Plant,
        isSelected: selectedPlants.some(sp => sp.id === plant.id)
      }));

    setSearchResults(filtered);
    setShowResults(true);
  }, [searchTerm, selectedPlants, plants]);

  const togglePlantSelection = (plant: Plant) => {
    const isSelected = selectedPlants.some(sp => sp.id === plant.id);
    
    if (isSelected) {
      setSelectedPlants(selectedPlants.filter(sp => sp.id !== plant.id));
    } else {
      setSelectedPlants([...selectedPlants, plant]);
    }
  };

  const removePlant = (plantId: string) => {
    setSelectedPlants(selectedPlants.filter(sp => sp.id !== plantId));
  };

  const getLowestPrice = (plant: Plant) => {
    if (plant.suppliers.length === 0) return 0;
    return Math.min(...plant.suppliers.map(s => s.price));
  };

  const getHighestPrice = (plant: Plant) => {
    if (plant.suppliers.length === 0) return 0;
    return Math.max(...plant.suppliers.map(s => s.price));
  };

  const handleAddSupplier = (plant: Plant) => {
    setSelectedPlantForSupplier(plant);
    setShowAddSupplierModal(true);
  };

  const handleSupplierAdded = () => {
    loadPlants(); // รีโหลดข้อมูล
  };

  const deleteBill = (index: number) => {
    if (window.confirm('คุณต้องการลบบิลนี้หรือไม่?')) {
      const newBills = bills.filter((_, i) => i !== index);
      setBills(newBills);
      localStorage.setItem('plantBills', JSON.stringify(newBills));
    }
  };

  const getTotalItems = (bill: BillData) => {
    return bill.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPriceRange = () => {
    if (selectedPlants.length === 0) return { min: 0, max: 0 };
    
    let minTotal = 0;
    let maxTotal = 0;
    
    selectedPlants.forEach(plant => {
      if (plant.suppliers.length > 0) {
        const prices = plant.suppliers.map(s => s.price);
        minTotal += Math.min(...prices);
        maxTotal += Math.max(...prices);
      }
    });
    
    return { min: minTotal, max: maxTotal };
  };

  const priceRange = getTotalPriceRange();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 h-6 w-6" />
          <input
            type="text"
            placeholder="พิมพ์ชื่อต้นไม้ ภาษาไทย หรือชื่อวิทยาศาสตร์ เช่น: มอนสเตอร่า, Monstera, ไม้ใบ"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
          />
        </div>
        
        {/* Search Examples */}
        {!showResults && searchTerm === '' && (
          <div className="mt-4 text-center">
            <p className="text-sm text-green-600 mb-2">ตัวอย่างการค้นหา:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['มอนสเตอร่า', 'ไทรใบสัก', 'กุหลาบ', 'แคคตัส', 'ไผ่', 'บอนไซ'].map((example) => (
                <button
                  key={example}
                  onClick={() => setSearchTerm(example)}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bills Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-green-800">
            รายการบิลล่าสุด ({bills.length} บิล)
          </h2>
          <button
            onClick={() => setShowBills(!showBills)}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            {showBills ? 'ซ่อน' : 'แสดง'} รายการบิล
          </button>
        </div>

        {showBills && bills.length > 0 && (
          <div className="space-y-4">
            {bills.slice(0, 3).map((bill, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-green-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-green-800">
                        {bill.supplierInfo.name}
                      </h3>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {bill.supplierInfo.province}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {getTotalItems(bill)} รายการ
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      เบอร์โทร: {bill.supplierInfo.phone} | 
                      ราคารวม: ฿{bill.totalAmount.toLocaleString()} | 
                      วันที่: {new Date(bill.date).toLocaleDateString('th-TH')}
                    </div>

                    {/* Items Preview */}
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-1">รายการสินค้า:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {bill.items.slice(0, 4).map((item, itemIndex) => (
                          <div key={itemIndex} className="text-xs text-gray-700">
                            {item.name} x{item.quantity} ฿{item.price.toLocaleString()}
                          </div>
                        ))}
                        {bill.items.length > 4 && (
                          <div className="text-xs text-gray-500 italic">
                            และอีก {bill.items.length - 4} รายการ...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteBill(index)}
                    className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                    title="ลบบิล"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {bills.length > 3 && (
              <div className="text-center text-sm text-green-600">
                และอีก {bills.length - 3} บิล... 
                <a href="/bill-list" className="ml-2 underline hover:text-green-800">
                  ดูทั้งหมด
                </a>
              </div>
            )}
          </div>
        )}

        {showBills && bills.length === 0 && (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">ยังไม่มีบิลในระบบ</p>
            <p className="text-sm text-gray-500 mt-1">
              ไปที่หน้า "ประมวลผลใบเสร็จ" เพื่อเพิ่มบิลใหม่
            </p>
          </div>
        )}
      </div>

      {/* Search Results - แสดงเฉพาะเมื่อมีการค้นหา */}
      {searchTerm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800">🔍 ผลการค้นหา</h2>
          
          {searchResults.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                พบ {searchResults.length} รายการสำหรับ "{searchTerm}"
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((result) => (
                  <div key={result.plant.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🌿</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{result.plant.name}</h3>
                          <p className="text-sm text-gray-500 italic">{result.plant.scientificName}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {result.plant.category}
                      </span>
                      
                      <button
                        onClick={() => togglePlantSelection(result.plant)}
                        disabled={result.isSelected}
                        className={`flex items-center px-3 py-1 rounded-lg text-sm transition-colors ${
                          result.isSelected
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {result.isSelected ? 'เลือกแล้ว' : 'เพิ่ม'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>ไม่พบต้นไม้ที่ค้นหา "{searchTerm}"</p>
              <p className="text-sm">ลองค้นหาด้วยคำอื่น หรือตรวจสอบการสะกดคำ</p>
            </div>
          )}
        </div>
      )}

      {!searchTerm && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">เริ่มค้นหาต้นไม้</h3>
          <p className="text-gray-500">พิมพ์ชื่อต้นไม้ที่ต้องการในช่องค้นหาด้านบน</p>
          <p className="text-sm text-gray-400 mt-2">เช่น "มอนสเตอร่า", "กุหลาบ", "แคคตัส"</p>
        </div>
      )}

      {/* Selected Plants */}
      {selectedPlants.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800">
            🛒 รายการที่เลือก ({selectedPlants.length} รายการ)
          </h2>
          
          <div className="space-y-4 mb-6">
            {selectedPlants.map((plant) => (
              <div key={plant.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">🌿</span>
                    <div>
                      <span className="font-medium">{plant.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({plant.category})</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {plant.plantType}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {plant.measurementType}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removePlant(plant.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* แสดงข้อมูลผู้จัดจำหน่าย */}
                <div className="ml-8">
                  {plant.suppliers.length > 0 ? (
                    <>
                      <p className="text-sm text-gray-600 mb-2">ผู้จัดจำหน่าย ({plant.suppliers.length} ร้าน):</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {plant.suppliers.slice(0, 3).map((supplier) => (
                          <div key={supplier.id} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                            <div>
                              <span className="font-medium">{supplier.name}</span>
                              <span className="text-gray-500 ml-1">({supplier.location})</span>
                              {supplier.size && (
                                <span className="ml-1 px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                  {supplier.size}
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-green-600">฿{supplier.price.toLocaleString()}</span>
                          </div>
                        ))}
                        {plant.suppliers.length > 3 && (
                          <div className="text-xs text-gray-500 italic">
                            และอีก {plant.suppliers.length - 3} ร้าน...
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        ราคา: ฿{getLowestPrice(plant).toLocaleString()} - ฿{getHighestPrice(plant).toLocaleString()}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-700">ไม่มีข้อมูลผู้จัดจำหน่าย</span>
                      </div>
                      <button
                        onClick={() => handleAddSupplier(plant)}
                        className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                      >
                        เพิ่มข้อมูล
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <p className="text-sm text-green-700">ราคารวมประมาณ:</p>
              <p className="text-lg font-bold text-green-800">
                {priceRange.min > 0 ? `฿${priceRange.min.toLocaleString()} - ฿${priceRange.max.toLocaleString()}` : 'ไม่มีข้อมูลราคา'}
              </p>
            </div>
            
            <button
              onClick={() => navigate('/purchase-order')}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Eye className="w-4 h-4 mr-2" />
              สร้างรายการสั่งซื้อ
            </button>
          </div>
        </div>
      )}

      {/* Selected Plants Summary */}
      {selectedPlants.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg border border-green-200 p-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-800">
                เลือกแล้ว {selectedPlants.length} รายการ
              </div>
              <div className="text-sm text-green-600">
                ราคารวม: {priceRange.min > 0 ? `฿${priceRange.min.toLocaleString()} - ฿${priceRange.max.toLocaleString()}` : 'ไม่มีข้อมูลราคา'}
              </div>
            </div>
            <button
              onClick={() => navigate('/purchase-order')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              สร้างรายการสั่งซื้อ
            </button>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {selectedPlantForSupplier && (
        <AddSupplierModal
          isOpen={showAddSupplierModal}
          onClose={() => {
            setShowAddSupplierModal(false);
            setSelectedPlantForSupplier(null);
          }}
          plantId={selectedPlantForSupplier.id}
          plantName={selectedPlantForSupplier.name}
          onSupplierAdded={handleSupplierAdded}
        />
      )}
    </div>
  );
};

export default SearchPage;
