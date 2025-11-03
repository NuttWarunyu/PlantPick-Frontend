const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Database queries
const db = {
  // Plants
  async getPlants() {
    const query = `
      SELECT p.id,
             p.name,
             p.scientific_name as "scientificName",
             p.category,
             p.plant_type as "plantType",
             p.measurement_type as "measurementType",
             p.created_at as "createdAt",
             p.updated_at as "updatedAt",
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', ps.supplier_id,
                   'name', s.name,
                   'price', ps.price,
                   'phone', s.phone,
                   'location', s.location,
                   'lastUpdated', ps.created_at,
                   'size', ps.size
                 )
               ) FILTER (WHERE s.id IS NOT NULL), 
               '[]'
             ) as suppliers
      FROM plants p
      LEFT JOIN plant_suppliers ps ON p.id = ps.plant_id
      LEFT JOIN suppliers s ON ps.supplier_id = s.id
      GROUP BY p.id, p.name, p.scientific_name, p.category, p.plant_type, p.measurement_type, p.created_at, p.updated_at
      ORDER BY p.name
    `;
    const result = await pool.query(query);
    return result.rows.map(row => ({
      ...row,
      hasSuppliers: row.suppliers.length > 0
    }));
  },

  async getPlantById(id) {
    const query = `
      SELECT p.id,
             p.name,
             p.scientific_name as "scientificName",
             p.category,
             p.plant_type as "plantType",
             p.measurement_type as "measurementType",
             p.created_at as "createdAt",
             p.updated_at as "updatedAt",
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', ps.supplier_id,
                   'name', s.name,
                   'price', ps.price,
                   'phone', s.phone,
                   'location', s.location,
                   'lastUpdated', ps.created_at,
                   'size', ps.size
                 )
               ) FILTER (WHERE s.id IS NOT NULL), 
               '[]'
             ) as suppliers
      FROM plants p
      LEFT JOIN plant_suppliers ps ON p.id = ps.plant_id
      LEFT JOIN suppliers s ON ps.supplier_id = s.id
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.scientific_name, p.category, p.plant_type, p.measurement_type, p.created_at, p.updated_at
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      hasSuppliers: row.suppliers.length > 0
    };
  },

  // Suppliers
  async addSupplier(plantId, supplierData) {
    const query = `
      INSERT INTO suppliers (id, plant_id, name, price, phone, location, size, last_updated)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [
      supplierData.id,
      plantId,
      supplierData.name,
      supplierData.price,
      supplierData.phone,
      supplierData.location,
      supplierData.size
    ]);
    return result.rows[0];
  },

  async updateSupplierPrice(plantId, supplierId, newPrice) {
    const query = `
      UPDATE suppliers 
      SET price = $1, last_updated = NOW()
      WHERE id = $2 AND plant_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [newPrice, supplierId, plantId]);
    return result.rows[0];
  },

  async deleteSupplier(plantId, supplierId) {
    const query = `
      DELETE FROM suppliers 
      WHERE id = $1 AND plant_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [supplierId, plantId]);
    return result.rows[0];
  },

  // Orders
  async createOrder(orderData) {
    const query = `
      INSERT INTO orders (id, order_number, total_amount, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [
      orderData.id,
      orderData.orderNumber,
      orderData.totalAmount,
      orderData.status || 'pending'
    ]);
    return result.rows[0];
  },

  async addOrderItem(orderId, itemData) {
    const query = `
      INSERT INTO order_items (id, order_id, plant_id, supplier_id, quantity, unit_price, total_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      itemData.id,
      orderId,
      itemData.plantId,
      itemData.supplierId,
      itemData.quantity,
      itemData.unitPrice,
      itemData.totalPrice
    ]);
    return result.rows[0];
  },

  async getOrders() {
    const query = `
      SELECT o.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'plantId', oi.plant_id,
                   'supplierId', oi.supplier_id,
                   'quantity', oi.quantity,
                   'unitPrice', oi.unit_price,
                   'totalPrice', oi.total_price
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), 
               '[]'
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Locations
  async getLocations() {
    const query = `SELECT * FROM locations ORDER BY name`;
    const result = await pool.query(query);
    return result.rows;
  },

  // Create new plant
  async createPlant(plantData) {
    const query = `
      INSERT INTO plants (id, name, scientific_name, category, plant_type, measurement_type, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      plantData.id,
      plantData.name,
      plantData.scientificName,
      plantData.category,
      plantData.plantType,
      plantData.measurementType,
      plantData.description
    ]);
    return result.rows[0];
  },

  // Get all suppliers (standalone suppliers table)
  async getAllSuppliers() {
    const query = `
      SELECT id, name, location, phone, website, description,
             specialties, business_hours, payment_methods, created_at
      FROM suppliers
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Find or create supplier by name
  async findOrCreateSupplier(supplierData) {
    // ค้นหาร้านค้าที่มีชื่อเหมือนกัน
    const findQuery = `SELECT id FROM suppliers WHERE LOWER(name) = LOWER($1) LIMIT 1`;
    const findResult = await pool.query(findQuery, [supplierData.name]);
    
    if (findResult.rows.length > 0) {
      // ถ้ามีแล้ว ให้อัพเดทข้อมูล
      const supplierId = findResult.rows[0].id;
      const updateQuery = `
        UPDATE suppliers 
        SET location = COALESCE($1, location),
            phone = COALESCE($2, phone),
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `;
      const updateResult = await pool.query(updateQuery, [
        supplierData.location,
        supplierData.phone,
        supplierId
      ]);
      return updateResult.rows[0];
    } else {
      // ถ้าไม่มี ให้เพิ่มใหม่
      const { v4: uuidv4 } = require('uuid');
      const supplierId = `supplier_${uuidv4()}`;
      const insertQuery = `
        INSERT INTO suppliers (id, name, location, phone, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const insertResult = await pool.query(insertQuery, [
        supplierId,
        supplierData.name,
        supplierData.location || '',
        supplierData.phone || null,
        supplierData.description || null
      ]);
      return insertResult.rows[0];
    }
  },

  // Find or create plant by name
  async findOrCreatePlant(plantData) {
    // ค้นหาต้นไม้ที่มีชื่อเหมือนกัน
    const findQuery = `SELECT id FROM plants WHERE LOWER(name) = LOWER($1) LIMIT 1`;
    const findResult = await pool.query(findQuery, [plantData.name]);
    
    if (findResult.rows.length > 0) {
      return findResult.rows[0];
    } else {
      // ถ้าไม่มี ให้เพิ่มใหม่
      const { v4: uuidv4 } = require('uuid');
      const plantId = `plant_${uuidv4()}`;
      const insertQuery = `
        INSERT INTO plants (id, name, category, plant_type, measurement_type, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const insertResult = await pool.query(insertQuery, [
        plantId,
        plantData.name,
        plantData.category || 'อื่นๆ',
        plantData.plantType || 'อื่นๆ',
        plantData.measurementType || 'ต้น',
        plantData.description || null
      ]);
      return insertResult.rows[0];
    }
  },

  // Upsert plant_supplier (insert or update)
  async upsertPlantSupplier(plantId, supplierId, priceData) {
    // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
    const findQuery = `
      SELECT id FROM plant_suppliers 
      WHERE plant_id = $1 AND supplier_id = $2 AND (size = $3 OR (size IS NULL AND $3 IS NULL))
    `;
    const findResult = await pool.query(findQuery, [
      plantId,
      supplierId,
      priceData.size || null
    ]);
    
    if (findResult.rows.length > 0) {
      // ถ้ามีแล้ว ให้อัพเดทราคา
      const updateQuery = `
        UPDATE plant_suppliers 
        SET price = $1, updated_at = NOW()
        WHERE plant_id = $2 AND supplier_id = $3 AND (size = $4 OR (size IS NULL AND $4 IS NULL))
        RETURNING *
      `;
      const updateResult = await pool.query(updateQuery, [
        priceData.price,
        plantId,
        supplierId,
        priceData.size || null
      ]);
      return updateResult.rows[0];
    } else {
      // ถ้าไม่มี ให้เพิ่มใหม่
      const { v4: uuidv4 } = require('uuid');
      const plantSupplierId = `plant_supplier_${uuidv4()}`;
      const insertQuery = `
        INSERT INTO plant_suppliers (id, plant_id, supplier_id, price, size, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `;
      const insertResult = await pool.query(insertQuery, [
        plantSupplierId,
        plantId,
        supplierId,
        priceData.price,
        priceData.size || null
      ]);
      return insertResult.rows[0];
    }
  },

  // Create bill
  async createBill(billData) {
    const { v4: uuidv4 } = require('uuid');
    const billId = `bill_${uuidv4()}`;
    const query = `
      INSERT INTO bills (id, supplier_id, supplier_name, supplier_phone, supplier_location, bill_date, total_amount, image_url, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await pool.query(query, [
      billId,
      billData.supplierId || null,
      billData.supplierName,
      billData.supplierPhone || null,
      billData.supplierLocation || null,
      billData.billDate || new Date(),
      billData.totalAmount,
      billData.imageUrl || null,
      billData.notes || null
    ]);
    return result.rows[0];
  },

  // Add bill item
  async addBillItem(billId, itemData) {
    const { v4: uuidv4 } = require('uuid');
    const itemId = `bill_item_${uuidv4()}`;
    const query = `
      INSERT INTO bill_items (id, bill_id, plant_id, plant_name, quantity, price, total_price, size, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await pool.query(query, [
      itemId,
      billId,
      itemData.plantId || null,
      itemData.plantName,
      itemData.quantity || 1,
      itemData.price,
      itemData.totalPrice || (itemData.price * (itemData.quantity || 1)),
      itemData.size || null,
      itemData.notes || null
    ]);
    return result.rows[0];
  }
};

module.exports = { pool, db };
