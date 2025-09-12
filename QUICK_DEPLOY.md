# 🚀 Quick Deploy Guide - Plant Price System

## 📋 Step-by-Step Deployment

### 1. ติดตั้ง Tools ที่จำเป็น

```bash
# ติดตั้ง Railway CLI
npm install -g @railway/cli

# ติดตั้ง Vercel CLI  
npm install -g vercel

# Login เข้าระบบ
railway login
vercel login
```

### 2. Deploy Backend ไปยัง Railway

```bash
# เข้าไปในโฟลเดอร์ backend
cd backend

# ติดตั้ง dependencies
npm install

# สร้างโปรเจคใหม่ใน Railway
railway init

# Deploy
railway up --detach

# ดู URL ที่ได้
railway domain
```

**บันทึก URL ที่ได้ไว้** (เช่น: `https://plant-price-backend-production.railway.app`)

### 3. ตั้งค่า Environment Variables ใน Railway

ใน Railway Dashboard:
- `NODE_ENV` = `production`
- `FRONTEND_URL` = `https://your-frontend-url.vercel.app` (จะได้หลังจาก deploy frontend)

### 4. Deploy Frontend ไปยัง Vercel

```bash
# เข้าไปในโฟลเดอร์ frontend
cd ../plant-price-system

# ติดตั้ง dependencies
npm install

# Build โปรเจค
npm run build

# Deploy ไปยัง Vercel
vercel --prod
```

**บันทึก URL ที่ได้ไว้** (เช่น: `https://plant-price-system.vercel.app`)

### 5. ตั้งค่า Environment Variables ใน Vercel

ใน Vercel Dashboard:
- `REACT_APP_API_URL` = `https://your-backend-url.railway.app`

### 6. อัปเดต CORS ใน Railway

กลับไปที่ Railway Dashboard:
- `FRONTEND_URL` = `https://your-frontend-url.vercel.app`

### 7. ทดสอบระบบ

1. เปิดเว็บไซต์ที่ Vercel URL
2. ทดสอบการค้นหาต้นไม้
3. ทดสอบการเพิ่มผู้จัดจำหน่าย
4. ตรวจสอบว่าเชื่อมต่อ API ได้

## 🔄 การอัปเดตในอนาคต

### อัปเดต Backend
```bash
cd backend
# แก้ไขโค้ด
git add .
git commit -m "Update backend"
git push
railway up --detach
```

### อัปเดต Frontend
```bash
cd plant-price-system
# แก้ไขโค้ด
git add .
git commit -m "Update frontend"
git push
vercel --prod
```

## 🆘 หากมีปัญหา

### ตรวจสอบ Logs
```bash
# Railway logs
railway logs

# Vercel logs
vercel logs
```

### ทดสอบ API
```bash
# ทดสอบ health check
curl https://your-backend-url.railway.app/api/health

# ทดสอบดึงข้อมูลต้นไม้
curl https://your-backend-url.railway.app/api/plants
```

### ตรวจสอบ Environment Variables
- Railway Dashboard → Variables tab
- Vercel Dashboard → Settings → Environment Variables

---

**🎉 เสร็จแล้ว! ระบบของคุณพร้อมใช้งานแล้ว**
