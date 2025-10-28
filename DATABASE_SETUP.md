# 🗄️ ตั้งค่า PostgreSQL Database บน Railway

## ✅ ขั้นตอนที่ 1: เพิ่ม Database Service

1. ไปที่ Railway Dashboard
2. Project: plant-price-backend
3. กด "**+ New**" หรือ "+ Add Service"
4. เลือก "**PostgreSQL**"
5. Railway จะสร้าง PostgreSQL database ให้อัตโนมัติ

---

## ✅ ขั้นตอนที่ 2: เชื่อม Database กับ Backend Service

1. เลือก **Backend Service** (web service)
2. ไปที่ "**Variables**" tab
3. กด "**+ New Variable**"
4. **Name**: `DATABASE_URL`
5. **Value**: `${{ Postgres.DATABASE_URL }}`
6. กด "**Save**"

⚠️ **สำคัญ**: ใช้ `${{ Postgres.DATABASE_URL }}` (มี `{{` และ `}}`)

Railway จะ inject connection string จาก PostgreSQL service เข้าไป

---

## ✅ ขั้นตอนที่ 3: Redeploy Backend

หลังจากตั้งค่า DATABASE_URL แล้ว:

```bash
cd backend
railway up
```

หรือกด "Redeploy" บน Railway Dashboard

---

## 🧪 Test Database Connection

```bash
# ตรวจสอบ backend logs
railway logs

# ควรเห็น:
# "Connected to PostgreSQL database"
```

---

## ✅ ตรวจสอบว่าดำเนินการถูกต้อง

- [ ] PostgreSQL service สร้างแล้วบน Railway
- [ ] DATABASE_URL variable ตั้งใน backend service
- [ ] Backend redeploy แล้ว
- [ ] Logs แสดง "Connected to PostgreSQL database"

---

## 💡 Tips

1. Database URL จะถูกสร้างโดย Railway อัตโนมัติ
2. ไม่ต้อง copy URL เอง ใช้ `${{ Postgres.DATABASE_URL }}` ได้เลย
3. รอให้ Railway ใช้ sync variable
4. ตรวจสอบ logs หากมีปัญหา

---

## 🎯 ต่อไป

เมื่อ database เชื่อมต่อแล้ว:

1. Backend จะใช้ PostgreSQL แทน localStorage
2. ข้อมูลจะถูกบันทึกใน database
3. ข้อมูลจะ persist แม้ redeploy

