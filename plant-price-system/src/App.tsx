import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Search, FolderOpen, Camera, BarChart3, Menu, X, Bot, Lock, Database } from 'lucide-react';
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
import GardenAnalysisPage from './pages/GardenAnalysisPage';
// import PriceAnalysisPage from './pages/PriceAnalysisPage';
// import RouteOptimizationPage from './pages/RouteOptimizationPage';
// import CostAnalysisPage from './pages/CostAnalysisPage';
import SupplierListPage from './pages/SupplierListPage';
import DatabaseManagementPage from './pages/DatabaseManagementPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AiAgentPage from './pages/AiAgentPage';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { initializeBasePlants } from './data/basePlants';
import './utils/testDataManager'; // Load test data manager
import './App.css';

function AppContent() {
  const [selectedPlants, setSelectedPlants] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin } = useAdmin();

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
                <a href="/search" className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                  <Search className="h-4 w-4" />
                  <span>ค้นหา</span>
                </a>
                <a href="/project" className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                  <FolderOpen className="h-4 w-4" />
                  <span>โปรเจกต์</span>
                </a>
                {isAdmin ? (
                  <>
                    <a href="/database" className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                      <Database className="h-4 w-4" />
                      <span>จัดการฐานข้อมูล</span>
                    </a>
                    <a href="/ai-agent" className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                      <Bot className="h-4 w-4" />
                      <span>AI Agent</span>
                    </a>
                  </>
                ) : (
                  <a href="/admin-login" className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                    <Lock className="h-4 w-4" />
                    <span>Admin</span>
                  </a>
                )}
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Mobile Navigation - Simplified (Hide complex features) */}
            {isMobileMenuOpen && (
              <div className="lg:hidden mt-4 pb-4 border-t border-green-200 max-h-[70vh] overflow-y-auto">
                <nav className="grid grid-cols-2 gap-3 mt-4 px-2">
                  <a href="/dashboard" className="flex flex-col items-center justify-center space-y-1 px-4 py-4 text-sm text-green-700 active:text-green-900 active:bg-green-50 rounded-xl transition-colors touch-manipulation" style={{ minHeight: '80px' }}>
                    <BarChart3 className="h-6 w-6" />
                    <span className="font-medium">หน้าหลัก</span>
                  </a>
                  <a href="/search" className="flex flex-col items-center justify-center space-y-1 px-4 py-4 text-sm text-green-700 active:text-green-900 active:bg-green-50 rounded-xl transition-colors touch-manipulation" style={{ minHeight: '80px' }}>
                    <Search className="h-6 w-6" />
                    <span className="font-medium">ค้นหา</span>
                  </a>
                  {isAdmin ? (
                    <>
                      <a href="/database" className="flex flex-col items-center justify-center space-y-1 px-4 py-4 text-sm text-green-700 active:text-green-900 active:bg-green-50 rounded-xl transition-colors touch-manipulation" style={{ minHeight: '80px' }}>
                        <Database className="h-6 w-6" />
                        <span className="font-medium">ฐานข้อมูล</span>
                      </a>
                      <a href="/ai-agent" className="flex flex-col items-center justify-center space-y-1 px-4 py-4 text-sm text-green-700 active:text-green-900 active:bg-green-50 rounded-xl transition-colors touch-manipulation" style={{ minHeight: '80px' }}>
                        <Bot className="h-6 w-6" />
                        <span className="font-medium">AI Agent</span>
                      </a>
                    </>
                  ) : (
                    <a href="/admin-login" className="flex flex-col items-center justify-center space-y-1 px-4 py-4 text-sm text-gray-600 active:text-gray-900 active:bg-gray-50 rounded-xl transition-colors touch-manipulation" style={{ minHeight: '80px' }}>
                      <Lock className="h-6 w-6" />
                      <span className="font-medium">Admin</span>
                    </a>
                  )}
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
              element={<Navigate to="/dashboard" replace />}
            />
            <Route 
              path="/search" 
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
                  path="/garden-analysis" 
                  element={<GardenAnalysisPage />} 
                />
                {/* Temporarily hidden - not in use yet
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
                */}
                <Route 
                  path="/suppliers" 
                  element={<SupplierListPage />} 
                />
                <Route 
                  path="/database" 
                  element={<DatabaseManagementPage />} 
                />
                <Route 
                  path="/admin-login" 
                  element={<AdminLoginPage />} 
                />
                <Route 
                  path="/ai-agent" 
                  element={<AiAgentPage />} 
                />
          </Routes>
        </main>

        {/* Bottom Navigation - Mobile Only (Simplified) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-green-200 shadow-lg z-50">
          <div className="grid grid-cols-3 h-16">
            <a href="/dashboard" className="flex flex-col items-center justify-center space-y-1 text-green-700 active:text-green-900 active:bg-green-50 transition-colors touch-manipulation">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs font-medium">หน้าหลัก</span>
            </a>
            <a href="/search" className="flex flex-col items-center justify-center space-y-1 text-green-700 active:text-green-900 active:bg-green-50 transition-colors touch-manipulation">
              <Search className="h-5 w-5" />
              <span className="text-xs font-medium">ค้นหา</span>
            </a>
            <a href="/bill-scanner" className="flex flex-col items-center justify-center space-y-1 text-green-700 active:text-green-900 active:bg-green-50 transition-colors touch-manipulation">
              <Camera className="h-6 w-6" />
              <span className="text-xs font-medium">สแกนบิล</span>
            </a>
          </div>
        </nav>

        {/* Footer - Hidden on Mobile */}
        <footer className="hidden lg:block bg-white border-t border-green-200 mt-auto">
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

function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  );
}

export default App;
