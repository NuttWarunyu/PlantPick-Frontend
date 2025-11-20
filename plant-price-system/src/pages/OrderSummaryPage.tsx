import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText, MapPin, Phone, Package, CheckCircle, Calendar, History, Route, Navigation, Clock, DollarSign, Truck, ExternalLink } from 'lucide-react';
import { Plant, QuoteItem } from '../types';
import { aiService } from '../services/aiService';

interface OrderSummaryPageProps {
  selectedPlants: Plant[];
  setSelectedPlants: (plants: Plant[]) => void;
}

interface OrderItem extends QuoteItem {
  confirmed: boolean;
  notes: string;
  orderDate: string;
}

const OrderSummaryPage: React.FC<OrderSummaryPageProps> = ({ selectedPlants, setSelectedPlants }) => {
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  
  // Route Optimization states
  const [destination, setDestination] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeAnalysis, setRouteAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // สร้างหมายเลขคำสั่งซื้อ
  useEffect(() => {
    const now = new Date();
    const orderNum = `PO-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    setOrderNumber(orderNum);
  }, []);

  // อัปเดต orderItems เมื่อ selectedPlants เปลี่ยน
  useEffect(() => {
    setOrderItems(
      selectedPlants.map(plant => ({
        plant,
        quantity: 1,
        selectedSupplier: plant.suppliers[0],
        confirmed: true,
        notes: '',
        orderDate: new Date().toISOString().split('T')[0]
      }))
    );
  }, [selectedPlants]);

  const getTotalPrice = () => {
    return orderItems.reduce((total, item) => {
      return total + ((item.selectedSupplier?.price || 0) * item.quantity);
    }, 0);
  };

  // จัดกลุ่มตามที่ตั้ง
  const getLocationGroups = () => {
    const groups: { [key: string]: OrderItem[] } = {};
    
    orderItems.forEach(item => {
      if (item.selectedSupplier) {
        const location = item.selectedSupplier?.location || 'ไม่ระบุที่ตั้ง';
        if (!groups[location]) {
          groups[location] = [];
        }
        groups[location].push(item);
      }
    });
    
    return groups;
  };

  const locationGroups = getLocationGroups();

  // Calculate route optimization
  const handleOptimizeRoute = async () => {
    if (!destination.trim()) {
      setRouteError('กรุณากรอกปลายทาง');
      return;
    }

    const locations = Object.keys(locationGroups);
    if (locations.length === 0) {
      setRouteError('ไม่มีที่ตั้งที่ต้องไป');
      return;
    }

    setIsOptimizing(true);
    setRouteError(null);

    try {
      // สร้าง suppliers array สำหรับ route optimization
      const suppliers = locations.map(location => {
        const items = locationGroups[location];
        const totalValue = items.reduce((sum, item) => 
          sum + ((item.selectedSupplier?.price || 0) * item.quantity), 0
        );
        
        return {
          name: location,
          location: location,
          items: items.map(item => ({
            plantName: item.plant.name,
            quantity: item.quantity
          })),
          totalValue: totalValue
        };
      });

      const result = await aiService.optimizeRoute(suppliers, destination);
      setRouteResult(result);
      
      // เรียก AI Analysis หลังจากได้ route result
      await handleAnalyzeRoute(result);
    } catch (error: any) {
      setRouteError(error.message || 'เกิดข้อผิดพลาดในการคำนวณเส้นทาง');
      console.error('Route optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  // AI Analysis for route
  const handleAnalyzeRoute = async (routeData: any) => {
    setIsAnalyzing(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');

      const orderData = {
        totalPrice: getTotalPrice(),
        items: orderItems,
        locationGroups: locationGroups
      };

      const response = await fetch(`${backendUrl}/api/route/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routeData,
          orderData
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setRouteAnalysis(data.data);
        }
      }
    } catch (error: any) {
      console.error('Route analysis error:', error);
      // ไม่แสดง error เพราะเป็น optional feature
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate number of trucks needed
  const calculateTrucksNeeded = () => {
    if (!routeResult) return null;
    
    // สมมติว่า 1 คันขนได้ 100 ต้น หรือ 50,000 บาท
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = getTotalPrice();
    
    const trucksByQuantity = Math.ceil(totalQuantity / 100);
    const trucksByValue = Math.ceil(totalValue / 50000);
    
    return Math.max(trucksByQuantity, trucksByValue, 1); // อย่างน้อย 1 คัน
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    alert('ฟีเจอร์ส่งออก PDF กำลังพัฒนา');
  };

  const handleSaveOrder = () => {
    const orderData = {
      orderNumber,
      orderDate: new Date().toISOString(),
      items: orderItems,
      totalAmount: getTotalPrice(),
      locationGroups: Object.keys(locationGroups)
    };
    
    // บันทึกลง localStorage
    const savedOrders = localStorage.getItem('plantOrders');
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    orders.unshift(orderData);
    localStorage.setItem('plantOrders', JSON.stringify(orders));
    
    setIsSaved(true);
    alert('บันทึกรายการสั่งซื้อเรียบร้อยแล้ว');
  };

  if (selectedPlants.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-green-800 mb-4">
          ไม่มีรายการสั่งซื้อ
        </h2>
        <p className="text-green-600 mb-6">
          กรุณาเลือกต้นไม้และยืนยันรายการจากหน้า Purchase Order ก่อน
        </p>
        <a
          href="/purchase-order"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไป Purchase Order
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
            สรุปคำสั่งซื้อ
          </h1>
          <p className="text-green-600">
            หมายเลขคำสั่งซื้อ: {orderNumber}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>พิมพ์</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
          <a
            href="/purchase-order"
            className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับ</span>
          </a>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-lg font-bold text-green-800">{orderNumber}</div>
            <div className="text-sm text-green-600">หมายเลขคำสั่งซื้อ</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-800">
              {new Date().toLocaleDateString('th-TH')}
            </div>
            <div className="text-sm text-blue-600">วันที่สั่งซื้อ</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-orange-800">
              {Object.keys(locationGroups).length}
            </div>
            <div className="text-sm text-orange-600">ที่ตั้งที่ต้องไป</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-purple-800">
              ฿{getTotalPrice().toLocaleString()}
            </div>
            <div className="text-sm text-purple-600">ราคารวม</div>
          </div>
        </div>
      </div>

      {/* Location Groups */}
      <div className="space-y-6">
        {Object.entries(locationGroups).map(([location, items]) => (
          <div key={location} className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-800">
                  {location}
                </h3>
                <p className="text-blue-600">
                  {items.length} รายการ | ราคารวม: ฿{items.reduce((sum, item) => sum + ((item.selectedSupplier?.price || 0) * item.quantity), 0).toLocaleString()}
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
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          ยืนยันแล้ว
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {item.plant.scientificName}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-gray-800">
                            {item.selectedSupplier?.name || 'ไม่มีผู้จัดจำหน่าย'}
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
                        <a
                          href={`tel:${item.selectedSupplier?.phone || ''}`}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          <span>โทร</span>
                        </a>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          จำนวน
                        </label>
                        <div className="px-3 py-2 bg-white rounded-lg border">
                          {item.quantity} ต้น
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ราคาต่อต้น
                        </label>
                        <div className="px-3 py-2 bg-white rounded-lg border">
                          ฿{item.selectedSupplier?.price.toLocaleString() || '0'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ราคารวม
                        </label>
                        <div className="px-3 py-2 bg-white rounded-lg border font-semibold text-green-600">
                          ฿{((item.selectedSupplier?.price || 0) * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {item.notes && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          หมายเหตุ
                        </label>
                        <div className="px-3 py-2 bg-white rounded-lg border text-sm">
                          {item.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Route Optimization Section */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Route className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-800">
              🗺️ วางแผนการเดินทาง
            </h3>
            <p className="text-blue-600 text-sm">
              คำนวณเส้นทางที่เหมาะสมสำหรับการไปรับของ
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Destination Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ปลายทาง (Destination):
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="เช่น กรุงเทพมหานคร, นครปฐม"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleOptimizeRoute}
                disabled={isOptimizing || !destination.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>กำลังคำนวณ...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4" />
                    <span>คำนวณเส้นทาง</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Route Result */}
          {routeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-700">{routeError}</div>
            </div>
          )}

          {routeResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <Navigation className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">
                    {routeResult.totalDistance.toFixed(1)} กม.
                  </div>
                  <div className="text-sm text-blue-700">ระยะทางรวม</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 text-center">
                  <Clock className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">
                    {routeResult.totalTime} ชม.
                  </div>
                  <div className="text-sm text-green-700">เวลาโดยประมาณ</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 text-center">
                  <DollarSign className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">
                    ฿{routeResult.totalCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-700">ค่าน้ำมัน</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 text-center">
                  <Truck className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-900">
                    {calculateTrucksNeeded() || 1} คัน
                  </div>
                  <div className="text-sm text-orange-700">จำนวนรถที่ต้องใช้</div>
                </div>
              </div>

              {/* Route Steps */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">🗺️ เส้นทางที่แนะนำ:</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        0
                      </div>
                      <span className="font-medium text-gray-800">เริ่มต้น: {destination}</span>
                    </div>
                  </div>
                  
                  {routeResult.optimizedRoute && routeResult.optimizedRoute.length > 0 ? (
                    routeResult.optimizedRoute.map((step: any, index: number) => {
                      // หา supplier ที่ตรงกับ location
                      const location = step.supplierName || step.location || step.address;
                      const supplierItems = locationGroups[location] || [];
                      const firstSupplier = supplierItems[0]?.selectedSupplier;
                      
                      return (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{location}</div>
                                {firstSupplier && (
                                  <>
                                    <div className="text-sm text-gray-600">{firstSupplier.name}</div>
                                    {firstSupplier.phone && (
                                      <div className="text-xs text-gray-500">📞 {firstSupplier.phone}</div>
                                    )}
                                  </>
                                )}
                                <div className="text-xs text-green-600 mt-1">
                                  {supplierItems.length} รายการ | ฿{supplierItems.reduce((sum: number, item: OrderItem) => 
                                    sum + ((item.selectedSupplier?.price || 0) * item.quantity), 0
                                  ).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            {step.distance_to_next !== undefined && step.distance_to_next > 0 && (
                              <div className="text-sm text-gray-600">
                                → {step.distance_to_next.toFixed(1)} กม.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      ไม่พบข้อมูลเส้นทาง
                    </div>
                  )}
                  
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                      <span className="font-medium text-gray-800">กลับไปที่: {destination}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps Link */}
              {routeResult.mapUrl && (
                <div>
                  <a
                    href={routeResult.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>เปิดใน Google Maps</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              {/* Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">📊 สรุปค่าใช้จ่ายการขนส่ง:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-yellow-700">ค่าน้ำมัน:</span>
                    <span className="ml-2 font-semibold text-yellow-900">
                      ฿{routeResult.totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-yellow-700">จำนวนรถ:</span>
                    <span className="ml-2 font-semibold text-yellow-900">
                      {calculateTrucksNeeded() || 1} คัน
                    </span>
                  </div>
                  <div>
                    <span className="text-yellow-700">ระยะทางรวม:</span>
                    <span className="ml-2 font-semibold text-yellow-900">
                      {routeResult.totalDistance.toFixed(1)} กม.
                    </span>
                  </div>
                  <div>
                    <span className="text-yellow-700">เวลาโดยประมาณ:</span>
                    <span className="ml-2 font-semibold text-yellow-900">
                      {routeResult.totalTime} ชั่วโมง
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Final Summary */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-semibold text-green-800">
            สรุปคำสั่งซื้อ
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">รายการสินค้า:</h4>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.plant.id} className="flex justify-between text-sm">
                  <span>{item.plant.name} x{item.quantity}</span>
                  <span>฿{((item.selectedSupplier?.price || 0) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">ที่ตั้งที่ต้องไป:</h4>
            <div className="space-y-2">
              {Object.entries(locationGroups).map(([location, items]) => (
                <div key={location} className="flex justify-between text-sm">
                  <span>{location}</span>
                  <span>{items.length} รายการ</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-green-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium text-gray-700">
              ราคารวมทั้งหมด: ฿{getTotalPrice().toLocaleString()}
            </div>
            {!isSaved ? (
              <button 
                onClick={handleSaveOrder}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                บันทึกรายการสั่งซื้อ
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/order-history')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <History className="h-4 w-4 inline mr-2" />
                  ดูประวัติคำสั่งซื้อ
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  สร้างคำสั่งซื้อใหม่
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
