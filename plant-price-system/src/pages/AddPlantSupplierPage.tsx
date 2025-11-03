import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Link, Search, Store, Leaf } from 'lucide-react';

interface Plant {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  plantType: string;
}

interface Supplier {
  id: string;
  name: string;
  location: string;
  phone: string;
  specialties: string[];
}

const AddPlantSupplierPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [plantSearchTerm, setPlantSearchTerm] = useState('');
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [showPlantList, setShowPlantList] = useState(false);
  const [showSupplierList, setShowSupplierList] = useState(false);
  
  const [connectionData, setConnectionData] = useState({
    plantId: '',
    supplierId: '',
    price: '',
    size: '',
    stockQuantity: '',
    minOrderQuantity: '1',
    deliveryAvailable: false,
    deliveryCost: '',
    notes: ''
  });

  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    loadPlants();
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (plantSearchTerm) {
      const filtered = plants.filter(plant =>
        plant.name?.toLowerCase().includes(plantSearchTerm.toLowerCase()) ||
        (plant.scientificName && plant.scientificName.toLowerCase().includes(plantSearchTerm.toLowerCase()))
      );
      setFilteredPlants(filtered);
    } else {
      setFilteredPlants(plants);
    }
  }, [plantSearchTerm, plants]);

  useEffect(() => {
    if (supplierSearchTerm) {
      const filtered = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        supplier.location.toLowerCase().includes(supplierSearchTerm.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [supplierSearchTerm, suppliers]);

  const loadPlants = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/plants`);
      const result = await response.json();
      if (result.success) {
        setPlants(result.data);
        setFilteredPlants(result.data);
      }
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/suppliers`);
      const result = await response.json();
      if (result.success) {
        setSuppliers(result.data);
        setFilteredSuppliers(result.data);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const handlePlantSelect = (plant: Plant) => {
    setSelectedPlant(plant);
    setConnectionData(prev => ({ ...prev, plantId: plant.id }));
    setShowPlantList(false);
    setPlantSearchTerm(plant.name);
  };

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setConnectionData(prev => ({ ...prev, supplierId: supplier.id }));
    setShowSupplierList(false);
    setSupplierSearchTerm(supplier.name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setConnectionData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connectionData.plantId || !connectionData.supplierId || !connectionData.price) {
      alert('กรุณาเลือกต้นไม้ ร้านค้า และกรอกราคา');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/plant-suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionData),
      });

      const result = await response.json();

      if (result.success) {
        alert('เพิ่มการเชื่อมต่อต้นไม้-ร้านค้าสำเร็จ!');
        navigate('/');
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.message);
      }
    } catch (error) {
      console.error('Error adding plant-supplier connection:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มการเชื่อมต่อ');
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
            <Link className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">เชื่อมต่อต้นไม้กับร้านค้า</h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plant Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกต้นไม้ *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={plantSearchTerm}
                  onChange={(e) => setPlantSearchTerm(e.target.value)}
                  onFocus={() => setShowPlantList(true)}
                  placeholder="ค้นหาต้นไม้..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                
                {showPlantList && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredPlants.map(plant => (
                      <div
                        key={plant.id}
                        onClick={() => handlePlantSelect(plant)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                      >
                        <div className="flex items-center space-x-3">
                          <Leaf className="w-4 h-4 text-green-600" />
                          <div>
                            <div className="font-medium text-gray-900">{plant.name}</div>
                            <div className="text-sm text-gray-500">{plant.scientificName}</div>
                            <div className="text-xs text-gray-400">{plant.category} • {plant.plantType}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Supplier Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกร้านค้า *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={supplierSearchTerm}
                  onChange={(e) => setSupplierSearchTerm(e.target.value)}
                  onFocus={() => setShowSupplierList(true)}
                  placeholder="ค้นหาร้านค้า..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                
                {showSupplierList && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredSuppliers.map(supplier => (
                      <div
                        key={supplier.id}
                        onClick={() => handleSupplierSelect(supplier)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                      >
                        <div className="flex items-center space-x-3">
                          <Store className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">{supplier.name}</div>
                            <div className="text-sm text-gray-500">{supplier.location}</div>
                            <div className="text-xs text-gray-400">{supplier.phone}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Price and Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  ราคา (บาท) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={connectionData.price}
                  onChange={handleInputChange}
                  required
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
                  value={connectionData.size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="เช่น 1-2 ฟุต, S, M, L"
                />
              </div>
            </div>

            {/* Stock and Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนสต็อก
                </label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  value={connectionData.stockQuantity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="เช่น 50"
                />
              </div>

              <div>
                <label htmlFor="minOrderQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนสั่งซื้อขั้นต่ำ
                </label>
                <input
                  type="number"
                  id="minOrderQuantity"
                  name="minOrderQuantity"
                  value={connectionData.minOrderQuantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="เช่น 1"
                />
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="deliveryAvailable"
                  name="deliveryAvailable"
                  checked={connectionData.deliveryAvailable}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="deliveryAvailable" className="text-sm font-medium text-gray-700">
                  มีบริการจัดส่ง
                </label>
              </div>

              <div>
                <label htmlFor="deliveryCost" className="block text-sm font-medium text-gray-700 mb-2">
                  ค่าจัดส่ง (บาท)
                </label>
                <input
                  type="number"
                  id="deliveryCost"
                  name="deliveryCost"
                  value={connectionData.deliveryCost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="เช่น 50"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                หมายเหตุ
              </label>
              <textarea
                id="notes"
                name="notes"
                value={connectionData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ข้อมูลเพิ่มเติม..."
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
                    <span>บันทึกการเชื่อมต่อ</span>
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

export default AddPlantSupplierPage;
