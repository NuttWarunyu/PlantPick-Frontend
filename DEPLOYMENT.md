# 🚀 Plant Price System - Deployment Guide

คู่มือการ deploy ระบบ Plant Price Management System ไปยัง Vercel (Frontend) และ Railway (Backend)

## 📋 Prerequisites

### Required Tools
- Node.js (v18+)
- npm
- Git
- Railway CLI
- Vercel CLI

### Installation Commands
```bash
# Install Railway CLI
npm install -g @railway/cli

# Install Vercel CLI
npm install -g vercel

# Login to services
railway login
vercel login
```

## 🎯 Quick Deployment

### Option 1: Automated Script
```bash
# Run the deployment script
./deploy.sh
```

### Option 2: Manual Deployment

## 🔧 Backend Deployment (Railway)

### Step 1: Prepare Backend
```bash
cd backend
npm install
```

### Step 2: Deploy to Railway
```bash
# Initialize Railway project
railway init

# Link to existing project (if you have one)
railway link

# Deploy
railway up --detach
```

### Step 3: Configure Environment Variables
ใน Railway Dashboard:
- `NODE_ENV=production`
- `FRONTEND_URL=https://your-frontend-domain.vercel.app`
- `PORT=3001` (optional, Railway will auto-assign)

### Step 4: Get Backend URL
```bash
railway domain
```

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
```bash
cd plant-price-system
npm install
npm run build
```

### Step 2: Deploy to Vercel
```bash
# Initialize Vercel project
vercel

# Deploy to production
vercel --prod
```

### Step 3: Configure Environment Variables
ใน Vercel Dashboard:
- `REACT_APP_API_URL=https://your-backend-domain.railway.app`

## 🔗 Connecting Frontend & Backend

### 1. Update API URL
หลังจากได้ backend URL จาก Railway:
```bash
# In Vercel dashboard, set:
REACT_APP_API_URL=https://your-railway-backend-url.railway.app
```

### 2. Update CORS Settings
ใน Railway backend, ตั้งค่า:
```bash
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
```

## 🧪 Testing Deployment

### Test Backend
```bash
# Health check
curl https://your-backend-url.railway.app/api/health

# Get plants
curl https://your-backend-url.railway.app/api/plants
```

### Test Frontend
1. เปิดเว็บไซต์ที่ Vercel URL
2. ตรวจสอบว่าสามารถเชื่อมต่อ API ได้
3. ทดสอบการค้นหาต้นไม้
4. ทดสอบการเพิ่มผู้จัดจำหน่าย

## 🔄 Updating Deployments

### Update Backend
```bash
cd backend
# Make your changes
git add .
git commit -m "Update backend"
git push
railway up --detach
```

### Update Frontend
```bash
cd plant-price-system
# Make your changes
git add .
git commit -m "Update frontend"
git push
vercel --prod
```

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Error
**Problem**: Frontend cannot connect to backend
**Solution**: 
- ตรวจสอบ `FRONTEND_URL` ใน Railway
- ตรวจสอบ `REACT_APP_API_URL` ใน Vercel

#### 2. Environment Variables Not Working
**Problem**: Environment variables not loaded
**Solution**:
- ตรวจสอบการตั้งค่าใน dashboard
- Redeploy หลังจากเปลี่ยน environment variables

#### 3. Build Failures
**Problem**: Build process fails
**Solution**:
- ตรวจสอบ Node.js version
- ตรวจสอบ dependencies
- ดู build logs ใน dashboard

### Debug Commands
```bash
# Check Railway logs
railway logs

# Check Vercel logs
vercel logs

# Test API locally
cd backend
npm start
curl http://localhost:3001/api/health
```

## 📊 Monitoring

### Railway Monitoring
- ดู logs ใน Railway dashboard
- ตรวจสอบ metrics และ performance

### Vercel Monitoring
- ดู analytics ใน Vercel dashboard
- ตรวจสอบ function logs

## 🔒 Security Notes

1. **Environment Variables**: อย่าเก็บ sensitive data ใน code
2. **CORS**: ตั้งค่า CORS ให้ถูกต้อง
3. **HTTPS**: ใช้ HTTPS เสมอใน production
4. **API Keys**: เก็บ API keys ใน environment variables

## 📞 Support

หากมีปัญหาการ deploy:
1. ตรวจสอบ logs ใน dashboard
2. ดู troubleshooting section
3. ตรวจสอบ environment variables
4. ทดสอบ API endpoints แยก

---

**Happy Deploying! 🌱**
