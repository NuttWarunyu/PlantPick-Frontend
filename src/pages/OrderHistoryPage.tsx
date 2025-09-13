import React, { useState, useEffect } from 'react';
import { FileText, Eye, Calendar, MapPin, Package, DollarSign, Trash2, Plus } from 'lucide-react';

interface OrderData {
  orderNumber: string;
  orderDate: string;
  items: any[];
  totalAmount: number;
  locationGroups: string[];
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);

  // Load orders from localStorage on component mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('plantOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const deleteOrder = (orderNumber: string) => {
    if (window.confirm('คุณต้องการลบรายการสั่งซื้อนี้หรือไม่?')) {
      const newOrders = orders.filter(order => order.orderNumber !== orderNumber);
      setOrders(newOrders);
      localStorage.setItem('plantOrders', JSON.stringify(newOrders));
    }
  };

  const viewOrderDetail = (order: OrderData) => {
    // TODO: Implement order detail view
    alert(`ดูรายละเอียดคำสั่งซื้อ: ${order.orderNumber}`);
  };

  const getTotalItems = (order: OrderData) => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            ประวัติคำสั่งซื้อ
          </h1>
          <p className="text-green-600">
            รายการสั่งซื้อที่บันทึกไว้ทั้งหมด
          </p>
        </div>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>สร้างคำสั่งซื้อใหม่</span>
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-800">{orders.length}</div>
          <div className="text-sm text-green-600">คำสั่งซื้อทั้งหมด</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-800">
            {orders.reduce((total, order) => total + getTotalItems(order), 0)}
          </div>
          <div className="text-sm text-blue-600">รายการสินค้า</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-800">
            ฿{orders.reduce((total, order) => total + order.totalAmount, 0).toLocaleString()}
          </div>
          <div className="text-sm text-purple-600">มูลค่ารวม</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-800">
            {orders.length > 0 ? new Date(orders[0].orderDate).toLocaleDateString('th-TH') : '-'}
          </div>
          <div className="text-sm text-orange-600">คำสั่งซื้อล่าสุด</div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-12 text-center">
          <FileText className="h-16 w-16 text-green-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            ยังไม่มีคำสั่งซื้อ
          </h3>
          <p className="text-green-600 mb-6">
            เริ่มต้นโดยการสร้างคำสั่งซื้อใหม่
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>สร้างคำสั่งซื้อแรก</span>
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderNumber}
              className="bg-white rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xl font-semibold text-green-800">
                      {order.orderNumber}
                    </h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {getTotalItems(order)} รายการ
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {order.locationGroups.length} ที่ตั้ง
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        วันที่: {new Date(order.orderDate).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        ราคารวม: ฿{order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        ที่ตั้ง: {order.locationGroups.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-700 mb-2">รายการสินค้า:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {order.items.slice(0, 4).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between text-sm">
                          <span className="text-gray-800">{item.plant.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">x{item.quantity}</span>
                            <span className="font-medium text-green-600">฿{item.selectedSupplier.price.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="text-sm text-gray-500 italic">
                          และอีก {order.items.length - 4} รายการ...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-6">
                  <button
                    onClick={() => viewOrderDetail(order)}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>ดูรายละเอียด</span>
                  </button>
                  <button
                    onClick={() => deleteOrder(order.orderNumber)}
                    className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>ลบ</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
