# 🔍 ตรวจสอบ Railway Backend URL

## ⚠️ ปัญหา:

**REACT_APP_API_URL ใน Vercel:**
```
https://plant-price-backend-production.up.railway.app
```

**แต่โปรเจค Railway ชื่อ:**
```
lovely-rejoicing
```

**→ URL อาจไม่ตรงกับโปรเจคปัจจุบัน!**

---

## 🔍 วิธีเช็ค Railway Backend URL ที่ถูกต้อง:

### วิธีที่ 1: เช็คใน Railway Dashboard

1. **Railway Dashboard** → Project `lovely-rejoicing`
2. ไปที่ **Backend Service** (หรือ Web Service)
3. ไปที่ **Settings** → **Generate Domain** หรือ **Networking**
4. **ดู Domain หรือ URL** ที่ Railway ให้มา
5. **Copy URL นั้น** (ควรมี format: `xxx.up.railway.app` หรือ `xxx.railway.app`)

### วิธีที่ 2: ใช้ Railway CLI

```bash
# Login Railway
railway login

# Link to project
railway link

# ดู domain
railway domain
```

---

## 🎯 URL ที่ควรใช้:

**ถ้าโปรเจค `lovely-rejoicing` ควรได้ URL แบบ:**
```
https://xxx-lovely-rejoicing.up.railway.app
```
หรือ
```
https://xxx-production.up.railway.app
```

**ไม่ใช่:**
```
https://plant-price-backend-production.up.railway.app
```
(นี่ดูเหมือน URL จากโปรเจคเก่า)

---

## ✅ วิธีแก้ไข:

### 1. หา Backend URL ที่ถูกต้องจาก Railway:

1. Railway Dashboard → Project `lovely-rejoicing` → **Backend Service**
2. **Settings** → **Networking** หรือ **Generate Domain**
3. Copy URL ที่ได้

### 2. อัปเดตใน Vercel:

1. **Vercel Dashboard** → Project → **Settings** → **Environment Variables**
2. หา `REACT_APP_API_URL`
3. **Edit** → เปลี่ยน Value เป็น URL จาก Railway
4. **Save** → Vercel จะ auto-redeploy

### 3. Test API:

```bash
curl https://[railway-url]/api/health
```

ควรได้:
```json
{"status":"OK","message":"Plant Price API is running"}
```

---

## 📝 Checklist:

- [ ] เช็คว่า Railway project `lovely-rejoicing` มี Backend URL อะไร
- [ ] Copy URL นั้น
- [ ] แก้ไข `REACT_APP_API_URL` ใน Vercel ให้ตรงกับ URL จาก Railway
- [ ] Test API ว่าทำงานได้
- [ ] รอ Vercel redeploy
- [ ] Test Frontend ว่าทำงานได้

---

## 💡 Tips:

**ถ้าไม่แน่ใจ URL:**
1. ไปที่ Railway Dashboard → Project `lovely-rejoicing`
2. ดู **Services** list
3. คลิกที่ **Backend Service** (หรือ Web Service)
4. ดู **Networking** tab → จะมี URL แสดงอยู่

**หรือ:**
- Railway Dashboard → Project → **Settings** → **Domains**
- จะแสดง URL ทั้งหมดที่มี

