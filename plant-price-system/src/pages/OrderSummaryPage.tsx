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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">
            สรุปคำสั่งซื้อ
          </h1>
          <p className="text-sm sm:text-base text-green-600 break-words">
            หมายเลขคำสั่งซื้อ: {orderNumber}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
          >
            <Printer className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">พิมพ์</span>
            <span className="sm:hidden">พิมพ์</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
          >
            <Download className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <a
            href="/purchase-order"
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-green-600 hover:text-green-800 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" />
            <span>กลับ</span>
          </a>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="text-base sm:text-lg font-bold text-green-800 break-words text-xs sm:text-base">{orderNumber}</div>
            <div className="text-xs sm:text-sm text-green-600 mt-1">หมายเลขคำสั่งซื้อ</div>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="text-base sm:text-lg font-bold text-blue-800">
              {new Date().toLocaleDateString('th-TH')}
            </div>
            <div className="text-xs sm:text-sm text-blue-600 mt-1">วันที่สั่งซื้อ</div>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <div className="text-base sm:text-lg font-bold text-orange-800">
              {Object.keys(locationGroups).length}
            </div>
            <div className="text-xs sm:text-sm text-orange-600 mt-1">ที่ตั้งที่ต้องไป</div>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="text-base sm:text-lg font-bold text-purple-800">
              ฿{getTotalPrice().toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-purple-600 mt-1">ราคารวม</div>
          </div>
        </div>
      </div>

      {/* Location Groups */}
      <div className="space-y-4 sm:space-y-6">
        {Object.entries(locationGroups).map(([location, items]) => (
          <div key={location} className="bg-white rounded-xl shadow-sm border border-green-200 p-4 sm:p-6">
            <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-blue-800 break-words">
                  {location}
                </h3>
                <p className="text-sm sm:text-base text-blue-600 mt-1">
                  {items.length} รายการ | ราคารวม: ฿{items.reduce((sum, item) => sum + ((item.selectedSupplier?.price || 0) * item.quantity), 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div key={item.plant.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h4 className="text-base sm:text-lg font-semibold text-green-800 break-words">
                          {item.plant.name}
                        </h4>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full whitespace-nowrap">
                          {item.plant.category}
                        </span>
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1 whitespace-nowrap">
                          <CheckCircle className="h-3 w-3" />
                          ยืนยันแล้ว
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm break-words">
                        {item.plant.scientificName}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="space-y-3 mb-3 sm:mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Package className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="font-medium text-gray-800 text-sm sm:text-base break-words">
                            {item.selectedSupplier?.name || 'ไม่มีผู้จัดจำหน่าย'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-600 break-words">
                            {item.selectedSupplier?.location || 'ไม่ระบุที่ตั้ง'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <a
                          href={`tel:${item.selectedSupplier?.phone || ''}`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation w-full sm:w-auto"
                        >
                          <Phone className="h-4 w-4 sm:h-4 sm:w-4" />
                          <span>โทร</span>
                        </a>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          จำนวน
                        </label>
                        <div className="px-3 py-2 sm:py-2 bg-white rounded-lg border text-sm sm:text-base">
                          {item.quantity} ต้น
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          ราคาต่อต้น
                        </label>
                        <div className="px-3 py-2 sm:py-2 bg-white rounded-lg border text-sm sm:text-base">
                          ฿{item.selectedSupplier?.price.toLocaleString() || '0'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          ราคารวม
                        </label>
                        <div className="px-3 py-2 sm:py-2 bg-white rounded-lg border font-semibold text-green-600 text-sm sm:text-base">
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
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4 sm:p-6 mt-6 sm:mt-8">
        <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Route className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-800">
              🗺️ วางแผนการเดินทาง
            </h3>
            <p className="text-blue-600 text-xs sm:text-sm mt-1">
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
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="เช่น กรุงเทพมหานคร, นครปฐม"
                className="flex-1 px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base sm:text-base min-h-[44px] touch-manipulation"
              />
              <button
                onClick={handleOptimizeRoute}
                disabled={isOptimizing || !destination.trim()}
                className="px-6 py-3 sm:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
                  <Navigation className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-blue-900">
                    {routeResult.totalDistance.toFixed(1)} กม.
                  </div>
                  <div className="text-xs sm:text-sm text-blue-700 mt-1">ระยะทางรวม</div>
                </div>
                
                <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-green-900">
                    {routeResult.totalTime} ชม.
                  </div>
                  <div className="text-xs sm:text-sm text-green-700 mt-1">เวลาโดยประมาณ</div>
                </div>
                
                <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-purple-900">
                    ฿{routeResult.totalCost.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-purple-700 mt-1">ค่าน้ำมัน</div>
                </div>
                
                <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-orange-900">
                    {calculateTrucksNeeded() || 1} คัน
                  </div>
                  <div className="text-xs sm:text-sm text-orange-700 mt-1">จำนวนรถที่ต้องใช้</div>
                </div>
              </div>

              {/* Route Visualization */}
              {routeResult.optimizedRoute && routeResult.optimizedRoute.length > 0 && (
                <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-3 sm:mb-4 text-base sm:text-lg">📊 กราฟแสดงระยะทางระหว่างจุด:</h4>
                  
                  {/* Distance Bar Chart */}
                  <div className="mb-4 sm:mb-6">
                    <div className="space-y-3">
                      {routeResult.optimizedRoute.map((step: any, index: number) => {
                        const distance = step.distance_to_next || 0;
                        const distances = routeResult.optimizedRoute.map((s: any) => s.distance_to_next || 0);
                        const maxDistance = Math.max(...distances, 1);
                        const percentage = maxDistance > 0 && distance > 0 ? (distance / maxDistance) * 100 : 0;
                        const location = step.supplierName || step.location || step.address;
                        
                        return (
                          <div key={index} className="space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                              <span className="text-xs sm:text-sm text-gray-700 font-medium break-words">
                                {index === 0 ? `เริ่มต้น → จุดที่ ${index + 1}` : `จุดที่ ${index} → จุดที่ ${index + 1}`}
                              </span>
                              <span className="text-xs sm:text-sm text-blue-600 font-semibold whitespace-nowrap">{distance > 0 ? `${distance.toFixed(1)} กม.` : 'ถึงแล้ว'}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
                              {distance > 0 ? (
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 sm:h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                  style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '20px' : '0' }}
                                >
                                  <span className="text-[10px] sm:text-xs text-white font-medium">{distance.toFixed(1)}</span>
                                </div>
                              ) : (
                                <div className="h-3 sm:h-4 flex items-center justify-center">
                                  <span className="text-[10px] sm:text-xs text-gray-400">จุดสุดท้าย</span>
                                </div>
                              )}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 pl-1 break-words">{location}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Route Path Visualization */}
                  <div className="mb-4 sm:mb-6">
                    <h5 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">🗺️ เส้นทางเดินรถ:</h5>
                    <div className="relative bg-gray-50 rounded-lg p-3 sm:p-6 overflow-x-auto -mx-2 sm:mx-0">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-max px-2 sm:px-0">
                        {/* Start Point */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base">
                            0
                          </div>
                          <div className="mt-2 text-[10px] sm:text-xs text-center text-gray-600 max-w-[80px] sm:max-w-[100px] break-words">
                            {destination.length > 12 ? destination.substring(0, 12) + '...' : destination}
                          </div>
                        </div>
                        
                        {/* Route Steps */}
                        {routeResult.optimizedRoute.map((step: any, index: number) => {
                          const distance = step.distance_to_next || 0;
                          const location = step.supplierName || step.location || step.address;
                          const supplierItems = locationGroups[location] || [];
                          const totalValue = supplierItems.reduce((sum: number, item: OrderItem) => 
                            sum + ((item.selectedSupplier?.price || 0) * item.quantity), 0
                          );
                          const isLast = index === routeResult.optimizedRoute.length - 1;
                          
                          return (
                            <React.Fragment key={index}>
                              {/* Connection Line */}
                              {!isLast && (
                                <div className="flex flex-col items-center min-w-[60px] sm:min-w-[80px] flex-shrink-0">
                                  <div className="w-full h-0.5 sm:h-1 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full relative">
                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2">
                                      <div className="w-0 h-0 border-l-6 sm:border-l-8 border-l-blue-500 border-t-3 sm:border-t-4 border-t-transparent border-b-3 sm:border-b-4 border-b-transparent"></div>
                                    </div>
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1 text-center">
                                    {distance > 0 ? `${distance.toFixed(1)} กม.` : '-'}
                                  </div>
                                </div>
                              )}
                              
                              {/* Stop Point */}
                              <div className="flex flex-col items-center flex-shrink-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg relative group text-sm sm:text-base">
                                  {index + 1}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden sm:group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                                    <div className="font-semibold">{location}</div>
                                    <div className="text-yellow-300">฿{totalValue.toLocaleString()}</div>
                                  </div>
                                </div>
                                <div className="mt-2 text-[10px] sm:text-xs text-center text-gray-600 max-w-[80px] sm:max-w-[100px] break-words">
                                  {location.length > 12 ? location.substring(0, 12) + '...' : location}
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                        
                        {/* Return Line */}
                        <div className="flex flex-col items-center min-w-[60px] sm:min-w-[80px] flex-shrink-0">
                          <div className="w-full h-0.5 sm:h-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full relative">
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2">
                              <div className="w-0 h-0 border-l-6 sm:border-l-8 border-l-green-500 border-t-3 sm:border-t-4 border-t-transparent border-b-3 sm:border-b-4 border-b-transparent"></div>
                            </div>
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-1 text-center">
                            กลับ
                          </div>
                        </div>
                        
                        {/* End Point */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base">
                            ✓
                          </div>
                          <div className="mt-2 text-[10px] sm:text-xs text-center text-gray-600 max-w-[80px] sm:max-w-[100px] break-words">
                            {destination.length > 12 ? destination.substring(0, 12) + '...' : destination}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown Chart */}
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">💰 ค่าใช้จ่ายตามระยะทาง:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {routeResult.optimizedRoute.map((step: any, index: number) => {
                        const distance = step.distance_to_next || 0;
                        const cost = distance * 0.75; // ค่าน้ำมันต่อกม.
                        const isLast = index === routeResult.optimizedRoute.length - 1;
                        const costPercentage = routeResult.totalCost > 0 ? (cost / routeResult.totalCost) * 100 : 0;
                        
                        return (
                          <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-2">
                              <span className="text-xs sm:text-sm text-gray-600 break-words">
                                {index === 0 ? 'เริ่มต้น' : `จุดที่ ${index}`} → {isLast ? 'กลับ' : `จุดที่ ${index + 1}`}
                              </span>
                              <span className="text-xs sm:text-sm font-semibold text-purple-600 whitespace-nowrap">
                                {cost > 0 ? `฿${cost.toFixed(0)}` : 'ถึงแล้ว'}
                              </span>
                            </div>
                            {cost > 0 && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${costPercentage}%`, minWidth: costPercentage > 0 ? '4px' : '0' }}
                                ></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Route Steps */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 text-base sm:text-lg">🗺️ เส้นทางที่แนะนำ:</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        0
                      </div>
                      <span className="font-medium text-gray-800 text-sm sm:text-base break-words">เริ่มต้น: {destination}</span>
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
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-800 text-sm sm:text-base break-words">{location}</div>
                                {firstSupplier && (
                                  <>
                                    <div className="text-xs sm:text-sm text-gray-600 break-words mt-1">{firstSupplier.name}</div>
                                    {firstSupplier.phone && (
                                      <div className="text-xs text-gray-500 mt-1">📞 {firstSupplier.phone}</div>
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
                              <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap ml-9 sm:ml-0">
                                → {step.distance_to_next.toFixed(1)} กม.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm sm:text-base">
                      ไม่พบข้อมูลเส้นทาง
                    </div>
                  )}
                  
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        ✓
                      </div>
                      <span className="font-medium text-gray-800 text-sm sm:text-base break-words">กลับไปที่: {destination}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps Link */}
              {routeResult.mapUrl && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-3 text-base sm:text-lg">🗺️ แผนที่เส้นทาง:</h4>
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 mb-4">
                    <div className="text-center text-gray-600 mb-4">
                      <MapPin className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 text-blue-500" />
                      <p className="text-xs sm:text-sm">คลิกที่ปุ่มด้านล่างเพื่อเปิดแผนที่เส้นทางใน Google Maps</p>
                    </div>
                    <a
                      href={routeResult.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors w-full sm:w-auto sm:mx-auto min-h-[44px] touch-manipulation text-sm sm:text-base"
                    >
                      <MapPin className="h-5 w-5" />
                      <span>เปิดใน Google Maps</span>
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-3 text-sm sm:text-base">📊 สรุปค่าใช้จ่ายการขนส่ง:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                    <span className="text-yellow-700">ค่าน้ำมัน:</span>
                    <span className="sm:ml-2 font-semibold text-yellow-900">
                      ฿{routeResult.totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                    <span className="text-yellow-700">จำนวนรถ:</span>
                    <span className="sm:ml-2 font-semibold text-yellow-900">
                      {calculateTrucksNeeded() || 1} คัน
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                    <span className="text-yellow-700">ระยะทางรวม:</span>
                    <span className="sm:ml-2 font-semibold text-yellow-900">
                      {routeResult.totalDistance.toFixed(1)} กม.
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                    <span className="text-yellow-700">เวลาโดยประมาณ:</span>
                    <span className="sm:ml-2 font-semibold text-yellow-900">
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
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 mt-6 sm:mt-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
          <h3 className="text-lg sm:text-xl font-semibold text-green-800">
            สรุปคำสั่งซื้อ
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">รายการสินค้า:</h4>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.plant.id} className="flex justify-between text-xs sm:text-sm">
                  <span className="break-words flex-1 mr-2">{item.plant.name} x{item.quantity}</span>
                  <span className="whitespace-nowrap">฿{((item.selectedSupplier?.price || 0) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">ที่ตั้งที่ต้องไป:</h4>
            <div className="space-y-2">
              {Object.entries(locationGroups).map(([location, items]) => (
                <div key={location} className="flex justify-between text-xs sm:text-sm">
                  <span className="break-words flex-1 mr-2">{location}</span>
                  <span className="whitespace-nowrap">{items.length} รายการ</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-green-200 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-base sm:text-lg font-medium text-gray-700 text-center sm:text-left">
              ราคารวมทั้งหมด: ฿{getTotalPrice().toLocaleString()}
            </div>
            {!isSaved ? (
              <button 
                onClick={handleSaveOrder}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors w-full sm:w-auto min-h-[44px] touch-manipulation text-sm sm:text-base"
              >
                บันทึกรายการสั่งซื้อ
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button 
                  onClick={() => navigate('/order-history')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto min-h-[44px] touch-manipulation text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <History className="h-4 w-4" />
                  <span>ดูประวัติคำสั่งซื้อ</span>
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors w-full sm:w-auto min-h-[44px] touch-manipulation text-sm sm:text-base"
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
