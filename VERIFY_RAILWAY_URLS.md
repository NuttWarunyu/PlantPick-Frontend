# 🔍 ตรวจสอบ Railway URLs ที่ถูกต้อง

## 📊 URLs ที่พบใน Railway Networking:

1. `plantpick-frontend.up.railway.app`
2. `plantpick.app` (custom domain)

---

## 🔍 ต้องเช็คว่า Backend Service URL คืออะไร:

### วิธีที่ 1: Test API Health Check

#### Test URL #1: `plantpick-frontend.up.railway.app`
```bash
curl https://plantpick-frontend.up.railway.app/api/health
```

**ถ้าได้:**
```json
{"status":"OK","message":"Plant Price API is running"}
```
→ นี่คือ Backend URL ✅

**ถ้าได้:**
- HTML page (React app)
- 404 error
- ไม่มี `/api/health`
→ นี่คือ Frontend URL ❌

#### Test URL #2: `plantpick.app`
```bash
curl https://plantpick.app/api/health
```

**ถ้าได้:**
```json
{"status":"OK","message":"Plant Price API is running"}
```
→ นี่คือ Backend URL ✅

**ถ้าได้:**
- HTML page (React app)
- 404 error
→ นี่คือ Frontend URL หรือ redirect ไป Frontend ❌

---

### วิธีที่ 2: เช็คใน Railway Dashboard

1. **Railway Dashboard** → Project `lovely-rejoicing`
2. **ดู Services list:**
   - **Backend Service** (หรือ **Web Service**) → URL อะไร?
   - **Frontend Service** (ถ้ามี) → URL อะไร?

3. **สำหรับ Backend Service:**
   - ไปที่ **Settings** → **Networking**
   - ดู **Public Networking** → Domain/URL คืออะไร?

---

## ⚠️ สิ่งที่ต้องระวัง:

### ชื่อ Domain อาจทำให้เข้าใจผิด:

- `plantpick-frontend.up.railway.app` → อาจเป็น Backend URL (แม้ชื่อบอกว่า frontend)
- `plantpick.app` → อาจเป็น custom domain สำหรับ Frontend หรือ Backend

### วิธีตรวจสอบที่แน่ชัด:

**ดูที่ Service Type:**
- **Backend Service** → ควรมี `/api/health` endpoint
- **Frontend Service** → ควรเป็น HTML page (React app)

---

## ✅ วิธีแก้ไข REACT_APP_API_URL:

### หลังจากหา Backend URL ที่ถูกต้องแล้ว:

1. **Vercel Dashboard** → Project → **Settings** → **Environment Variables**
2. หา `REACT_APP_API_URL`
3. **Edit** → เปลี่ยน Value เป็น Backend URL ที่ถูกต้อง:
   - ถ้า Backend = `plantpick-frontend.up.railway.app` → ใช้ตัวนี้
   - ถ้า Backend = `plantpick.app` → ใช้ตัวนี้
   - หรือ Backend URL อื่นๆ ที่ test `/api/health` ได้
4. **Save** → Vercel จะ auto-redeploy

---

## 📝 Checklist:

- [ ] Test `plantpick-frontend.up.railway.app/api/health`
- [ ] Test `plantpick.app/api/health`
- [ ] ดูว่า URL ไหนเป็น Backend (ได้ API response)
- [ ] อัปเดต `REACT_APP_API_URL` ใน Vercel
- [ ] Test Frontend ว่าทำงานได้

