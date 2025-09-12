import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Search, FileText, Calculator, History } from 'lucide-react';
import SearchPage from './pages/SearchPage';
import PurchaseOrderPage from './pages/PurchaseOrderPage';
import OrderSummaryPage from './pages/OrderSummaryPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import BillProcessingPage from './pages/BillProcessingPage';
import BillListPage from './pages/BillListPage';
import { initializeBasePlants } from './data/basePlants';
import './App.css';

function App() {
  const [selectedPlants, setSelectedPlants] = useState<any[]>([]);

  // เริ่มต้นข้อมูลพื้นฐานเมื่อแอปเริ่มทำงาน
  useEffect(() => {
    initializeBasePlants();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Search className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-green-800">Plant Price System</h1>
                  <p className="text-sm text-green-600">ระบบจัดการราคาต้นไม้ - สวนธุรกิจไทย</p>
                </div>
              </div>
              
              <nav className="flex items-center space-x-6">
                <a href="/" className="flex items-center space-x-2 text-green-700 hover:text-green-900 transition-colors">
                  <Search className="h-5 w-5" />
                  <span>ค้นหา</span>
                </a>
                <a href="/bill-processing" className="flex items-center space-x-2 text-green-700 hover:text-green-900 transition-colors">
                  <FileText className="h-5 w-5" />
                  <span>ประมวลผลใบเสร็จ</span>
                </a>
                <a href="/order-history" className="flex items-center space-x-2 text-green-700 hover:text-green-900 transition-colors">
                  <History className="h-5 w-5" />
                  <span>ประวัติคำสั่งซื้อ</span>
                </a>
                <a href="/bill-list" className="flex items-center space-x-2 text-green-700 hover:text-green-900 transition-colors">
                  <FileText className="h-5 w-5" />
                  <span>รายการบิล</span>
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <SearchPage 
                  selectedPlants={selectedPlants}
                  setSelectedPlants={setSelectedPlants}
                />
              } 
            />
            <Route 
              path="/purchase-order" 
              element={
                <PurchaseOrderPage 
                  selectedPlants={selectedPlants}
                  setSelectedPlants={setSelectedPlants}
                />
              } 
            />
            <Route 
              path="/order-summary" 
              element={
                <OrderSummaryPage 
                  selectedPlants={selectedPlants}
                  setSelectedPlants={setSelectedPlants}
                />
              } 
            />
            <Route 
              path="/order-history" 
              element={<OrderHistoryPage />} 
            />
            <Route 
              path="/bill-processing" 
              element={<BillProcessingPage />} 
            />
            <Route 
              path="/bill-list" 
              element={<BillListPage />} 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-green-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-green-600">
              <p>© 2024 Plant Price Management System - สวนธุรกิจไทย</p>
              <p className="mt-1">ระบบจัดการราคาต้นไม้ครบวงจร</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
