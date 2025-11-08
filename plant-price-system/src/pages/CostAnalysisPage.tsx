import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';

interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface ProjectCost {
  id: string;
  name: string;
  totalCost: number;
  breakdown: CostBreakdown[];
  recommendations: string[];
  savings: {
    potential: number;
    percentage: number;
  };
}

const CostAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProjectCost | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ข้อมูลโปรเจกต์ตัวอย่าง
  const sampleProjects = [
    { id: '1', name: 'สวนหน้าบ้าน - บ้านคุณสมชาย', totalCost: 50000 },
    { id: '2', name: 'สวนหลังบ้าน - คอนโดมิเนียม', totalCost: 30000 },
    { id: '3', name: 'สวนโรงแรม - ริสอร์ท', totalCost: 150000 },
    { id: '4', name: 'สวนออฟฟิศ - อาคารสำนักงาน', totalCost: 80000 }
  ];

  const handleAnalyze = async () => {
    if (!selectedProject) {
      setError('กรุณาเลือกโปรเจกต์ที่ต้องการวิเคราะห์');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const project = sampleProjects.find(p => p.id === selectedProject);
      if (!project) {
        throw new Error('ไม่พบข้อมูลโปรเจกต์');
      }

      // จำลองการวิเคราะห์ต้นทุน
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult: ProjectCost = {
        id: project.id,
        name: project.name,
        totalCost: project.totalCost,
        breakdown: [
          {
            category: 'ต้นไม้และพืช',
            amount: project.totalCost * 0.6,
            percentage: 60,
            color: 'bg-green-500'
          },
          {
            category: 'ดินและปุ๋ย',
            amount: project.totalCost * 0.15,
            percentage: 15,
            color: 'bg-yellow-500'
          },
          {
            category: 'กระถางและวัสดุ',
            amount: project.totalCost * 0.1,
            percentage: 10,
            color: 'bg-blue-500'
          },
          {
            category: 'แรงงาน',
            amount: project.totalCost * 0.1,
            percentage: 10,
            color: 'bg-purple-500'
          },
          {
            category: 'อื่นๆ',
            amount: project.totalCost * 0.05,
            percentage: 5,
            color: 'bg-gray-500'
          }
        ],
        recommendations: [
          'เลือกซื้อต้นไม้จากร้านค้าที่มีราคาดีที่สุด',
          'ใช้ดินผสมเองแทนการซื้อดินสำเร็จรูป',
          'ซื้อกระถางแบบแพ็คเกจเพื่อลดราคาต่อชิ้น',
          'จ้างแรงงานในช่วงนอกฤดูเพื่อประหยัดค่าแรง',
          'เปรียบเทียบราคาจากหลายร้านค้าก่อนตัดสินใจ'
        ],
        savings: {
          potential: project.totalCost * 0.15,
          percentage: 15
        }
      };

      setAnalysisResult(mockResult);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการวิเคราะห์ต้นทุน');
      console.error('Cost analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // const getColorClass = (color: string) => {
  //   const colorMap: { [key: string]: string } = {
  //     'bg-green-500': 'text-green-600 bg-green-100',
  //     'bg-yellow-500': 'text-yellow-600 bg-yellow-100',
  //     'bg-blue-500': 'text-blue-600 bg-blue-100',
  //     'bg-purple-500': 'text-purple-600 bg-purple-100',
  //     'bg-gray-500': 'text-gray-600 bg-gray-100'
  //   };
  //   return colorMap[color] || 'text-gray-600 bg-gray-100';
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💰 วิเคราะห์ต้นทุนโปรเจกต์</h1>
            <p className="text-gray-600 mt-2">วิเคราะห์และหาวิธีประหยัดต้นทุน</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            กลับหน้าหลัก
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🌱 เลือกโปรเจกต์</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  โปรเจกต์ที่ต้องการวิเคราะห์
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">เลือกโปรเจกต์</option>
                  {sampleProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} - ฿{project.totalCost.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!selectedProject || isAnalyzing}
                className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>กำลังวิเคราะห์...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    <span>วิเคราะห์ต้นทุน</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 ผลการวิเคราะห์</h2>
            
            {analysisResult ? (
              <div className="space-y-6">
                {/* Project Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{analysisResult.name}</h3>
                  <div className="text-2xl font-bold text-green-600">
                    ฿{analysisResult.totalCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">งบประมาณรวม</div>
                </div>

                {/* Cost Breakdown */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">📈 แยกตามหมวดหมู่</h3>
                  <div className="space-y-3">
                    {analysisResult.breakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                          <span className="font-medium text-gray-900">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            ฿{item.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Savings Potential */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">💡 ประหยัดได้</h3>
                  <div className="text-2xl font-bold text-yellow-600">
                    ฿{analysisResult.savings.potential.toLocaleString()}
                  </div>
                  <div className="text-sm text-yellow-700">
                    ประหยัดได้ {analysisResult.savings.percentage}% ของงบประมาณ
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>เลือกโปรเจกต์และกดวิเคราะห์เพื่อดูผลลัพธ์</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Analysis */}
        {analysisResult && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cost Breakdown Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 กราฟแยกตามหมวดหมู่</h2>
              
              <div className="space-y-4">
                {analysisResult.breakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium text-gray-900">{item.category}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 คำแนะนำการประหยัด</h2>
              
              <div className="space-y-3">
                {analysisResult.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-800">{recommendation}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🎯 เป้าหมายการประหยัด</h3>
                <div className="text-2xl font-bold text-blue-600">
                  ฿{analysisResult.savings.potential.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">
                  ประหยัดได้ {analysisResult.savings.percentage}% ของงบประมาณ
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-purple-50 rounded-lg p-6">
          <h3 className="font-semibold text-purple-900 mb-2">💡 เคล็ดลับการประหยัดต้นทุน</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• เปรียบเทียบราคาจากหลายร้านค้าก่อนตัดสินใจ</li>
            <li>• ซื้อในช่วงนอกฤดูเพื่อได้ราคาที่ดีกว่า</li>
            <li>• ใช้ดินผสมเองแทนการซื้อดินสำเร็จรูป</li>
            <li>• ซื้อกระถางแบบแพ็คเกจเพื่อลดราคาต่อชิ้น</li>
            <li>• จ้างแรงงานในช่วงนอกฤดูเพื่อประหยัดค่าแรง</li>
            <li>• ใช้ต้นไม้ที่โตเร็วเพื่อลดระยะเวลาการดูแล</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CostAnalysisPage;
