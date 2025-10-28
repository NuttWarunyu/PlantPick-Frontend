# 🔗 คู่มือเชื่อมต่อ Backend Database จริง

## 📊 สถานะปัจจุบัน

### Frontend (Plant Price System)
- **URL**: https://github.com/NuttWarunyu/PlantPick-Frontend  
- **Deploy**: Vercel (Automatic)
- **Storage**: localStorage (ชั่วคราว)

### Backend (แยก Repository)
- **URL**: https://github.com/NuttWarunyu/PlantPick-Backend
- **Deploy**: Railway
- **Database**: PostgreSQL

---

## 🚀 วิธีเชื่อมต่อ Backend จริง

### ขั้นตอนที่ 1: Deploy Backend บน Railway

```bash
# 1. Clone Backend repository
cd /Users/warunyu/PlantPick-Backend/backend

# 2. Login Railway
railway login

# 3. Deploy
railway up

# 4. เพิ่ม PostgreSQL Database
railway add --plugin postgres

# 5. ตั้งค่า Environment Variables
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set FRONTEND_URL=https://your-frontend.vercel.app
```

### ขั้นตอนที่ 2: ตั้งค่า Frontend

```bash
# 1. แก้ไข .env ใน Frontend
cd plant-price-system
cp env.example .env

# 2. ใส่ backend URL
echo "REACT_APP_API_URL=https://your-backend.railway.app" >> .env
```

### ขั้นตอนที่ 3: Rebuild Frontend

```bash
# Build และ Deploy
cd plant-price-system
npm run build
vercel --prod
```

---

## 📝 หมายเหตุ

- ตอนนี้ระบบใช้ localStorage เพื่อให้ใช้งานได้ทันที
- ถ้าต้องการเชื่อมต่อกับ database จริง ต้อง deploy backend ก่อน
- ข้อมูลใน localStorage จะไม่ซิงค์กับ database จริง

---

## ✅ ข้อดีของการใช้ Database จริง

1. **หลายคนใช้ได้** - ไม่จำกัดที่เบราว์เซอร์เดียว
2. **ข้อมูลคงอยู่** - ไม่หายเมื่อลบ data
3. **Backup ได้** - มีระบบ backup อัตโนมัติ
4. **Scalable** - สามารถขยายได้ในอนาคต

