# 🚀 Deploy Frontend to Vercel

## 1. สร้าง Repository ใหม่ใน GitHub

1. ไปที่ [GitHub](https://github.com)
2. คลิก "New repository"
3. ตั้งชื่อ: `PlantPick-Frontend`
4. เลือก "Public"
5. เพิ่ม Description: "Frontend for Plant Price Management System - React + TypeScript"
6. **อย่า** check "Add a README file" (เพราะเรามีแล้ว)
7. คลิก "Create repository"

## 2. Push Code ไปยัง Repository

```bash
# เพิ่ม remote origin
git remote add origin https://github.com/NuttWarunyu/PlantPick-Frontend.git

# Push ไปยัง repository ใหม่
git push -u origin main
```

## 3. Deploy ไปยัง Vercel

### วิธีที่ 1: ผ่าน Vercel Dashboard (แนะนำ)

1. ไปที่ [Vercel](https://vercel.com)
2. คลิก "New Project"
3. เลือก "Import Git Repository"
4. เลือก `PlantPick-Frontend` repository
5. Vercel จะ auto-detect React project
6. คลิก "Deploy"

### วิธีที่ 2: ผ่าน Vercel CLI

```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Login เข้าระบบ
vercel login

# Deploy
vercel --prod
```

## 4. ตั้งค่า Environment Variables

ใน Vercel Dashboard:
- `REACT_APP_API_URL` = `https://your-backend-url.railway.app`

## 5. ทดสอบ Frontend

1. เปิดเว็บไซต์ที่ Vercel URL
2. ตรวจสอบว่าสามารถเชื่อมต่อ API ได้
3. ทดสอบการค้นหาต้นไม้
4. ทดสอบการเพิ่มผู้จัดจำหน่าย

## 6. อัปเดต Backend CORS

ใน Railway Dashboard:
- `FRONTEND_URL` = `https://your-vercel-url.vercel.app`

## 7. ตรวจสอบการเชื่อมต่อ

```bash
# ทดสอบ API จาก frontend
curl https://your-backend-url.railway.app/api/health

# ตรวจสอบ CORS
curl -H "Origin: https://your-vercel-url.vercel.app" \
     https://your-backend-url.railway.app/api/plants
```

---

**เสร็จแล้ว! Frontend พร้อมใช้งาน** 🌱
