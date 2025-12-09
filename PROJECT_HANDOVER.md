# 🌱 PlantPick - Project Handover Document

**สำหรับส่งต่องานให้ Antigravity หรือ Developer คนต่อไป**

---

## 📋 Executive Summary

**PlantPick** เป็นระบบจัดการราคาต้นไม้ครบวงจรสำหรับสวนธุรกิจไทย ที่ใช้ AI/ML ในการประมวลผลข้อมูลอัตโนมัติ

### Core Features
- ✅ **Price Comparison**: ค้นหาและเปรียบเทียบราคาต้นไม้จากหลาย Supplier
- ✅ **AI Bill Scanning**: สแกนใบเสร็จด้วย GPT-4o Vision (OCR + AI)
- ✅ **Web Scraping**: รวบรวมข้อมูลจาก Facebook/เว็บไซต์อัตโนมัติ
- ⚠️ **Google Maps Places Search**: ค้นหาร้านค้าจาก Google Maps (Partially Implemented - ต้องปรับปรุง)
- ✅ **Admin Dashboard**: จัดการข้อมูล, Approve scraping results
- ✅ **Database Management**: Backup, Restore, Bulk Import/Export

### Tech Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS (Deploy: Vercel)
- **Backend**: Node.js + Express + PostgreSQL (Deploy: Railway)
- **AI**: OpenAI GPT-4o, GPT-3.5-turbo
- **Database**: PostgreSQL (Railway managed)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│   Frontend (React + TypeScript)         │
│   Deployed: Vercel                      │
│   URL: https://plantpick-frontend.vercel.app │
└──────────────┬──────────────────────────┘
               │ HTTPS/REST API
               │
┌──────────────▼──────────────────────────┐
│   Backend API (Node.js + Express)      │
│   Deployed: Railway                     │
│   URL: https://plantpick-backend.railway.app │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   PostgreSQL Database (Railway)        │
└─────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
PlantPick/
├── backend/                    # Backend API
│   ├── server.js              # Main server file (2,537 lines)
│   ├── database.js            # Database queries (530 lines)
│   ├── package.json           # Dependencies
│   ├── services/              # Business logic
│   │   ├── aiService.js       # OpenAI integration
│   │   ├── agentService.js    # Web scraping service
│   │   ├── scrapingService.js # HTML scraping
│   │   ├── routeOptimizationService.js # Route optimization
│   │   ├── supplierValidationService.js # Supplier validation
│   │   └── adminAuth.js      # Admin authentication
│   ├── middleware/
│   │   └── adminAuth.js      # Admin auth middleware
│   └── scripts/               # Database migration scripts
│
├── plant-price-system/         # Frontend React App
│   ├── src/
│   │   ├── App.tsx            # Main app + routing (304 lines)
│   │   ├── pages/              # Page components
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── SearchPage.tsx
│   │   │   ├── BillScannerPage.tsx
│   │   │   ├── AiAgentPage.tsx        # Admin: Web scraping management
│   │   │   ├── DatabaseManagementPage.tsx # Admin: DB management
│   │   │   ├── SupplierListPage.tsx
│   │   │   ├── ProjectPage.tsx
│   │   │   └── ... (other pages)
│   │   ├── services/          # API services
│   │   │   ├── api.ts         # API client
│   │   │   └── aiService.ts   # AI service (frontend)
│   │   ├── components/        # Reusable components
│   │   └── contexts/          # React contexts
│   │       └── AdminContext.tsx # Admin auth context
│   └── package.json
│
└── Documentation/
    ├── README.md              # Main README
    ├── PLATFORM_OVERVIEW.md   # Detailed technical overview
    ├── DELETE_DATA_GUIDE.md   # Guide for deleting data
    └── PROJECT_HANDOVER.md    # This file
