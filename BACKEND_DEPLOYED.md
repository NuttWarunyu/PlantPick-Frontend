# ✅ Backend Deployed Successfully!

## 🎉 Backend URL

**Backend URL**: https://plant-price-backend-production.up.railway.app

### Test API:
```bash
# Health check
curl https://plant-price-backend-production.up.railway.app/api/health

# Get plants
curl https://plant-price-backend-production.up.railway.app/api/plants

# AI Insights
curl https://plant-price-backend-production.up.railway.app/api/ai/insights
```

---

## 🔗 เชื่อม Frontend กับ Backend

### ตั้งค่าบน Vercel:

1. ไปที่ Vercel Dashboard: https://vercel.com/dashboard
2. เลือก project: `PlantPrice-Frontend`
3. ไปที่ Settings → Environment Variables
4. เพิ่ม variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://plant-price-backend-production.up.railway.app`

5. Rebuild project

---

## 📊 Status

- ✅ Frontend: Vercel (Auto Deploy)
- ✅ Backend: Railway (Deployed)
- ⏳ Database: ไม่มี PostgreSQL (ต้องเพิ่มบน Railway Dashboard)

---

## 🗄️ เพิ่ม PostgreSQL Database

### ขั้นตอน:
1. ไปที่ Railway Dashboard: https://railway.com/project/186e6d0a-cd49-4177-a257-9077ae0978ac
2. กด "New" หรือ "+"
3. เลือก "Database"
4. เลือก "PostgreSQL"
5. รอให้ Railway สร้าง database

Railway จะสร้าง environment variable `DATABASE_URL` อัตโนมัติ

---

## 🎯 ต่อไป

1. ✅ Deploy Backend สำเร็จแล้ว
2. ⏳ เพิ่ม Database บน Railway Dashboard
3. ⏳ ตั้งค่า `REACT_APP_API_URL` บน Vercel
4. ✅ พร้อมใช้งาน!

