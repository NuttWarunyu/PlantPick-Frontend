import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Trash2, AlertCircle, CheckSquare, Square, ShoppingCart, X } from 'lucide-react';
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
        plant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plant.scientificName && plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        plant.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Simple Header */}
      <div className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              🌿 PlantPick
            </h1>
            <p className="text-gray-600">ระบบจัดการราคาต้นไม้สำหรับธุรกิจสวน</p>
          </div>
        </div>
      </div>

      {/* Search Section - Mobile Optimized */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="relative">
          <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5 sm:h-6 sm:w-6" />
          <input
            type="text"
            placeholder="ค้นหาต้นไม้ เช่น มอนสเตอร่า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 sm:pl-14 pr-4 py-4 sm:py-5 text-base sm:text-lg border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300 shadow-sm touch-manipulation"
            style={{ fontSize: '16px' }} // ป้องกัน zoom บน iOS
          />
        </div>
        
        {/* Search Examples */}
        {!showResults && searchTerm === '' && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">ตัวอย่างการค้นหา:</p>
            <div className="flex flex-wrap gap-2">
              {['มอนสเตอร่า', 'ไทรใบสัก', 'กุหลาบ', 'แคคตัส', 'ไผ่', 'บอนไซ'].map((example) => (
                <button
                  key={example}
                  onClick={() => setSearchTerm(example)}
                  className="px-3 py-1 bg-white text-green-700 rounded-full text-sm hover:bg-green-50 transition-colors border border-green-200 hover:border-green-300"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Search Results - แสดงเฉพาะเมื่อมีการค้นหา */}
      {searchTerm && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">🔍 ผลการค้นหา</h2>
              {searchResults.length > 0 && (
                <p className="text-gray-600">
                  พบ <span className="font-semibold text-green-600">{searchResults.length}</span> รายการสำหรับ "<span className="font-semibold">{searchTerm}</span>"
                </p>
              )}
            </div>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {searchResults.map((result) => (
                  <div 
                    key={result.plant.id} 
                    className="group relative bg-gray-50 border-2 border-gray-200 rounded-xl p-4 sm:p-5 active:border-green-400 hover:shadow-md transition-all duration-300"
                  >
                    {/* Plant Icon */}
                    <div className="text-center mb-3">
                      <div className="text-4xl sm:text-5xl mb-2">🌿</div>
                    </div>

                    {/* Plant Info */}
                    <div className="text-center mb-3">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 line-clamp-2">{result.plant.name}</h3>
                      {result.plant.scientificName && (
                        <p className="text-xs sm:text-sm text-gray-500 italic mb-2 line-clamp-1">{result.plant.scientificName}</p>
                      )}
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {result.plant.category || 'อื่นๆ'}
                      </span>
                    </div>

                    {/* Price Info */}
                    {result.plant.suppliers.length > 0 && (
                      <div className="text-center mb-3">
                        <div className="text-base sm:text-lg font-bold text-green-600">
                          ฿{getLowestPrice(result.plant).toLocaleString()}
                          {getLowestPrice(result.plant) !== getHighestPrice(result.plant) && (
                            <span className="text-xs sm:text-sm text-gray-500"> - ฿{getHighestPrice(result.plant).toLocaleString()}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">ราคาต่อต้น</p>
                      </div>
                    )}

                    {/* Action Button - Mobile Optimized */}
                    <button
                      onClick={() => togglePlantSelection(result.plant)}
                      disabled={result.isSelected}
                      className={`w-full flex items-center justify-center px-4 py-3 sm:py-2 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 touch-manipulation ${
                        result.isSelected
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 text-white active:bg-green-600 hover:bg-green-600'
                      }`}
                      style={{ minHeight: '48px' }} // Touch target size
                    >
                      <Plus className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                      {result.isSelected ? 'เลือกแล้ว' : 'เพิ่มลงรายการ'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ไม่พบต้นไม้ที่ค้นหา</h3>
                <p className="text-gray-600 mb-4">ลองค้นหาด้วยคำอื่น หรือดูตัวอย่างการค้นหาด้านบน</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  ล้างการค้นหา
                </button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Selected Plants */}
      {selectedPlants.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
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
