# 📅 Daily Workflow Guide - Cursor IDE

**คู่มือการทำงานในแต่ละวันหลังจากปล่อยระบบ**

---

## 🌅 Morning Routine (เช้า - 15 นาที)

### 1. ตรวจสอบระบบ (5 นาที)
```bash
# ตรวจสอบว่า backend ทำงานอยู่หรือไม่
curl https://your-backend-url.railway.app/api/health

# ตรวจสอบ frontend
curl https://your-frontend-url.vercel.app
```

**สิ่งที่ต้องตรวจสอบ**:
- ✅ Backend API ทำงานปกติ
- ✅ Frontend ทำงานปกติ
- ✅ Database เชื่อมต่อได้
- ✅ ไม่มี critical errors

### 2. ตรวจสอบ Logs (5 นาที)
- เปิด Railway Dashboard → Logs
- ดู error logs จากคืนที่ผ่านมา
- ตรวจสอบ API usage (OpenAI, Google Maps)

**สิ่งที่ต้องดู**:
- ❌ Error messages
- ⚠️ Warning messages
- 📊 API usage (ใกล้ limit หรือไม่)
- 🔴 Critical issues

### 3. ตรวจสอบ Metrics (5 นาที)
- ดูจำนวน bills ที่ scan เมื่อวาน
- ดูจำนวน scraping results ที่รอ approve
- ดูจำนวน users/requests

**Tools**:
- Railway Dashboard → Metrics
- Vercel Dashboard → Analytics
- Database queries (ถ้ามี dashboard)

---

## 🛠️ Development Tasks (ตามความจำเป็น)

### Task 1: Approve Scraping Results (ถ้ามี)

**เมื่อไหร่**: เมื่อมี scraping results รอ approve

**ทำอะไร**:
1. เปิด `/ai-agent` ใน frontend
2. ไปที่ tab "Results"
3. Review แต่ละ result:
   - ✅ ข้อมูลถูกต้องหรือไม่
   - ✅ Location มีหรือไม่ (สำคัญ!)
   - ✅ Price ถูกต้องหรือไม่
4. Approve หรือ Reject

**เวลา**: 5-15 นาที/ครั้ง (ขึ้นอยู่กับจำนวน results)

### Task 2: Fix Bugs (ถ้ามี)

**เมื่อไหร่**: เมื่อพบ bugs จาก logs หรือ user reports

**Workflow**:
```bash
# 1. Pull latest code
git pull origin main

# 2. สร้าง branch ใหม่
git checkout -b fix/bug-description

# 3. แก้ไข bug ใน Cursor
# - ใช้ Cursor AI ช่วยแก้ไข
# - Test locally

# 4. Commit และ push
git add .
git commit -m "fix: description of bug fix"
git push origin fix/bug-description

# 5. Deploy (Railway/Vercel จะ auto-deploy)
```

**เวลา**: ขึ้นอยู่กับความซับซ้อนของ bug

### Task 3: Add New Features (ถ้าต้องการ)

**เมื่อไหร่**: เมื่อต้องการเพิ่ม features ใหม่

**Workflow**:
```bash
# 1. สร้าง branch ใหม่
git checkout -b feature/feature-name

# 2. พัฒนาใน Cursor
# - ใช้ Cursor AI ช่วยเขียน code
# - Test locally

# 3. Commit และ push
git add .
git commit -m "feat: add feature description"
git push origin feature/feature-name

# 4. Deploy
```

**เวลา**: ขึ้นอยู่กับความซับซ้อนของ feature

### Task 4: Update Data (ถ้าต้องการ)

**เมื่อไหร่**: เมื่อต้องการเพิ่ม/แก้ไขข้อมูล

**ทำอะไร**:
1. เพิ่ม Plants/Suppliers ใหม่
2. อัปเดตราคา
3. Geocode supplier locations (ถ้ายังไม่มี)
4. Bulk import จาก CSV

**Tools**:
- Frontend: `/search`, `/suppliers`
- Admin: `/database` (bulk operations)

**เวลา**: ขึ้นอยู่กับจำนวนข้อมูล

---

