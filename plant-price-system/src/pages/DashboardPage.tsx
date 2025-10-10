import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  FolderOpen, 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Clock, 
  DollarSign,
  Database,
  Store,
  FileText,
  Search,
  Plus,
  PieChart
} from 'lucide-react';

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
      route: '/'
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
    }
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
      // โหลดสถิติจาก API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/statistics`);
      const result = await response.json();
      
      if (result.success) {
        setStatistics({
          totalPlants: result.data.totalPlants,
          totalSuppliers: result.data.totalSuppliers,
          totalProjects: 3, // ข้อมูลจำลอง
          totalBills: 5 // ข้อมูลจำลอง
        });
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🌱 หน้าหลัก - PlantPick</h1>
          <p className="text-gray-600 mt-2">ระบบจัดการราคาต้นไม้สำหรับธุรกิจจัดสวน</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ต้นไม้ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalPlants.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ร้านค้า</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalSuppliers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FolderOpen className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">โปรเจกต์</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalProjects}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ใบเสร็จ</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalBills}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">⚡ งานด่วน</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                  >
                    <div className={`${action.color} text-white p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">📈 กิจกรรมล่าสุด</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-green-600 hover:text-green-800 font-medium">
                ดูทั้งหมด
              </button>
            </div>
          </div>
        </div>

        {/* Tips & Tricks */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 เคล็ดลับการใช้งาน</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">สแกนใบเสร็จ</h3>
                <p className="text-sm text-gray-600">ใช้ AI อ่านใบเสร็จเพื่ออัปเดตราคาล่าสุดอัตโนมัติ</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900">สร้างโปรเจกต์</h3>
                <p className="text-sm text-gray-600">จัดการโปรเจกต์จัดสวนและติดตามงบประมาณ</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">เปรียบเทียบราคา</h3>
                <p className="text-sm text-gray-600">หาร้านค้าที่ราคาดีที่สุดและวางแผนเส้นทาง</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
