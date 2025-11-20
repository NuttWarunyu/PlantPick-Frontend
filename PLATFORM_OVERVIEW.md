# 🌱 PlantPick Platform - Technical Overview & Development Guide

## 📋 Executive Summary

**PlantPick** เป็นแพลตฟอร์มจัดการราคาต้นไม้ครบวงจรสำหรับสวนธุรกิจไทย ที่ใช้ AI/ML ในการประมวลผลข้อมูลอัตโนมัติ ระบบช่วยให้ผู้ใช้สามารถค้นหาเปรียบเทียบราคา บันทึกใบเสร็จด้วย OCR/AI และรวบรวมข้อมูลจากเว็บไซต์/Facebook อัตโนมัติ

### Core Value Proposition
- **Price Intelligence**: เปรียบเทียบราคาต้นไม้จากหลาย Supplier
- **Automated Data Entry**: สแกนใบเสร็จด้วย AI Vision (GPT-4o)
- **Web Scraping**: รวบรวมข้อมูลจาก Facebook/เว็บไซต์อัตโนมัติ
- **Smart Analytics**: วิเคราะห์ราคาและแนะนำราคาที่เหมาะสม

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)            │
│                    Deployed on: Vercel                      │
│                                                             │
│  - Search & Compare Prices                                 │
│  - Bill Scanner (OCR + AI Vision)                          │
│  - Dashboard & Analytics                                   │
│  - AI Agent Management (Admin)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Backend API (Node.js + Express)                │
│              Deployed on: Railway                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  REST API    │  │  AI Service  │  │ Agent Service│    │
│  │  Endpoints   │  │  (OpenAI)    │  │  (Scraping)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              PostgreSQL Database (Railway)                  │
│                                                             │
│  - plants, suppliers, plant_suppliers                      │
│  - bills, bill_items                                       │
│  - websites, scraping_jobs, scraping_results               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 19.1.1 + TypeScript 4.9.5
- **Styling**: Tailwind CSS 3.4.17
- **Routing**: React Router DOM 7.9.4
- **Icons**: Lucide React 0.540.0
- **OCR**: Tesseract.js 6.0.1 (client-side, optional)
- **Build Tool**: React Scripts 5.0.1
- **Deployment**: Vercel

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.18.2
- **Database**: PostgreSQL (via pg 8.11.3)
- **AI/ML**: OpenAI API (GPT-4o, GPT-3.5-turbo)
- **Web Scraping**: 
  - Puppeteer-core 21.0.0
  - Cheerio 1.0.0-rc.12
  - Axios 1.6.0
- **File Upload**: Multer 1.4.5-lts.1
- **CSV Processing**: csv-parser 3.0.0
- **Security**: Helmet 7.1.0, CORS 2.8.5
- **Logging**: Morgan 1.10.0
- **Deployment**: Railway

---

## 📊 Database Schema

### Core Tables

#### 1. `plants` - ข้อมูลต้นไม้
```sql
- id (VARCHAR) PRIMARY KEY
- name (VARCHAR) NOT NULL
- scientific_name (VARCHAR)
- category (VARCHAR) -- หมวดหมู่ (ไม้ประดับ, ไม้ล้อม, ไม้ดอก, etc.)
- plant_type (VARCHAR) -- ประเภทต้นไม้
- measurement_type (VARCHAR) -- หน่วยวัด (ต้น, ความสูง, ขนาดกระถาง)
- description (TEXT)
- image_url (TEXT) -- รูปภาพต้นไม้
- created_at, updated_at (TIMESTAMP)
```

#### 2. `suppliers` - ข้อมูลร้านค้า/ผู้จัดจำหน่าย
```sql
- id (VARCHAR) PRIMARY KEY
- name (VARCHAR) NOT NULL
- location (TEXT) NOT NULL -- ที่อยู่ (สำคัญสำหรับ Route Optimization)
- phone (VARCHAR) -- เบอร์โทรหลัก
- phone_numbers (TEXT) -- JSON array ของเบอร์โทรทั้งหมด
- website (VARCHAR)
- description (TEXT)
- specialties (TEXT) -- JSON array
- business_hours (VARCHAR)
- payment_methods (TEXT) -- JSON array
- created_at, updated_at (TIMESTAMP)
```

