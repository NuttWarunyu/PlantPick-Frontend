import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  FolderOpen, 
  BarChart3, 
  MapPin, 
  Database,
  Store,
  FileText,
  Search,
  Plus,
  PieChart,
  Bot
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAdmin } from '../contexts/AdminContext';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
}

interface RecentActivity {
  id: string;
  type: 'scan' | 'project' | 'search' | 'add';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [statistics, setStatistics] = useState({
    totalPlants: 0,
    totalSuppliers: 0,
    totalProjects: 0,
    totalBills: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const quickActions: QuickAction[] = [
    {
      id: 'scan-bill',
      title: 'สแกนใบเสร็จ',
      description: 'อัปเดตราคาล่าสุดด้วย AI',
      icon: <Camera className="w-6 h-6" />,
      color: 'bg-blue-500',
      route: '/bill-scanner'
    },
    {
      id: 'create-project',
      title: 'สร้างโปรเจกต์',
      description: 'เริ่มโปรเจกต์จัดสวนใหม่',
      icon: <FolderOpen className="w-6 h-6" />,
      color: 'bg-green-500',
      route: '/project'
    },
    {
      id: 'search-plants',
      title: 'ค้นหาต้นไม้',
      description: 'ค้นหาและเปรียบเทียบราคา',
      icon: <Search className="w-6 h-6" />,
      color: 'bg-purple-500',
      route: '/search'
    },
    {
      id: 'add-plant',
      title: 'เพิ่มต้นไม้',
      description: 'เพิ่มข้อมูลต้นไม้ใหม่',
      icon: <Plus className="w-6 h-6" />,
      color: 'bg-orange-500',
      route: '/add-plant'
    },
    {
      id: 'price-analysis',
      title: 'วิเคราะห์ราคา',
      description: 'วิเคราะห์เทรนด์ราคา',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-indigo-500',
      route: '/price-analysis'
    },
    {
      id: 'route-optimization',
      title: 'วางแผนเส้นทาง',
      description: 'หาทางไปซื้อที่ประหยัดที่สุด',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-pink-500',
      route: '/route-optimization'
    },
    {
      id: 'cost-analysis',
      title: 'วิเคราะห์ต้นทุน',
      description: 'วิเคราะห์และหาวิธีประหยัด',
      icon: <PieChart className="w-6 h-6" />,
      color: 'bg-indigo-500',
      route: '/cost-analysis'
    },
    ...(isAdmin ? [{
      id: 'ai-agent',
      title: 'AI Agent',
      description: 'จัดการ AI Agent สำหรับเก็บข้อมูล',
      icon: <Bot className="w-6 h-6" />,
      color: 'bg-purple-500',
      route: '/ai-agent'
    }] : [])
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'scan',
      title: 'สแกนใบเสร็จสำเร็จ',
      description: 'สวนไม้ประดับ ณัฐพล - 15,750 ฿',
      timestamp: '2 ชั่วโมงที่แล้ว',
      icon: <Camera className="w-4 h-4" />
    },
    {
      id: '2',
      type: 'project',
      title: 'สร้างโปรเจกต์ใหม่',
      description: 'สวนหน้าบ้าน - บ้านคุณสมชาย',
      timestamp: '1 วันที่แล้ว',
      icon: <FolderOpen className="w-4 h-4" />
    },
    {
      id: '3',
      type: 'search',
      title: 'ค้นหาต้นไม้',
      description: 'มอนสเตอร่า - พบ 8 ร้านค้า',
      timestamp: '2 วันที่แล้ว',
      icon: <Search className="w-4 h-4" />
    },
    {
      id: '4',
      type: 'add',
      title: 'เพิ่มต้นไม้ใหม่',
      description: 'ฟิโลเดนดรอน เฮเดรซิฟอลิอัม',
      timestamp: '3 วันที่แล้ว',
      icon: <Plus className="w-4 h-4" />
    }
  ];

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      // ใช้ API Service เพื่อดึงข้อมูลสถิติจาก Backend
      const statisticsResponse = await apiService.getStatistics();
      
      if (statisticsResponse.success) {
        // ดึงข้อมูลจาก localStorage สำหรับ projects และ bills (ยังไม่มี API)
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const bills = JSON.parse(localStorage.getItem('processedBills') || '[]');
        
        setStatistics({
          totalPlants: statisticsResponse.data.totalPlants,
          totalSuppliers: statisticsResponse.data.totalSuppliers,
          totalProjects: projects.length,
          totalBills: bills.length
        });
      } else {
        throw new Error('Failed to fetch statistics from API');
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Fallback to localStorage if API fails
      const plants = JSON.parse(localStorage.getItem('plantsData') || '[]');
      const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const bills = JSON.parse(localStorage.getItem('processedBills') || '[]');
      
      setStatistics({
        totalPlants: plants.length,
        totalSuppliers: suppliers.length,
        totalProjects: projects.length,
        totalBills: bills.length
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    navigate(action.route);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🌱 หน้าหลัก</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">ระบบจัดการราคาต้นไม้สำหรับธุรกิจจัดสวน</p>
        </div>

        {/* Statistics Cards - Mobile First */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <Database className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 mb-2 sm:mb-0 sm:mr-4" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">ต้นไม้ทั้งหมด</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{statistics.totalPlants.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <Store className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 mb-2 sm:mb-0 sm:mr-4" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">ร้านค้า</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{statistics.totalSuppliers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 mb-2 sm:mb-0 sm:mr-4" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">โปรเจกต์</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{statistics.totalProjects}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 mb-2 sm:mb-0 sm:mr-4" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">ใบเสร็จ</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{statistics.totalBills}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile First Layout */}
        <div className="space-y-6 sm:space-y-8">
          {/* Quick Actions - Mobile Optimized */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">⚡ งานด่วน</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center p-4 sm:p-5 rounded-xl border-2 border-gray-200 active:border-green-400 hover:border-green-300 hover:shadow-lg transition-all group touch-manipulation"
                  style={{ minHeight: '80px' }}
                >
                  <div className={`${action.color} text-white p-3 sm:p-4 rounded-xl mr-3 sm:mr-4 group-active:scale-110 transition-transform flex-shrink-0`}>
                    {action.icon}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-active:text-gray-700 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 group-active:text-gray-600 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activities - Mobile Optimized */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">📈 กิจกรรมล่าสุด</h2>
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-green-600 hover:text-green-800 active:text-green-900 font-medium rounded-lg hover:bg-green-50 touch-manipulation">
              ดูทั้งหมด
            </button>
          </div>
        </div>

        {/* Tips & Tricks - Mobile Optimized */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">💡 เคล็ดลับการใช้งาน</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50">
              <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-base sm:text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">สแกนใบเสร็จ</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">ใช้ AI อ่านใบเสร็จเพื่ออัปเดตราคาล่าสุดอัตโนมัติ</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50">
              <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-base sm:text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">สร้างโปรเจกต์</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">จัดการโปรเจกต์จัดสวนและติดตามงบประมาณ</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 sm:col-span-2 lg:col-span-1">
              <div className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-base sm:text-sm font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">เปรียบเทียบราคา</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">หาร้านค้าที่ราคาดีที่สุดและวางแผนเส้นทาง</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
