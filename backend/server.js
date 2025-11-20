const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const { db, pool } = require('./database');
const aiService = require('./services/aiService');
const adminAuth = require('./services/adminAuth');
const { requireAdmin, optionalAdmin } = require('./middleware/adminAuth');
const agentService = require('./services/agentService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true
}));
app.use(morgan('combined'));
// เพิ่ม body size limit สำหรับรองรับ base64 image (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Database connection will be handled by database.js

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Plant Price API is running',
    timestamp: new Date().toISOString()
  });
});

// Add supplier endpoint
app.post('/api/suppliers', async (req, res) => {
  try {
    const { name, location, phone, website, description, specialties, businessHours, paymentMethods } = req.body;
    
    const supplierId = `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      INSERT INTO suppliers (id, name, location, phone, website, description, specialties, business_hours, payment_methods, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      supplierId,
      name,
      location,
      phone || null,
      website || null,
      description || null,
      JSON.stringify(specialties),
      businessHours || null,
      JSON.stringify(paymentMethods)
    ]);
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'เพิ่มข้อมูลร้านค้าสำเร็จ'
    });
  } catch (error) {
    console.error('Error adding supplier:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลร้านค้า'
    });
  }
});

// Add plant-supplier connection
app.post('/api/plant-suppliers', async (req, res) => {
  try {
    const { plantId, supplierId, price, size, stockQuantity, minOrderQuantity, deliveryAvailable, deliveryCost, notes } = req.body;
    
    const connectionId = `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      INSERT INTO plant_suppliers (id, plant_id, supplier_id, price, size, stock_quantity, min_order_quantity, delivery_available, delivery_cost, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      connectionId,
      plantId,
      supplierId,
      price,
      size || null,
      stockQuantity || 0,
      minOrderQuantity || 1,
      deliveryAvailable || false,
      deliveryCost || 0,
      notes || null
    ]);
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'เพิ่มการเชื่อมต่อต้นไม้-ร้านค้าสำเร็จ'
    });
  } catch (error) {
    console.error('Error adding plant-supplier connection:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการเพิ่มการเชื่อมต่อ'
    });
  }
});

// Get plant-supplier connections
app.get('/api/plant-suppliers', async (req, res) => {
  try {
    const { plantId, supplierId } = req.query;
    
    let query = `
      SELECT 
        ps.*,
        p.name as plant_name,
        p.scientific_name as plant_scientific_name,
        p.category as plant_category,
        s.name as supplier_name,
        s.location as supplier_location,
        s.phone as supplier_phone
      FROM plant_suppliers ps
      JOIN plants p ON ps.plant_id = p.id
      JOIN suppliers s ON ps.supplier_id = s.id
      WHERE ps.is_active = true
    `;
    
    const params = [];
    if (plantId) {
      query += ` AND ps.plant_id = $${params.length + 1}`;
      params.push(plantId);
    }
    if (supplierId) {
      query += ` AND ps.supplier_id = $${params.length + 1}`;
      params.push(supplierId);
    }
    
    query += ` ORDER BY ps.price ASC`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      message: 'ดึงข้อมูลการเชื่อมต่อสำเร็จ'
    });
  } catch (error) {
    console.error('Error getting plant-supplier connections:', error);
    res.status(500).json({
      success: false,
      data: [],
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการเชื่อมต่อ'
    });
  }
});

