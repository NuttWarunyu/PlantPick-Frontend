# 🗄️ วิธีสร้างตาราง Suppliers ใน Railway Database

## 🔍 วิธีที่ 1: ใช้ Railway CLI (แนะนำ - ง่ายที่สุด)

### ขั้นตอน:

1. **เปิด Terminal** (บน Mac หรือเครื่องที่ติดตั้ง Railway CLI)

2. **Login Railway:**
```bash
railway login
```

3. **Link to Project:**
```bash
railway link
```
- เลือก Project: `lovely-rejoicing`

4. **Connect to Database และรัน SQL:**
```bash
railway run psql $DATABASE_URL << 'EOF'
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

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_location ON suppliers(location);

SELECT 'Table suppliers created successfully!' as status;
EOF
```

---

## 🔍 วิธีที่ 2: ใช้ Node.js Script

### ขั้นตอน:

1. **เข้าไปที่ backend directory:**
```bash
cd /Users/warunyu/PlantPick/backend
```

2. **ใช้ Railway CLI รัน script:**
```bash
railway link
railway run node scripts/init-suppliers-table.js
```

---

## 🔍 วิธีที่ 3: รอให้ Railway Deploy โค้ดใหม่ (แนะนำ - อัตโนมัติ)

### ถ้าเปลี่ยน Railway Source เป็น `PlantPick-Frontend` แล้ว:

1. **Railway จะ auto-deploy จาก GitHub**
2. **เมื่อ server เริ่มทำงาน → function `initializeDatabase()` จะสร้างตารางอัตโนมัติ**
3. **หรือเมื่อเรียก API `/api/suppliers` → จะตรวจสอบและสร้างตารางอัตโนมัติ**

### วิธีเช็คว่า deploy แล้วหรือยัง:
- Railway Dashboard → Deployments → เช็คว่ามี deployment ล่าสุดที่มี commit `d457a1a` หรือ `11ceb0d` หรือยัง

---

## 🔍 วิธีที่ 4: ใช้ External Database Client

### ใช้ pgAdmin, DBeaver, หรือ TablePlus:

1. **Get Database Connection String:**
   - Railway Dashboard → Postgres Service → Variables
   - Copy `DATABASE_URL` (จะมี format: `postgresql://user:password@host:port/database`)

2. **Connect ด้วย Database Client:**
   - ใช้ `DATABASE_URL` เพื่อเชื่อมต่อ
   - รัน SQL script

---

## 🎯 วิธีที่แนะนำ: ใช้ Railway CLI (วิธีที่ 1)

**เพราะ:**
- ✅ ไม่ต้อง setup อะไรเพิ่ม
- ✅ ใช้ DATABASE_URL จาก Railway โดยอัตโนมัติ
- ✅ ทำงานได้ทันที

**ถ้าไม่มี Railway CLI:**
```bash
# ติดตั้ง Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# รัน SQL
railway run psql $DATABASE_URL << 'EOF'
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

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_location ON suppliers(location);
EOF
```

---

## ✅ หลังจากสร้างตารางแล้ว:

1. **Test API:**
```bash
curl https://plant-price-backend-production.up.railway.app/api/suppliers
```

ควรได้ response:
```json
{
  "success": true,
  "data": [...],
  "message": "ดึงข้อมูลร้านค้าสำเร็จ"
}
```

2. **Test Frontend:**
- เปิด Frontend URL จาก Vercel
- ไปหน้า "รายการร้านค้า"
- ควรเห็นข้อมูลจาก database

---

## 📝 หมายเหตุ:

- ถ้า Railway CLI ไม่ทำงาน → ใช้วิธีที่ 3 (รอ deploy) หรือวิธีที่ 4 (external client)
- ถ้าต้องการเร็วที่สุด → ใช้วิธีที่ 1 (Railway CLI)

