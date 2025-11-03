# 🌐 ตั้งค่า Domain สำหรับ Frontend และ Backend

## 📊 Domain ที่มี:

### 1. **Frontend (Vercel)**
- **Domain**: `plantpick-frontend.vercel.app`
- **URL**: `https://plantpick-frontend.vercel.app`
- **หน้าที่**: หน้าเว็บสำหรับผู้ใช้ (React App)

### 2. **Backend (Railway)**
- **Domain**: `plant-price-backend-production.up.railway.app`
- **URL**: `https://plant-price-backend-production.up.railway.app`
- **หน้าที่**: API Server (Node.js + PostgreSQL)

---

## 🔧 วิธีตั้งค่า Environment Variables:

### ✅ ใน Vercel (Frontend):

**Variable**: `REACT_APP_API_URL`

**Value**: `https://plant-price-backend-production.up.railway.app`

**ไม่ใช่**: `https://plantpick-frontend.vercel.app` ❌ (นี่คือ Frontend URL ตัวเอง)

**ทำไม:**
- Frontend ต้องเรียก API ไปที่ Backend
- ไม่ใช่เรียกไปที่ Frontend URL ตัวเอง

---

### ✅ ใน Railway (Backend):

**Variable**: `FRONTEND_URL`

**Value**: `https://plantpick-frontend.vercel.app`

**ทำไม:**
- Backend ต้องรู้ว่า Frontend มาจากไหน
- เพื่อตั้งค่า CORS (Allow requests จาก Frontend)
- เพื่อความปลอดภัย

---

## 🔄 การทำงาน:

```
Frontend (Vercel)                    Backend (Railway)
plantpick-frontend.vercel.app   →   plant-price-backend-production.up.railway.app
     ↑                                          ↑
  User เยี่ยมชม                             API Server
  (React App)                                 (Database)
```

### Flow:
1. **User** เปิด `https://plantpick-frontend.vercel.app`
2. **Frontend** (React) เรียก API ไปที่ `https://plant-price-backend-production.up.railway.app/api/suppliers`
3. **Backend** ตรวจสอบ CORS → ถ้า request มาจาก `plantpick-frontend.vercel.app` → อนุญาต
4. **Backend** query ข้อมูลจาก PostgreSQL Database
5. **Backend** ส่ง response กลับไป Frontend
6. **Frontend** แสดงข้อมูลให้ User

---

## ✅ Checklist ตั้งค่า:

### Vercel (Frontend):
- [ ] `REACT_APP_API_URL` = `https://plant-price-backend-production.up.railway.app`
- [ ] **ไม่ใช่** `https://plantpick-frontend.vercel.app`

### Railway (Backend):
- [ ] `FRONTEND_URL` = `https://plantpick-frontend.vercel.app`
- [ ] `DATABASE_URL` = `postgresql://...` (auto จาก Railway)
- [ ] `NODE_ENV` = `production`

---

## 🔍 วิธีเช็ค:

### 1. เช็ค Vercel Environment Variables:

1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. หา `REACT_APP_API_URL`
3. เช็คว่า Value = `https://plant-price-backend-production.up.railway.app`

### 2. เช็ค Railway Environment Variables:

1. Railway Dashboard → Project `lovely-rejoicing` → Backend Service → **Variables**
2. หา `FRONTEND_URL`
3. เช็คว่า Value = `https://plantpick-frontend.vercel.app`

---

## 📝 สรุป:

**Frontend (Vercel):**
- Domain: `plantpick-frontend.vercel.app` ✅
- `REACT_APP_API_URL` = Backend URL (`plant-price-backend-production.up.railway.app`) ✅

**Backend (Railway):**
- Domain: `plant-price-backend-production.up.railway.app` ✅
- `FRONTEND_URL` = Frontend URL (`plantpick-frontend.vercel.app`) ✅

**ไม่ใช่**: ใช้ domain เดียวกัน
**แต่**: แต่ละฝั่งต้องรู้ URL ของอีกฝั่ง

---

## 🎯 ขั้นตอนต่อไป:

1. **เช็คว่า Vercel** มี `REACT_APP_API_URL` = Backend URL หรือยัง
2. **เช็คว่า Railway** มี `FRONTEND_URL` = Frontend URL หรือยัง
3. **ถ้าไม่ถูกต้อง** → แก้ไขและ Redeploy