// Get all suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    // ตรวจสอบว่าตาราง suppliers มีอยู่หรือไม่
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'suppliers'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('⚠️ ตาราง suppliers ไม่มีอยู่ กำลังสร้าง...');
      // สร้างตารางอัตโนมัติ
      await initializeDatabase();
    }
    
    const query = `
      SELECT id, name, location, phone, website, description, 
             specialties, business_hours, payment_methods, created_at
      FROM suppliers
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    const suppliers = result.rows.map(row => {
      let specialties = [];
      let paymentMethods = [];
      
      // Handle specialties - check if it's valid JSON
      if (row.specialties && row.specialties.trim() !== '') {
        try {
          // Check if it's already an array or object
          if (typeof row.specialties === 'string') {
            if (row.specialties.startsWith('[') || row.specialties.startsWith('{')) {
              specialties = JSON.parse(row.specialties);
            } else {
              // If it's a comma-separated string, convert to array
              specialties = row.specialties.split(',').map(s => s.trim()).filter(s => s);
            }
          } else {
            specialties = row.specialties;
          }
        } catch (e) {
          console.error('Error parsing specialties:', e);
          // Fallback: treat as comma-separated string
          specialties = row.specialties.split(',').map(s => s.trim()).filter(s => s);
        }
      } else {
        specialties = [];
      }
      
      // Handle payment methods - check if it's valid JSON
      if (row.payment_methods && row.payment_methods.trim() !== '') {
        try {
          // Check if it's already an array or object
          if (typeof row.payment_methods === 'string') {
            if (row.payment_methods.startsWith('[') || row.payment_methods.startsWith('{')) {
              paymentMethods = JSON.parse(row.payment_methods);
            } else {
              // If it's a comma-separated string, convert to array
              paymentMethods = row.payment_methods.split(',').map(s => s.trim()).filter(s => s);
            }
          } else {
            paymentMethods = row.payment_methods;
          }
        } catch (e) {
          console.error('Error parsing paymentMethods:', e);
          // Fallback: treat as comma-separated string
          paymentMethods = row.payment_methods.split(',').map(s => s.trim()).filter(s => s);
        }
      } else {
        paymentMethods = [];
      }
      
      return {
        ...row,
        specialties,
        paymentMethods
      };
    });
    
    res.json({
      success: true,
      data: suppliers,
      message: 'ดึงข้อมูลร้านค้าสำเร็จ'
    });
  } catch (error) {
    console.error('Error getting suppliers:', error);
    res.status(500).json({
      success: false,
      data: [],
      message: `เกิดข้อผิดพลาดในการดึงข้อมูลร้านค้า: ${error.message}`
    });
  }
});

// 📊 Statistics Endpoint - ดึงข้อมูลสถิติ
app.get('/api/statistics', async (req, res) => {
  try {
    // ตรวจสอบว่าตารางมีอยู่หรือไม่
    const plantsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'plants'
      );
    `);
    const suppliersTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'suppliers'
      );
    `);
    
    if (!plantsTableCheck.rows[0].exists || !suppliersTableCheck.rows[0].exists) {
      console.log('⚠️ ตารางบางตารางไม่มี กำลังสร้าง...');
      await initializeDatabase();
    }
    
    let plants = [];
    let suppliers = [];
    
    try {
      plants = await db.getPlants();
    } catch (error) {
      console.error('Error getting plants:', error);
      // ถ้า error ให้ใช้ array ว่าง
    }
    
    try {
      suppliers = await db.getAllSuppliers();
    } catch (error) {
      console.error('Error getting suppliers:', error);
      // ถ้า error ให้ใช้ array ว่าง
    }
    
    // นับจำนวนต้นไม้ตามหมวดหมู่
    const categoryCount = {};
    const plantTypeCount = {};
    
    plants.forEach(plant => {
      if (plant.category) {
        categoryCount[plant.category] = (categoryCount[plant.category] || 0) + 1;
      }
      if (plant.plantType) {
        plantTypeCount[plant.plantType] = (plantTypeCount[plant.plantType] || 0) + 1;
      }
    });
    
    res.json({
      success: true,
      data: {
        totalPlants: plants.length,
        totalSuppliers: suppliers.length,
        categoryCount,
        plantTypeCount
      },
      message: 'ดึงข้อมูลสถิติสำเร็จ'
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      data: {
        totalPlants: 0,
        totalSuppliers: 0,
        categoryCount: {},
        plantTypeCount: {}
      },
      message: `เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ: ${error.message}`
    });
  }
});

// Alias for compatibility
app.get('/statistics', async (req, res) => {
  try {
    const plants = await db.getPlants();
    const suppliers = await db.getAllSuppliers();
    
    // นับจำนวนต้นไม้ตามหมวดหมู่
    const categoryCount = {};
    const plantTypeCount = {};
    
    plants.forEach(plant => {
      categoryCount[plant.category] = (categoryCount[plant.category] || 0) + 1;
      plantTypeCount[plant.plant_type] = (plantTypeCount[plant.plant_type] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        totalPlants: plants.length,
        totalSuppliers: suppliers.length,
        categoryCount,
        plantTypeCount
      },
      message: 'ดึงข้อมูลสถิติสำเร็จ'
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      data: {
        totalPlants: 0,
        totalSuppliers: 0,
        categoryCount: {},
        plantTypeCount: {}
      },
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ'
    });
  }
});

// Get all plants
app.get('/api/plants', async (req, res) => {
  try {
    // ตรวจสอบว่าตาราง plants และ plant_suppliers มีอยู่หรือไม่
    const plantsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'plants'
      );
    `);
    const plantSuppliersTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'plant_suppliers'
      );
    `);
    
    if (!plantsTableCheck.rows[0].exists || !plantSuppliersTableCheck.rows[0].exists) {
      console.log('⚠️ ตารางบางตารางไม่มี กำลังสร้าง...');
      // สร้างตารางอัตโนมัติ
      await initializeDatabase();
    }
    
    const plants = await db.getPlants();
    res.json({
      success: true,
      data: plants,
      message: 'ดึงข้อมูลต้นไม้สำเร็จ'
    });
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({
      success: false,
      data: [],
      message: `เกิดข้อผิดพลาดในการดึงข้อมูลต้นไม้: ${error.message}`
    });
  }
});

// Get specific plant by ID
app.get('/api/plants/:id', async (req, res) => {
  try {
    const plant = await db.getPlantById(req.params.id);
    if (!plant) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'ไม่พบข้อมูลต้นไม้'
      });
    }
    
    res.json({
      success: true,
      data: plant,
      message: 'ดึงข้อมูลต้นไม้สำเร็จ'
    });
  } catch (error) {
    console.error('Error fetching plant:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลต้นไม้'
    });
  }
});

// Add supplier to plant
app.post('/api/plants/:plantId/suppliers', async (req, res) => {
  try {
    const { plantId } = req.params;
    const { name, price, phone, location, size } = req.body;
    
    // Check if plant exists
    const plant = await db.getPlantById(plantId);
    if (!plant) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'ไม่พบข้อมูลต้นไม้'
      });
    }
    
    const newSupplier = {
      id: `supplier_${Date.now()}`,
      name,
      price: Number(price),
      phone,
      location,
      size
    };
    
    const supplier = await db.addSupplier(plantId, newSupplier);
    
    res.json({
      success: true,
      data: supplier,
      message: 'เพิ่มข้อมูลผู้จัดจำหน่ายสำเร็จ'
    });
  } catch (error) {
    console.error('Error adding supplier:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลผู้จัดจำหน่าย'
    });
  }
});

// Update supplier price
app.put('/api/plants/:plantId/suppliers/:supplierId/price', async (req, res) => {
  try {
    const { plantId, supplierId } = req.params;
    const { price } = req.body;
    
    const supplier = await db.updateSupplierPrice(plantId, supplierId, Number(price));
    if (!supplier) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'ไม่พบข้อมูลผู้จัดจำหน่าย'
      });
    }
    
    res.json({
      success: true,
      data: supplier,
      message: 'อัปเดตราคาสำเร็จ'
    });
  } catch (error) {
    console.error('Error updating supplier price:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการอัปเดตราคา'
    });
  }
});

// Delete supplier
app.delete('/api/plants/:plantId/suppliers/:supplierId', async (req, res) => {
  try {
    const { plantId, supplierId } = req.params;
    
    const supplier = await db.deleteSupplier(plantId, supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'ไม่พบข้อมูลผู้จัดจำหน่าย'
      });
    }
    
    res.json({
      success: true,
      data: supplier,
      message: 'ลบข้อมูลผู้จัดจำหน่ายสำเร็จ'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการลบข้อมูลผู้จัดจำหน่าย'
    });
  }
});

// 🤖 AI Endpoints

// AI Validation - ตรวจสอบข้อมูลด้วย AI
app.post('/api/ai/validate', async (req, res) => {
  try {
    const { data, type } = req.body;
    
    const validation = await aiService.validateDataWithAI(data, type);
    
    res.json({
      success: true,
      data: validation,
      message: 'ตรวจสอบข้อมูลสำเร็จ'
    });
  } catch (error) {
    console.error('AI Validation Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล'
    });
  }
});

// AI Price Analysis - วิเคราะห์ราคาด้วย AI
app.post('/api/ai/analyze-price', async (req, res) => {
  try {
    const { plantName, price, category, historicalPrices } = req.body;
    
    // ใช้ AI วิเคราะห์ราคา
    const aiAnalysis = await aiService.analyzePrice(plantName, price, category);
    
    // ใช้ Smart Pricing
    const optimalPrice = aiService.suggestOptimalPrice(plantName, category, price, historicalPrices || []);
    
    res.json({
      success: true,
      data: {
        aiAnalysis,
        optimalPrice,
        timestamp: new Date().toISOString()
      },
      message: 'วิเคราะห์ราคาสำเร็จ'
    });
  } catch (error) {
    console.error('AI Price Analysis Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการวิเคราะห์ราคา'
    });
  }
});

// AI Business Insights - ดูข้อมูลเชิงลึก
app.get('/api/ai/insights', async (req, res) => {
  try {
    const plants = await db.getPlants();
    const suppliers = await db.getAllSuppliers();
    const orders = await db.getOrders();
    
    const insights = aiService.generateInsights(plants, suppliers, orders);
    
    res.json({
      success: true,
      data: insights,
      message: 'ดึงข้อมูลเชิงลึกสำเร็จ'
    });
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลเชิงลึก'
    });
  }
});

// 📸 AI Bill Scanner - สแกนใบเสร็จด้วย ChatGPT Vision (ปลอดภัย - API Key อยู่บน Backend)
app.post('/api/ai/scan-bill', async (req, res) => {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ไม่พบรูปภาพที่ส่งมา'
      });
    }

    // เรียก AI Service เพื่อสแกนใบเสร็จ (API Key อยู่บน Backend - ปลอดภัย)
    const scanResult = await aiService.scanBill(base64Image);

    res.json({
      success: true,
      data: scanResult,
      message: 'สแกนใบเสร็จสำเร็จ'
    });

  } catch (error) {
    console.error('❌ AI Bill Scan Error:', error);
    
    // ตรวจสอบ error type เพื่อให้ error message ชัดเจนขึ้น
    let errorMessage = 'เกิดข้อผิดพลาดในการสแกนใบเสร็จ';
    
    if (error.message) {
      if (error.message.includes('API key')) {
        errorMessage = '⚠️ ยังไม่ได้ตั้งค่า OPENAI_API_KEY ใน Railway. กรุณาเพิ่ม API Key ใน Railway Dashboard → Variables';
      } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
        errorMessage = '⚠️ OpenAI API Key ไม่ถูกต้อง. กรุณาตรวจสอบ API Key ใน Railway';
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorMessage = '⚠️ เกิน Rate Limit ของ OpenAI API. กรุณารอสักครู่แล้วลองใหม่';
      } else if (error.message.includes('timeout')) {
        errorMessage = '⚠️ การเชื่อมต่อกับ OpenAI API หมดเวลา. กรุณาลองใหม่อีกครั้ง';
      } else if (error.message.includes('PayloadTooLargeError') || error.message.includes('entity too large')) {
        errorMessage = '⚠️ รูปภาพมีขนาดใหญ่เกินไป. กรุณาลองลดขนาดรูปหรืออัพโหลดรูปที่มีขนาดเล็กกว่า (แนะนำ: < 5MB)';
      } else {
        errorMessage = `เกิดข้อผิดพลาด: ${error.message}`;
      }
    }
    
    res.status(500).json({
      success: false,
      data: null,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json({
      success: true,
      data: orders,
      message: 'ดึงข้อมูลคำสั่งซื้อสำเร็จ'
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      data: [],
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ'
    });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { orderNumber, totalAmount, items } = req.body;
    
    const orderId = `order_${Date.now()}`;
    const order = await db.createOrder({
      id: orderId,
      orderNumber,
      totalAmount,
      status: 'pending'
    });
    
    // Add order items
    for (const item of items) {
      await db.addOrderItem(orderId, {
        id: `item_${Date.now()}_${Math.random()}`,
        plantId: item.plantId,
        supplierId: item.supplierId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      });
    }
    
    res.json({
      success: true,
      data: order,
      message: 'สร้างคำสั่งซื้อสำเร็จ'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ'
    });
  }
});

// Locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await db.getLocations();
    res.json({
      success: true,
      data: locations,
      message: 'ดึงข้อมูลที่ตั้งสำเร็จ'
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      data: [],
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลที่ตั้ง'
    });
  }
});

// Add new plant
app.post('/api/plants', async (req, res) => {
  try {
    const { name, scientificName, category, plantType, measurementType, description } = req.body;
    
    const plantId = `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const plant = await db.createPlant({
      id: plantId,
      name,
      scientificName,
      category,
      plantType,
      measurementType,
      description
    });
    
    res.json({
      success: true,
      data: plant,
      message: 'เพิ่มข้อมูลต้นไม้สำเร็จ'
    });
  } catch (error) {
    console.error('Error creating plant:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลต้นไม้'
    });
  }
});

