const { pool } = require('../database');

async function createSuppliersTable() {
  console.log('กำลังสร้างตาราง suppliers...');
  
  try {
    // สร้างตาราง suppliers ใหม่
    const query = `
      CREATE TABLE IF NOT EXISTS suppliers_new (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location TEXT NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        description TEXT,
        specialties JSONB DEFAULT '[]',
        business_hours VARCHAR(255),
        payment_methods JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await pool.query(query);
    console.log('✅ สร้างตาราง suppliers_new สำเร็จ');
    
    // คัดลอกข้อมูลจากตารางเดิม (ถ้ามี)
    const copyQuery = `
      INSERT INTO suppliers_new (id, name, location, phone, created_at)
      SELECT DISTINCT 
        'supplier_' || EXTRACT(EPOCH FROM NOW())::bigint || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 9) as id,
        s.name,
        s.location,
        s.phone,
        NOW() as created_at
      FROM suppliers s
      WHERE s.name IS NOT NULL
      ON CONFLICT (id) DO NOTHING
    `;
    
    await pool.query(copyQuery);
    console.log('✅ คัดลอกข้อมูลจากตารางเดิมสำเร็จ');
    
    // ลบตารางเดิม
    await pool.query('DROP TABLE IF EXISTS suppliers CASCADE');
    console.log('✅ ลบตารางเดิมสำเร็จ');
    
    // เปลี่ยนชื่อตารางใหม่
    await pool.query('ALTER TABLE suppliers_new RENAME TO suppliers');
    console.log('✅ เปลี่ยนชื่อตารางสำเร็จ');
    
    // สร้าง index
    await pool.query('CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_suppliers_location ON suppliers(location)');
    console.log('✅ สร้าง index สำเร็จ');
    
    console.log('🎉 สร้างตาราง suppliers ใหม่สำเร็จ!');
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  } finally {
    process.exit();
  }
}

createSuppliersTable();
