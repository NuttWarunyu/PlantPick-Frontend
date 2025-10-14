import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Phone, Mail, Globe, Clock, Search, Filter } from 'lucide-react';
import { apiService } from '../services/api';

interface Supplier {
  id: string;
  name: string;
  location: string;
  phone: string;
  email?: string;
  website?: string;
  description?: string;
  specialties: string[];
  businessHours?: string;
  paymentMethods: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);

  const specialties = [
    'ไม้ประดับ', 'ไม้ล้อม', 'ไม้คลุมดิน', 'ไม้ดอก', 'ไม้ใบ', 
    'แคคตัส', 'บอนไซ', 'กล้วยไม้', 'ไม้ไผ่'
  ];

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, selectedSpecialty]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSuppliers();
      if (response.success) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSuppliers = () => {
    let filtered = suppliers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(supplier =>
        supplier.specialties.includes(selectedSpecialty)
      );
    }

    setFilteredSuppliers(filtered);
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors: { [key: string]: string } = {
      'ไม้ประดับ': 'bg-green-100 text-green-800',
      'ไม้ล้อม': 'bg-blue-100 text-blue-800',
      'ไม้คลุมดิน': 'bg-yellow-100 text-yellow-800',
      'ไม้ดอก': 'bg-pink-100 text-pink-800',
      'ไม้ใบ': 'bg-emerald-100 text-emerald-800',
      'แคคตัส': 'bg-orange-100 text-orange-800',
      'บอนไซ': 'bg-purple-100 text-purple-800',
      'กล้วยไม้': 'bg-rose-100 text-rose-800',
      'ไม้ไผ่': 'bg-lime-100 text-lime-800'
    };
    return colors[specialty] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลผู้จัดจำหน่าย...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏪 รายการผู้จัดจำหน่าย</h1>
            <p className="text-gray-600 mt-2">ค้นหาและเปรียบเทียบผู้จัดจำหน่ายต้นไม้</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            กลับหน้าหลัก
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อร้านค้า, ที่อยู่, หรือความเชี่ยวชาญ"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Specialty Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">ทุกความเชี่ยวชาญ</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            พบ {filteredSuppliers.length} ร้านค้าจากทั้งหมด {suppliers.length} ร้าน
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Store className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                      <p className="text-sm text-gray-600">{supplier.location}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{supplier.phone}</span>
                  </div>
                  {supplier.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2" />
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {supplier.website}
                      </a>
                    </div>
                  )}
                  {supplier.businessHours && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{supplier.businessHours}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {supplier.description && (
                  <p className="text-sm text-gray-600 mb-4">{supplier.description}</p>
                )}

                {/* Specialties */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">ความเชี่ยวชาญ:</h4>
                  <div className="flex flex-wrap gap-2">
                    {supplier.specialties.map(specialty => (
                      <span
                        key={specialty}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSpecialtyColor(specialty)}`}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">วิธีการชำระเงิน:</h4>
                  <div className="flex flex-wrap gap-2">
                    {supplier.paymentMethods.map(method => (
                      <span
                        key={method}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/supplier/${supplier.id}`)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    ดูรายละเอียด
                  </button>
                  <button
                    onClick={() => navigate(`/add-plant-supplier?supplierId=${supplier.id}`)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    เชื่อมต่อ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบผู้จัดจำหน่าย</h3>
            <p className="text-gray-600">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierListPage;