// Add supplier to plant
app.post('/api/plants/:plantId/suppliers', async (req, res) => {
  try {
    const { plantId } = req.params;
    const { name, price, phone, location, size } = req.body;
    
    const supplierId = `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const supplier = await db.addSupplier(plantId, {
      id: supplierId,
      name,
      price: Number(price),
      phone,
      location,
      size
    });
    
    res.json({
      success: true,
      data: supplier,
      message: 'เพิ่มข้อมูลผู้จัดจำหน่ายสำเร็จ'
    });
  } catch (error) {
    console.error('Error adding supplier:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลผู้จัดจำหน่าย'
    });
  }
});

// Bulk import plants from CSV
app.post('/api/plants/bulk-import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        success: 0,
        failed: 0,
        errors: ['ไม่พบไฟล์ที่อัปโหลด']
      });
    }

    const fs = require('fs');
    const results = [];
    const errors = [];
    let successCount = 0;
    let failedCount = 0;

    // Read and parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        try {
          // Process each plant
          for (const plantData of results) {
            try {
              // Validate required fields
              if (!plantData.name || !plantData.category || !plantData.plantType || !plantData.measurementType) {
                errors.push(`ข้อมูลไม่ครบถ้วน: ${plantData.name || 'ไม่ระบุชื่อ'}`);
                failedCount++;
                continue;
              }

              const plantId = `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              const plant = await db.createPlant({
                id: plantId,
                name: plantData.name.trim(),
                scientificName: plantData.scientificName ? plantData.scientificName.trim() : '',
                category: plantData.category.trim(),
                plantType: plantData.plantType.trim(),
                measurementType: plantData.measurementType.trim(),
                description: plantData.description ? plantData.description.trim() : ''
              });

              successCount++;
            } catch (error) {
              errors.push(`ข้อผิดพลาดในการเพิ่ม ${plantData.name}: ${error.message}`);
              failedCount++;
            }
          }

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            success: true,
            success: successCount,
            failed: failedCount,
            errors: errors
          });
        } catch (error) {
          console.error('Error processing CSV:', error);
          res.status(500).json({
            success: false,
            success: 0,
            failed: 0,
            errors: ['เกิดข้อผิดพลาดในการประมวลผลไฟล์']
          });
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        res.status(500).json({
          success: false,
          success: 0,
          failed: 0,
          errors: ['เกิดข้อผิดพลาดในการอ่านไฟล์ CSV']
        });
      });
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({
      success: false,
      success: 0,
      failed: 0,
      errors: ['เกิดข้อผิดพลาดในการนำเข้าข้อมูล']
    });
  }
});

