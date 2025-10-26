import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Search, FileText, Calculator, History, Store, Link, FolderOpen, Camera, BarChart3, TrendingUp, MapPin, PieChart, Menu, X, Database } from 'lucide-react';
import SearchPage from './pages/SearchPage';
import PurchaseOrderPage from './pages/PurchaseOrderPage';
import OrderSummaryPage from './pages/OrderSummaryPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import BillProcessingPage from './pages/BillProcessingPage';
import BillListPage from './pages/BillListPage';
import AddPlantPage from './pages/AddPlantPage';
import BulkImportPage from './pages/BulkImportPage';
import AddSupplierPage from './pages/AddSupplierPage';
import AddPlantSupplierPage from './pages/AddPlantSupplierPage';
import ProjectPage from './pages/ProjectPage';
import BillScannerPage from './pages/BillScannerPage';
import DashboardPage from './pages/DashboardPage';
import PriceAnalysisPage from './pages/PriceAnalysisPage';
import RouteOptimizationPage from './pages/RouteOptimizationPage';
import CostAnalysisPage from './pages/CostAnalysisPage';
import SupplierListPage from './pages/SupplierListPage';
import DatabaseManagementPage from './pages/DatabaseManagementPage';
import { initializeBasePlants } from './data/basePlants';
import './utils/testDataManager'; // Load test data manager
import './App.css';

function App() {
  const [selectedPlants, setSelectedPlants] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // เริ่มต้นข้อมูลพื้นฐานเมื่อแอปเริ่มทำงาน
  useEffect(() => {
    initializeBasePlants();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-green-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Search className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-green-800">Plant Price System</h1>
                  <p className="text-xs text-green-600 hidden sm:block">ระบบจัดการราคาต้นไม้</p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                <a href="/dashboard" className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span>หน้าหลัก</span>
                </a>
                <a href="/" className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                  <Search className="h-4 w-4" />
                  <span>ค้นหา</span>
                </a>
                <a href="/project" className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                  <FolderOpen className="h-4 w-4" />
                  <span>โปรเจกต์</span>
                </a>
                <a href="/add-plant" className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                  <Calculator className="h-4 w-4" />
                  <span>เพิ่มต้นไม้</span>
                </a>
                <a href="/suppliers" className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                  <Store className="h-4 w-4" />
                  <span>ร้านค้า</span>
                </a>
                <a href="/price-analysis" className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                  <TrendingUp className="h-4 w-4" />
                  <span>วิเคราะห์</span>
                </a>
                <a href="/bill-scanner" className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                  <Camera className="h-4 w-4" />
                  <span>สแกนบิล</span>
                </a>
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="lg:hidden mt-4 pb-4 border-t border-green-200">
                <nav className="grid grid-cols-2 gap-2 mt-4">
                  <a href="/dashboard" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <BarChart3 className="h-4 w-4" />
                    <span>หน้าหลัก</span>
                  </a>
                  <a href="/" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <Search className="h-4 w-4" />
                    <span>ค้นหา</span>
                  </a>
                  <a href="/project" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <FolderOpen className="h-4 w-4" />
                    <span>โปรเจกต์</span>
                  </a>
                  <a href="/add-plant" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <Calculator className="h-4 w-4" />
                    <span>เพิ่มต้นไม้</span>
                  </a>
                  <a href="/add-supplier" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <Store className="h-4 w-4" />
                    <span>เพิ่มร้านค้า</span>
                  </a>
                  <a href="/add-plant-supplier" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <Link className="h-4 w-4" />
                    <span>เชื่อมต่อ</span>
                  </a>
                  <a href="/price-analysis" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <TrendingUp className="h-4 w-4" />
                    <span>วิเคราะห์ราคา</span>
                  </a>
                  <a href="/route-optimization" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <MapPin className="h-4 w-4" />
                    <span>วางแผนเส้นทาง</span>
                  </a>
                  <a href="/cost-analysis" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <PieChart className="h-4 w-4" />
                    <span>วิเคราะห์ต้นทุน</span>
                  </a>
                  <a href="/bulk-import" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <FileText className="h-4 w-4" />
                    <span>นำเข้าข้อมูล</span>
                  </a>
                  <a href="/bill-scanner" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <Camera className="h-4 w-4" />
                    <span>สแกนใบเสร็จ</span>
                  </a>
                  <a href="/bill-processing" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <FileText className="h-4 w-4" />
                    <span>ประมวลผลบิล</span>
                  </a>
                  <a href="/order-history" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <History className="h-4 w-4" />
                    <span>ประวัติคำสั่งซื้อ</span>
                  </a>
                  <a href="/bill-list" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <FileText className="h-4 w-4" />
                    <span>รายการบิล</span>
                  </a>
                  <a href="/database" className="flex items-center space-x-2 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <Database className="h-4 w-4" />
                    <span>จัดการฐานข้อมูล</span>
                  </a>
                </nav>
              </div>
            )}
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
            <Route 
              path="/add-plant" 
              element={<AddPlantPage />} 
            />
            <Route 
              path="/add-supplier" 
              element={<AddSupplierPage />} 
            />
            <Route 
              path="/add-plant-supplier" 
              element={<AddPlantSupplierPage />} 
            />
                <Route 
                  path="/bulk-import" 
                  element={<BulkImportPage />} 
                />
                <Route 
                  path="/project" 
                  element={<ProjectPage />} 
                />
                <Route 
                  path="/bill-scanner" 
                  element={<BillScannerPage />} 
                />
                <Route 
                  path="/dashboard" 
                  element={<DashboardPage />} 
                />
                <Route 
                  path="/price-analysis" 
                  element={<PriceAnalysisPage />} 
                />
                <Route 
                  path="/route-optimization" 
                  element={<RouteOptimizationPage />} 
                />
                <Route 
                  path="/cost-analysis" 
                  element={<CostAnalysisPage />} 
                />
                <Route 
                  path="/suppliers" 
                  element={<SupplierListPage />} 
                />
                <Route 
                  path="/database" 
                  element={<DatabaseManagementPage />} 
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
