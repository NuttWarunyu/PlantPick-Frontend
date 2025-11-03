-- Script สำหรับสร้างตาราง suppliers โดยตรง
-- ใช้กับ Railway Database

-- สร้างตาราง suppliers
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
);

-- สร้าง index
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_location ON suppliers(location);

-- ตรวจสอบว่าสร้างสำเร็จ
SELECT 'Table suppliers created successfully!' as status;