// 📄 Bills API - บันทึกใบเสร็จและแยกข้อมูลอัตโนมัติ
app.post('/api/bills', async (req, res) => {
  try {
    const { supplierName, supplierPhone, supplierLocation, billDate, totalAmount, items, imageUrl } = req.body;

    // Validate required fields
    if (!supplierName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ข้อมูลไม่ครบถ้วน: ต้องมีชื่อร้านค้าและรายการสินค้า'
      });
    }

    // ตรวจสอบว่าตารางมีอยู่หรือไม่
    const billsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bills'
      );
    `);
    
    if (!billsTableCheck.rows[0].exists) {
      console.log('⚠️ ตาราง bills ยังไม่มี กำลังสร้าง...');
      await initializeDatabase();
    }

    // 1. หาหรือเพิ่ม Supplier
    console.log(`🔍 กำลังหาหรือเพิ่มร้านค้า: ${supplierName}`);
    const supplier = await db.findOrCreateSupplier({
      name: supplierName,
      location: supplierLocation || '',
      phone: supplierPhone || null
    });
    console.log(`✅ ร้านค้า: ${supplier.name} (ID: ${supplier.id})`);

    // 2. บันทึกใบเสร็จ
    const bill = await db.createBill({
      supplierId: supplier.id,
      supplierName: supplierName,
      supplierPhone: supplierPhone || null,
      supplierLocation: supplierLocation || null,
      billDate: billDate ? new Date(billDate) : new Date(),
      totalAmount: parseFloat(totalAmount) || 0,
      imageUrl: imageUrl || null,
      notes: null
    });
    console.log(`✅ บันทึกใบเสร็จสำเร็จ (Bill ID: ${bill.id})`);

    // 3. ประมวลผลรายการแต่ละรายการ
    const processedItems = [];
    const errors = [];

    for (const item of items) {
      try {
        const plantName = item.plantName || item.name;
        const itemPrice = parseFloat(item.price) || parseFloat(item.unitPrice) || 0;
        const itemQuantity = parseInt(item.quantity) || 1;
        const itemSize = item.size || null;
        
        if (!plantName) {
          errors.push(`รายการไม่มีชื่อต้นไม้: ${JSON.stringify(item)}`);
          continue;
        }

        // ข้ามรายการบริการ/ค่าแรง ไม่ต้องสร้างต้นไม้และไม่อัปเดตราคา
        const serviceKeywords = ['ค่าแรง', 'ค่าขน', 'ค่าขนส่ง', 'ค่าจัดส่ง', 'ค่าบริการ'];
        const isService = (itemSize && itemSize.trim() === 'งาน') || serviceKeywords.some(k => plantName.includes(k));
        if (isService) {
          await db.addBillItem(bill.id, {
            plantId: null,
            plantName: plantName,
            quantity: itemQuantity,
            price: itemPrice,
            totalPrice: itemPrice * itemQuantity,
            size: itemSize,
            notes: 'SERVICE_ITEM'
          });
          processedItems.push({
            plantName,
            plantId: null,
            quantity: itemQuantity,
            price: itemPrice,
            totalPrice: itemPrice * itemQuantity
          });
          continue;
        }

        // 3.1 หาหรือเพิ่ม Plant
        console.log(`🔍 กำลังหาหรือเพิ่มต้นไม้: ${plantName}`);
        const plant = await db.findOrCreatePlant({
          name: plantName,
          category: item.category || 'อื่นๆ',
          plantType: item.plantType || 'อื่นๆ',
          measurementType: item.measurementType || 'ต้น',
          description: item.description || null
        });
        console.log(`✅ ต้นไม้: ${plant.name} (ID: ${plant.id})`);

        // 3.2 บันทึกรายการใบเสร็จ
        const billItem = await db.addBillItem(bill.id, {
          plantId: plant.id,
          plantName: plantName,
          quantity: itemQuantity,
          price: itemPrice,
          totalPrice: itemPrice * itemQuantity,
          size: itemSize,
          notes: item.notes || null
        });
        console.log(`✅ บันทึกรายการ: ${plantName} x${itemQuantity} = ${itemPrice * itemQuantity} บาท`);

        // 3.3 อัพเดทหรือเพิ่ม plant_supplier (ราคา)
        await db.upsertPlantSupplier(plant.id, supplier.id, {
          price: itemPrice,
          size: itemSize
        });
        console.log(`✅ อัพเดทราคา: ${plant.name} ที่ ${supplier.name} = ${itemPrice} บาท`);

        processedItems.push({
          plantName,
          plantId: plant.id,
          quantity: itemQuantity,
          price: itemPrice,
          totalPrice: itemPrice * itemQuantity
        });

      } catch (itemError) {
        console.error(`❌ ข้อผิดพลาดในการประมวลผลรายการ: ${item.plantName || item.name}`, itemError);
        errors.push(`ไม่สามารถประมวลผล ${item.plantName || item.name}: ${itemError.message}`);
      }
    }

    // สรุปผล
    const summary = {
      billId: bill.id,
      supplierName: supplier.name,
      supplierId: supplier.id,
      totalAmount: bill.total_amount,
      itemsProcessed: processedItems.length,
      itemsTotal: items.length,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log(`📊 สรุปการบันทึกใบเสร็จ: ${processedItems.length}/${items.length} รายการสำเร็จ`);

    res.json({
      success: true,
      data: {
        bill: {
          id: bill.id,
          supplierName: supplier.name,
          supplierId: supplier.id,
          billDate: bill.bill_date,
          totalAmount: bill.total_amount
        },
        processedItems,
        summary
      },
      message: `บันทึกใบเสร็จสำเร็จ: ${processedItems.length}/${items.length} รายการ`
    });

  } catch (error) {
    console.error('❌ Error saving bill:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: `เกิดข้อผิดพลาดในการบันทึกใบเสร็จ: ${error.message}`
    });
  }
});

// 🔐 Admin Authentication Endpoints
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    const result = adminAuth.login(password);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          token: result.token,
          isAdmin: true
        },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        data: null,
        message: result.message || 'Invalid password'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการ login'
    });
  }
});

app.post('/api/admin/logout', async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '') || 
                  req.headers['x-admin-token'] || 
                  req.body.token;
    const result = adminAuth.logout(token);
    res.json({
      success: result.success,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการ logout'
    });
  }
});

app.get('/api/admin/check', optionalAdmin, (req, res) => {
  res.json({
    success: true,
    data: {
      isAdmin: req.admin || false
    }
  });
});

// 🤖 AI Agent Endpoints

// Get all websites (public read, admin can manage)
app.get('/api/agents/websites', optionalAdmin, async (req, res) => {
  try {
    const query = `
      SELECT id, name, url, description, enabled, schedule, last_scraped, created_at, updated_at
      FROM websites
      WHERE enabled = true OR $1 = true
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [req.admin || false]);
    res.json({
      success: true,
      data: result.rows,
      message: 'ดึงข้อมูลเว็บไซต์สำเร็จ'
    });
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({
      success: false,
      data: [],
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลเว็บไซต์'
    });
  }
});

