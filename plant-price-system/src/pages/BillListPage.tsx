import React, { useState, useEffect } from 'react';
import { FileText, Eye, Trash2, Plus, Calendar, Package, DollarSign } from 'lucide-react';
import { BillData } from '../types';

const BillListPage: React.FC = () => {
  const [bills, setBills] = useState<BillData[]>([]);
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Load bills from localStorage on component mount
  useEffect(() => {
    const savedBills = localStorage.getItem('plantBills');
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    }
  }, []);

  // Save bills to localStorage whenever bills change
  useEffect(() => {
    localStorage.setItem('plantBills', JSON.stringify(bills));
  }, [bills]);

  const deleteBill = (index: number) => {
    if (window.confirm('คุณต้องการลบบิลนี้หรือไม่?')) {
      const newBills = bills.filter((_, i) => i !== index);
      setBills(newBills);
    }
  };

  const viewBillDetail = (bill: BillData) => {
    setSelectedBill(bill);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedBill(null);
  };

  const getTotalItems = (bill: BillData) => {
    return bill.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-100';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            รายการบิลทั้งหมด
          </h1>
          <p className="text-green-600">
            จัดการบิลที่เพิ่มเข้าไปในระบบ
          </p>
        </div>
        <a
          href="/bill-processing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>เพิ่มบิลใหม่</span>
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-800">{bills.length}</div>
          <div className="text-sm text-green-600">บิลทั้งหมด</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-800">
            {bills.reduce((total, bill) => total + getTotalItems(bill), 0)}
          </div>
          <div className="text-sm text-blue-600">รายการสินค้า</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-800">
            ฿{bills.reduce((total, bill) => total + bill.totalAmount, 0).toLocaleString()}
          </div>
          <div className="text-sm text-purple-600">มูลค่ารวม</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-800">
            {bills.length > 0 ? new Date(bills[0].date).toLocaleDateString('th-TH') : '-'}
          </div>
          <div className="text-sm text-orange-600">บิลล่าสุด</div>
        </div>
      </div>

      {/* Bills List */}
      {bills.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-12 text-center">
          <FileText className="h-16 w-16 text-green-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            ยังไม่มีบิลในระบบ
          </h3>
          <p className="text-green-600 mb-6">
            เริ่มต้นโดยการเพิ่มบิลใหม่จากผู้จัดจำหน่าย
          </p>
          <a
            href="/bill-processing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>เพิ่มบิลแรก</span>
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bills.map((bill, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xl font-semibold text-green-800">
                      {bill.supplierInfo.name}
                    </h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {bill.supplierInfo.province}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {getTotalItems(bill)} รายการ
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        เบอร์โทร: {bill.supplierInfo.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        ราคารวม: ฿{bill.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        วันที่: {new Date(bill.date).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-700 mb-2">รายการสินค้า:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {bill.items.slice(0, 4).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between text-sm">
                          <span className="text-gray-800">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">x{item.quantity}</span>
                            <span className="font-medium text-green-600">฿{item.price.toLocaleString()}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(item.confidenceScore)}`}>
                              {(item.confidenceScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                      {bill.items.length > 4 && (
                        <div className="text-sm text-gray-500 italic">
                          และอีก {bill.items.length - 4} รายการ...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-6">
                  <button
                    onClick={() => viewBillDetail(bill)}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>ดูรายละเอียด</span>
                  </button>
                  <button
                    onClick={() => deleteBill(index)}
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

      {/* Bill Detail Modal */}
      {showDetail && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-green-800">
                  รายละเอียดบิล - {selectedBill.supplierInfo.name}
                </h2>
                <button
                  onClick={closeDetail}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Supplier Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-700 mb-3">ข้อมูลผู้จัดจำหน่าย:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">ชื่อร้าน:</span>
                    <div className="font-medium">{selectedBill.supplierInfo.name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">เบอร์โทร:</span>
                    <div className="font-medium">{selectedBill.supplierInfo.phone}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">จังหวัด:</span>
                    <div className="font-medium">{selectedBill.supplierInfo.province}</div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">รายการสินค้า:</h3>
                <div className="space-y-3">
                  {selectedBill.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          จำนวน: {item.quantity} | ราคา: ฿{item.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-green-600">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(item.confidenceScore)}`}>
                          {(item.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-medium text-gray-700">
                    ราคารวมทั้งหมด: ฿{selectedBill.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    วันที่: {new Date(selectedBill.date).toLocaleDateString('th-TH')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillListPage;
