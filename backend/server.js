const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const { db, pool } = require('./database');
const aiService = require('./services/aiService');
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_plants_name ON plants(name)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category)');
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
    
    // สร้างตาราง plant_suppliers ถ้ายังไม่มี
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plant_suppliers (
        id VARCHAR(255) PRIMARY KEY,
        plant_id VARCHAR(255) NOT NULL,
        supplier_id VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        size VARCHAR(100),
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
    console.log('✅ ตาราง plant_suppliers พร้อมใช้งาน');
    
    // สร้างตาราง bills ถ้ายังไม่มี
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id VARCHAR(255) PRIMARY KEY,
        supplier_id VARCHAR(255),
        supplier_name VARCHAR(255) NOT NULL,
        supplier_phone VARCHAR(20),
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
