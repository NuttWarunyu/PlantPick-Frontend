import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Package, CheckCircle, XCircle, Truck, FileText } from 'lucide-react';
import { Plant, QuoteItem } from '../types';
import { updateAndSavePrice } from '../utils/priceUpdate';

interface PurchaseOrderPageProps {
  selectedPlants: Plant[];
  setSelectedPlants: (plants: Plant[]) => void;
}

interface PurchaseOrderItem extends QuoteItem {
  confirmed: boolean;
  notes: string;
  actualPrice: number; // ราคาจริงที่ได้จากสวน
}

const PurchaseOrderPage: React.FC<PurchaseOrderPageProps> = ({ selectedPlants, setSelectedPlants }) => {
  const navigate = useNavigate();
  const [purchaseItems, setPurchaseItems] = useState<PurchaseOrderItem[]>([]);
  const [allConfirmed, setAllConfirmed] = useState(false);

  // อัปเดต purchaseItems เมื่อ selectedPlants เปลี่ยน
  useEffect(() => {
    setPurchaseItems(
      selectedPlants.map(plant => ({
        plant,
        quantity: 1,
        selectedSupplier: plant.suppliers && plant.suppliers.length > 0 ? plant.suppliers[0] : null,
        confirmed: false,
        notes: '',
        actualPrice: plant.suppliers && plant.suppliers.length > 0 ? plant.suppliers[0].price : 0 // เริ่มต้นด้วยราคาจากฐานข้อมูล
      }))
    );
  }, [selectedPlants]);

  // ตรวจสอบว่าทุกรายการได้รับการยืนยันแล้วหรือไม่
  useEffect(() => {
    const confirmed = purchaseItems.every(item => item.confirmed);
    setAllConfirmed(confirmed && purchaseItems.length > 0);
  }, [purchaseItems]);

  const updateQuantity = (plantId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setPurchaseItems(prev => 
      prev.map(item => 
        item.plant.id === plantId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateSupplier = (plantId: string, supplierId: string) => {
    setPurchaseItems(prev => 
      prev.map(item => {
        if (item.plant.id === plantId) {
          const newSupplier = item.plant.suppliers.find(s => s.id === supplierId);
          return newSupplier ? { 
            ...item, 
            selectedSupplier: newSupplier,
            actualPrice: newSupplier.price // อัปเดตราคาจริงด้วย
          } : item;
        }
        return item;
      })
    );
  };

  const updateActualPrice = (plantId: string, price: number) => {
    setPurchaseItems(prev => 
      prev.map(item => 
        item.plant.id === plantId 
          ? { ...item, actualPrice: price }
          : item
      )
    );
  };

  const toggleConfirmation = (plantId: string) => {
    setPurchaseItems(prev => 
      prev.map(item => {
        if (item.plant.id === plantId) {
          const newConfirmed = !item.confirmed;
          
          // ถ้ากำลังยืนยัน (เปลี่ยนจาก false เป็น true) ให้อัปเดตราคาในฐานข้อมูล
          if (newConfirmed && !item.confirmed && item.selectedSupplier) {
            updateAndSavePrice(plantId, item.selectedSupplier.id, item.actualPrice);
            console.log(`อัปเดตราคา ${item.plant.name} จาก ${item.selectedSupplier?.name || 'ผู้จัดจำหน่าย'} เป็น ฿${item.actualPrice}`);
            
            // แสดงข้อความแจ้งเตือน
            setTimeout(() => {
              alert(`อัปเดตราคา ${item.plant.name} จาก ${item.selectedSupplier?.name || 'ผู้จัดจำหน่าย'} เป็น ฿${item.actualPrice.toLocaleString()} แล้ว`);
            }, 100);
          }
          
          return { ...item, confirmed: newConfirmed };
        }
        return item;
      })
    );
  };

  const updateNotes = (plantId: string, notes: string) => {
    setPurchaseItems(prev => 
      prev.map(item => 
        item.plant.id === plantId 
          ? { ...item, notes }
          : item
      )
    );
  };

  const removePlant = (plantId: string) => {
    setPurchaseItems(prev => prev.filter(item => item.plant.id !== plantId));
    setSelectedPlants(selectedPlants.filter(plant => plant.id !== plantId));
  };

  const getTotalPrice = () => {
    return purchaseItems.reduce((total, item) => {
      return total + (item.actualPrice * item.quantity);
    }, 0);
  };

  // จัดกลุ่มตามที่ตั้ง
  const getLocationGroups = () => {
    const groups: { [key: string]: PurchaseOrderItem[] } = {};
    
    purchaseItems.forEach(item => {
      if (item.selectedSupplier) {
        const location = item.selectedSupplier.location;
        if (!groups[location]) {
          groups[location] = [];
        }
        groups[location].push(item);
      }
    });
    
    return groups;
  };

  const locationGroups = getLocationGroups();

  if (selectedPlants.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-green-800 mb-4">
          ไม่มีรายการสั่งซื้อ
        </h2>
        <p className="text-green-600 mb-6">
          กรุณาเลือกต้นไม้จากหน้าค้นหาก่อน
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปค้นหา
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            รายการสั่งซื้อ (Purchase Order)
          </h1>
          <p className="text-green-600">
            โทรคอนเฟิมและจัดกลุ่มตามที่ตั้งสำหรับการจ้างรถ
          </p>
        </div>
        <a
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>กลับไปค้นหา</span>
        </a>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800">
              {purchaseItems.length}
            </div>
            <div className="text-sm text-green-600">รายการทั้งหมด</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-800">
              {Object.keys(locationGroups).length}
            </div>
            <div className="text-sm text-blue-600">ที่ตั้งที่ต้องไป</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-800">
              {purchaseItems.filter(item => item.confirmed).length}
            </div>
            <div className="text-sm text-orange-600">ยืนยันแล้ว</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800">
              ฿{getTotalPrice().toLocaleString()}
            </div>
            <div className="text-sm text-green-600">ราคารวม</div>
          </div>
        </div>
      </div>

      {/* Location Groups */}
      <div className="space-y-6">
        {Object.entries(locationGroups).map(([location, items]) => (
          <div key={location} className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-800">
                  {location}
                </h3>
                <p className="text-blue-600">
                  {items.length} รายการ | ราคารวม: ฿{items.reduce((sum, item) => sum + (item.actualPrice * item.quantity), 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.plant.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-green-800">
                          {item.plant.name}
                        </h4>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {item.plant.category}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {item.plant.plantType}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {item.plant.measurementType}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {item.plant.scientificName}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => removePlant(item.plant.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Supplier Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ผู้จัดจำหน่าย:
                    </label>
                    <select
                      value={item.selectedSupplier?.id || ''}
                      onChange={(e) => updateSupplier(item.plant.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    >
                      {item.plant.suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} - ฿{supplier.price.toLocaleString()} ({supplier.location})
                          {supplier.size && ` - ${supplier.size}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity and Price */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">จำนวน:</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.plant.id, parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                        min="1"
                        placeholder="จำนวน"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ราคาต่อต้น (฿):</label>
                      <input
                        type="number"
                        value={item.actualPrice}
                        onChange={(e) => updateActualPrice(item.plant.id, parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                        min="0"
                        placeholder="ราคาจริงจากสวน"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        ราคาอ้างอิง: ฿{item.selectedSupplier?.price.toLocaleString() || '0'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ราคารวม:</label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg border">
                        <div className="text-lg font-semibold text-green-800">
                          ฿{(item.actualPrice * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact and Confirmation */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-gray-800">
                            {item.selectedSupplier?.name || 'ไม่มีผู้จัดจำหน่าย'}
                            {item.selectedSupplier?.size && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {item.selectedSupplier.size}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {item.selectedSupplier?.location || 'ไม่ระบุที่ตั้ง'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {item.selectedSupplier && (
                          <a
                            href={`tel:${item.selectedSupplier.phone}`}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                            <span>โทร</span>
                          </a>
                        )}
                        
                        <button
                          onClick={() => toggleConfirmation(item.plant.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            item.confirmed
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>{item.confirmed ? 'ยืนยันแล้ว' : 'ยืนยัน'}</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        หมายเหตุ:
                      </label>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => updateNotes(item.plant.id, e.target.value)}
                        placeholder="เพิ่มหมายเหตุ..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Final Summary */}
      {allConfirmed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="text-xl font-semibold text-green-800">
              พร้อมจัดส่ง!
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">สรุปรายการ:</h4>
              <div className="space-y-1">
                {purchaseItems.map((item) => (
                  <div key={item.plant.id} className="flex justify-between text-sm">
                    <span>{item.plant.name} x{item.quantity}</span>
                    <span>฿{((item.selectedSupplier?.price || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">ที่ตั้งที่ต้องไป:</h4>
              <div className="space-y-1">
                {Object.entries(locationGroups).map(([location, items]) => (
                  <div key={location} className="flex justify-between text-sm">
                    <span>{location}</span>
                    <span>{items.length} รายการ</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-green-200 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium text-gray-700">
                ราคารวมทั้งหมด: ฿{getTotalPrice().toLocaleString()}
              </div>
              <button 
                onClick={() => navigate('/order-summary')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                สร้างสรุปคำสั่งซื้อ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderPage;
