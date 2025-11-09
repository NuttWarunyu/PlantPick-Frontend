import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Plus, RefreshCw, Trash2, 
  Globe, Clock, CheckCircle, XCircle, AlertCircle,
  LogOut, Eye, ExternalLink, Loader, FileText, Send, Edit2
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
  status?: 'pending' | 'approved' | 'rejected';
  image_url?: string;
  supplier_name?: string;
  supplier_phone?: string;
  supplier_location?: string;
  supplier_location_in_db?: string; // Location from suppliers table
  created_at: string;
  approved_at?: string;
}

const AiAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, adminToken, logout } = useAdmin();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [results, setResults] = useState<ScrapingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'websites' | 'jobs' | 'results' | 'logs' | 'paste'>('websites');
  const [scrapingStatus, setScrapingStatus] = useState<Record<string, 'idle' | 'scraping' | 'success' | 'error'>>({});
  const [scrapingMessage, setScrapingMessage] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<string[]>([]);
  
  // Add website modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWebsite, setNewWebsite] = useState({ name: '', url: '', description: '', schedule: 'manual' });
  const [isAdding, setIsAdding] = useState(false);
  
  // Paste text state
  const [pastedText, setPastedText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Edit location state
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [locationValue, setLocationValue] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }
    loadData();
    
    // Auto refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, navigate, activeTab]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('th-TH');
    setLogs(prev => [...prev.slice(-49), `[${timestamp}] ${message}`]); // Keep last 50 logs
  };

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

      // Load results (admin can see all, filter by status if needed)
      if (activeTab === 'results' || isAdmin) {
        const statusFilter = isAdmin ? undefined : 'approved'; // Admin sees all, others see approved only
        const resultsUrl = statusFilter 
          ? `${backendUrl}/api/agents/results?limit=100&status=${statusFilter}`
          : `${backendUrl}/api/agents/results?limit=100`;
        
        const resultsRes = await fetch(resultsUrl, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'x-admin-token': adminToken || ''
          }
        });
        const resultsData = await resultsRes.json();
        if (resultsData.success) {
          setResults(resultsData.data || []);
          addLog(`✅ โหลดผลลัพธ์ ${resultsData.data?.length || 0} รายการ`);
        } else {
          addLog(`❌ โหลดผลลัพธ์ล้มเหลว: ${resultsData.message}`);
        }
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      addLog(`❌ เกิดข้อผิดพลาด: ${error.message || 'ไม่ทราบสาเหตุ'}`);
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

  const handleAnalyzeText = async () => {
    if (!pastedText.trim()) {
      alert('กรุณา paste ข้อความที่ต้องการวิเคราะห์');
      return;
    }
    
    setIsAnalyzing(true);
    addLog(`🚀 เริ่มการวิเคราะห์ข้อความ (ความยาว: ${pastedText.length} ตัวอักษร)`);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');

      const response = await fetch(`${backendUrl}/api/agents/analyze-text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          text: pastedText,
          sourceUrl: sourceUrl || null
        })
      });

      const data = await response.json();
      if (data.success) {
        addLog(`✅ เริ่มการวิเคราะห์ข้อความสำเร็จ: ${data.data?.message || 'กำลังประมวลผล'}`);
        
        // Clear form
        setPastedText('');
        setSourceUrl('');
        
        // Auto refresh results and switch to results tab
        setTimeout(() => {
          loadData();
          setActiveTab('results');
        }, 1000);
        
        // Continue polling for results
        let pollCount = 0;
        const maxPolls = 30;
        const pollInterval = setInterval(async () => {
          pollCount++;
          await loadData();
          
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            addLog(`⏱️ หยุด polling หลังจาก ${maxPolls} ครั้ง`);
          }
        }, 10000);
        
        alert('✅ เริ่มการวิเคราะห์ข้อความแล้ว กำลังรอผลลัพธ์...');
      } else {
        throw new Error(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      addLog(`❌ เกิดข้อผิดพลาดในการวิเคราะห์ข้อความ: ${error.message}`);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScrape = async (websiteId?: string, url?: string) => {
    const key = websiteId || url || 'manual';
    setScrapingStatus(prev => ({ ...prev, [key]: 'scraping' }));
    setScrapingMessage(prev => ({ ...prev, [key]: 'กำลังเริ่มการ scrape...' }));
    addLog(`🚀 เริ่มการ scrape: ${url || websiteId || 'manual'}`);
    
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
        addLog(`✅ เริ่มการ scrape สำเร็จ: ${data.data?.message || 'กำลังประมวลผล'}`);
        
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
                  const statusMsg = completedJob.status === 'completed' 
                    ? '✅ Scraping เสร็จสิ้น! ตรวจสอบผลลัพธ์ในแท็บ Results' 
                    : `❌ Scraping ล้มเหลว: ${completedJob.error_message || 'ไม่ทราบสาเหตุ'}`;
                  setScrapingMessage(prev => ({ ...prev, [key]: statusMsg }));
                  setScrapingStatus(prev => ({ ...prev, [key]: completedJob.status === 'completed' ? 'success' : 'error' }));
                  addLog(statusMsg);
                  
                  // Switch to results tab if completed
                  if (completedJob.status === 'completed') {
                    setTimeout(() => setActiveTab('results'), 2000);
                  }
                } else {
                  setScrapingMessage(prev => ({ ...prev, [key]: '⏱️ กำลังรอผลลัพธ์...' }));
                  addLog(`⏱️ กำลังรอผลลัพธ์... (${pollCount}/${maxPolls})`);
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
        const errorMsg = `❌ ${data.message || 'เกิดข้อผิดพลาด'}`;
        setScrapingMessage(prev => ({ ...prev, [key]: errorMsg }));
        setScrapingStatus(prev => ({ ...prev, [key]: 'error' }));
        addLog(errorMsg);
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
      addLog(`❌ Error: ${errorMsg}`);
      setTimeout(() => {
        setScrapingStatus(prev => ({ ...prev, [key]: 'idle' }));
        setScrapingMessage(prev => ({ ...prev, [key]: '' }));
      }, 5000);
    }
  };

  const handleApproveResult = async (id: string) => {
    // Check if result has location or supplier already has location
    const result = results.find(r => r.id === id);
    if (result && !result.supplier_location && !result.supplier_location_in_db) {
      // Check if supplier already exists with location (will be checked on backend)
      // Just show warning but let backend handle the validation
      const proceed = window.confirm('⚠️ ผลลัพธ์นี้ไม่มีตำแหน่งที่ตั้ง\n\nถ้า Supplier นี้มี Location อยู่แล้วในระบบ จะใช้ Location เดิม\n\nถ้ายังไม่มี Location จะต้องเพิ่มก่อน\n\nต้องการดำเนินการต่อหรือไม่?');
      if (!proceed) return;
    }
    
    if (!window.confirm('คุณต้องการ approve ผลลัพธ์นี้หรือไม่? ข้อมูลจะถูกบันทึกลงฐานข้อมูล')) return;
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');
      
      const response = await fetch(`${backendUrl}/api/agents/results/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken || '',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        addLog(`✅ Approve สำเร็จ: ${data.data?.plantName || id} → บันทึกลงฐานข้อมูลแล้ว`);
        alert('✅ Approve สำเร็จ! ข้อมูลถูกบันทึกลงฐานข้อมูลแล้ว');
        loadData();
      } else {
        addLog(`❌ Approve ล้มเหลว: ${data.message || 'ไม่ทราบสาเหตุ'}`);
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      console.error('Error approving result:', error);
      addLog(`❌ Error approving: ${error.message || 'ไม่ทราบสาเหตุ'}`);
      alert('เกิดข้อผิดพลาดในการ approve');
    }
  };

  const handleApproveAll = async () => {
    const pendingResults = results.filter(r => r.status === 'pending');
    
    if (pendingResults.length === 0) {
      alert('ไม่มีผลลัพธ์ที่รอ Approve');
      return;
    }
    
    // Group by supplier name to check if supplier has location
    const supplierGroups = new Map<string, typeof pendingResults>();
    pendingResults.forEach(r => {
      const supplierName = r.supplier_name || 'ไม่ระบุ';
      if (!supplierGroups.has(supplierName)) {
        supplierGroups.set(supplierName, []);
      }
      supplierGroups.get(supplierName)!.push(r);
    });
    
    // Check if any supplier group has no location at all
    // Check both result location and supplier location in DB
    const suppliersWithoutLocation: string[] = [];
    supplierGroups.forEach((results, supplierName) => {
      const hasAnyLocation = results.some(r => 
        (r.supplier_location && r.supplier_location.trim() !== '') ||
        (r.supplier_location_in_db && r.supplier_location_in_db.trim() !== '')
      );
      if (!hasAnyLocation) {
        suppliersWithoutLocation.push(supplierName);
      }
    });
    
    if (suppliersWithoutLocation.length > 0) {
      alert(`⚠️ ไม่สามารถ Approve ทั้งหมดได้: มี Supplier ${suppliersWithoutLocation.length} รายการที่ไม่มีตำแหน่งที่ตั้ง (Location)\n\nSupplier ที่ไม่มี Location:\n${suppliersWithoutLocation.slice(0, 5).join('\n')}${suppliersWithoutLocation.length > 5 ? '\n...' : ''}\n\nกรุณาเพิ่มตำแหน่งที่ตั้งให้ Supplier เหล่านี้ก่อน Approve\n\n💡 เพิ่ม Location ครั้งเดียวสำหรับ Supplier เดียวกัน แล้ว Approve อื่นๆ จะใช้ Location เดิมได้`);
      return;
    }
    
    if (!window.confirm(`คุณต้องการ approve ทั้งหมด ${pendingResults.length} รายการหรือไม่? ข้อมูลจะถูกบันทึกลงฐานข้อมูล`)) return;
    
    setIsAnalyzing(true);
    addLog(`🚀 เริ่ม Approve ทั้งหมด ${pendingResults.length} รายการ...`);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');
      
      let successCount = 0;
      let failCount = 0;
      
      // Approve all results sequentially
      for (const result of pendingResults) {
        try {
          const response = await fetch(`${backendUrl}/api/agents/results/${result.id}/approve`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'x-admin-token': adminToken || '',
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          if (data.success) {
            successCount++;
            addLog(`✅ Approve สำเร็จ: ${data.data?.plantName || result.id}`);
          } else {
            failCount++;
            addLog(`❌ Approve ล้มเหลว: ${result.plant_name} - ${data.message || 'ไม่ทราบสาเหตุ'}`);
          }
        } catch (error: any) {
          failCount++;
          addLog(`❌ Error approving ${result.plant_name}: ${error.message || 'ไม่ทราบสาเหตุ'}`);
        }
      }
      
      addLog(`✅ Approve ทั้งหมดเสร็จสิ้น: สำเร็จ ${successCount} รายการ, ล้มเหลว ${failCount} รายการ`);
      alert(`✅ Approve ทั้งหมดเสร็จสิ้น!\n\nสำเร็จ: ${successCount} รายการ\nล้มเหลว: ${failCount} รายการ`);
      
      loadData();
    } catch (error: any) {
      console.error('Error approving all results:', error);
      addLog(`❌ Error approving all: ${error.message || 'ไม่ทราบสาเหตุ'}`);
      alert('เกิดข้อผิดพลาดในการ approve ทั้งหมด');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateLocation = async (id: string) => {
    if (!locationValue.trim()) {
      alert('กรุณากรอกตำแหน่งที่ตั้ง');
      return;
    }
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');
      
      const response = await fetch(`${backendUrl}/api/agents/results/${id}/location`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ location: locationValue.trim() })
      });
      
      const data = await response.json();
      if (data.success) {
        addLog(`✅ อัพเดทตำแหน่งที่ตั้งสำเร็จ: ${locationValue.trim()}`);
        setEditingLocation(null);
        setLocationValue('');
        loadData();
      } else {
        addLog(`❌ อัพเดทตำแหน่งที่ตั้งล้มเหลว: ${data.message || 'ไม่ทราบสาเหตุ'}`);
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      console.error('Error updating location:', error);
      addLog(`❌ Error updating location: ${error.message || 'ไม่ทราบสาเหตุ'}`);
      alert('เกิดข้อผิดพลาดในการอัพเดทตำแหน่งที่ตั้ง');
    }
  };

  const handleRejectResult = async (id: string) => {
    if (!window.confirm('คุณต้องการ reject ผลลัพธ์นี้หรือไม่?')) return;
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      const backendUrl = apiUrl.replace(/\/api$/, '');
      
      const response = await fetch(`${backendUrl}/api/agents/results/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken || '',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        addLog(`✅ Reject สำเร็จ: ${id}`);
        alert('✅ Reject สำเร็จ');
        loadData();
      } else {
        addLog(`❌ Reject ล้มเหลว: ${data.message || 'ไม่ทราบสาเหตุ'}`);
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      console.error('Error rejecting result:', error);
      addLog(`❌ Error rejecting: ${error.message || 'ไม่ทราบสาเหตุ'}`);
      alert('เกิดข้อผิดพลาดในการ reject');
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
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex-1 px-4 py-3 sm:py-4 text-center font-medium transition-colors touch-manipulation ${
                activeTab === 'paste'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📋 Paste Text
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 px-4 py-3 sm:py-4 text-center font-medium transition-colors touch-manipulation ${
                activeTab === 'logs'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📝 Logs ({logs.length})
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

            {/* Paste Text Tab */}
            {activeTab === 'paste' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Paste Text จาก Facebook</span>
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL ต้นฉบับ (ไม่บังคับ)
                      </label>
                      <input
                        type="url"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                        placeholder="https://www.facebook.com/..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ข้อความจาก Facebook Post
                        <span className="text-xs text-gray-500 ml-2">
                          (Copy-paste ข้อความทั้งหมดจากโพสต์)
                        </span>
                      </label>
                      <textarea
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none font-mono text-sm"
                        rows={15}
                        placeholder="ตัวอย่าง:
💥จำหน่ายย ไทรเกาหลีไม้ฟอกอากาศยอดฮิต  ไทรเกาหลีไม้ทำแนวรั้วยอดนิยม💥 

‼️ฟรอมสวยขายหน้าร้าน 
ฟรอมรั้วราคาประหยัด‼️

✅ ไทรเกาหลี 80 เซน - 3 เมตร

✅ มีบริการปลูก - ส่งทั่วไทย 

✅ มีบริการเก็บเงินปลายทาง

📱สอบถามได้ค่ะยินดีให้คำแนะนำ

☎️0927494962 นุช

🆔 https://line.me/ti/p/EmnLpyhTGY"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        ความยาว: {pastedText.length} ตัวอักษร
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>💡 วิธีใช้:</strong>
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                        <li>Copy ข้อความทั้งหมดจาก Facebook Post</li>
                        <li>Paste ลงในช่องด้านบน</li>
                        <li>คลิก "วิเคราะห์ด้วย AI"</li>
                        <li>AI จะแกะข้อมูลต้นไม้ ราคา และข้อมูลติดต่อ</li>
                        <li>ผลลัพธ์จะแสดงในแท็บ "ผลลัพธ์" และรอ Approve</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={handleAnalyzeText}
                      disabled={isAnalyzing || !pastedText.trim()}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation font-medium text-base"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>กำลังวิเคราะห์...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>วิเคราะห์ด้วย AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">ผลลัพธ์การ Scrape</h2>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      {results.filter(r => r.status === 'pending').length > 0 && (
                        <button
                          onClick={handleApproveAll}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve ทั้งหมด ({results.filter(r => r.status === 'pending').length})</span>
                        </button>
                      )}
                      <button
                        onClick={() => loadData()}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        รีเฟรช
                      </button>
                    </div>
                  )}
                </div>
                {results.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">ยังไม่มีผลลัพธ์</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((result) => (
                      <div 
                        key={result.id} 
                        className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 border-2 ${
                          result.status === 'pending' ? 'border-yellow-300 bg-yellow-50' :
                          result.status === 'approved' ? 'border-green-300 bg-green-50' :
                          result.status === 'rejected' ? 'border-red-300 bg-red-50' :
                          'border-gray-200'
                        }`}
                      >
                        {/* Status Badge */}
                        {result.status && (
                          <div className="mb-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              result.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              result.status === 'approved' ? 'bg-green-100 text-green-700' :
                              result.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {result.status === 'pending' ? '⏳ รอ Approve' :
                               result.status === 'approved' ? '✅ Approve แล้ว' :
                               result.status === 'rejected' ? '❌ Reject แล้ว' :
                               'Unknown'}
                            </span>
                          </div>
                        )}
                        
                        {/* Plant Image */}
                        {result.image_url && (
                          <div className="mb-3">
                            <img 
                              src={result.image_url} 
                              alt={result.plant_name}
                              className="w-full h-32 object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Plant Name */}
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{result.plant_name}</h3>
                        
                        {/* Supplier Info */}
                        {result.supplier_name && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-700">🏪 {result.supplier_name}</p>
                            {editingLocation === result.id ? (
                              <div className="mt-2 flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={locationValue}
                                  onChange={(e) => setLocationValue(e.target.value)}
                                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-green-500"
                                  placeholder="กรอกตำแหน่งที่ตั้ง..."
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateLocation(result.id)}
                                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                >
                                  บันทึก
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingLocation(null);
                                    setLocationValue('');
                                  }}
                                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                {result.supplier_location || result.supplier_location_in_db ? (
                                  <p className="text-xs text-gray-500">
                                    📍 {result.supplier_location || result.supplier_location_in_db}
                                    {!result.supplier_location && result.supplier_location_in_db && (
                                      <span className="text-gray-400 ml-1">(จาก Supplier)</span>
                                    )}
                                  </p>
                                ) : (
                                  <p className="text-xs text-red-500">⚠️ ไม่มีตำแหน่งที่ตั้ง</p>
                                )}
                                {isAdmin && result.status === 'pending' && (
                                  <button
                                    onClick={() => {
                                      setEditingLocation(result.id);
                                      setLocationValue(result.supplier_location || result.supplier_location_in_db || '');
                                    }}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                    title="แก้ไขตำแหน่งที่ตั้ง (จะใช้ร่วมกันกับ Supplier เดียวกัน)"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                            {result.supplier_phone && (
                              <p className="text-xs text-gray-500">📞 {result.supplier_phone}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Price */}
                        {result.price ? (
                          <p className="text-xl font-bold text-green-600 mb-2">฿{result.price.toLocaleString()}</p>
                        ) : (
                          <p className="text-sm text-gray-500 mb-2">💰 ไม่มีราคา</p>
                        )}
                        
                        {/* Size */}
                        {result.size && (
                          <p className="text-sm text-gray-600 mb-2">📏 Size: {result.size}</p>
                        )}
                        
                        {/* Confidence */}
                        {result.confidence && (
                          <p className="text-xs text-gray-500 mb-3">
                            🎯 Confidence: {(result.confidence * 100).toFixed(0)}%
                          </p>
                        )}
                        
                        {/* Admin Actions */}
                        {isAdmin && result.status === 'pending' && (
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => handleApproveResult(result.id)}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectResult(result.id)}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                        
                        {/* Approved Info */}
                        {result.status === 'approved' && result.approved_at && (
                          <p className="text-xs text-green-600 mt-2">
                            ✅ Approve แล้ว: {new Date(result.approved_at).toLocaleString('th-TH')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">📝 System Logs</h2>
                  <button
                    onClick={() => setLogs([])}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    ล้าง Logs
                  </button>
                </div>
                {logs.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">ยังไม่มี logs</p>
                    <p className="text-sm text-gray-500 mt-2">Logs จะแสดงเมื่อมีการทำงาน (scrape, approve, reject)</p>
                  </div>
                ) : (
                  <div className="bg-gray-900 rounded-xl shadow-sm p-4 sm:p-6 font-mono text-sm">
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                      {logs.map((log, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded ${
                            log.includes('✅') ? 'bg-green-900 text-green-300' :
                            log.includes('❌') ? 'bg-red-900 text-red-300' :
                            log.includes('🚀') ? 'bg-blue-900 text-blue-300' :
                            log.includes('⏱️') ? 'bg-yellow-900 text-yellow-300' :
                            'bg-gray-800 text-gray-300'
                          }`}
                        >
                          {log}
                        </div>
                      ))}
                    </div>
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