// Add website (admin only)
app.post('/api/agents/websites', requireAdmin, async (req, res) => {
  try {
    const { name, url, description, schedule } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'กรุณาระบุชื่อและ URL ของเว็บไซต์'
      });
    }

    const websiteId = `website_${Date.now()}_${uuidv4()}`;
    const query = `
      INSERT INTO websites (id, name, url, description, schedule, enabled, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [
      websiteId,
      name,
      url,
      description || null,
      schedule || 'manual',
      true
    ]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'เพิ่มเว็บไซต์สำเร็จ'
    });
  } catch (error) {
    console.error('Error adding website:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการเพิ่มเว็บไซต์'
    });
  }
});

// Update website (admin only)
app.put('/api/agents/websites/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, description, schedule, enabled } = req.body;

    const query = `
      UPDATE websites
      SET name = COALESCE($1, name),
          url = COALESCE($2, url),
          description = COALESCE($3, description),
          schedule = COALESCE($4, schedule),
          enabled = COALESCE($5, enabled),
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [name, url, description, schedule, enabled, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'ไม่พบเว็บไซต์ที่ต้องการ'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'อัพเดทเว็บไซต์สำเร็จ'
    });
  } catch (error) {
    console.error('Error updating website:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'เกิดข้อผิดพลาดในการอัพเดทเว็บไซต์'
    });
  }
});

// Delete website (admin only)
app.delete('/api/agents/websites/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM websites WHERE id = $1', [id]);
    res.json({
      success: true,
      message: 'ลบเว็บไซต์สำเร็จ'
    });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบเว็บไซต์'
    });
  }
});

// Analyze pasted text from Facebook (admin only)
app.post('/api/agents/analyze-text', requireAdmin, async (req, res) => {
  try {
    const { text, sourceUrl } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'กรุณาระบุข้อความที่ต้องการวิเคราะห์'
      });
    }

    // Start analysis asynchronously (don't wait)
    agentService.analyzePastedText(text, sourceUrl || null)
      .then(result => {
        console.log(`✅ Text analysis completed`);
      })
      .catch(error => {
        console.error(`❌ Text analysis failed:`, error);
      });

    res.json({
      success: true,
      data: {
        message: 'เริ่มการวิเคราะห์ข้อความแล้ว',
        textLength: text.length
      },
      message: 'กำลังวิเคราะห์ข้อความด้วย AI...'
    });
  } catch (error) {
    console.error('Error starting text analysis:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: `เกิดข้อผิดพลาดในการวิเคราะห์: ${error.message}`
    });
  }
});

// Trigger scraping (admin only)
app.post('/api/agents/scrape', requireAdmin, async (req, res) => {
  try {
    const { websiteId, url } = req.body;

    if (!websiteId && !url) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'กรุณาระบุ websiteId หรือ url'
      });
    }

    // Get website info if websiteId provided
    let websiteUrl = url;
    let websiteName = 'Manual Scrape';
    if (websiteId) {
      const websiteResult = await pool.query('SELECT url, name FROM websites WHERE id = $1', [websiteId]);
      if (websiteResult.rows.length > 0) {
        websiteUrl = websiteResult.rows[0].url;
        websiteName = websiteResult.rows[0].name;
      }
    }

    if (!websiteUrl) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ไม่พบ URL'
      });
    }

    // Start scraping asynchronously (don't wait)
    agentService.scrapeWebsite(websiteId || null, websiteUrl)
      .then(result => {
        console.log(`✅ Scraping completed for ${websiteUrl}`);
        // Update last_scraped if websiteId provided
        if (websiteId) {
          pool.query('UPDATE websites SET last_scraped = NOW() WHERE id = $1', [websiteId]);
        }
      })
      .catch(error => {
        console.error(`❌ Scraping failed for ${websiteUrl}:`, error);
      });

    res.json({
      success: true,
      data: {
        message: 'เริ่มการ scrape แล้ว',
        website: websiteName,
        url: websiteUrl
      },
      message: 'กำลัง scrape ข้อมูล...'
    });
  } catch (error) {
    console.error('Error starting scrape:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: `เกิดข้อผิดพลาดในการ scrape: ${error.message}`
    });
  }
});

// Get scraping jobs (public read, admin can see all)
app.get('/api/agents/jobs', optionalAdmin, async (req, res) => {
  try {
    const { limit = 50, status } = req.query;
    let query = `
      SELECT id, website_id, url, status, started_at, completed_at, error_message, created_at
      FROM scraping_jobs
    `;
    const params = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows,
      message: 'ดึงข้อมูล scraping jobs สำเร็จ'
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      data: [],
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล scraping jobs'
    });
  }
});

