// 🗄️ Database Management Page - หน้าจัดการฐานข้อมูล
// ระบบจัดการข้อมูลแบบครบวงจร

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Upload, 
  Download, 
  Trash2, 
  RefreshCw, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  HardDrive,
  Settings,
  BarChart3,
  Save,
  RotateCcw
} from 'lucide-react';
import { databaseService, DatabaseStats, BulkUpdateResult, ImportResult, BackupData } from '../services/databaseService';
import { testDataManager } from '../utils/testDataManager';

const DatabaseManagementPage: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState('');

  useEffect(() => {
    loadStats();
    loadBackups();
  }, []);

  const loadStats = () => {
    const databaseStats = databaseService.getDatabaseStats();
    setStats(databaseStats);
  };

  const loadBackups = () => {
    const backupList = databaseService.getBackups();
    setBackups(backupList);
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // 📊 สถิติฐานข้อมูล
  const handleRefreshStats = () => {
    loadStats();
    showMessage('info', 'อัปเดตสถิติแล้ว');
  };

  // 💾 Backup Operations
  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const success = databaseService.createBackup();
      if (success) {
        showMessage('success', 'สร้าง Backup สำเร็จ');
        loadBackups();
      } else {
        showMessage('error', 'สร้าง Backup ล้มเหลว');
      }
    } catch (error) {
      showMessage('error', `เกิดข้อผิดพลาด: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (backup: BackupData) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะกู้คืนข้อมูลจาก ${new Date(backup.timestamp).toLocaleString()}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const success = databaseService.restoreBackup(backup);
      if (success) {
        showMessage('success', 'กู้คืนข้อมูลสำเร็จ');
        loadStats();
        loadBackups();
      } else {
        showMessage('error', 'กู้คืนข้อมูลล้มเหลว');
      }
    } catch (error) {
      showMessage('error', `เกิดข้อผิดพลาด: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 📥 Export Data
  const handleExportData = () => {
    try {
      const data = databaseService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plant-database-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage('success', 'ส่งออกข้อมูลสำเร็จ');
    } catch (error) {
      showMessage('error', `ส่งออกข้อมูลล้มเหลว: ${error}`);
    }
  };

  // 📤 Import Data
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportData = async () => {
    if (!selectedFile) {
      showMessage('error', 'กรุณาเลือกไฟล์');
      return;
    }

    setIsLoading(true);
    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text);
      const result: ImportResult = databaseService.importData(data);
      
      if (result.success > 0) {
        showMessage('success', `นำเข้าข้อมูลสำเร็จ ${result.success} รายการ`);
        loadStats();
        loadBackups();
      } else {
        showMessage('error', `นำเข้าข้อมูลล้มเหลว: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      showMessage('error', `ไฟล์ไม่ถูกต้อง: ${error}`);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
    }
  };

  // 🔄 Bulk Update
  const handleBulkUpdate = async () => {
    if (!bulkUpdateData.trim()) {
      showMessage('error', 'กรุณาใส่ข้อมูล');
      return;
    }

    setIsLoading(true);
    try {
      const updates = JSON.parse(bulkUpdateData);
      const result: BulkUpdateResult = databaseService.bulkUpdatePrices(updates);
      
      if (result.success > 0) {
        showMessage('success', `อัปเดตราคา ${result.success} รายการสำเร็จ`);
        loadStats();
      }
      
      if (result.failed > 0) {
        showMessage('error', `ล้มเหลว ${result.failed} รายการ: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      showMessage('error', `ข้อมูลไม่ถูกต้อง: ${error}`);
    } finally {
      setIsLoading(false);
      setBulkUpdateData('');
      setShowBulkUpdate(false);
    }
  };

  // 🧹 Maintenance
  const handleOptimizeDatabase = async () => {
    setIsLoading(true);
    try {
      const success = databaseService.optimizeDatabase();
      if (success) {
        showMessage('success', 'ปรับปรุงฐานข้อมูลสำเร็จ');
        loadStats();
      } else {
        showMessage('error', 'ปรับปรุงฐานข้อมูลล้มเหลว');
      }
    } catch (error) {
      showMessage('error', `เกิดข้อผิดพลาด: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้!')) {
      return;
    }

    setIsLoading(true);
    try {
      const success = databaseService.clearAllData();
      if (success) {
        showMessage('success', 'ลบข้อมูลทั้งหมดสำเร็จ');
        loadStats();
        loadBackups();
      } else {
        showMessage('error', 'ลบข้อมูลล้มเหลว');
      }
    } catch (error) {
      showMessage('error', `เกิดข้อผิดพลาด: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 🧪 Test Functions
  const handleCreateTestData = () => {
    testDataManager.createBasicTestData();
    showMessage('success', 'สร้างข้อมูลทดสอบพื้นฐานสำเร็จ');
    loadStats();
  };

  const handleCreateBulkTestData = () => {
    testDataManager.createBulkTestData();
    showMessage('success', 'สร้างข้อมูลทดสอบจำนวนมากสำเร็จ');
    loadStats();
  };

  const handleCreateBulkUpdateData = () => {
    const bulkData = testDataManager.createBulkUpdateTestData();
    setBulkUpdateData(bulkData);
    setShowBulkUpdate(true);
    showMessage('info', 'สร้างข้อมูล Bulk Update สำเร็จ');
  };

  const handleCreateImportFile = () => {
    testDataManager.createImportTestFile();
    showMessage('success', 'สร้างไฟล์ทดสอบ Import สำเร็จ');
  };

  const handleRunAllTests = () => {
    testDataManager.runAllTests();
    showMessage('success', 'รันการทดสอบทั้งหมดสำเร็จ');
    loadStats();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Database className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">จัดการฐานข้อมูล</h1>
            <p className="text-gray-600">ระบบจัดการข้อมูลต้นไม้และผู้จัดจำหน่าย</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
             message.type === 'error' ? <XCircle className="h-5 w-5" /> :
             <AlertTriangle className="h-5 w-5" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ต้นไม้ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPlants}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ผู้จัดจำหน่าย</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">การเชื่อมต่อ</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConnections}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ขนาดข้อมูล</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.dataSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Backup & Restore */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Save className="h-5 w-5 text-blue-600" />
              <span>Backup & Restore</span>
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex space-x-3">
              <button
                onClick={handleCreateBackup}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>สร้าง Backup</span>
              </button>
              <button
                onClick={handleExportData}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>

            {/* Backup List */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Backup ที่มีอยู่:</h3>
              {backups.length === 0 ? (
                <p className="text-gray-500 text-sm">ไม่มี Backup</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {backups.slice().reverse().map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(backup.timestamp).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {backup.metadata.totalRecords} รายการ
                        </p>
                      </div>
                      <button
                        onClick={() => handleRestoreBackup(backup)}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center space-x-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span className="text-sm">กู้คืน</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Import Data */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Upload className="h-5 w-5 text-green-600" />
              <span>Import ข้อมูล</span>
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกไฟล์ JSON
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {selectedFile && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ไฟล์ที่เลือก: {selectedFile.name}
                </p>
                <p className="text-xs text-green-600">
                  ขนาด: {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <button
              onClick={handleImportData}
              disabled={!selectedFile || isLoading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import ข้อมูล</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Update */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-purple-600" />
            <span>Bulk Update ราคา</span>
          </h2>
        </div>
        <div className="p-6">
          {!showBulkUpdate ? (
            <button
              onClick={() => setShowBulkUpdate(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>เปิด Bulk Update</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ข้อมูล JSON สำหรับอัปเดตราคา:
                </label>
                <textarea
                  value={bulkUpdateData}
                  onChange={(e) => setBulkUpdateData(e.target.value)}
                  placeholder={`[
  {
    "plantId": "plant_1",
    "supplierId": "supplier_1", 
    "newPrice": 500
  }
]`}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleBulkUpdate}
                  disabled={isLoading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>อัปเดต</span>
                </button>
                <button
                  onClick={() => {
                    setShowBulkUpdate(false);
                    setBulkUpdateData('');
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Testing Tools */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <span>เครื่องมือทดสอบ</span>
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={handleCreateTestData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <Database className="h-4 w-4" />
              <span>ข้อมูลทดสอบพื้นฐาน</span>
            </button>

            <button
              onClick={handleCreateBulkTestData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>ข้อมูลทดสอบจำนวนมาก</span>
            </button>

            <button
              onClick={handleCreateBulkUpdateData}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>ข้อมูล Bulk Update</span>
            </button>

            <button
              onClick={handleCreateImportFile}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>ไฟล์ทดสอบ Import</span>
            </button>

            <button
              onClick={handleRunAllTests}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center justify-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>รันการทดสอบทั้งหมด</span>
            </button>

            <button
              onClick={handleClearAllData}
              disabled={isLoading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>ลบข้อมูลทั้งหมด</span>
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Settings className="h-5 w-5 text-orange-600" />
            <span>การบำรุงรักษา</span>
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleOptimizeDatabase}
              disabled={isLoading}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>ปรับปรุงฐานข้อมูล</span>
            </button>

            <button
              onClick={handleRefreshStats}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>อัปเดตสถิติ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManagementPage;
