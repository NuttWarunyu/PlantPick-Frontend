# 📤 คู่มือการ Push Code

## 🎯 สถานะ Repository

### 1. **Frontend Repository** (PlantPick-Frontend)
- **URL**: https://github.com/NuttWarunyu/PlantPick-Frontend
- **Contains**: Frontend (plant-price-system/)
- **Deploy**: Vercel (Auto)
- **Branch**: main

### 2. **Backend Repository** (PlantPick-Backend)  
- **URL**: https://github.com/NuttWarunyu/PlantPick-Backend
- **Contains**: Backend (backend/)
- **Deploy**: Railway (Manual)
- **Branch**: main

### 3. **Local Repository** (ในเครื่องคุณ)
- **Location**: `/Users/warunyu/PlantPick/`
- **Contains**: Frontend + Backend (ในที่เดียวกัน)
- **Branch**: main

---

## 📤 วิธี Push Code

### **กรณีที่ 1: Push Frontend เท่านั้น**

```bash
cd /Users/warunyu/PlantPick

# Commit และ push frontend
git add plant-price-system/
git commit -m "your message"
git push origin main
```

✅ Vercel จะ auto-deploy อัตโนมัติ

---

### **กรณีที่ 2: Push Backend เท่านั้น**

```bash
# Clone Backend repository
cd /Users/warunyu/PlantPick-Backend

# Copy backend files
cp -r /Users/warunyu/PlantPick/backend/* .

# Commit และ push
git add .
git commit -m "your message"
git push origin main
```

✅ แล้วต้อง deploy บน Railway ด้วย:
```bash
railway login
railway link
railway up
```

---

### **กรณีที่ 3: Push ทั้ง Frontend และ Backend**

```bash
# 1. Push Frontend
cd /Users/warunyu/PlantPick
git add plant-price-system/
git commit -m "Update frontend"
git push origin main

# 2. Push Backend  
cd /Users/warunyu/PlantPick-Backend
cp -r /Users/warunyu/PlantPick/backend/* .
git add .
git commit -m "Update backend"
git push origin main

# 3. Deploy Backend
cd backend
railway up
```

---

## 🔄 วิธีที่ง่ายกว่า: รวม Repository

แนะนำให้รวม Frontend + Backend เป็น repository เดียว:

```bash
cd /Users/warunyu/PlantPick

# Commit ทั้งหมด
git add .
git commit -m "Update both frontend and backend"

# Push ครั้งเดียว
git push origin main
```

✅ Vercel จะ deploy frontend อัตโนมัติ

สำหรับ backend ต้อง:
```bash
cd backend
railway up
```

---

## 💡 ข้อแนะนำ

### วิธีที่ 1: แยก Repository (ตอนนี้)
- ✅ แยก Frontend/Backend ชัดเจน
- ❌ ต้อง push 2 ครั้ง

### วิธีที่ 2: รวม Repository (แนะนำ)
- ✅ Push ครั้งเดียว
- ✅ จัดการง่ายขึ้น
- ❌ Repository ใหญ่ขึ้น

คุณต้องการให้เปลี่ยนเป็นการรวม repository หรือไม่?