#### 3. `plant_suppliers` - ความสัมพันธ์ต้นไม้-ร้านค้า (ราคา)
```sql
- id (VARCHAR) PRIMARY KEY
- plant_id (VARCHAR) FK → plants.id
- supplier_id (VARCHAR) FK → suppliers.id
- price (DECIMAL) -- ราคา (NULL ได้ถ้าเป็น catalog)
- size (VARCHAR) -- ขนาด/ไซต์
- image_url (TEXT) -- รูปภาพต้นไม้ที่ supplier ขาย
- stock_quantity (INTEGER)
- min_order_quantity (INTEGER)
- delivery_available (BOOLEAN)
- delivery_cost (DECIMAL)
- notes (TEXT)
- is_active (BOOLEAN)
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
- image_url (TEXT) -- รูปภาพใบเสร็จ
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
- notes (TEXT) -- 'SERVICE_ITEM' ถ้าเป็นบริการ
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

### Key Design Decisions

1. **Normalized Schema**: แยก plants, suppliers, และ plant_suppliers เพื่อรองรับ many-to-many relationship
2. **Soft Delete**: ใช้ `is_active` flag แทนการลบจริง
3. **Approval Workflow**: scraping_results ต้องรอ admin approve ก่อนบันทึกลงฐานข้อมูล
4. **Flexible Pricing**: `price` ใน plant_suppliers เป็น NULL ได้ (รองรับ catalog ที่ไม่มีราคา)
5. **Location Required**: suppliers.location เป็น NOT NULL (จำเป็นสำหรับ Route Optimization)

---

## 🔄 Core Data Flows

### 1. Bill Scanning Flow (AI Vision)

```
User uploads bill image (base64)
    ↓
Frontend → POST /api/ai/scan-bill
    ↓
Backend: aiService.scanBill()
    ↓
OpenAI GPT-4o Vision API
    ↓
Extract structured data:
  - supplierName, supplierPhone, supplierLocation
  - billDate, totalAmount
  - items[] (plantName, quantity, price, size)
    ↓
Frontend displays extracted data
    ↓
User confirms → POST /api/bills
    ↓
Backend processes:
  1. findOrCreateSupplier()
  2. createBill()
  3. For each item:
     - findOrCreatePlant()
     - addBillItem()
     - upsertPlantSupplier() (update price)
    ↓
Database updated
```

**Key Features**:
- Uses GPT-4o Vision for high accuracy
- Handles service items (ค่าแรง, ค่าขนส่ง) separately
- Auto-updates prices in plant_suppliers
- Creates plants/suppliers if not exist

### 2. Web Scraping Flow (AI Agent)

```
Admin adds website → POST /api/agents/websites
    ↓
Admin triggers scrape → POST /api/agents/scrape
    ↓
Backend: agentService.scrapeWebsite()
    ↓
1. scrapingService.scrapeHTML() (Puppeteer/Cheerio)
2. scrapingService.extractText()
3. scrapingService.extractStructuredData()
    ↓
AI Analysis: aiService.analyzeText()
  - GPT-4o extracts plant data from HTML/text
  - Handles Facebook posts, websites
  - Extracts: plant name, price, size, supplier info
    ↓
AI Validation: agentService.validateAndCleanData()
  - Validates and normalizes data
  - Removes duplicates
  - Standardizes categories, sizes
    ↓
Save to scraping_results (status: 'pending')
    ↓
Admin reviews → POST /api/agents/results/:id/approve
    ↓
Backend:
  1. findOrCreateSupplier() (requires location!)
  2. findOrCreatePlant()
  3. upsertPlantSupplier()
  4. Update scraping_results (status: 'approved')
    ↓
Data now visible in main database
```

**Key Features**:
- Asynchronous processing (doesn't block API)
- Approval workflow (admin must approve)
- Location validation (required for route optimization)
- Handles Facebook posts, websites, pasted text

### 3. Price Comparison Flow

```
User searches for plant → GET /api/plants?search=...
    ↓
Backend: db.getPlants()
  - JOIN plants, plant_suppliers, suppliers
  - Filter by search term
  - Sort by price ASC
    ↓
Return plants with suppliers array
    ↓
Frontend displays:
  - Plant info
  - List of suppliers with prices
  - Sort/filter options
    ↓