## 📊 Weekly Tasks (ทุกสัปดาห์)

### Monday: Review & Planning (30 นาที)
- ✅ Review metrics จากสัปดาห์ที่แล้ว
- ✅ วางแผน tasks สำหรับสัปดาห์นี้
- ✅ ตรวจสอบ costs (API usage)
- ✅ Review user feedback (ถ้ามี)

### Wednesday: Data Quality Check (30 นาที)
- ✅ ตรวจสอบ duplicate entries
- ✅ Geocode suppliers ที่ยังไม่มี coordinates
- ✅ Validate data quality
- ✅ Clean up old data (ถ้าจำเป็น)

### Friday: Backup & Review (30 นาที)
- ✅ Backup database
- ✅ Review error logs
- ✅ Review performance metrics
- ✅ Plan improvements

---

## 🐛 Common Tasks & Solutions

### Task: Fix API Error

**Problem**: API error จาก logs

**Solution**:
```bash
# 1. ดู error logs ใน Railway
# 2. เปิด Cursor → เปิดไฟล์ที่เกี่ยวข้อง
# 3. ใช้ Cursor AI ช่วยแก้ไข:
#    - Paste error message
#    - Ask: "How to fix this error?"
# 4. Test และ deploy
```

### Task: Add New API Endpoint

**Problem**: ต้องการเพิ่ม endpoint ใหม่

**Solution**:
```bash
# 1. เปิด backend/server.js ใน Cursor
# 2. ใช้ Cursor AI ช่วย:
#    - Ask: "Add endpoint POST /api/example"
#    - Cursor จะ generate code ให้
# 3. Test และ deploy
```

### Task: Update Frontend UI

**Problem**: ต้องการแก้ไข UI

**Solution**:
```bash
# 1. เปิดไฟล์ component ใน Cursor
# 2. ใช้ Cursor AI ช่วย:
#    - Ask: "Add button to do X"
#    - Cursor จะ generate code ให้
# 3. Test และ deploy
```

### Task: Optimize Database Query

**Problem**: Query ช้า

**Solution**:
```bash
# 1. เปิด backend/database.js ใน Cursor
# 2. ใช้ Cursor AI ช่วย:
#    - Paste slow query
#    - Ask: "How to optimize this query?"
# 3. Test และ deploy
```

---

## 🔍 Daily Checklist

### ✅ Morning (เช้า)
- [ ] ตรวจสอบระบบทำงานปกติ
- [ ] ตรวจสอบ error logs
- [ ] ตรวจสอบ API usage
- [ ] Approve scraping results (ถ้ามี)

### ✅ Afternoon (บ่าย)
- [ ] Fix bugs (ถ้ามี)
- [ ] Review user feedback
- [ ] Update documentation (ถ้าจำเป็น)

### ✅ Evening (เย็น)
- [ ] ตรวจสอบระบบอีกครั้ง
- [ ] ตรวจสอบ metrics
- [ ] Plan tasks สำหรับวันพรุ่งนี้

---

## 🎯 Priority Tasks (เรียงตามความสำคัญ)

### 🔴 Critical (ทำทันที)
1. **System Down** - แก้ไขทันที
2. **Critical Errors** - แก้ไขภายในวัน
3. **API Limit Reached** - แก้ไขทันที

### 🟡 High (ทำภายในสัปดาห์)
4. **Bugs** - แก้ไขภายใน 2-3 วัน
5. **Performance Issues** - แก้ไขภายในสัปดาห์
6. **Data Quality Issues** - แก้ไขภายในสัปดาห์

### 🟢 Medium (ทำเมื่อมีเวลา)
7. **New Features** - ตาม roadmap
8. **UI Improvements** - ตาม feedback
9. **Documentation** - อัปเดตเมื่อจำเป็น

### 🔵 Low (ทำเมื่อว่าง)
10. **Code Refactoring** - ปรับปรุงเมื่อมีเวลา
11. **Testing** - เพิ่ม tests เมื่อมีเวลา
12. **Optimization** - optimize เมื่อมีเวลา

---

## 💡 Tips for Using Cursor IDE

