import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Plus, RefreshCw, Trash2, Edit2, 
  Globe, Clock, CheckCircle, XCircle, AlertCircle,
  LogOut, Eye, ExternalLink, Loader
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';

interface Website {
  id: string;
  name: string;
  url: string;
  description?: string;
  enabled: boolean;
  schedule?: string;
  last_scraped?: string;
  created_at: string;
}

interface ScrapingJob {
  id: string;
  website_id?: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
}

interface ScrapingResult {
  id: string;
  job_id: string;
  plant_name: string;
  price?: number;
  size?: string;
  confidence?: number;
  created_at: string;
}

const AiAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, adminToken, logout } = useAdmin();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [results, setResults] = useState<ScrapingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'websites' | 'jobs' | 'results'>('websites');
  const [scrapingStatus, setScrapingStatus] = useState<Record<string, 'idle' | 'scraping' | 'success' | 'error'>>({});
  const [scrapingMessage, setScrapingMessage] = useState<Record<string, string>>({});
  
  // Add website modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWebsite, setNewWebsite] = useState({ name: '', url: '', description: '', schedule: 'manual' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }
    loadData();
    
    // Auto refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [isAdmin, navigate, activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');

      // Load websites
      if (activeTab === 'websites' || isAdmin) {
        const websitesRes = await fetch(`${backendUrl}/api/agents/websites`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'x-admin-token': adminToken || ''
          }
        });
        const websitesData = await websitesRes.json();
        if (websitesData.success) {
          setWebsites(websitesData.data || []);
        }
      }

      // Load jobs
      if (activeTab === 'jobs' || isAdmin) {
        const jobsRes = await fetch(`${backendUrl}/api/agents/jobs?limit=50`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'x-admin-token': adminToken || ''
          }
        });
        const jobsData = await jobsRes.json();
        if (jobsData.success) {
          setJobs(jobsData.data || []);
        }
      }

      // Load results
      if (activeTab === 'results' || isAdmin) {
        const resultsRes = await fetch(`${backendUrl}/api/agents/results?limit=100`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'x-admin-token': adminToken || ''
          }
        });
        const resultsData = await resultsRes.json();
        if (resultsData.success) {
          setResults(resultsData.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWebsite = async () => {
    if (!newWebsite.name || !newWebsite.url) {
      alert('กรุณาระบุชื่อและ URL');
      return;
    }

    setIsAdding(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');

      const response = await fetch(`${backendUrl}/api/agents/websites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWebsite)
      });

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        setNewWebsite({ name: '', url: '', description: '', schedule: 'manual' });
        loadData();
      } else {
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error adding website:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มเว็บไซต์');
    } finally {
      setIsAdding(false);
    }
  };

  const handleScrape = async (websiteId?: string, url?: string) => {
    const key = websiteId || url || 'manual';
    setScrapingStatus(prev => ({ ...prev, [key]: 'scraping' }));
    setScrapingMessage(prev => ({ ...prev, [key]: 'กำลังเริ่มการ scrape...' }));
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');

      const response = await fetch(`${backendUrl}/api/agents/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ websiteId, url })
      });

      const data = await response.json();
      if (data.success) {
        setScrapingMessage(prev => ({ ...prev, [key]: '✅ เริ่มการ scrape แล้ว กำลังรอผลลัพธ์...' }));
        setScrapingStatus(prev => ({ ...prev, [key]: 'success' }));
        
        // Auto refresh jobs and results
        setTimeout(() => {
          loadData();
          // Switch to jobs tab to see progress
          if (activeTab !== 'jobs') {
            setActiveTab('jobs');
          }
        }, 1000);
        
        // Continue polling for results
        let pollCount = 0;
        const maxPolls = 30; // 30 polls = 5 minutes (10s interval)
        const pollInterval = setInterval(async () => {
          pollCount++;
          await loadData();
          
          // Fetch latest jobs to check status
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
          const backendUrl = apiUrl.replace(/\/api$/, '');
          try {
            const jobsRes = await fetch(`${backendUrl}/api/agents/jobs?limit=50`, {
              headers: {
                'Authorization': `Bearer ${adminToken}`,
                'x-admin-token': adminToken || ''
              }
            });
            const jobsData = await jobsRes.json();
            if (jobsData.success) {
              const latestJobs = jobsData.data || [];
              // Check if job is completed
              const completedJob = latestJobs.find((j: ScrapingJob) => 
                ((websiteId && j.website_id === websiteId) || (url && j.url === url)) &&
                (j.status === 'completed' || j.status === 'failed')
              );
              
              if (completedJob || pollCount >= maxPolls) {
                clearInterval(pollInterval);
                if (completedJob) {
                  setScrapingMessage(prev => ({ 
                    ...prev, 
                    [key]: completedJob.status === 'completed' 
                      ? '✅ Scraping เสร็จสิ้น! ตรวจสอบผลลัพธ์ในแท็บ Results' 
                      : `❌ Scraping ล้มเหลว: ${completedJob.error_message || 'ไม่ทราบสาเหตุ'}`
                  }));
                  setScrapingStatus(prev => ({ ...prev, [key]: completedJob.status === 'completed' ? 'success' : 'error' }));
                  
                  // Switch to results tab if completed
                  if (completedJob.status === 'completed') {
                    setTimeout(() => setActiveTab('results'), 2000);
                  }
                } else {
                  setScrapingMessage(prev => ({ ...prev, [key]: '⏱️ กำลังรอผลลัพธ์...' }));
                }
              }
            }
          } catch (err) {
            console.error('Error polling jobs:', err);
          }
        }, 10000); // Poll every 10 seconds
        
        // Clear status after 10 seconds
        setTimeout(() => {
          setScrapingStatus(prev => ({ ...prev, [key]: 'idle' }));
          setScrapingMessage(prev => ({ ...prev, [key]: '' }));
        }, 10000);
      } else {
        setScrapingMessage(prev => ({ ...prev, [key]: `❌ ${data.message || 'เกิดข้อผิดพลาด'}` }));
        setScrapingStatus(prev => ({ ...prev, [key]: 'error' }));
        setTimeout(() => {
          setScrapingStatus(prev => ({ ...prev, [key]: 'idle' }));
          setScrapingMessage(prev => ({ ...prev, [key]: '' }));
        }, 5000);
      }
    } catch (error: any) {
      console.error('Error scraping:', error);
      const errorMsg = error.message || 'เกิดข้อผิดพลาดในการ scrape';
      setScrapingMessage(prev => ({ ...prev, [key]: `❌ ${errorMsg}` }));
      setScrapingStatus(prev => ({ ...prev, [key]: 'error' }));
      setTimeout(() => {
        setScrapingStatus(prev => ({ ...prev, [key]: 'idle' }));
        setScrapingMessage(prev => ({ ...prev, [key]: '' }));
      }, 5000);
    }
  };

  const handleDeleteWebsite = async (id: string) => {
    if (!window.confirm('คุณต้องการลบเว็บไซต์นี้หรือไม่?')) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');

      const response = await fetch(`${backendUrl}/api/agents/websites/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken || ''
        }
      });

      const data = await response.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error deleting website:', error);
      alert('เกิดข้อผิดพลาดในการลบเว็บไซต์');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 mr-3 text-green-600" />
              🤖 AI Agent Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              ระบบเก็บข้อมูลต้นไม้และราคาจากเว็บไซต์อัตโนมัติ
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors touch-manipulation"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('websites')}
              className={`flex-1 px-4 py-3 sm:py-4 text-center font-medium transition-colors touch-manipulation ${
                activeTab === 'websites'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🌐 เว็บไซต์ ({websites.length})
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 px-4 py-3 sm:py-4 text-center font-medium transition-colors touch-manipulation ${
                activeTab === 'jobs'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              ⚙️ Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 px-4 py-3 sm:py-4 text-center font-medium transition-colors touch-manipulation ${
                activeTab === 'results'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📊 ผลลัพธ์ ({results.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Websites Tab */}
            {activeTab === 'websites' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">รายการเว็บไซต์</h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors touch-manipulation"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มเว็บไซต์</span>
                  </button>
                </div>

                {websites.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">ยังไม่มีเว็บไซต์</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors touch-manipulation"
                    >
                      เพิ่มเว็บไซต์แรก
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {websites.map((website) => (
                      <div key={website.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{website.name}</h3>
                            <a
                              href={website.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
                            >
                              <span className="truncate">{website.url}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            website.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {website.enabled ? 'เปิด' : 'ปิด'}
                          </span>
                        </div>

                        {website.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{website.description}</p>
                        )}

                        {website.last_scraped && (
                          <p className="text-xs text-gray-500 mb-4">
                            Scraped: {new Date(website.last_scraped).toLocaleString('th-TH')}
                          </p>
                        )}

                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleScrape(website.id)}
                              disabled={scrapingStatus[website.id] === 'scraping'}
                              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors touch-manipulation text-sm font-medium ${
                                scrapingStatus[website.id] === 'scraping'
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : scrapingStatus[website.id] === 'success'
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : scrapingStatus[website.id] === 'error'
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {scrapingStatus[website.id] === 'scraping' ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  <span>Scraping...</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-4 h-4" />
                                  <span>Scrape</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteWebsite(website.id)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors touch-manipulation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {scrapingMessage[website.id] && (
                            <div className={`text-xs px-2 py-1 rounded ${
                              scrapingStatus[website.id] === 'success' 
                                ? 'bg-green-50 text-green-700' 
                                : scrapingStatus[website.id] === 'error'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}>
                              {scrapingMessage[website.id]}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">ประวัติการ Scrape</h2>
                {jobs.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">ยังไม่มีประวัติการ scrape</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(job.status)}
                                  <span className="text-sm font-medium capitalize">{job.status}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <a
                                  href={job.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline truncate block max-w-xs"
                                >
                                  {job.url}
                                </a>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {job.started_at ? new Date(job.started_at).toLocaleString('th-TH') : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {job.completed_at ? new Date(job.completed_at).toLocaleString('th-TH') : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">ผลลัพธ์การ Scrape</h2>
                {results.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">ยังไม่มีผลลัพธ์</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((result) => (
                      <div key={result.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{result.plant_name}</h3>
                        {result.price && (
                          <p className="text-xl font-bold text-green-600 mb-2">฿{result.price.toLocaleString()}</p>
                        )}
                        {result.size && (
                          <p className="text-sm text-gray-600 mb-2">Size: {result.size}</p>
                        )}
                        {result.confidence && (
                          <p className="text-xs text-gray-500">
                            Confidence: {(result.confidence * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Add Website Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">เพิ่มเว็บไซต์</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อเว็บไซต์</label>
                  <input
                    type="text"
                    value={newWebsite.name}
                    onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    placeholder="เช่น ร้านต้นไม้ ABC"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                  <input
                    type="url"
                    value={newWebsite.url}
                    onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย (ไม่บังคับ)</label>
                  <textarea
                    value={newWebsite.description}
                    onChange={(e) => setNewWebsite({ ...newWebsite, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    rows={3}
                    placeholder="รายละเอียดเว็บไซต์..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                  <select
                    value={newWebsite.schedule}
                    onChange={(e) => setNewWebsite({ ...newWebsite, schedule: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                  >
                    <option value="manual">Manual</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddWebsite}
                  disabled={isAdding || !newWebsite.name || !newWebsite.url}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation font-medium"
                >
                  {isAdding ? 'กำลังเพิ่ม...' : 'เพิ่มเว็บไซต์'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewWebsite({ name: '', url: '', description: '', schedule: 'manual' });
                  }}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors touch-manipulation font-medium"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAgentPage;

