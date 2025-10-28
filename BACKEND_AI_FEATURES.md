# 🤖 Backend AI Features

## ✨ Features ที่เพิ่มเข้าไป

### 1. **AI Validation** 📝
**Endpoint**: `POST /api/ai/validate`

ตรวจสอบความถูกต้องของข้อมูลด้วย AI:
- ตรวจสอบข้อมูลที่กรอกผิด
- แนะนำการแก้ไข
- ให้คะแนนความเชื่อมั่น

**ตัวอย่าง:**
```bash
curl -X POST https://your-backend.railway.app/api/ai/validate \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "มอนสเตอร่า",
      "price": 500
    },
    "type": "plant"
  }'
```

---

### 2. **AI Price Analysis** 💰
**Endpoint**: `POST /api/ai/analyze-price`

วิเคราะห์ราคาด้วย AI:
- เปรียบเทียบกับราคาตลาด
- แนะนำราคาที่เหมาะสม
- วิเคราะห์แนวโน้มราคา

**ตัวอย่าง:**
```bash
curl -X POST https://your-backend.railway.app/api/ai/analyze-price \
  -H "Content-Type: application/json" \
  -d '{
    "plantName": "มอนสเตอร่า",
    "price": 500,
    "category": "ไม้ประดับ",
    "historicalPrices": [450, 500, 550]
  }'
```

---

### 3. **AI Business Insights** 📊
**Endpoint**: `GET /api/ai/insights`

ดูข้อมูลเชิงลึกของธุรกิจ:
- สถิติต้นไม้และร้านค้า
- ราคาเฉลี่ย
- ต้นไม้ยอดนิยม
- คำแนะนำ

**ตัวอย่าง:**
```bash
curl https://your-backend.railway.app/api/ai/insights
```

---

## 🔧 Smart Pricing

### ระบบแนะนำราคาที่เหมาะสม
- วิเคราะห์ราคาปัจจุบัน
- เปรียบเทียบกับราคาเฉลี่ย
- แนะนำราคาที่เหมาะสม
- ตรวจสอบราคาที่ผิดปกติ

---

## 🎯 วิธีใช้งาน

### 1. **ตรวจสอบข้อมูลด้วย AI**
```javascript
const response = await fetch('https://your-backend/api/ai/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: plantData,
    type: 'plant'
  })
});
```

### 2. **วิเคราะห์ราคาด้วย AI**
```javascript
const response = await fetch('https://your-backend/api/ai/analyze-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    plantName: 'มอนสเตอร่า',
    price: 500,
    category: 'ไม้ประดับ'
  })
});
```

### 3. **ดูข้อมูลเชิงลึก**
```javascript
const response = await fetch('https://your-backend/api/ai/insights');
const insights = await response.json();
```

---

## 💡 ข้อดี

1. ✅ **ตรวจสอบข้อมูล** - ป้องกันข้อมูลผิดพลาด
2. ✅ **วิเคราะห์ราคา** - แนะนำราคาที่เหมาะสม
3. ✅ **Smart Insights** - ข้อมูลเชิงลึกของธุรกิจ
4. ✅ **Duplicate Detection** - ตรวจสอบข้อมูลซ้ำ
5. ✅ **Smart Pricing** - แนะนำราคาที่เหมาะสม

---

## 🔑 Environment Variables

```bash
OPENAI_API_KEY=your_openai_key_here
```

*ถ้าไม่มี API key ระบบจะทำงานแบบ mock mode*

