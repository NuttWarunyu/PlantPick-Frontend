# 🚀 สรุปการ Deploy

## 📍 แบ่งเป็น 2 Platform

### 1. **Frontend → Vercel** ✅ (Auto Deploy)
**ไม่ต้องทำอะไร!** 

- Push ไป GitHub → Vercel จะ deploy อัตโนมัติ
- URL: `https://your-frontend.vercel.app`
- ไม่ต้อง setup อะไรเพิ่ม

### 2. **Backend → Railway** 🔄 (Manual Deploy)
**ต้อง deploy เอง:**

```bash
cd backend
railway login
railway init
railway add --plugin postgres
railway up
```

- URL: `https://your-backend.railway.app`
- ต้อง setup database (PostgreSQL)

---

## 🎯 สถานะปัจจุบัน

| Component | Platform | Status | Auto Deploy |
|-----------|----------|--------|-------------|
| Frontend | Vercel | ✅ Deployed | ✅ Yes |
| Backend | Railway | ⏳ Not Deployed | ❌ No |

---

## 📤 การ Push Code

### **Push ครั้งเดียว - Frontend deploy อัตโนมัติ**

```bash
cd /Users/warunyu/PlantPick

# Push ทั้งหมด
git add .
git commit -m "your message"
git push origin main
```

✅ **Frontend** → Vercel deploy อัตโนมัติ  
⏳ **Backend** → ต้อง deploy เองบน Railway

---

## 🔄 การ Deploy Backend

### ขั้นตอนที่ 1: Login Railway
```bash
cd backend
railway login
```

### ขั้นตอนที่ 2: Initialize Project
```bash
railway init
```

### ขั้นตอนที่ 3: Add PostgreSQL Database
```bash
railway add --plugin postgres
```

### ขั้นตอนที่ 4: Deploy
```bash
railway up
```

### ขั้นตอนที่ 5: ตั้งค่า Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://your-frontend.vercel.app
```

### ขั้นตอนที่ 6: Get Backend URL
```bash
railway domain
```

---

## 🔗 เชื่อม Frontend ↔ Backend

### ตั้งค่า Environment Variable บน Vercel:

1. ไปที่ Vercel Dashboard
2. เลือก project `PlantPrice-Frontend`
3. Settings → Environment Variables
4. เพิ่ม: `REACT_APP_API_URL` = `https://your-backend.railway.app`

---

## ✅ ผลลัพธ์

- **Frontend**: https://your-frontend.vercel.app ✅
- **Backend**: https://your-backend.railway.app ⏳
- **Database**: PostgreSQL on Railway ⏳

---

## 💡 หมายเหตุ

- Frontend deploy อัตโนมัติเมื่อ push
- Backend ต้อง deploy เองบน Railway
- เมื่อตั้งค่า `REACT_APP_API_URL` แล้ว Frontend จะเชื่อมต่อกับ Backend อัตโนมัติ
- ถ้ายังไม่มี backend URL → ระบบจะใช้ localStorage

