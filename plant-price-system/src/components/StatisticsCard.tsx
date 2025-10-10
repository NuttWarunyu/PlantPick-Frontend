import React from 'react';
import { Database, Store, BarChart3, TrendingUp } from 'lucide-react';

interface StatisticsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  description 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface StatisticsProps {
  totalPlants: number;
  totalSuppliers: number;
  categoryCount: Record<string, number>;
  plantTypeCount: Record<string, number>;
}

const Statistics: React.FC<StatisticsProps> = ({
  totalPlants,
  totalSuppliers,
  categoryCount,
  plantTypeCount
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">สถิติข้อมูลในระบบ</h2>
      
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatisticsCard
          title="จำนวนต้นไม้ทั้งหมด"
          value={totalPlants}
          icon={<Database className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          description="ชนิดต้นไม้ในระบบ"
        />
        <StatisticsCard
          title="จำนวนร้านค้า"
          value={totalSuppliers}
          icon={<Store className="w-6 h-6 text-white" />}
          color="bg-green-500"
          description="ร้านค้าผู้จัดจำหน่าย"
        />
        <StatisticsCard
          title="หมวดหมู่ต้นไม้"
          value={Object.keys(categoryCount).length}
          icon={<BarChart3 className="w-6 h-6 text-white" />}
          color="bg-purple-500"
          description="หมวดหมู่ที่แตกต่างกัน"
        />
        <StatisticsCard
          title="ประเภทต้นไม้"
          value={Object.keys(plantTypeCount).length}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-orange-500"
          description="ประเภทที่แตกต่างกัน"
        />
      </div>
    </div>
  );
};

export default Statistics;