User selects suppliers → Create purchase order
```

**Key Features**:
- Real-time price comparison
- Multiple suppliers per plant
- Price history tracking (via bills)

---

## 🤖 AI/ML Integration

### 1. OpenAI GPT-4o Vision (Bill Scanning)

**Endpoint**: `POST /api/ai/scan-bill`

**Model**: `gpt-4o` (multimodal)

**Prompt Engineering**:
- Structured JSON output format
- Handles Thai language
- Extracts: supplier info, items, prices, dates
- Returns confidence score

**Error Handling**:
- API key validation
- Rate limit handling
- Image size validation (50MB limit)
- JSON parsing with sanitization

### 2. OpenAI GPT-4o (Text Analysis)

**Endpoints**: 
- `POST /api/agents/analyze-text` (pasted text)
- Used in `agentService.scrapeWebsite()`

**Model**: `gpt-4o`

**Use Cases**:
- Extract plant data from HTML/text
- Parse Facebook posts
- Validate and normalize data
- Handle Thai language plant names

**Prompt Engineering**:
- Context-aware prompts (Facebook vs website)
- Structured JSON output
- Handles missing data (price can be null)
- Date parsing (Thai relative dates: "5 ชั่วโมง", "1 วัน")

### 3. OpenAI GPT-3.5-turbo (Price Analysis)

**Endpoint**: `POST /api/ai/analyze-price`

**Model**: `gpt-3.5-turbo`

**Features**:
- Price fairness analysis
- Market trend analysis
- Optimal price suggestions
- Historical price comparison

### 4. Smart Pricing Algorithm

**Function**: `aiService.suggestOptimalPrice()`

**Logic**:
- Calculate average from historical prices
- Compare with current price
- Suggest price adjustment if:
  - Current > 1.5x average → suggest lower
  - Current < 0.5x average → suggest higher (verify)
- Returns confidence score

---

## 🔐 Security & Authentication

### Admin Authentication

**Implementation**: JWT-based (via `adminAuth` service)

**Endpoints**:
- `POST /api/admin/login` - Login with password
- `POST /api/admin/logout` - Logout
- `GET /api/admin/check` - Check admin status

**Middleware**:
- `requireAdmin` - Blocks non-admin users
- `optionalAdmin` - Allows both admin and public (different data)

**Protected Routes**:
- AI Agent management
- Scraping results approval
- Database management

### API Security

- **Helmet**: Security headers
- **CORS**: Configured for frontend origin
- **Rate Limiting**: (Not implemented yet - potential improvement)
- **Input Validation**: Basic validation on endpoints
- **SQL Injection Prevention**: Parameterized queries (pg library)

---

## 📱 Frontend Architecture

### Page Structure

1. **DashboardPage** - Statistics and overview
2. **SearchPage** - Search and compare prices
3. **BillScannerPage** - Upload and scan bills
4. **BillListPage** - View all bills
5. **PriceAnalysisPage** - Price trends and analysis
6. **RouteOptimizationPage** - Optimize supplier routes
7. **CostAnalysisPage** - Cost breakdown analysis
8. **SupplierListPage** - Manage suppliers
9. **AiAgentPage** - Manage scraping (Admin only)
10. **DatabaseManagementPage** - Database tools (Admin only)

### State Management

- **React Context**: `AdminContext` for admin authentication
- **Local State**: useState for component-level state
- **API Calls**: Custom hooks or direct fetch calls

### Key Components

- **StatisticsCard**: Reusable stats display
- **AddSupplierModal**: Modal for adding suppliers

---

## 🚀 Deployment

### Backend (Railway)

**Configuration**:
- `Procfile`: `web: node server.js`
- `railway.json`: Build and start commands
- Environment variables:
  - `DATABASE_URL` (PostgreSQL)
  - `OPENAI_API_KEY` (OpenAI API)
  - `PORT` (auto-assigned)
  - `ADMIN_PASSWORD` (admin login)

**Database**: PostgreSQL (Railway managed)

### Frontend (Vercel)

**Configuration**:
- `vercel.json`: Routing configuration
- Environment variables:
  - `REACT_APP_API_URL` (Backend API URL)

**Build**: `npm run build` (React Scripts)

---

## 🎯 Current Features

### ✅ Implemented

1. **Plant & Supplier Management**
   - CRUD operations for plants
   - CRUD operations for suppliers
   - Plant-supplier relationships with pricing
   - Bulk import from CSV

2. **Bill Processing**
   - AI Vision bill scanning (GPT-4o)
   - Automatic data extraction
   - Price auto-update
   - Bill history tracking

3. **AI Agent (Web Scraping)**
   - Website management
   - HTML scraping (Puppeteer/Cheerio)
   - AI text analysis (GPT-4o)
   - Approval workflow
   - Facebook post parsing

4. **Price Intelligence**
   - Price comparison
   - Price analysis (AI)
   - Smart pricing suggestions
   - Historical price tracking

5. **Admin Features**
   - Admin authentication
   - Scraping results approval
   - Database management

### 🚧 Partially Implemented

1. **Route Optimization**
   - Page exists but logic not fully implemented
   - Requires supplier location data

2. **Cost Analysis**
   - Page exists but needs more features

3. **Order Management**
   - Basic structure exists
   - Needs integration with suppliers

---

## 💡 Potential Improvements & Development Ideas

### 1. **Enhanced AI Features**

#### A. Duplicate Detection
- **Current**: Basic name matching
- **Improvement**: Use AI embeddings (OpenAI embeddings API) to detect similar plant names
- **Benefit**: Reduce duplicate entries, improve data quality

#### B. Price Prediction
- **Current**: Basic price analysis
- **Improvement**: ML model to predict price trends based on:
  - Historical prices
  - Seasonality
  - Supplier patterns
  - Market conditions
- **Benefit**: Better pricing decisions

#### C. Image Recognition
- **Current**: Manual image upload
- **Improvement**: Use GPT-4o Vision to identify plants from images
- **Benefit**: Auto-categorize plants, verify plant names

### 2. **Data Quality & Validation**

#### A. Data Validation Pipeline
- **Current**: Basic validation
- **Improvement**: 
  - Multi-stage validation (AI + rule-based)
  - Confidence scoring
  - Auto-flag suspicious data
- **Benefit**: Higher data quality

#### B. Data Enrichment
- **Current**: Basic plant info
- **Improvement**: 
  - Auto-fetch scientific names
  - Add care instructions
  - Add growth characteristics
  - Add images from external sources
- **Benefit**: Richer plant database

### 3. **User Experience**

#### A. Mobile App
- **Current**: Web-only (responsive)
- **Improvement**: Native mobile app (React Native)
- **Benefit**: Better mobile experience, offline support

#### B. Real-time Updates
- **Current**: Manual refresh
- **Improvement**: WebSocket for real-time price updates
- **Benefit**: Always up-to-date prices

#### C. Advanced Search
- **Current**: Basic text search
- **Improvement**: 
  - Filter by category, price range, location
  - Image search
  - Voice search
- **Benefit**: Better discovery

### 4. **Business Intelligence**

#### A. Analytics Dashboard
- **Current**: Basic statistics
- **Improvement**: 
  - Price trends over time
  - Supplier performance metrics
  - Popular plants analysis
  - Revenue forecasting
- **Benefit**: Data-driven decisions

#### B. Supplier Insights
- **Current**: Basic supplier list
- **Improvement**: 
  - Supplier reliability score
  - Price competitiveness
  - Delivery performance
  - Customer reviews
- **Benefit**: Better supplier selection

### 5. **Automation**

#### A. Scheduled Scraping
- **Current**: Manual trigger
- **Improvement**: Cron jobs for scheduled scraping
- **Benefit**: Always up-to-date data

#### B. Auto-approval Rules
- **Current**: Manual approval
- **Improvement**: 
  - Confidence threshold auto-approval
  - Whitelist suppliers
  - Rule-based auto-approval
- **Benefit**: Less manual work

#### C. Price Alert System
- **Current**: None
- **Improvement**: 
  - Alert when price drops
  - Alert when new supplier found
  - Alert when price anomaly detected
- **Benefit**: Never miss deals

### 6. **Integration & APIs**

#### A. External APIs
- **Current**: OpenAI only
- **Improvement**: 
  - Google Maps API (route optimization)
  - Weather API (seasonal pricing)
  - E-commerce APIs (price comparison)
- **Benefit**: More features

#### B. Webhook Support
- **Current**: None
- **Improvement**: Webhooks for:
  - New price updates
  - Scraping completion
  - Approval notifications
- **Benefit**: Integration with other systems

### 7. **Performance & Scalability**

#### A. Caching
- **Current**: No caching
- **Improvement**: 
  - Redis for frequently accessed data
  - CDN for static assets
  - API response caching
- **Benefit**: Faster response times

#### B. Database Optimization
- **Current**: Basic indexes
- **Improvement**: 
  - Full-text search indexes
  - Composite indexes for common queries
  - Query optimization
- **Benefit**: Better performance

#### C. Background Jobs
- **Current**: Async but in-memory
- **Improvement**: 
  - Job queue (Bull/BullMQ)
  - Worker processes
  - Retry logic
- **Benefit**: Better reliability

### 8. **Security & Compliance**

#### A. Rate Limiting
- **Current**: None
- **Improvement**: Rate limiting per user/IP
- **Benefit**: Prevent abuse

#### B. Data Privacy
- **Current**: Basic security
- **Improvement**: 
  - GDPR compliance
  - Data encryption at rest
  - Audit logs
- **Benefit**: Better security

### 9. **Testing & Quality**

#### A. Test Coverage
- **Current**: Minimal tests
- **Improvement**: 
  - Unit tests
  - Integration tests
  - E2E tests
- **Benefit**: Fewer bugs

#### B. Monitoring & Logging
- **Current**: Basic console logs
- **Improvement**: 
  - Structured logging (Winston)
  - Error tracking (Sentry)
  - Performance monitoring (New Relic)
- **Benefit**: Better observability

### 10. **New Features**

#### A. Social Features
- User reviews and ratings
- Supplier recommendations
- Community plant database

#### B. Marketplace
- Direct ordering from suppliers
- Payment integration
- Order tracking

#### C. Plant Care Assistant
- AI-powered care instructions
- Reminder system
- Disease detection from images

---

## 🎯 Strategic Recommendations

### 1. **Focus on Route Optimization** 🔴 CRITICAL

**Why**: นี่คือ killer feature ที่แตกต่างจากคู่แข่ง ควรทำให้ดีที่สุด

**Implementation**:
- ✅ Integrate Google Maps API
- ✅ Real-time traffic data
- ✅ Multi-day route planning
- ✅ Truck capacity optimization
- ✅ Geocode supplier locations
- ✅ Calculate optimal routes using TSP (Traveling Salesman Problem)

**Business Impact**: 
- ลดค่าน้ำมัน 20-30%
- ประหยัดเวลา 2-4 ชั่วโมง/โปรเจกต์
- ลดความเสี่ยงในการขนส่ง

### 2. **Improve Data Quality**

**Why**: ข้อมูลคือหัวใจของระบบ

**Implementation**:
- ✅ Better validation (location geocoding)
- ✅ Duplicate detection (AI embeddings)
- ✅ Auto-enrichment (fetch images, descriptions)
- ✅ Price history tracking
- ✅ Supplier location validation

**Business Impact**:
- เพิ่มความน่าเชื่อถือของข้อมูล
- ลด duplicate entries
- ข้อมูลครบถ้วนมากขึ้น

### 3. **Enhance User Experience**

**Why**: ทำให้ใช้งานง่ายที่สุด

**Implementation**:
- ✅ Project templates (สร้างโปรเจกต์เร็วขึ้น)
- ✅ Mobile app (React Native)
- ✅ Voice commands (speech-to-text)
- ✅ Offline mode (PWA)
- ✅ Better mobile UX

**Business Impact**:
- เพิ่ม user engagement
- ลด learning curve
- เพิ่ม retention rate

### 4. **Build Moat (สร้างคูเมือง)**

**Why**: ทำให้คู่แข่งทำตามยาก

**Implementation**:
- ✅ Network effects (ยิ่งมีคนใช้ ข้อมูลยิ่งดี)
- ✅ Proprietary data (price history, supplier ratings)
- ✅ AI models (fine-tuned for Thai plants)
- ✅ Integration ecosystem (webhooks, API)

**Business Impact**:
- สร้าง competitive advantage
- เพิ่ม switching cost
- สร้าง barrier to entry

---

## 📊 Metrics to Track

### Data Metrics
- **จำนวนต้นไม้**: เป้า 5,000+ ใน 6 เดือน
- **จำนวนร้าน**: เป้า 100+ ใน 6 เดือน
- **Price updates**: เป้า 1,000+/เดือน
- **Location geocoded**: เป้า 100% ของ suppliers

### User Metrics
- **Projects created**: เป้า 50+/เดือน
- **Bills scanned**: เป้า 200+/เดือน
- **Cost savings**: เฉลี่ย 500 บาท/project
- **Route optimizations**: เป้า 30+/เดือน

### AI Metrics
- **Bill scan accuracy**: >95%
- **Scraping success rate**: >80%
- **Approval rate**: >90%
- **Route optimization accuracy**: >90%

### Business Metrics
- **Cost savings from route optimization**: เป้า 20-30% reduction
- **Time saved per project**: เป้า 2-4 hours
- **User retention rate**: เป้า >70%

---

## 🚀 Next Steps (Immediate Action Plan)

### สัปดาห์นี้ (Week 1)
1. ✅ Setup Google Maps API
   - Get API key
   - Add to environment variables
   - Test geocoding

2. ✅ Implement Route Optimization (basic)
   - Create `routeOptimizationService.js`
   - Implement TSP algorithm
   - Integrate with Google Maps

3. ✅ Add latitude/longitude to suppliers table
   - Database migration
   - Add columns: `latitude`, `longitude`, `formatted_address`
   - Create geospatial indexes

4. ✅ Migrate existing suppliers (geocode locations)
   - Batch geocoding script
   - Update existing records

### สัปดาห์หน้า (Week 2)
5. ✅ Create Projects table
   - Database schema
   - CRUD endpoints

6. ✅ Build Project Management UI
   - Project creation form
   - Project list view
   - Project detail view

7. ✅ Integrate Route Optimization with Projects
   - Connect projects to suppliers
   - Calculate routes per project
   - Display optimized routes

8. ✅ Add price history tracking
   - Track price changes
   - Display price trends
   - Price alerts

### เดือนหน้า (Month 1)
9. ✅ Build Project Templates
   - Pre-configured project types
   - Quick start templates

10. ✅ Add Notification System
    - Price alerts
    - Route updates
    - Scraping completion

11. ✅ Improve Mobile UX
    - Responsive design improvements
    - Touch-friendly interactions
    - Mobile-specific features

12. ✅ Launch Beta Program
    - User testing
    - Feedback collection
    - Iteration

---

## 💰 Cost Optimization

### OpenAI API Cost Reduction

**Strategy**: Use cheaper models for simple tasks

```javascript
// Use GPT-4o-mini for simple tasks, GPT-4o for complex
const model = task === 'simple' ? 'gpt-4o-mini' : 'gpt-4o';

