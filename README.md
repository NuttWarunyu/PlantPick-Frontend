
# 🌱 Plant Price Management System

ระบบจัดการราคาต้นไม้ครบวงจร สำหรับสวนธุรกิจไทย

## 🎯 Overview

Plant Price Management System เป็นระบบจัดการราคาต้นไม้ที่ออกแบบมาเพื่อช่วยให้สวนธุรกิจไทยสามารถ:
- ค้นหาและเปรียบเทียบราคาต้นไม้จากผู้จัดจำหน่ายต่างๆ
- จัดการข้อมูลผู้จัดจำหน่าย
- ประมวลผลใบเสร็จด้วย OCR และ AI
- ติดตามประวัติคำสั่งซื้อ

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Location**: `plant-price-system/`
- **Deployment**: Vercel
- **Features**: 
  - หน้าค้นหาต้นไม้
  - ระบบใบเสนอราคา
  - ประมวลผลใบเสร็จด้วย OCR
  - จัดการประวัติคำสั่งซื้อ

### Backend (Node.js + Express)
- **Location**: `backend/`
- **Deployment**: Railway
- **Features**:
  - RESTful API
  - จัดการข้อมูลต้นไม้และผู้จัดจำหน่าย
  - CORS support
  - Error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- Railway CLI
- Vercel CLI

### Installation
```bash
# Clone repository
git clone <repository-url>
cd PlantPick

# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### Development
```bash
# Frontend only
npm run dev:frontend

# Backend only  
npm run dev:backend

# Both (recommended)
npm run dev
```

## 🚀 Deployment

### Quick Deploy
```bash
# Run automated deployment script
./deploy.sh
```

### Manual Deploy
ดูรายละเอียดใน [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

## 📁 Project Structure

```
PlantPick/
├── plant-price-system/     # Frontend (React)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── backend/               # Backend (Node.js)
│   ├── server.js         # Main server file
│   ├── package.json
│   └── README.md
├── deploy.sh             # Deployment script
├── DEPLOYMENT.md         # Detailed deployment guide
├── QUICK_DEPLOY.md       # Quick deployment guide
└── README.md            # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **Tesseract.js** - OCR processing

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **CORS** - Cross-origin requests
- **Helmet** - Security headers
- **Morgan** - Logging

### Deployment
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting

## 📊 API Endpoints

### Health Check
- `GET /api/health` - ตรวจสอบสถานะ API

### Plants
- `GET /api/plants` - ดึงข้อมูลต้นไม้ทั้งหมด
- `GET /api/plants/:id` - ดึงข้อมูลต้นไม้ตาม ID

### Suppliers
- `POST /api/plants/:plantId/suppliers` - เพิ่มผู้จัดจำหน่าย
- `PUT /api/plants/:plantId/suppliers/:supplierId/price` - อัปเดตราคา
- `DELETE /api/plants/:plantId/suppliers/:supplierId` - ลบผู้จัดจำหน่าย

## 🎨 Features

### หน้าค้นหา
- ค้นหาต้นไม้ด้วยชื่อ
- ดูราคาจากผู้จัดจำหน่ายหลายราย
- เปรียบเทียบราคา

### ระบบใบเสนอราคา
- เลือกต้นไม้และจำนวน
- คำนวณราคารวม
- ส่งออกเป็น PDF

### ประมวลผลใบเสร็จ
- อัปโหลดภาพใบเสร็จ
- OCR ประมวลผลข้อความ
- AI วิเคราะห์และจัดระเบียบข้อมูล

### จัดการข้อมูล
- เพิ่ม/แก้ไขข้อมูลผู้จัดจำหน่าย
- อัปเดตราคาแบบ real-time
- ดูประวัติการเปลี่ยนแปลง

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

#### Backend (.env)
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
PORT=3001
```

## 🧪 Testing

```bash
# Test backend
npm run test:backend

# Test frontend
npm run test:frontend

# Test all
npm test
```

## 📈 Monitoring

### Railway (Backend)
- ดู logs ใน Railway dashboard
- ตรวจสอบ metrics และ performance

### Vercel (Frontend)
- ดู analytics ใน Vercel dashboard
- ตรวจสอบ function logs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

หากมีปัญหาหรือคำถาม:
1. ดู [DEPLOYMENT.md](./DEPLOYMENT.md) สำหรับการ deploy
2. ดู [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) สำหรับการ deploy แบบเร็ว
3. ตรวจสอบ logs ใน dashboard
4. สร้าง issue ใน GitHub

---

**Made with ❤️ for Thai Plant Business**
