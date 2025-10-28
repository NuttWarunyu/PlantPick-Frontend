# 🚀 คู่มือ Deploy Backend จริง

## 📋 ขั้นตอนการ Deploy

### 1️⃣ Deploy Backend บน Railway

```bash
# ไปที่ backend directory
cd backend

# Login Railway
railway login

# Deploy
railway up

# เพิ่ม PostgreSQL Database
railway add --plugin postgres

# ดู backend URL ที่ได้
railway domain
```

### 2️⃣ ตั้งค่า Environment Variables

#### บน Railway (Backend):

```bash
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set FRONTEND_URL=https://your-frontend.vercel.app
```

#### บน Vercel (Frontend):

1. ไปที่ Vercel Dashboard
2. เลือก project `PlantPrice-Frontend`
3. ไปที่ Settings → Environment Variables
4. เพิ่ม:
   - `REACT_APP_API_URL` = `https://your-backend.railway.app`

### 3️⃣ Rebuild Frontend

```bash
# Trigger rebuild บน Vercel
# หรือ deploy ใหม่
vercel --prod
```

---

## 🔄 การ Push Code

### ถ้าแก้ Frontend:

```bash
cd /Users/warunyu/PlantPick
git add plant-price-system/
git commit -m "message"
git push origin main
```

Vercel จะ auto-deploy อัตโนมัติ

### ถ้าแก้ Backend:

```bash
cd /Users/warunyu/PlantPick/backend
git add .
git commit -m "message"
git push origin main

# Deploy บน Railway
railway up
```

---

## ✅ ตรวจสอบการเชื่อมต่อ

### 1. Test Backend:

```bash
curl https://your-backend.railway.app/api/health
```

ควรได้ response:
```json
{"status":"OK","message":"Plant Price API is running"}
```

### 2. Check Frontend:

- เปิด Chrome DevTools (F12)
- ไปที่ Console
- ดู network requests ไปที่ backend URL

---

## 🎯 Tips

- Frontend และ Backend อยู่ใน repository เดียวกัน
- Frontend deploy บน Vercel (auto)
- Backend deploy บน Railway (ต้อง manual)
- ตั้งค่า `REACT_APP_API_URL` ใน Vercel
- ตั้งค่า `DATABASE_URL` ใน Railway (auto จาก PostgreSQL plugin)

