ํํ# Plant Price Backend API

Backend API สำหรับระบบจัดการราคาต้นไม้

## 🚀 Features

- **Database**: PostgreSQL with Railway
- **API Endpoints**: CRUD operations for plants and suppliers
- **CORS**: Cross-origin resource sharing enabled
- **Security**: Helmet for security headers
- **Logging**: Morgan for request logging

## 📦 Installation

```bash
npm install
```

## 🔧 Environment Variables

Create `.env` file:

```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## 🗄️ Database Setup

### 1. Create PostgreSQL Database in Railway

1. Go to Railway Dashboard
2. Create new PostgreSQL service
3. Copy the `DATABASE_URL` from Railway
4. Set it in your environment variables

### 2. Run Migration

```bash
npm run migrate
```

This will:
- Create `plants` and `suppliers` tables
- Insert sample data (10 plants, 10 suppliers)

## 🚀 Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Manual Deployment

```bash
npm start
```

## 📚 API Endpoints

### Health Check
```
GET /api/health
```

### Plants
```
GET /api/plants              # Get all plants
GET /api/plants/:id          # Get specific plant
```

### Suppliers
```
POST /api/plants/:plantId/suppliers                    # Add supplier
PUT /api/plants/:plantId/suppliers/:supplierId/price   # Update price
DELETE /api/plants/:plantId/suppliers/:supplierId       # Delete supplier
```

## 🗃️ Database Schema

### Plants Table
```sql
CREATE TABLE plants (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  scientific_name VARCHAR(255),
  category VARCHAR(100),
  plant_type VARCHAR(100),
  measurement_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Suppliers Table
```sql
CREATE TABLE suppliers (
  id VARCHAR(50) PRIMARY KEY,
  plant_id VARCHAR(50) REFERENCES plants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  phone VARCHAR(20),
  location VARCHAR(255),
  size VARCHAR(100),
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Sample Data

The migration script includes:

- **10 Plants**: ไม้ประดับ, ไม้ล้อม, ไม้คลุมดิน
- **10 Suppliers**: ข้อมูลผู้จัดจำหน่ายพร้อมราคา

## 🛠️ Development

```bash
npm run dev
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migration
- `npm run build` - Build (no build step required)

## 🔒 Security

- CORS enabled for frontend domains
- Helmet for security headers
- Input validation and sanitization
- SQL injection protection with parameterized queries

## 📊 Monitoring

- Morgan logging for all requests
- Error handling with detailed logs
- Database connection monitoring