# 🔗 ตั้งค่าเชื่อม Frontend กับ Backend

## 📍 Current Status

✅ **Backend**: https://plant-price-backend-production.up.railway.app  
⏳ **Frontend**: ยังใช้ localStorage อยู่

---

## ⚙️ ตั้งค่าบน Vercel

### ขั้นตอนที่ 1: ไปที่ Vercel Dashboard
https://vercel.com/dashboard

### ขั้นตอนที่ 2: เลือก Project
ค้นหา "PlantPick" หรือ "PlantPrice-Frontend"

### ขั้นตอนที่ 3: ไปที่ Settings → Environment Variables

### ขั้นตอนที่ 4: เพิ่ม Environment Variable

คลิก "Add New"

- **Name**: `REACT_APP_API_URL`
- **Value**: `https://plant-price-backend-production.up.railway.app`
- **Environment**: All (Production, Preview, Development)
- **Overwrite**: ✅

คลิก "Save"

### ขั้นตอนที่ 5: Rebuild Project

1. ไปที่ Deployments tab
2. เลือก latest deployment
3. กด "Redeploy" → "Redeploy"

หรือ:
- Push การเปลี่ยนแปลงใดๆ ไป GitHub
- Vercel จะ rebuild อัตโนมัติ

---

## 🧪 Test การเชื่อมต่อ

หลังจาก rebuild เสร็จ:

```bash
# 1. เปิด Frontend URL
https://your-frontend.vercel.app

# 2. เปิด Browser DevTools (F12)
# 3. ไปที่ Network tab
# 4. ดู requests ไปที่ backend URL
```

### Expected Behavior:

**Before** (localStorage):
- Data เก็บใน localStorage
- ไม่มี network requests ไป backend

**After** (connected):
- Data เรียกจาก backend
- Network requests ไปที่ `https://plant-price-backend-production.up.railway.app`

---

## 📊 Verify Connection

ทดสอบใน Browser Console:

```javascript
// ตรวจสอบ environment variable
console.log(process.env.REACT_APP_API_URL);

// ควรได้: https://plant-price-backend-production.up.railway.app
```

---

## ✅ Checklist

- [ ] ✅ Backend deployed บน Railway
- [ ] ⏳ เพิ่ม `REACT_APP_API_URL` บน Vercel
- [ ] ⏳ Rebuild frontend
- [ ] ⏳ Test connection

---

## 🎯 Quick Test

หลังจาก rebuild เสร็จ:

1. เปิด Frontend
2. เพิ่มร้านค้า
3. ตรวจสอบ Network tab → ควรมี requests ไป backend
4. ตรวจสอบว่า data ถูกบันทึกใน database จริง

---

## 💡 หมายเหตุ

- Frontend ใช้ auto-detect: ถ้ามี `REACT_APP_API_URL` → ใช้ Real API, ถ้าไม่มี → ใช้ localStorage
- หลังจากตั้งค่าแล้ว ต้อง rebuild frontend ใหม่
- Database ยังต้องเพิ่มบน Railway Dashboard

