# 🔍 วิธีเช็คว่า Frontend ใช้ Real API หรือ Mock API

## 📋 ขั้นตอนการตรวจสอบ:

### 1. เช็คว่า REACT_APP_API_URL ถูกต้องใน Vercel

1. **Vercel Dashboard** → Project → **Settings** → **Environment Variables**
2. หา `REACT_APP_API_URL`
3. **เช็ค Value** ควรเป็น:
   ```
   https://plant-price-backend-production.up.railway.app
   ```

**ถ้าไม่ถูกต้อง:**
- Edit → เปลี่ยน Value
- Save → Vercel จะ auto-redeploy

---

### 2. เช็คว่า Frontend ใช้ Real API Service หรือไม่

เปิด Browser Console (F12) → Console tab:

```javascript
// ตรวจสอบ REACT_APP_API_URL
console.log('API URL:', process.env.REACT_APP_API_URL);

// ควรได้:
// https://plant-price-backend-production.up.railway.app
```

**ถ้าได้ `undefined` หรือ `http://localhost:3002`:**
- Frontend ใช้ MockApiService (localStorage)
- ต้องแก้ไข REACT_APP_API_URL ใน Vercel

**ถ้าได้ `https://plant-price-backend-production.up.railway.app`:**
- Frontend ใช้ RealApiService ✅
- ไปขั้นตอนที่ 3

---

### 3. เช็ค Network Requests

Browser DevTools → **Network** tab:

1. เปิดหน้า "รายการร้านค้า"
2. ดู requests → ควรมี request ไปที่:
   ```
   https://plant-price-backend-production.up.railway.app/api/suppliers
   ```

**ถ้าเห็น request นี้:**
- Frontend เรียก Real API ✅
- เช็ค Response Status:
  - `200 OK` → ทำงานได้ ✅
  - `500 Internal Server Error` → Backend error (ตารางไม่มี)
  - `404 Not Found` → API endpoint ผิด

**ถ้าไม่เห็น request:**
- Frontend ใช้ MockApiService (localStorage)
- ต้องแก้ไข REACT_APP_API_URL

---

### 4. เช็ค Response ใน Network Tab

1. Browser DevTools → **Network** tab
2. หา request `/api/suppliers`
3. คลิกดู **Response** tab

**ถ้าได้:**
```json
{
  "success": true,
  "data": [...],
  "message": "ดึงข้อมูลร้านค้าสำเร็จ"
}
```
→ ทำงานได้ ✅

**ถ้าได้:**
```json
{
  "success": false,
  "data": [],
  "message": "relation \"suppliers\" does not exist"
}
```
→ Backend error (ตารางไม่มี) → ต้องสร้างตารางใน database

---

## 🔧 วิธีแก้ไข:

### ถ้า Frontend ใช้ MockApiService:

1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. แก้ไข `REACT_APP_API_URL` = `https://plant-price-backend-production.up.railway.app`
3. **Save** → Vercel จะ auto-redeploy
4. รอ deploy เสร็จ → Hard Refresh หน้าเว็บ (Cmd+Shift+R)

### ถ้า Frontend ใช้ RealApiService แต่ยัง error:

1. **Backend error** → ต้องสร้างตาราง suppliers ใน database
2. ใช้ External Database Client หรือ SQL manual

---

## 📝 Checklist:

- [ ] REACT_APP_API_URL ใน Vercel = `https://plant-price-backend-production.up.railway.app`
- [ ] Frontend Console แสดง API URL ถูกต้อง
- [ ] Network tab มี request ไปที่ backend URL
- [ ] API Response ไม่ error
- [ ] หน้า "รายการร้านค้า" แสดงข้อมูลจาก database