### 1. ใช้ Cursor AI ช่วยเขียน Code
```
# ตัวอย่าง: ถาม Cursor AI
"Add function to calculate total price"
"Fix this error: [paste error]"
"How to optimize this query?"
```

### 2. ใช้ Cursor Chat สำหรับถามคำถาม
- กด `Cmd+L` (Mac) หรือ `Ctrl+L` (Windows)
- ถามคำถามเกี่ยวกับ code
- Cursor จะช่วยอธิบายและแก้ไข

### 3. ใช้ Cursor Composer สำหรับแก้ไขหลายไฟล์
- กด `Cmd+I` (Mac) หรือ `Ctrl+I` (Windows)
- อธิบายสิ่งที่ต้องการทำ
- Cursor จะแก้ไขหลายไฟล์พร้อมกัน

### 4. ใช้ Cursor สำหรับ Code Review
- เปิดไฟล์ที่ต้องการ review
- ถาม Cursor: "Review this code and suggest improvements"
- Cursor จะแนะนำการปรับปรุง

---

## 📝 Example Daily Workflow

### วันจันทร์ (Monday)
```
09:00 - ตรวจสอบระบบ (5 นาที)
09:05 - ตรวจสอบ logs (5 นาที)
09:10 - Approve scraping results (10 นาที)
09:20 - Review metrics จากสัปดาห์ที่แล้ว (10 นาที)
09:30 - วางแผน tasks สำหรับสัปดาห์นี้ (20 นาที)
---
Total: ~50 นาที
```

### วันอังคาร-ศุกร์ (Tuesday-Friday)
```
09:00 - ตรวจสอบระบบ (5 นาที)
09:05 - ตรวจสอบ logs (5 นาที)
09:10 - Approve scraping results (ถ้ามี) (10 นาที)
09:20 - Development tasks (ตามความจำเป็น)
---
Total: ~20-60 นาที (ขึ้นอยู่กับ tasks)
```

### วันเสาร์-อาทิตย์ (Weekend)
```
- ตรวจสอบระบบ (5 นาที)
- Approve scraping results (ถ้ามี) (10 นาที)
- Rest! 🎉
---
Total: ~15 นาที
```

---

## 🚨 Emergency Procedures

### System Down
1. ตรวจสอบ Railway Dashboard → Logs
2. ตรวจสอบ Vercel Dashboard → Logs
3. ตรวจสอบ Database connection
4. Restart services (ถ้าจำเป็น)
5. Fix และ deploy

### API Limit Reached
1. ตรวจสอบ usage ใน dashboard
2. เพิ่ม limit (ถ้าจำเป็น)
3. Optimize usage (caching, batch requests)
4. Monitor usage

### Critical Bug
1. ตรวจสอบ error logs
2. Reproduce bug locally
3. Fix ใน Cursor
4. Test และ deploy
5. Monitor หลัง deploy

---

## 📚 Resources

### Documentation
- `README.md` - Main overview
- `PLATFORM_OVERVIEW.md` - Technical details
- `POST_LAUNCH_DEVELOPMENT.md` - Development roadmap
- `PROJECT_HANDOVER.md` - Handover guide

### Dashboards
- Railway: https://railway.app/dashboard
- Vercel: https://vercel.com/dashboard
- OpenAI: https://platform.openai.com/usage
- Google Cloud: https://console.cloud.google.com/

### Tools
- Cursor IDE: https://cursor.sh/
- Git: https://git-scm.com/
- PostgreSQL: https://www.postgresql.org/docs/

---

## 🎯 Success Metrics

### Daily Metrics
- ✅ System uptime: >99%
- ✅ Error rate: <1%
- ✅ Response time: <500ms
- ✅ API usage: ภายใน limit

### Weekly Metrics
- ✅ Bugs fixed: ตาม priority
- ✅ Features added: ตาม roadmap
- ✅ Data quality: >95% accuracy
- ✅ User satisfaction: ตาม feedback

---

**Last Updated**: 2024-12-19
**Version**: 1.0.0

**Remember**: ไม่ต้องทำงานทุกวัน! ระบบควรทำงานได้เอง เราแค่ monitor และ maintain เท่านั้น 🎉