// Get scraping results (public read, admin can see all, others see approved only)
app.get('/api/agents/results', optionalAdmin, async (req, res) => {
  try {
    const { jobId, limit = 100, status } = req.query;
    const isAdmin = req.admin || false;
    
    let query = `
      SELECT sr.id, sr.job_id, sr.plant_id, sr.supplier_id, sr.plant_name, sr.price, sr.size, 
             sr.confidence, sr.status, sr.created_at, sr.image_url,
             sr.supplier_name, sr.supplier_phone, sr.supplier_location,
             sr.approved_by, sr.approved_at,
             p.name as plant_name_in_db,
             s.name as supplier_name_in_db,
             s.location as supplier_location_in_db
      FROM scraping_results sr
      LEFT JOIN plants p ON sr.plant_id = p.id
      LEFT JOIN suppliers s ON sr.supplier_id = s.id OR (sr.supplier_name IS NOT NULL AND LOWER(s.name) = LOWER(sr.supplier_name))
    `;
    const params = [];
    const conditions = [];
    
    // Always filter out rejected results
    conditions.push(`sr.status != 'rejected'`);
    
    if (jobId) {
      conditions.push(`sr.job_id = $${params.length + 1}`);
      params.push(jobId);
    }
    
    if (status) {
      conditions.push(`sr.status = $${params.length + 1}`);
      params.push(status);
    } else if (!isAdmin) {
      // Non-admin users only see approved results
      conditions.push(`sr.status = 'approved'`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY sr.created_at DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    
    // Merge location: use supplier location if result doesn't have one
    const processedRows = result.rows.map(row => ({
      ...row,
      supplier_location: row.supplier_location || row.supplier_location_in_db || null
    }));
    
    res.json({
      success: true,
      data: processedRows,
      message: 'ดึงข้อมูล scraping results สำเร็จ'
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      data: [],
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล scraping results'
    });
  }
});

// Approve scraping result (admin only) - Save to plants/suppliers
app.post('/api/agents/results/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin?.id || 'admin';
    
    // Get scraping result
    const resultQuery = await pool.query(`
      SELECT * FROM scraping_results WHERE id = $1 AND status = 'pending'
    `, [id]);
    
    if (resultQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผลลัพธ์ที่ต้องการ approve หรือ approve แล้ว'
      });
    }
    
    const result = resultQuery.rows[0];
    const rawData = JSON.parse(result.raw_data || '{}');
    
    // 1. Find or create supplier
    // First, check if supplier already exists with location
    let existingSupplier = null;
    if (result.supplier_name) {
      const findSupplierQuery = `SELECT id, location FROM suppliers WHERE LOWER(name) = LOWER($1) LIMIT 1`;
      const findSupplierResult = await pool.query(findSupplierQuery, [result.supplier_name]);
      if (findSupplierResult.rows.length > 0) {
        existingSupplier = findSupplierResult.rows[0];
      }
    }
    
    // Use location from result, or existing supplier, or empty
    const locationToUse = result.supplier_location?.trim() || existingSupplier?.location || '';
    
    // Validate: location is required for route calculation
    if (!locationToUse || locationToUse.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถ Approve ได้: กรุณาเพิ่มตำแหน่งที่ตั้ง (Location) ของ Supplier ก่อน\n\nตำแหน่งที่ตั้งจำเป็นสำหรับการคำนวณเส้นทาง\n\n💡 ถ้า Supplier นี้มีอยู่แล้ว ให้เพิ่ม Location ที่ Supplier ครั้งเดียว แล้ว Approve อื่นๆ จะใช้ Location เดิมได้'
      });
    }
    
    let supplier = null;
    if (result.supplier_name || result.supplier_phone || locationToUse) {
      supplier = await db.findOrCreateSupplier({
        name: result.supplier_name || 'ไม่ระบุ',
        location: locationToUse, // Use location from result or existing supplier
        phone: result.supplier_phone || null,
        phoneNumbers: result.supplier_phone ? [result.supplier_phone] : [],
        description: `Approved from scraping result ${id}`,
        website: rawData.supplier?.website || null
      });
    }
    
    // 2. Find or create plant
    const plant = await db.findOrCreatePlant({
      name: result.plant_name || 'ไม่ระบุชื่อ',
      category: rawData.category || 'ไม้ประดับ',
      plantType: rawData.category || 'ไม้ประดับ',
      measurementType: result.size ? 'ขนาดกระถาง' : 'ความสูง',
      description: rawData.description || null,
      scientificName: rawData.scientificName || '',
      imageUrl: result.image_url || null
    });
    
    // 3. Create plant-supplier relationship
    if (supplier) {
      await db.upsertPlantSupplier(plant.id, supplier.id, {
        price: result.price,
        size: result.size || null,
        imageUrl: result.image_url || null
      });
    }
    
    // 4. Update scraping result status
    await pool.query(`
      UPDATE scraping_results 
      SET status = 'approved', 
          plant_id = $1, 
          supplier_id = $2,
          approved_by = $3,
          approved_at = NOW()
      WHERE id = $4
    `, [plant.id, supplier?.id || null, adminId, id]);
    
    res.json({
      success: true,
      message: 'Approve สำเร็จ ข้อมูลถูกบันทึกลงฐานข้อมูลแล้ว',
      data: {
        plantId: plant.id,
        supplierId: supplier?.id,
        plantName: plant.name,
        supplierName: supplier?.name
      }
    });
  } catch (error) {
    console.error('Error approving result:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการ approve'
    });
  }
});

// Update scraping result location (admin only)
// This will update the supplier location so all results from the same supplier can use it
app.put('/api/agents/results/:id/location', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body;
    
    if (!location || location.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุตำแหน่งที่ตั้ง'
      });
    }
    
    // Get the result to find supplier name
    const resultQuery = await pool.query(`
      SELECT supplier_name FROM scraping_results WHERE id = $1 AND status = 'pending'
    `, [id]);
    
    if (resultQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผลลัพธ์ที่ต้องการอัพเดท'
      });
    }
    
    const supplierName = resultQuery.rows[0].supplier_name;
    
    // Update supplier location (if supplier exists) and all pending results with same supplier name
    if (supplierName) {
      // Update supplier location (find or create supplier)
      const supplier = await db.findOrCreateSupplier({
        name: supplierName,
        location: location.trim(),
        phone: null,
        phoneNumbers: [],
        description: `Location updated from scraping result ${id}`
      });
      
      // Update all pending results with same supplier name
      await pool.query(`
        UPDATE scraping_results 
        SET supplier_location = $1
        WHERE supplier_name = $2 AND status = 'pending'
      `, [location.trim(), supplierName]);
    } else {
      // If no supplier name, just update this result
      await pool.query(`
        UPDATE scraping_results 
        SET supplier_location = $1
        WHERE id = $2 AND status = 'pending'
      `, [location.trim(), id]);
    }
    
    res.json({
      success: true,
      message: `อัพเดทตำแหน่งที่ตั้งสำเร็จ${supplierName ? ` (อัพเดท Supplier "${supplierName}" และผลลัพธ์ทั้งหมดที่เกี่ยวข้อง)` : ''}`
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเดทตำแหน่งที่ตั้ง'
    });
  }
});

