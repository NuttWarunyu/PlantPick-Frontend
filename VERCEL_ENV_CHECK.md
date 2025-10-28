# ✅ เช็ค Environment Variable บน Vercel

## ขั้นตอน:

### 1. ไปที่ Vercel Dashboard
- เปิด: https://vercel.com
- เลือก Project ของคุณ

### 2. เช็ค Environment Variables
- ไปที่ **Settings** → **Environment Variables**
- หา `REACT_APP_API_URL`
- เช็คว่า Value เป็นอะไร

### 3. ถ้า Value ถูกต้อง
- Value ควรเป็น: `https://plant-price-backend-production.up.railway.app`
- **ไม่ต้องแก้ไขอะไร** - Vercel จะ auto-deploy

### 4. ถ้า Value ไม่ถูกต้อง
- คลิกที่ `REACT_APP_API_URL` เพื่อแก้ไข
- เปลี่ยน Value เป็น: `https://plant-price-backend-production.up.railway.app`
- Save
- **Vercel จะ auto-deploy ใหม่**

---

## 🎯 สิ่งที่ต้องเป็น:

```
Key: REACT_APP_API_URL
Value: https://plant-price-backend-production.up.railway.app
Scope: Production, Preview, Development (ทั้งหมด)
```

---

## ✅ ตรวจสอบว่า Deploy สำเร็จ:

1. ไปที่ **Deployments** tab
2. รอจนสถานะเป็น "Ready" (มี ✅)
3. คลิกที่ Deployment ล่าสุด
4. ทดสอบเพิ่มร้านค้าจริง

---

## 🧪 ทดสอบการเชื่อมต่อ:

1. ไปที่เว็บไซต์ของคุณบน Vercel
2. ไปที่หน้า `/add-supplier`
3. กรอกข้อมูลร้านค้า
4. บันทึก
5. ตรวจสอบว่าข้อมูลถูกบันทึกใน PostgreSQL

---

## 💡 Tips:

- ถ้า Vercel auto-deploy แล้ว **ไม่ต้องทำอะไร**
- ถ้าต้องการ Force Redeploy → ไปที่ Deployments → เลือก 3 dots (More) → Redeploy