// Cache AI responses
const cacheKey = `ai:${hash(prompt)}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const result = await callOpenAI(prompt, model);
await redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);
```

**Cost Breakdown**:
- GPT-4o: $2.50/1M input tokens, $10/1M output tokens
- GPT-4o-mini: $0.15/1M input tokens, $0.60/1M output tokens
- **Savings**: ~94% for simple tasks

### Google Maps API Cost

**Pricing**:
- Geocoding: $5/1000 requests
- Directions: $5/1000 requests
- Distance Matrix: $5/1000 requests

**Estimated Usage**:
- 100 projects/เดือน = ~500 requests/เดือน
- **Cost**: ~$2.50/เดือน (very affordable!)

**Optimization**:
- Cache geocoded addresses
- Batch geocoding requests
- Use distance matrix for multiple routes

---

## 🔴 Critical Features - Implementation Guide

### 1. Route Optimization Service

**File**: `backend/services/routeOptimizationService.js`

```javascript
const aiService = require('./aiService');

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth radius in km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Geocode address using Google Maps API
const geocodeAddress = async (address) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );
  const data = await response.json();
  
  if (data.results.length === 0) {
    throw new Error(`Cannot geocode address: ${address}`);
  }
  
  return {
    lat: data.results[0].geometry.location.lat,
    lng: data.results[0].geometry.location.lng,
    formatted_address: data.results[0].formatted_address
  };
};

// Optimize route using AI (TSP solver)
const optimizeRoute = async (projectLocation, selectedSuppliers) => {
  // 1. Geocode all addresses
  const geocodedSuppliers = await Promise.all(
    selectedSuppliers.map(async (s) => {
      const coords = await geocodeAddress(s.location);
      return { ...s, coords };
    })
  );

  // 2. Calculate distances between all points
  const distances = {};
  for (let i = 0; i < geocodedSuppliers.length; i++) {
    for (let j = i + 1; j < geocodedSuppliers.length; j++) {
      const dist = calculateDistance(
        geocodedSuppliers[i].coords,
        geocodedSuppliers[j].coords
      );
      distances[`${i}-${j}`] = dist;
    }
  }

  // 3. Solve TSP using AI
  const optimalRoute = await solveWithAI(projectLocation, geocodedSuppliers, distances);

  // 4. Calculate costs
  const totalDistance = optimalRoute.reduce((sum, leg) => sum + leg.distance, 0);
  const fuelCost = totalDistance * 0.75; // 6 บาท/km ÷ 8 km/L
  
  return {
    route: optimalRoute,
    totalDistance,
    estimatedTime: Math.ceil(totalDistance / 50), // 50 km/hr average
    fuelCost,
    mapUrl: generateGoogleMapsUrl(optimalRoute)
  };
};

// Solve TSP using AI
const solveWithAI = async (projectLocation, suppliers, distances) => {
  const prompt = `คุณเป็น AI ผู้เชี่ยวชาญด้าน Route Optimization