// Reject scraping result (admin only)
app.post('/api/agents/results/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin?.id || 'admin';
    
    await pool.query(`
      UPDATE scraping_results 
      SET status = 'rejected', 
          approved_by = $1,
          approved_at = NOW()
      WHERE id = $2 AND status = 'pending'
    `, [adminId, id]);
    
    res.json({
      success: true,
      message: 'Reject สำเร็จ'
    });
  } catch (error) {
    console.error('Error rejecting result:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการ reject'
    });
  }
});

// 🗺️ Route Optimization Endpoints

// Optimize route for project
app.post('/api/route/optimize', async (req, res) => {
  try {
    const { projectLocation, selectedSuppliers } = req.body;
    
    if (!projectLocation || !selectedSuppliers || selectedSuppliers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: projectLocation and selectedSuppliers (array)'
      });
    }

    const routeOptimizationService = require('./services/routeOptimizationService');
    const result = await routeOptimizationService.optimizeRoute(projectLocation, selectedSuppliers);
    
    res.json({
      success: true,
      data: result,
      message: 'คำนวณเส้นทางสำเร็จ'
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: `เกิดข้อผิดพลาดในการคำนวณเส้นทาง: ${error.message}`
    });
  }
});

// Geocode address
app.post('/api/route/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: address'
      });
    }

    const routeOptimizationService = require('./services/routeOptimizationService');
    const result = await routeOptimizationService.geocodeAddress(address);
    
    res.json({
      success: true,
      data: result,
      message: 'Geocode สำเร็จ'
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: `เกิดข้อผิดพลาดในการ geocode: ${error.message}`
    });
  }
});

// Batch geocode addresses
app.post('/api/route/geocode-batch', async (req, res) => {
  try {
    const { addresses } = req.body;
    
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: addresses (array)'
      });
    }

    const routeOptimizationService = require('./services/routeOptimizationService');
    const results = await routeOptimizationService.geocodeAddresses(addresses);
    
    res.json({
      success: true,
      data: results,
      message: `Geocode สำเร็จ ${results.filter(r => r.success).length}/${results.length} ที่อยู่`
    });
  } catch (error) {
    console.error('Batch geocoding error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: `เกิดข้อผิดพลาดในการ geocode: ${error.message}`
    });
  }
});

// Validate supplier location
app.post('/api/suppliers/validate-location', async (req, res) => {
  try {
    const { location } = req.body;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: location'
      });
    }

    const supplierValidationService = require('./services/supplierValidationService');
    const result = await supplierValidationService.validateSupplierLocation(location);
    
    res.json({
      success: result.isValid,
      data: result,
      message: result.isValid ? 'ที่อยู่ถูกต้อง' : result.error
    });
  } catch (error) {
    console.error('Location validation error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: `เกิดข้อผิดพลาดในการตรวจสอบที่อยู่: ${error.message}`
    });
  }
});

