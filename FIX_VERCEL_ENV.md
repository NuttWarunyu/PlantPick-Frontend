# 🔧 แก้ไข Environment Variable บน Vercel

## ⚠️ ปัญหา:

Value ปัจจุบัน:
```
REACT_APP_API_URL: https://plantpick-frontend.up.railway.app
```

**→ ผิด! นี่คือ Frontend URL ไม่ใช่ Backend**

---

## ✅ วิธีแก้:

### 1. ไปที่ Vercel Dashboard
1. เปิด: https://vercel.com
2. Login
3. เลือก Project ของคุณ

### 2. ไปที่ Settings → Environment Variables
4. คลิก **Settings**
5. คลิก **Environment Variables**

### 3. แก้ไข REACT_APP_API_URL
6. หา `REACT_APP_API_URL`
7. คลิก **Edit** (✏️)
8. เปลี่ยน Value เป็น:
   ```
   https://plant-price-backend-production.up.railway.app
   ```
9. คลิก **Save**

### 4. Redeploy
10. ไปที่ **Deployments** tab
11. คลิก 3 dots (More) บน deployment ล่าสุด
12. เลือก **Redeploy**
13. รอจนสถานะเป็น "Ready"

---

## 🎯 URL ที่ถูกต้อง:

### Frontend (บน Vercel):
```
https://plantpick-frontend.up.railway.app
```
หรือ URL ที่ Vercel จัดให้

### Backend (บน Railway):
```
https://plant-price-backend-production.up.railway.app
```
← **ตัวนี้ต้องใส่ใน REACT_APP_API_URL**

### Database (บน Railway):
```
PostgreSQL - เชื่อมกับ Backend อัตโนมัติ
```

---

## ✅ หลังจากแก้ไขแล้ว:

1. ✅ **Frontend** จะเรียก API ไปที่ Backend
2. ✅ **Backend** จะบันทึกข้อมูลใน PostgreSQL
3. ✅ ทุกคนที่ใช้เว็บจะเห็นข้อมูลเดียวกัน
4. ✅ AI features ทำงานได้

---

## 🧪 ทดสอบ:

หลังจาก Redeploy เสร็จ:

1. ไปที่เว็บไซต์ของคุณ
2. ไปที่ `/add-supplier`
3. กรอกข้อมูลร้านค้า
4. บันทึก
5. ข้อมูลจะถูกบันทึกใน PostgreSQL ✅