โปรเจกต์: ${projectLocation}

ร้านที่ต้องไปรับของ:
${suppliers.map((s, i) => `
${i+1}. ${s.name}
   - Location: ${s.location}
   - Coordinates: ${s.coords.lat}, ${s.coords.lng}
   - Items: ${s.items.length} รายการ
   - Total Value: ${s.totalValue} บาท
`).join('\n')}

ระยะทางระหว่างร้าน (km):
${Object.entries(distances).map(([key, val]) => `${key}: ${val.toFixed(2)}`).join('\n')}

TASK: หาเส้นทางที่สั้นที่สุด (Traveling Salesman Problem)

กฎ:
1. เริ่มจาก "โปรเจกต์"
2. ไปรับของจากทุกร้าน
3. กลับมาที่ "โปรเจกต์"
4. ใช้ระยะทางรวมน้อยที่สุด

Return JSON:
{
  "route": [
    { "location": "โปรเจกต์", "distance_to_next": 12 },
    { "location": "ร้าน A", "distance_to_next": 45 },
    { "location": "ร้าน B", "distance_to_next": 30 },
    { "location": "โปรเจกต์", "distance_to_next": 0 }
  ],
  "total_distance": 87,
  "reasoning": "..."
}`;

  const response = await aiService.analyzeText(prompt);
  return response;
};

// Generate Google Maps URL
const generateGoogleMapsUrl = (route) => {
  const waypoints = route.slice(1, -1).map(r => r.location).join('|');
  return `https://www.google.com/maps/dir/?api=1&origin=${route[0].location}&destination=${route[route.length-1].location}&waypoints=${waypoints}`;
};