```

---

## 🗄️ Database Schema

### Core Tables

#### 1. `plants` - ข้อมูลต้นไม้
```sql
- id (VARCHAR) PRIMARY KEY
- name (VARCHAR) NOT NULL
- scientific_name (VARCHAR)
- category (VARCHAR)
- plant_type (VARCHAR)
- measurement_type (VARCHAR)
- description (TEXT)
- image_url (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### 2. `suppliers` - ข้อมูลร้านค้า/ผู้จัดจำหน่าย
```sql
- id (VARCHAR) PRIMARY KEY
- name (VARCHAR) NOT NULL
- location (TEXT) NOT NULL -- สำคัญสำหรับ Route Optimization
- phone (VARCHAR)
- phone_numbers (TEXT) -- JSON array
- website (VARCHAR)
- description (TEXT)
- specialties (TEXT) -- JSON array
- business_hours (VARCHAR)
- payment_methods (TEXT) -- JSON array
- latitude, longitude (DECIMAL) -- สำหรับ Route Optimization
- formatted_address (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### 3. `plant_suppliers` - ความสัมพันธ์ต้นไม้-ร้านค้า (ราคา)
```sql
- id (VARCHAR) PRIMARY KEY
- plant_id (VARCHAR) FK → plants.id
- supplier_id (VARCHAR) FK → suppliers.id
- price (DECIMAL) -- NULL ได้ถ้าเป็น catalog
- size (VARCHAR)
- image_url (TEXT)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(plant_id, supplier_id, size)
```

#### 4. `bills` - ใบเสร็จ
```sql
- id (VARCHAR) PRIMARY KEY
- supplier_id (VARCHAR) FK → suppliers.id
- supplier_name (VARCHAR) NOT NULL
- supplier_phone (VARCHAR)
- supplier_location (TEXT)
- bill_date (DATE)
- total_amount (DECIMAL) NOT NULL
- image_url (TEXT)
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### 5. `bill_items` - รายการในใบเสร็จ
```sql
- id (VARCHAR) PRIMARY KEY
- bill_id (VARCHAR) FK → bills.id
- plant_id (VARCHAR) FK → plants.id (NULL ได้ถ้าเป็นบริการ)
- plant_name (VARCHAR) NOT NULL
- quantity (INTEGER)
- price (DECIMAL) NOT NULL
- total_price (DECIMAL) NOT NULL
- size (VARCHAR)
- notes (TEXT)
- created_at (TIMESTAMP)
```

### AI Agent Tables

#### 6. `websites` - เว็บไซต์ที่ต้อง scrape
```sql
- id (VARCHAR) PRIMARY KEY
- name (VARCHAR) NOT NULL
- url (TEXT) NOT NULL
- description (TEXT)
- enabled (BOOLEAN) DEFAULT true
- schedule (VARCHAR) -- 'daily', 'weekly', 'manual'
- last_scraped (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

#### 7. `scraping_jobs` - ประวัติการ scrape
```sql
- id (VARCHAR) PRIMARY KEY
- website_id (VARCHAR) FK → websites.id
- url (TEXT) NOT NULL
- status (VARCHAR) -- 'pending', 'processing', 'completed', 'failed'
- started_at, completed_at (TIMESTAMP)
- result (TEXT) -- JSON result
- error_message (TEXT)
- created_at (TIMESTAMP)
```

#### 8. `scraping_results` - ผลลัพธ์การ scrape (รอ Approve)
```sql
- id (VARCHAR) PRIMARY KEY
- job_id (VARCHAR) FK → scraping_jobs.id
- plant_id (VARCHAR) FK → plants.id (NULL จนกว่า approve)
- supplier_id (VARCHAR) FK → suppliers.id (NULL จนกว่า approve)
- plant_name (VARCHAR) NOT NULL
- price (DECIMAL) -- NULL ถ้าไม่มีราคา
- size (VARCHAR)
- raw_data (TEXT) -- JSON raw data
- confidence (DECIMAL) -- 0.00-1.00
- status (VARCHAR) -- 'pending', 'approved', 'rejected'
- approved_by (VARCHAR) -- admin user ID
- approved_at (TIMESTAMP)
- image_url (TEXT)
- supplier_name (VARCHAR)
- supplier_phone (VARCHAR)
- supplier_location (TEXT)
- created_at (TIMESTAMP)
```

**⚠️ Important**: เมื่อ approve แล้ว ข้อมูลจะถูกลบออกจาก `scraping_results` ทันที (บันทึกลง `plants`/`suppliers` แล้ว)

---

## 🔌 API Endpoints (สำคัญ)

### Health Check
- `GET /api/health` - ตรวจสอบสถานะ API

### Plants
- `GET /api/plants` - ดึงข้อมูลต้นไม้ทั้งหมด
- `GET /api/plants/:id` - ดึงข้อมูลต้นไม้ตาม ID
- `POST /api/plants` - สร้างต้นไม้ใหม่
- `DELETE /api/plants/:id` - ลบต้นไม้

### Suppliers
- `GET /api/suppliers` - ดึงข้อมูลร้านค้าทั้งหมด
- `POST /api/suppliers` - สร้างร้านค้าใหม่
- `DELETE /api/suppliers/:id` - ลบร้านค้า
- `POST /api/plants/:plantId/suppliers` - เพิ่ม supplier ให้ plant
- `PUT /api/plants/:plantId/suppliers/:supplierId/price` - อัปเดตราคา
- `DELETE /api/plants/:plantId/suppliers/:supplierId` - ลบ supplier จาก plant

### Bills
- `GET /api/bills` - ดึงข้อมูลใบเสร็จทั้งหมด
- `POST /api/bills` - สร้างใบเสร็จใหม่
- `GET /api/bills/:id` - ดึงข้อมูลใบเสร็จตาม ID

### AI Services
- `POST /api/ai/scan-bill` - สแกนใบเสร็จด้วย GPT-4o Vision
- `POST /api/ai/analyze-price` - วิเคราะห์ราคาด้วย AI

### AI Agent (Admin Only)
- `GET /api/agents/websites` - ดึงรายการเว็บไซต์
- `POST /api/agents/websites` - เพิ่มเว็บไซต์
- `DELETE /api/agents/websites/:id` - ลบเว็บไซต์
- `POST /api/agents/scrape` - Trigger scraping
- `GET /api/agents/jobs` - ดึงประวัติการ scrape
- `GET /api/agents/results` - ดึงผลลัพธ์การ scrape
- `POST /api/agents/results/:id/approve` - Approve ผลลัพธ์ (ลบออกจากรายการทันที)
- `POST /api/agents/results/:id/reject` - Reject ผลลัพธ์
- `PUT /api/agents/results/:id/location` - อัปเดต location ของ supplier
- `POST /api/agents/analyze-text` - วิเคราะห์ข้อความจาก Facebook
- `POST /api/agents/maps/search` - ค้นหาจาก Google Places API และบันทึกลง scraping_results

### Admin
- `POST /api/admin/login` - Login (ใช้ password จาก env)
- `POST /api/admin/logout` - Logout
- `GET /api/admin/check` - ตรวจสอบ admin status
- `DELETE /api/admin/data/clear-all` - ลบข้อมูลทั้งหมด (ต้องยืนยัน)

### Route Optimization
- `POST /api/route/optimize` - คำนวณเส้นทางที่เหมาะสม
- `POST /api/route/geocode` - Geocode address

### Statistics
- `GET /api/statistics` - ดึงสถิติฐานข้อมูล

---

## 🔐 Authentication & Security

### Admin Authentication
- **Method**: JWT-based (via `adminAuth` service)
- **Password**: ตั้งใน `ADMIN_PASSWORD` environment variable
- **Middleware**: `requireAdmin` สำหรับ routes ที่ต้องเป็น admin
- **Protected Routes**: 
  - `/api/agents/*` (AI Agent management)
  - `/api/admin/*` (Admin functions)
  - `/api/admin/data/clear-all` (Delete all data)

### Security Features
- **Helmet**: Security headers
- **CORS**: Configured for frontend origin
- **SQL Injection Prevention**: Parameterized queries (pg library)
- **Input Validation**: Basic validation on endpoints

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
# Server
PORT=3001
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://plantpick-frontend.vercel.app

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# API Keys
OPENAI_API_KEY=sk-...                    # OpenAI API key (required)
GOOGLE_MAPS_API_KEY=...                  # Google Maps API (REQUIRED for Places Search & Route Optimization)
                                        # Enable APIs: Places API, Geocoding API, Maps JavaScript API

# Admin
ADMIN_PASSWORD=your_secure_password       # Admin login password
```

### Frontend (`plant-price-system/.env`)
```env
# API Configuration
REACT_APP_API_URL=https://plantpick-backend.railway.app

# Development (local)
# REACT_APP_API_URL=http://localhost:3001
```

---

## 🚀 Deployment

### Backend (Railway)
1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to `main`
4. Database: PostgreSQL (Railway managed)

**Files**:
- `Procfile`: `web: node server.js`
- `railway.json`: Build configuration

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables (`REACT_APP_API_URL`)
3. Deploy automatically on push to `main`

**Files**:
- `vercel.json`: Routing configuration

---

## ✅ Features ที่ใช้งานได้

### 1. Plant & Supplier Management
- ✅ CRUD operations สำหรับ plants และ suppliers
- ✅ Plant-supplier relationships with pricing
- ✅ Bulk import จาก CSV
- ✅ ลบข้อมูล (รายการเดียวหรือทั้งหมด)

### 2. Bill Processing (AI Vision)
- ✅ สแกนใบเสร็จด้วย GPT-4o Vision
- ✅ Extract ข้อมูลอัตโนมัติ (supplier, items, prices)
- ✅ Auto-update ราคาใน plant_suppliers
- ✅ Bill history tracking

### 3. AI Agent (Web Scraping)
- ✅ จัดการเว็บไซต์ที่ต้อง scrape
- ✅ HTML scraping (Puppeteer/Cheerio)
- ✅ AI text analysis (GPT-4o)
- ✅ Facebook post parsing
- ✅ Approval workflow (admin approve ก่อนบันทึก)
- ✅ **เมื่อ approve แล้วจะลบออกจากรายการทันที**
- ⚠️ **Google Maps Places Search** (Partially Implemented)
  - ✅ Backend service exists (`googleMapsService.js`)
  - ✅ API endpoint exists (`POST /api/agents/maps/search`)
  - ✅ Frontend UI tab exists (needs testing/improvement)
  - ⚠️ Needs: Better deduplication, AI filtering improvement, geocoding save

### 4. Search & Price Comparison
- ✅ ค้นหาต้นไม้
- ✅ เปรียบเทียบราคาจากหลาย suppliers
- ✅ Sort และ filter

### 5. Admin Features
- ✅ Admin authentication
- ✅ Scraping results approval
- ✅ Database management (Backup, Restore, Clear all)
- ✅ Bulk operations

### 6. Project Management
- ✅ สร้างโปรเจกต์
- ✅ จัดการโปรเจกต์

---

## 🚧 Features ที่ซ่อนไว้ (ยังไม่ได้ใช้)

หน้าเหล่านี้ถูก comment out ในโค้ดแล้ว แต่ยังมีไฟล์อยู่:

1. **Price Analysis** (`PriceAnalysisPage.tsx`)
   - Route: `/price-analysis`
   - Status: Commented out in `App.tsx` และ `DashboardPage.tsx`

2. **Route Optimization** (`RouteOptimizationPage.tsx`)
   - Route: `/route-optimization`
   - Status: Commented out in `App.tsx` และ `DashboardPage.tsx`
   - Note: มี service `routeOptimizationService.js` อยู่แล้ว

3. **Cost Analysis** (`CostAnalysisPage.tsx`)
   - Route: `/cost-analysis`
   - Status: Commented out in `App.tsx` และ `DashboardPage.tsx`

**วิธีเปิดใช้**: Uncomment ใน `App.tsx` และ `DashboardPage.tsx`

---

## 🔄 Data Flow (สำคัญ)

### 1. Bill Scanning Flow
```
User uploads bill image
  ↓
POST /api/ai/scan-bill
  ↓
GPT-4o Vision API extracts data
  ↓
User confirms → POST /api/bills
  ↓
Backend:
  1. findOrCreateSupplier()
  2. createBill()
  3. For each item:
     - findOrCreatePlant()
     - addBillItem()
     - upsertPlantSupplier() (update price)
```

### 2. Web Scraping Flow
```
Admin triggers scrape → POST /api/agents/scrape
  ↓
Backend scrapes HTML/text
  ↓
AI analyzes → GPT-4o extracts plant data
  ↓
Save to scraping_results (status: 'pending')
  ↓
Admin reviews → POST /api/agents/results/:id/approve
  ↓
Backend:
  1. findOrCreateSupplier() (requires location!)
  2. findOrCreatePlant()
  3. upsertPlantSupplier()
  4. DELETE scraping_results (ลบออกทันที)
```

### 3. Price Update Flow
```
Bill scanned → Bill items created
  ↓
For each bill item:
  - Find plant by name
  - Find supplier by name
  - upsertPlantSupplier() with new price
  ↓
Price updated in plant_suppliers table
```

---

## 📝 Important Code Patterns

### Database Queries (backend/database.js)
```javascript
// Pattern: findOrCreate
async findOrCreatePlant(plantData) {
  // 1. Try to find existing
  const findResult = await pool.query(`SELECT id FROM plants WHERE LOWER(name) = LOWER($1)`, [name]);
  
  // 2. If exists, update
  if (findResult.rows.length > 0) {
    await pool.query(`UPDATE plants SET ... WHERE id = $1`, [id]);
    return existing;
  }
  
  // 3. If not exists, create
  const newId = `plant_${uuidv4()}`;
  await pool.query(`INSERT INTO plants ...`, [newId, ...]);
  return new;
}
```

### AI Service Pattern (backend/services/aiService.js)
```javascript
async scanBill(imageBase64) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Extract data from this bill...' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      ]
    }]
  });
  
  // Parse JSON response
  const data = JSON.parse(response.choices[0].message.content);
  return data;
}
```

### Admin Auth Pattern
```javascript
// Middleware
const requireAdmin = async (req, res, next) => {
  const token = req.headers['x-admin-token'] || req.headers['authorization']?.replace('Bearer ', '');
  const admin = adminAuth.verifyToken(token);
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  req.admin = admin;
  next();
};

// Usage
app.post('/api/agents/scrape', requireAdmin, async (req, res) => {
  // Only admin can access
});
```

---

## 🐛 Known Issues & Technical Debt

1. **Error Handling**: บาง endpoints ยังไม่มี comprehensive error handling
2. **Validation**: Input validation ควรใช้ Joi/Yup แทน manual validation
3. **Testing**: Minimal test coverage (ไม่มี unit tests)
4. **Type Safety**: Backend ใช้ JavaScript (ควร migrate เป็น TypeScript)
5. **Rate Limiting**: ยังไม่มี rate limiting บน API endpoints
6. **Caching**: ยังไม่มี caching layer
7. **Facebook Scraping**: ถูกจำกัดโดย Facebook bot protection

---

## 🎯 Next Steps / TODO

### High Priority - Google Maps Places Search Feature

**Status**: ⚠️ **Partially Implemented** - ต้องเพิ่ม/ปรับปรุง

#### ✅ Already Implemented:
1. **Backend Service**: `backend/services/googleMapsService.js`
   - ✅ `searchPlaces(keyword)` - Google Places Text Search API
   - ✅ `getPlaceDetails(placeId)` - Place Details API (phone, rating, reviews)
   - ✅ `formatPlace(place)` - Format Google Place to Supplier structure

2. **Agent Service**: `backend/services/agentService.js`
   - ✅ `searchPlacesAndSave(keywords, filterWholesale)` - Search and save to scraping_results
   - ✅ Basic deduplication (by Place ID)
   - ✅ Place Details fetching (phone, rating)
   - ⚠️ `checkIfWholesale(place)` - AI filtering (มีอยู่แต่ต้องปรับปรุง)

3. **API Endpoint**: `backend/server.js`
   - ✅ `POST /api/agents/maps/search` - Search places and save to scraping_results

4. **Frontend UI**: `plant-price-system/src/pages/AiAgentPage.tsx`
   - ✅ Tab "maps" exists
   - ✅ Search form with keywords textarea
   - ✅ Filter wholesale checkbox
   - ⚠️ `handleSearchMaps()` function (ต้องตรวจสอบว่าทำงานหรือไม่)

#### ❌ Missing / Needs Improvement:

1. **UI ค้นหาจาก Google Maps** ⚠️
   - ✅ Tab exists but needs testing
   - ❌ Missing: Better UI/UX for results display
   - ❌ Missing: Map visualization (optional)
   - ❌ Missing: Search history

2. **Google Places API Integration** ✅
   - ✅ Text Search API - Working
   - ✅ Place Details API - Working
   - ⚠️ Need: Better error handling
   - ⚠️ Need: Rate limiting handling

3. **บันทึกลง scraping_results** ✅
   - ✅ Working in `searchPlacesAndSave()`
   - ⚠️ Need: Better data structure in `raw_data` JSON

4. **Admin Approve → บันทึกลง suppliers** ✅
   - ✅ Existing approval workflow works
   - ✅ When approved, saves to suppliers table
   - ✅ Deletes from scraping_results after approval

5. **Deduplication พื้นฐาน** ✅
   - ✅ By Place ID (in `searchPlacesAndSave()`)
   - ⚠️ Need: Better deduplication (by name + location)

#### 🚧 Features to Add/Improve:

1. **AI Filtering (กรองร้านขายส่ง)** ⚠️
   - ✅ Function exists: `checkIfWholesale(place)`
   - ⚠️ Need: Improve AI prompt for better accuracy
   - ⚠️ Need: Cache results to reduce API calls

2. **Place Details (เบอร์โทร, Rating, รีวิว)** ✅
   - ✅ `getPlaceDetails()` fetches phone, rating, reviews
   - ⚠️ Need: Save reviews to database
   - ⚠️ Need: Display rating in UI

3. **Geocoding (lat/lng)** ✅
   - ✅ Already included in `formatPlace()` (coords.lat, coords.lng)
   - ✅ Already saved in `raw_data` JSON
   - ⚠️ Need: Save to suppliers.latitude, suppliers.longitude when approved

4. **Batch Search** ✅
   - ✅ Supports multiple keywords (one per line)
   - ⚠️ Need: Progress indicator
   - ⚠️ Need: Cancel functionality

5. **Better Deduplication** ⚠️
   - ✅ Basic deduplication by Place ID
   - ❌ Need: Deduplication by name + location similarity
   - ❌ Need: Check against existing suppliers table
   - ❌ Need: Fuzzy matching for similar names

### Implementation Guide for Antigravity:

#### 1. Test Existing Features
```bash
# Test API endpoint
curl -X POST https://your-backend-url/api/agents/maps/search \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["ร้านต้นไม้ ขายส่ง ตลาดวัดพระเงิน"],
    "filterWholesale": false
  }'
```

#### 2. Improve Frontend UI
- File: `plant-price-system/src/pages/AiAgentPage.tsx`
- Check `handleSearchMaps()` function (around line 250-300)
- Add loading states, progress indicator
- Display search results in a better format

#### 3. Improve Deduplication
- File: `backend/services/agentService.js`
- Function: `searchPlacesAndSave()`
- Add: Check against existing suppliers by name + location
- Add: Fuzzy matching algorithm

#### 4. Improve AI Filtering
- File: `backend/services/agentService.js`
- Function: `checkIfWholesale(place)`
- Improve: AI prompt for better accuracy
- Add: Caching to reduce API costs

#### 5. Save Geocoding to Suppliers
- When approving scraping result from Google Maps:
  - Extract `coords.lat` and `coords.lng` from `raw_data`
  - Save to `suppliers.latitude` and `suppliers.longitude`
  - File: `backend/server.js` - `POST /api/agents/results/:id/approve`

#### 6. Add Place Details to UI
- Display rating, phone number, reviews in scraping results
- File: `plant-price-system/src/pages/AiAgentPage.tsx`
- Tab: "results" - enhance result card display

### Other High Priority Tasks:

1. ✅ **Route Optimization**: มี service อยู่แล้ว แต่หน้า UI ถูกซ่อนไว้
   - Uncomment `RouteOptimizationPage` ใน `App.tsx`
   - Test และปรับปรุง UI

2. ✅ **Data Quality**: 
   - Geocode supplier locations (มี script `geocode-suppliers.js` อยู่แล้ว)
   - Validate locations ก่อน approve scraping results

3. ✅ **Testing**: 
   - เพิ่ม unit tests สำหรับ services
   - เพิ่ม integration tests สำหรับ API endpoints

### Medium Priority
4. **Mobile UX**: ปรับปรุง mobile experience
5. **Performance**: เพิ่ม caching (Redis)
6. **Monitoring**: เพิ่ม error tracking (Sentry)

### Low Priority
7. **Documentation**: API documentation (Swagger/OpenAPI)
8. **Rate Limiting**: เพิ่ม rate limiting
9. **Background Jobs**: ใช้ job queue (Bull/BullMQ)

---

## 📚 Key Files to Understand

### Backend
1. **`backend/server.js`** (2,537 lines)
   - Main server file
   - All API endpoints
   - Start here!

2. **`backend/database.js`** (530 lines)
   - Database queries
   - findOrCreate patterns
   - CRUD operations

3. **`backend/services/aiService.js`**
   - OpenAI integration
   - GPT-4o Vision for bill scanning
   - GPT-4o for text analysis

4. **`backend/services/agentService.js`**
   - Web scraping orchestration
   - AI validation
   - Data cleaning

### Frontend
1. **`plant-price-system/src/App.tsx`** (304 lines)
   - Main app component
   - Routing configuration
   - Navigation menu

2. **`plant-price-system/src/pages/AiAgentPage.tsx`** (1,285 lines)
   - Admin page for web scraping
   - Approval workflow
   - Website management

3. **`plant-price-system/src/pages/DatabaseManagementPage.tsx`** (632 lines)
   - Admin page for database management
   - Backup/Restore
   - Clear all data

---

## 🔑 Important Notes

### 1. Admin Password
- ตั้งใน `ADMIN_PASSWORD` environment variable
- ใช้สำหรับ login ที่ `/admin-login`
- JWT token ถูกเก็บใน localStorage

### 2. OpenAI API Key
- **Required** สำหรับ bill scanning และ text analysis
- ใช้ GPT-4o (แพงกว่าแต่แม่นยำกว่า)
- Cost: ~$2.50/1M input tokens, $10/1M output tokens

### 3. Database Migrations
- ใช้ scripts ใน `backend/scripts/`
- Run: `npm run migrate` หรือ `node scripts/migrate.js`
- Tables จะถูกสร้างอัตโนมัติเมื่อ server start (ถ้ายังไม่มี)

### 4. Scraping Results Approval
- **สำคัญ**: เมื่อ approve แล้ว ข้อมูลจะถูกลบออกจาก `scraping_results` ทันที
- ข้อมูลถูกบันทึกลง `plants` และ `suppliers` แล้ว
- Frontend จะ filter approved results ออกจากการแสดงผล

### 5. Supplier Location
- **Required** สำหรับ Route Optimization
- ต้องมี `location` ก่อน approve scraping result
- มี script `geocode-suppliers.js` สำหรับ geocode locations

---

## 📞 Support & Resources

### Documentation Files
- `README.md` - Main overview
- `PLATFORM_OVERVIEW.md` - Detailed technical overview (1,330 lines)
- `DELETE_DATA_GUIDE.md` - Guide for deleting data
- `DEPLOYMENT.md` - Deployment guide
- `QUICK_DEPLOY.md` - Quick deployment guide

### External Resources
- **OpenAI API**: https://platform.openai.com/docs/
- **Railway**: https://docs.railway.app/
- **Vercel**: https://vercel.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs/

---

## 🎓 Getting Started (สำหรับ Developer ใหม่)

### 1. Setup Local Development
```bash
# Clone repository
git clone <repository-url>
cd PlantPick

# Install dependencies
cd backend && npm install
cd ../plant-price-system && npm install

# Setup environment variables
cp backend/env.example backend/.env
cp plant-price-system/env.example plant-price-system/.env

# Edit .env files with your keys
```

### 2. Run Locally
```bash
# Terminal 1: Backend
cd backend
npm run dev  # Runs on http://localhost:3001

# Terminal 2: Frontend
cd plant-price-system
npm start    # Runs on http://localhost:3000
```

### 3. First Steps
1. ✅ เข้า `/admin-login` และ login ด้วย `ADMIN_PASSWORD`
2. ✅ ไปที่ `/database` เพื่อดู database management
3. ✅ ไปที่ `/ai-agent` เพื่อดู web scraping
4. ✅ ไปที่ `/bill-scanner` เพื่อทดสอบ bill scanning
5. ✅ ไปที่ `/search` เพื่อค้นหาต้นไม้

---

## 💡 Tips for Development

1. **Always check logs**: Backend logs ใน Railway dashboard, Frontend logs ใน browser console
2. **Test with real data**: ใช้ข้อมูลจริงจากใบเสร็จหรือ Facebook posts
3. **Check database**: ใช้ Railway database dashboard เพื่อดูข้อมูล
4. **AI costs**: ระวัง OpenAI API costs (ใช้ GPT-4o-mini สำหรับ simple tasks)
5. **Location is critical**: Supplier location สำคัญมากสำหรับ Route Optimization

---

## 🎯 Success Criteria

### Data Quality
- ✅ จำนวนต้นไม้: 5,000+ ใน 6 เดือน
- ✅ จำนวนร้าน: 100+ ใน 6 เดือน
- ✅ Price updates: 1,000+/เดือน
- ✅ Location geocoded: 100% ของ suppliers

### User Engagement
- ✅ Projects created: 50+/เดือน
- ✅ Bills scanned: 200+/เดือน
- ✅ Route optimizations: 30+/เดือน

### AI Performance
- ✅ Bill scan accuracy: >95%
- ✅ Scraping success rate: >80%
- ✅ Approval rate: >90%

---

**Last Updated**: 2024-12-19
**Version**: 1.0.0
**Maintained by**: PlantPick Team

---

**Good luck! 🚀**

