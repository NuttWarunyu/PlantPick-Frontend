const { pool } = require('../database');

async function createPlantSuppliersTable() {
  console.log('กำลังสร้างตาราง plant_suppliers...');
  
  try {
    // สร้างตาราง plant_suppliers
    const query = `
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
    `;
    
    await pool.query(query);
    console.log('✅ สร้างตาราง plant_suppliers สำเร็จ');
    
    // สร้าง index
    await pool.query('CREATE INDEX IF NOT EXISTS idx_plant_suppliers_plant_id ON plant_suppliers(plant_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_plant_suppliers_supplier_id ON plant_suppliers(supplier_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_plant_suppliers_price ON plant_suppliers(price)');
    console.log('✅ สร้าง index สำเร็จ');
    
    // ไม่ต้องคัดลอกข้อมูลจากตารางเดิม เพราะโครงสร้างเปลี่ยนแล้ว
    console.log('✅ ตาราง plant_suppliers พร้อมใช้งาน');
    
    console.log('🎉 สร้างตาราง plant_suppliers สำเร็จ!');
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  } finally {
    process.exit();
  }
}

createPlantSuppliersTable();