module.exports = {
  optimizeRoute,
  geocodeAddress,
  calculateDistance
};
```

**API Endpoint**: `POST /api/route/optimize`

```javascript
// In server.js
app.post('/api/route/optimize', async (req, res) => {
  try {
    const { projectLocation, selectedSuppliers } = req.body;
    
    if (!projectLocation || !selectedSuppliers || selectedSuppliers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: projectLocation and selectedSuppliers'
      });
    }
    
    const routeOptimizationService = require('./services/routeOptimizationService');
    const result = await routeOptimizationService.optimizeRoute(
      projectLocation,
      selectedSuppliers
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

**Environment Variable**:
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 2. Enhanced Supplier Data Validation

**File**: `backend/services/supplierValidationService.js`

```javascript
const routeOptimizationService = require('./routeOptimizationService');

// Validate supplier location
const validateSupplierLocation = async (location) => {
  try {
    const coords = await routeOptimizationService.geocodeAddress(location);
    return {
      isValid: true,
      coords,
      formatted_address: coords.formatted_address
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'ไม่สามารถหาพิกัดที่อยู่ได้ กรุณาระบุที่อยู่ให้ชัดเจนขึ้น'
    };
  }
};

// Validate scraping result before approval
const validateScrapingResult = async (result) => {
  if (!result.supplier_location) {
    return {
      isValid: false,
      error: 'ต้องมี supplier_location สำหรับ Route Optimization'
    };
  }
  
  const locationValidation = await validateSupplierLocation(result.supplier_location);
  
  if (!locationValidation.isValid) {
    return locationValidation;
  }
  
  return {
    isValid: true,
    location: locationValidation
  };
};

module.exports = {
  validateSupplierLocation,
  validateScrapingResult
};
```

**Database Migration**:

```sql
-- Add geospatial columns to suppliers table
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS formatted_address TEXT;

-- Index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_suppliers_coords ON suppliers(latitude, longitude);

-- Update existing suppliers (run migration script)
-- UPDATE suppliers SET latitude = ..., longitude = ... WHERE location IS NOT NULL;
```

### 3. Smart Cost-Benefit Analysis

**File**: `backend/services/costAnalysisService.js`

```javascript
const aiService = require('./aiService');

// Analyze cost-benefit between two scenarios
const analyzeCostBenefit = async (scenario1, scenario2) => {
  const prompt = `คุณเป็น Financial Analyst สำหรับผู้รับเหมาจัดสวน

สถานการณ์ที่ 1 (ปัจจุบัน):
${JSON.stringify(scenario1, null, 2)}

สถานการณ์ที่ 2 (ทางเลือก):
${JSON.stringify(scenario2, null, 2)}

TASK: วิเคราะห์ Cost-Benefit

พิจารณา:
1. ต้นทุนต้นไม้
2. ค่าน้ำมัน
3. ค่าแรง
4. เวลาที่ใช้
5. ความเสี่ยง (ร้านไกล = เสี่ยงขนส่ง)

Return JSON:
{
  "recommendation": "scenario1" | "scenario2",
  "savings": {
    "plants_cost": 500,
    "fuel_cost": -200,
    "labor_cost": 0,
    "time_saved_hours": 2,
    "total_savings": 300
  },
  "risk_assessment": {
    "scenario1_risk": "low",
    "scenario2_risk": "medium",
    "reasoning": "..."
  },
  "reasoning": "แม้ scenario2 จะแพงกว่า 200 บาท แต่ประหยัดเวลา 2 ชม. และเสี่ยงน้อยกว่า จึงแนะนำ scenario2",
  "confidence": 85
}`;

  const response = await aiService.analyzeText(prompt);
  return response;
};

module.exports = {
  analyzeCostBenefit
};
```

**API Endpoint**: `POST /api/cost-analysis/compare`

```javascript
// In server.js
app.post('/api/cost-analysis/compare', async (req, res) => {
  try {
    const { scenario1, scenario2 } = req.body;
    
    if (!scenario1 || !scenario2) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: scenario1 and scenario2'
      });
    }
    
    const costAnalysisService = require('./services/costAnalysisService');
    const result = await costAnalysisService.analyzeCostBenefit(scenario1, scenario2);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Cost analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

## 🔧 Technical Debt & Known Issues

1. **Error Handling**: Some endpoints lack comprehensive error handling
2. **Validation**: Input validation could be more robust (use Joi/Yup)
3. **Testing**: Minimal test coverage
4. **Documentation**: API documentation could be improved (Swagger/OpenAPI)
5. **Type Safety**: Backend uses JavaScript (consider TypeScript migration)
6. **Facebook Scraping**: Limited by Facebook's bot protection
7. **Rate Limiting**: No rate limiting on API endpoints
8. **Caching**: No caching layer for frequently accessed data

---

## 📈 Metrics & KPIs to Track

1. **Data Quality**
   - Number of plants in database
   - Number of suppliers
   - Price update frequency
   - Data accuracy (manual review)

2. **AI Performance**
   - Bill scanning accuracy
   - Scraping success rate
   - Approval rate of scraping results
   - AI confidence scores

3. **User Engagement**
   - Daily active users
   - Searches per day
   - Bills scanned per day
   - Features used

4. **Business Metrics**
   - Cost savings from price comparison
   - Time saved from automation
   - Supplier coverage
   - Price competitiveness

---

## 🎓 Learning Resources

### For Understanding the Codebase

1. **Backend**: Start with `server.js` → understand routes → services → database
2. **Frontend**: Start with `App.tsx` → understand routing → pages → components
3. **AI Integration**: Check `aiService.js` and `agentService.js`
4. **Database**: Check `database.js` for query patterns

### For Development

1. **Express.js**: https://expressjs.com/
2. **React**: https://react.dev/
3. **PostgreSQL**: https://www.postgresql.org/docs/
4. **OpenAI API**: https://platform.openai.com/docs/
5. **Railway**: https://docs.railway.app/
6. **Vercel**: https://vercel.com/docs

---

## 🤝 Contributing Guidelines

1. **Code Style**: Follow existing patterns
2. **Commits**: Use descriptive commit messages
3. **Testing**: Add tests for new features
4. **Documentation**: Update this document for major changes
5. **AI Usage**: Be mindful of API costs

---

## 📞 Support & Contact

- **Documentation**: See README.md, DEPLOYMENT.md
- **Issues**: Create GitHub issues for bugs/features
- **Questions**: Refer to this document first

---

**Last Updated**: 2024
**Version**: 1.0.0
**Maintainer**: PlantPick Team

