import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  FolderOpen, 
  Database,
  Store,
  FileText,
  Search,
  Plus,
  Bot,
  Sparkles,
  TrendingUp,
  Heart
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAdmin } from '../contexts/AdminContext';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  emoji: string;
  route: string;
}

interface RecentActivity {
  id: string;
  type: 'scan' | 'project' | 'search' | 'add';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
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
      icon: <Camera className="w-7 h-7" />,
      gradient: 'from-blue-400 to-cyan-500',
      emoji: '📸',
      route: '/bill-scanner'
    },
    {
      id: 'create-project',
      title: 'สร้างโปรเจกต์',
      description: 'เริ่มโปรเจกต์จัดสวนใหม่',
      icon: <FolderOpen className="w-7 h-7" />,
      gradient: 'from-green-400 to-emerald-500',
      emoji: '🌿',
      route: '/project'
    },
    {
      id: 'search-plants',
      title: 'ค้นหาต้นไม้',
      description: 'ค้นหาและเปรียบเทียบราคา',
      icon: <Search className="w-7 h-7" />,
      gradient: 'from-purple-400 to-pink-500',
      emoji: '🔍',
      route: '/search'
    },
    {
      id: 'add-plant',
      title: 'เพิ่มต้นไม้',
      description: 'เพิ่มข้อมูลต้นไม้ใหม่',
      icon: <Plus className="w-7 h-7" />,
      gradient: 'from-orange-400 to-red-500',
      emoji: '🌱',
      route: '/add-plant'
    },
    // Temporarily hidden - not in use yet
    // {
    //   id: 'price-analysis',
    //   title: 'วิเคราะห์ราคา',
    //   description: 'วิเคราะห์เทรนด์ราคา',
    //   icon: <BarChart3 className="w-7 h-7" />,
    //   gradient: 'from-indigo-400 to-purple-500',
    //   emoji: '📊',
    //   route: '/price-analysis'
    // },
    // {
    //   id: 'route-optimization',
    //   title: 'วางแผนเส้นทาง',
    //   description: 'หาทางไปซื้อที่ประหยัดที่สุด',
    //   icon: <MapPin className="w-7 h-7" />,
    //   gradient: 'from-pink-400 to-rose-500',
    //   emoji: '🗺️',
    //   route: '/route-optimization'
    // },
    // {
    //   id: 'cost-analysis',
    //   title: 'วิเคราะห์ต้นทุน',
    //   description: 'วิเคราะห์และหาวิธีประหยัด',
    //   icon: <PieChart className="w-7 h-7" />,
    //   gradient: 'from-teal-400 to-cyan-500',
    //   emoji: '💰',
    //   route: '/cost-analysis'
    // },
    ...(isAdmin ? [{
      id: 'ai-agent',
      title: 'AI Agent',
      description: 'จัดการ AI Agent สำหรับเก็บข้อมูล',
      icon: <Bot className="w-7 h-7" />,
      gradient: 'from-violet-400 to-purple-500',
      emoji: '🤖',
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
      icon: <Camera className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: '2',
      type: 'project',
      title: 'สร้างโปรเจกต์ใหม่',
      description: 'สวนหน้าบ้าน - บ้านคุณสมชาย',
      timestamp: '1 วันที่แล้ว',
      icon: <FolderOpen className="w-5 h-5" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: '3',
      type: 'search',
      title: 'ค้นหาต้นไม้',
      description: 'มอนสเตอร่า - พบ 8 ร้านค้า',
      timestamp: '2 วันที่แล้ว',
      icon: <Search className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: '4',
      type: 'add',
      title: 'เพิ่มต้นไม้ใหม่',
      description: 'ฟิโลเดนดรอน เฮเดรซิฟอลิอัม',
      timestamp: '3 วันที่แล้ว',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const statisticsResponse = await apiService.getStatistics();
      
      if (statisticsResponse.success) {
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header - Cute & Friendly */}
        <div className="mb-8 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
            <div className="text-5xl sm:text-6xl animate-bounce">🌱</div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ยินดีต้อนรับ!
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mt-1">ระบบจัดการราคาต้นไม้ของคุณ</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Cute & Colorful */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 transform hover:scale-105 transition-all duration-300 border-2 border-green-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-3 shadow-md">
                <Database className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">ต้นไม้ทั้งหมด</p>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {statistics.totalPlants.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 transform hover:scale-105 transition-all duration-300 border-2 border-blue-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 shadow-md">
                <Store className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">ร้านค้า</p>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {statistics.totalSuppliers}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 transform hover:scale-105 transition-all duration-300 border-2 border-purple-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-3 shadow-md">
                <FolderOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">โปรเจกต์</p>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {statistics.totalProjects}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 transform hover:scale-105 transition-all duration-300 border-2 border-orange-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-3 shadow-md">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">ใบเสร็จ</p>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {statistics.totalBills}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Cute Cards */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">เริ่มต้นใช้งาน</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="group relative bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-green-300 overflow-hidden"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{action.emoji}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activities - Cute Timeline */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">กิจกรรมล่าสุด</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border-2 border-purple-100">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group"
                >
                  <div className={`${activity.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base sm:text-lg font-bold text-gray-800 mb-1">{activity.title}</p>
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span>⏰</span>
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold rounded-xl hover:from-purple-500 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg">
              ดูทั้งหมด →
            </button>
          </div>
        </div>

        {/* Tips & Tricks - Cute Cards */}
        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 rounded-2xl p-6 sm:p-8 border-2 border-yellow-200 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">เคล็ดลับการใช้งาน</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-yellow-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md text-2xl font-bold text-white">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">📸 สแกนใบเสร็จ</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">ใช้ AI อ่านใบเสร็จเพื่ออัปเดตราคาล่าสุดอัตโนมัติ ง่ายและรวดเร็ว!</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-green-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md text-2xl font-bold text-white">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">🌿 สร้างโปรเจกต์</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">จัดการโปรเจกต์จัดสวนและติดตามงบประมาณได้อย่างง่ายดาย</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-purple-100 sm:col-span-2 lg:col-span-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md text-2xl font-bold text-white">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">🔍 เปรียบเทียบราคา</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">หาร้านค้าที่ราคาดีที่สุดและวางแผนเส้นทางประหยัด</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