// AI Route Analysis - วิเคราะห์เส้นทางและให้คำแนะนำด้วย AI
app.post('/api/route/analyze', async (req, res) => {
  try {
    const { routeData, orderData } = req.body;
    
    if (!routeData || !orderData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: routeData and orderData'
      });
    }

    const routeOptimizationService = require('./services/routeOptimizationService');
    const analysis = await routeOptimizationService.analyzeRouteWithAI(routeData, orderData);
    
    res.json({
      success: true,
      data: analysis,
      message: 'วิเคราะห์เส้นทางสำเร็จ'
    });
  } catch (error) {
    console.error('Route analysis error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: `เกิดข้อผิดพลาดในการวิเคราะห์เส้นทาง: ${error.message}`
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    data: null,
    message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: 'ไม่พบ API endpoint ที่ต้องการ'
  });
});

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('🔍 กำลังตรวจสอบและสร้างตาราง...');
    
    // สร้างตาราง plants ถ้ายังไม่มี
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plants (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        scientific_name VARCHAR(255),
        category VARCHAR(100),
        plant_type VARCHAR(100),
        measurement_type VARCHAR(100),
        description TEXT,
        image_url TEXT, -- รูปภาพต้นไม้ (URL จาก Facebook หรือแหล่งอื่น)
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_plants_name ON plants(name)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category)');
    // เพิ่มคอลัมน์ image_url ถ้ายังไม่มี
    try {
      await pool.query(`ALTER TABLE plants ADD COLUMN IF NOT EXISTS image_url TEXT`);
    } catch (e) {}
    console.log('✅ ตาราง plants พร้อมใช้งาน');
    
    // สร้างตาราง suppliers ถ้ายังไม่มี
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location TEXT NOT NULL,
        phone VARCHAR(20),
        website VARCHAR(255),
        description TEXT,
        specialties TEXT DEFAULT '[]',
        business_hours VARCHAR(255),
        payment_methods TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_suppliers_location ON suppliers(location)');
    console.log('✅ ตาราง suppliers พร้อมใช้งาน');
    // ขยายความยาวเบอร์โทรรองรับหลายเบอร์
    try {
      await pool.query(`ALTER TABLE suppliers ALTER COLUMN phone TYPE VARCHAR(50)`);
    } catch (e) {}
    // เพิ่มคอลัมน์ phone_numbers (เก็บหลายเบอร์เป็น JSON)
    try {
      await pool.query(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS phone_numbers TEXT DEFAULT '[]'`);
    } catch (e) {}
    // เพิ่มคอลัมน์สำหรับ geocoding (latitude, longitude, formatted_address)
    try {
      await pool.query(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8)`);
      await pool.query(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8)`);
      await pool.query(`ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS formatted_address TEXT`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_suppliers_coords ON suppliers(latitude, longitude)`);
      console.log('✅ เพิ่มคอลัมน์ geocoding (latitude, longitude, formatted_address)');
    } catch (e) {
      console.error('Error adding geocoding columns:', e.message);
    }
    
    // สร้างตาราง plant_suppliers ถ้ายังไม่มี
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plant_suppliers (
        id VARCHAR(255) PRIMARY KEY,
        plant_id VARCHAR(255) NOT NULL,
        supplier_id VARCHAR(255) NOT NULL,
        price DECIMAL(10,2),
        size VARCHAR(100),
        image_url TEXT, -- รูปภาพต้นไม้ที่ supplier ขาย (URL จาก Facebook)
        stock_quantity INTEGER DEFAULT 0,
        min_order_quantity INTEGER DEFAULT 1,
        delivery_available BOOLEAN DEFAULT false,
        delivery_cost DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        UNIQUE(plant_id, supplier_id, size)
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_plant_suppliers_plant_id ON plant_suppliers(plant_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_plant_suppliers_supplier_id ON plant_suppliers(supplier_id)');
    // เพิ่มคอลัมน์ image_url ถ้ายังไม่มี
    try {
      await pool.query(`ALTER TABLE plant_suppliers ADD COLUMN IF NOT EXISTS image_url TEXT`);
      // แก้ price ให้เป็น NULL ได้ (สำหรับ catalog ที่ไม่มีราคา)
      await pool.query(`ALTER TABLE plant_suppliers ALTER COLUMN price DROP NOT NULL`);
    } catch (e) {}
    console.log('✅ ตาราง plant_suppliers พร้อมใช้งาน');
    
    // สร้างตาราง bills ถ้ายังไม่มี
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id VARCHAR(255) PRIMARY KEY,
        supplier_id VARCHAR(255),
        supplier_name VARCHAR(255) NOT NULL,
        supplier_phone VARCHAR(50),
        supplier_location TEXT,
        bill_date DATE,
        total_amount DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bills_supplier_id ON bills(supplier_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(bill_date)');
    console.log('✅ ตาราง bills พร้อมใช้งาน');
    // ขยายความยาวเบอร์โทรในบิล
    try {
      await pool.query(`ALTER TABLE bills ALTER COLUMN supplier_phone TYPE VARCHAR(50)`);
    } catch (e) {}
    
    // สร้างตาราง bill_items ถ้ายังไม่มี
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bill_items (
        id VARCHAR(255) PRIMARY KEY,
        bill_id VARCHAR(255) NOT NULL,
        plant_id VARCHAR(255),
        plant_name VARCHAR(255) NOT NULL,
        quantity INTEGER DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        size VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
        FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE SET NULL
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bill_items_plant_id ON bill_items(plant_id)');
    console.log('✅ ตาราง bill_items พร้อมใช้งาน');
    
    // 🤖 AI Agent Tables - สร้างตารางสำหรับ AI Agent
    // ตาราง websites - เก็บเว็บไซต์ที่ต้อง scrape
    await pool.query(`
      CREATE TABLE IF NOT EXISTS websites (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        enabled BOOLEAN DEFAULT true,
        schedule VARCHAR(100), -- 'daily', 'weekly', 'manual'
        last_scraped TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_websites_enabled ON websites(enabled)');
    console.log('✅ ตาราง websites พร้อมใช้งาน');
    
    // ตาราง scraping_jobs - เก็บประวัติการ scrape
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scraping_jobs (
        id VARCHAR(255) PRIMARY KEY,
        website_id VARCHAR(255),
        url TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        result TEXT, -- JSON result
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE SET NULL
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_scraping_jobs_website_id ON scraping_jobs(website_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status)');
    console.log('✅ ตาราง scraping_jobs พร้อมใช้งาน');
    
    // ตาราง scraping_results - เก็บผลลัพธ์การ scrape
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scraping_results (
        id VARCHAR(255) PRIMARY KEY,
        job_id VARCHAR(255) NOT NULL,
        plant_id VARCHAR(255),
        supplier_id VARCHAR(255),
        plant_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2),
        size VARCHAR(100),
        raw_data TEXT, -- JSON raw data
        confidence DECIMAL(3,2), -- 0.00-1.00
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        approved_by VARCHAR(255), -- admin user ID
        approved_at TIMESTAMP,
        image_url TEXT, -- รูปภาพต้นไม้
        supplier_name VARCHAR(255), -- ชื่อร้าน
        supplier_phone VARCHAR(50), -- เบอร์โทร
        supplier_location TEXT, -- ที่อยู่
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (job_id) REFERENCES scraping_jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE SET NULL,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_scraping_results_job_id ON scraping_results(job_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_scraping_results_plant_id ON scraping_results(plant_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_scraping_results_supplier_id ON scraping_results(supplier_id)');
    // เพิ่มคอลัมน์ใหม่ถ้ายังไม่มี (ใช้ DO block เพื่อ avoid error ถ้ามีอยู่แล้ว)
    try {
      await pool.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scraping_results' AND column_name='status') THEN
            ALTER TABLE scraping_results ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scraping_results' AND column_name='approved_by') THEN
            ALTER TABLE scraping_results ADD COLUMN approved_by VARCHAR(255);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scraping_results' AND column_name='approved_at') THEN
            ALTER TABLE scraping_results ADD COLUMN approved_at TIMESTAMP;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scraping_results' AND column_name='image_url') THEN
            ALTER TABLE scraping_results ADD COLUMN image_url TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scraping_results' AND column_name='supplier_name') THEN
            ALTER TABLE scraping_results ADD COLUMN supplier_name VARCHAR(255);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scraping_results' AND column_name='supplier_phone') THEN
            ALTER TABLE scraping_results ADD COLUMN supplier_phone VARCHAR(50);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scraping_results' AND column_name='supplier_location') THEN
            ALTER TABLE scraping_results ADD COLUMN supplier_location TEXT;
          END IF;
        END $$;
      `);
      await pool.query('CREATE INDEX IF NOT EXISTS idx_scraping_results_status ON scraping_results(status)');
    } catch (e) {
      console.error('Error adding columns to scraping_results:', e.message);
    }
    console.log('✅ ตาราง scraping_results พร้อมใช้งาน');
    
    // ตรวจสอบจำนวนข้อมูล
    const plantsCount = await pool.query('SELECT COUNT(*) FROM plants');
    const suppliersCount = await pool.query('SELECT COUNT(*) FROM suppliers');
    console.log(`📊 จำนวนต้นไม้: ${plantsCount.rows[0].count} รายการ`);
    console.log(`📊 จำนวนร้านค้า: ${suppliersCount.rows[0].count} รายการ`);
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสร้างตาราง:', error.message);
    // ไม่ throw error เพราะอาจมีตารางอยู่แล้ว
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🌱 Plant Price API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌿 Plants API: http://localhost:${PORT}/api/plants`);
  
  // Initialize database tables
  await initializeDatabase();
});

module.exports = app;
