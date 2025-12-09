# 🗺️ คู่มือตั้งค่า Google Maps API สำหรับ PlantPick

## ⚠️ ปัญหาที่พบ
หากพบข้อความ "พบ 0 สถานที่" หรือ error เกี่ยวกับ Google Maps API แสดงว่ายังไม่ได้ตั้งค่า API Key หรือยังไม่ได้เปิดใช้งาน Places API

---

## 📋 ขั้นตอนการตั้งค่า Google Maps API

### 1. สร้าง Google Cloud Project

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. คลิก "Select a project" → "New Project"
3. ตั้งชื่อโปรเจค เช่น "PlantPick"
4. คลิก "Create"

### 2. เปิดใช้งาน APIs ที่จำเป็น

ต้องเปิดใช้งาน APIs เหล่านี้:

#### ✅ Places API (Text Search) - **จำเป็นสำหรับการค้นหา**
1. ไปที่ [API Library](https://console.cloud.google.com/apis/library)
2. ค้นหา "Places API"
3. คลิก "Places API"
4. คลิก "Enable"

#### ✅ Places API (Place Details) - **จำเป็นสำหรับข้อมูลเบอร์โทร, Rating**
- ใช้ API เดียวกันกับ Places API (Text Search)

#### ✅ Geocoding API - **จำเป็นสำหรับ Route Optimization**
1. ค้นหา "Geocoding API"
2. คลิก "Geocoding API"
3. คลิก "Enable"

#### ✅ Maps JavaScript API - **สำหรับ Route Optimization (optional)**
1. ค้นหา "Maps JavaScript API"
2. คลิก "Enable"

### 3. สร้าง API Key

1. ไปที่ [Credentials](https://console.cloud.google.com/apis/credentials)
2. คลิก "Create Credentials" → "API Key"
3. คัดลอก API Key ที่ได้

### 4. ตั้งค่า API Key Restrictions (แนะนำ)

เพื่อความปลอดภัย:

1. คลิกที่ API Key ที่สร้างไว้
2. ไปที่ "API restrictions"
3. เลือก "Restrict key"
4. เลือก APIs:
   - ✅ Places API
   - ✅ Geocoding API
   - ✅ Maps JavaScript API (ถ้าใช้)
5. คลิก "Save"

#### Application restrictions (Optional)
- เลือก "HTTP referrers" สำหรับ frontend
- หรือ "IP addresses" สำหรับ backend

---

## 🔧 ตั้งค่าใน Backend (Railway)

### วิธีที่ 1: ผ่าน Railway Dashboard

1. ไปที่ [Railway Dashboard](https://railway.app/)
2. เลือกโปรเจค PlantPick Backend
3. ไปที่ "Variables" tab
4. คลิก "New Variable"
5. ตั้งชื่อ: `GOOGLE_MAPS_API_KEY`
6. ตั้งค่า: `your_api_key_here` (ใส่ API Key ที่คัดลอกมา)
7. คลิก "Add"
8. **Restart service** (Railway จะ restart อัตโนมัติ)

### วิธีที่ 2: ผ่าน Railway CLI

```bash
railway variables set GOOGLE_MAPS_API_KEY=your_api_key_here
```

---

## 🔧 ตั้งค่าใน Local Development

### 1. สร้างไฟล์ `.env` ใน `backend/`

```bash
cd backend
cp env.example .env
```

### 2. แก้ไขไฟล์ `backend/.env`

```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. Restart Server

```bash
npm run dev
```

---

## ✅ ตรวจสอบว่าตั้งค่าถูกต้อง

### วิธีที่ 1: ตรวจสอบ Logs

เมื่อ start server ควรเห็น:
```
✅ Connected to PostgreSQL database
```

**ไม่ควรเห็น:**
```
⚠️ GOOGLE_MAPS_API_KEY is not set. Google Maps features will not work.
```

### วิธีที่ 2: ทดสอบ API Endpoint

```bash
# ทดสอบ Geocoding API
curl "https://maps.googleapis.com/maps/api/geocode/json?address=กรุงเทพ&key=YOUR_API_KEY"

# ทดสอบ Places API
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=ร้านต้นไม้&key=YOUR_API_KEY&language=th&region=th"
```

### วิธีที่ 3: ทดสอบในระบบ

1. เข้า `/ai-agent` (ต้องเป็น Admin)
2. ไปที่แท็บ "Google Maps"
3. คลิกปุ่ม Quick Search เช่น "คลอง 15"
4. ควรเห็นผลลัพธ์ (ไม่ใช่ 0 สถานที่)

---

## 🐛 Troubleshooting

### ปัญหา: "พบ 0 สถานที่"

**สาเหตุที่เป็นไปได้:**

1. **API Key ไม่ถูกตั้งค่า**
   - ตรวจสอบว่า `GOOGLE_MAPS_API_KEY` ถูกตั้งค่าใน Railway/Local
   - ตรวจสอบ logs: `⚠️ GOOGLE_MAPS_API_KEY is not set`

2. **Places API ยังไม่ได้เปิดใช้งาน**
   - ไปที่ Google Cloud Console → APIs & Services → Enabled APIs
   - ตรวจสอบว่า "Places API" ถูก enable แล้ว

3. **API Key Restrictions จำกัดเกินไป**
   - ตรวจสอบ API restrictions ใน Google Cloud Console
   - ลองลบ restrictions ชั่วคราวเพื่อทดสอบ

4. **Billing ไม่ได้เปิดใช้งาน**
   - Google Maps API ต้องเปิดใช้งาน Billing
   - ไปที่ Billing → Link billing account
   - มี Free Tier: $200 credit/เดือน (พอใช้)

5. **คำค้นหาไม่เจอผลลัพธ์**
   - ลองคำค้นหาอื่น เช่น "ตลาดต้นไม้ ปทุมธานี"
   - หรือ "plant market Thailand"

### ปัญหา: "REQUEST_DENIED"

**สาเหตุ:**
- API Key ไม่ถูกต้อง
- API ยังไม่ได้เปิดใช้งาน
- API Key restrictions จำกัดเกินไป

**วิธีแก้:**
1. ตรวจสอบ API Key ถูกต้อง
2. ตรวจสอบว่า Places API ถูก enable แล้ว
3. ลองลบ API restrictions ชั่วคราว

### ปัญหา: "OVER_QUERY_LIMIT"

**สาเหตุ:**
- ใช้ API เกิน quota

**วิธีแก้:**
1. ตรวจสอบ Quota ใน Google Cloud Console
2. เพิ่ม quota หรือรอให้ reset (รายวัน)

---

## 💰 ค่าใช้จ่าย Google Maps API

### Pricing (ณ วันที่ 2024)

- **Places API (Text Search)**: $32 per 1,000 requests
- **Places API (Place Details)**: $17 per 1,000 requests  
- **Geocoding API**: $5 per 1,000 requests

### Free Tier

Google ให้ **$200 credit/เดือน** ซึ่งครอบคลุม:
- ~6,250 Text Search requests
- ~11,764 Place Details requests
- ~40,000 Geocoding requests

### ค่าใช้จ่ายโดยประมาณ

สำหรับการใช้งานปกติ:
- ค้นหา 100 keywords/เดือน = ~100 Text Search requests = **$3.20**
- Place Details 200 places/เดือน = ~200 requests = **$3.40**
- **รวมประมาณ $6-10/เดือน** (ยังอยู่ใน Free Tier)

---

## 📝 ตัวอย่างการใช้งาน

### ทดสอบ API Key

```bash
# ทดสอบ Places API Text Search
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=ร้านต้นไม้+ตลาดวัดพระเงิน&key=YOUR_API_KEY&language=th&region=th"

# ทดสอบ Geocoding
curl "https://maps.googleapis.com/maps/api/geocode/json?address=คลอง+15+ปทุมธานี&key=YOUR_API_KEY&language=th&region=th"
```

### คำค้นหาที่แนะนำ

```
ร้านต้นไม้ ขายส่ง คลอง 15
ร้านต้นไม้ ขายส่ง ตลาดวัดพระเงิน
ตลาดต้นไม้ คลอง 15
ไม้ดอกไม้ประดับ คลอง 15
ร้านกล้วยไม้ ปทุมธานี
ตลาดต้นไม้ นครปฐม
```

---

## 🔒 Security Best Practices

1. **Restrict API Key** - จำกัดให้ใช้เฉพาะ APIs ที่จำเป็น
2. **Application Restrictions** - จำกัด IP addresses หรือ HTTP referrers
3. **Monitor Usage** - ตรวจสอบ usage ใน Google Cloud Console
4. **Set Budget Alerts** - ตั้งค่า alerts เมื่อใช้เกิน budget

---

## 📞 Support

หากยังมีปัญหา:
1. ตรวจสอบ logs ใน Railway Dashboard
2. ตรวจสอบ Google Cloud Console → APIs & Services → Quotas
3. ตรวจสอบ Billing → Usage

---

**Last Updated**: 2024-12-19

