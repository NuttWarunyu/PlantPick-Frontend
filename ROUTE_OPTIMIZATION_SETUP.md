# 🗺️ Route Optimization Setup Guide

## Overview

Route Optimization feature has been implemented according to Week 1 roadmap. This feature allows users to optimize routes for visiting multiple suppliers, reducing fuel costs and travel time.

## ✅ Completed Features

### 1. Route Optimization Service
- **File**: `backend/services/routeOptimizationService.js`
- **Features**:
  - Geocoding addresses using Google Maps API
  - Distance calculation (Haversine formula)
  - TSP (Traveling Salesman Problem) solving using AI
  - Fallback to Nearest Neighbor algorithm
  - Google Maps URL generation

### 2. Supplier Validation Service
- **File**: `backend/services/supplierValidationService.js`
- **Features**:
  - Location validation via geocoding
  - Scraping result validation
  - Batch validation support

### 3. API Endpoints
- `POST /api/route/optimize` - Optimize route for project
- `POST /api/route/geocode` - Geocode single address
- `POST /api/route/geocode-batch` - Batch geocode addresses
- `POST /api/suppliers/validate-location` - Validate supplier location

### 4. Database Updates
- Added `latitude`, `longitude`, `formatted_address` columns to `suppliers` table
- Added geospatial index for efficient queries
- Updated `findOrCreateSupplier()` to handle geocoded coordinates

### 5. Migration Script
- **File**: `backend/scripts/geocode-suppliers.js`
- **Command**: `npm run geocode-suppliers`
- Geocodes all existing suppliers without coordinates

## 🚀 Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Geocoding API** and **Maps JavaScript API**
4. Create API Key in **Credentials** section
5. (Optional) Restrict API key to specific APIs and IPs for security

### 2. Configure Environment Variables

Add to `backend/.env`:

```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

Or in Railway:
1. Go to Railway Dashboard → Your Project → Variables
2. Add: `GOOGLE_MAPS_API_KEY` = `your_api_key_here`

### 3. Run Database Migration

The database migration runs automatically when the server starts. It will:
- Add `latitude`, `longitude`, `formatted_address` columns
- Create geospatial index

### 4. Geocode Existing Suppliers

Run the migration script to geocode all existing suppliers:

```bash
cd backend
npm run geocode-suppliers
```

This will:
- Find all suppliers without coordinates
- Geocode their addresses
- Update database with coordinates
- Show summary of success/failures

## 📖 API Usage Examples

### Optimize Route

```javascript
// POST /api/route/optimize
const response = await fetch('/api/route/optimize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectLocation: '123 ถนนสุขุมวิท กรุงเทพมหานคร',
    selectedSuppliers: [
      {
        name: 'สวนไม้ประดับ ABC',
        location: '456 ถนนพหลโยธิน กรุงเทพมหานคร',
        items: [{ plantName: 'มอนสเตอร่า', quantity: 5 }],
        totalValue: 2500
      },
      {
        name: 'ร้านต้นไม้ XYZ',
        location: '789 ถนนรัชดาภิเษก กรุงเทพมหานคร',
        items: [{ plantName: 'ยางอินเดีย', quantity: 3 }],
        totalValue: 1500
      }
    ]
  })
});

const result = await response.json();
// result.data contains:
// - route: optimized route array
// - totalDistance: total distance in km
// - estimatedTime: estimated time in hours
// - fuelCost: estimated fuel cost in THB
// - mapUrl: Google Maps directions URL
```

### Geocode Address

```javascript
// POST /api/route/geocode
const response = await fetch('/api/route/geocode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '123 ถนนสุขุมวิท กรุงเทพมหานคร'
  })
});

const result = await response.json();
// result.data contains:
// - lat: latitude
// - lng: longitude
// - formatted_address: formatted address
// - place_id: Google Place ID
```

### Validate Supplier Location

```javascript
// POST /api/suppliers/validate-location
const response = await fetch('/api/suppliers/validate-location', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: '123 ถนนสุขุมวิท กรุงเทพมหานคร'
  })
});

const result = await response.json();
// result.data.isValid: true/false
// result.data.coords: { lat, lng } if valid
// result.data.error: error message if invalid
```

## 💰 Cost Estimation

### Google Maps API Pricing
- **Geocoding**: $5 per 1,000 requests
- **Directions**: $5 per 1,000 requests

### Estimated Monthly Cost
- 100 projects/month = ~500 geocoding requests
- **Cost**: ~$2.50/month (very affordable!)

### Cost Optimization Tips
1. Cache geocoded addresses (coordinates don't change)
2. Batch geocode when possible
3. Use formatted_address from previous geocoding

## 🔧 Troubleshooting

### Error: "GOOGLE_MAPS_API_KEY is not set"
- Make sure you've added the API key to environment variables
- Restart the server after adding the key

### Error: "Cannot geocode address"
- Check if the address is valid and complete
- Try adding more details (district, province, postal code)
- Check Google Maps API quota and billing

### Error: "Geocoding failed: REQUEST_DENIED"
- Check if Geocoding API is enabled in Google Cloud Console
- Verify API key restrictions
- Check if billing is enabled

### Suppliers not geocoding
- Run `npm run geocode-suppliers` to geocode existing suppliers
- Check that suppliers have valid `location` field
- Review error messages in script output

## 📊 Next Steps

According to roadmap, next steps are:

### Week 2:
- Create Projects table
- Build Project Management UI
- Integrate Route Optimization with Projects
- Add price history tracking

### Future Enhancements:
- Real-time traffic data
- Multi-day route planning
- Truck capacity optimization
- Route optimization history

## 📝 Notes

- The TSP solver uses AI (GPT-4o) for optimal route calculation
- Falls back to Nearest Neighbor algorithm if AI fails
- All geocoding results are cached in database
- Coordinates are stored with 8 decimal places precision (~1mm accuracy)

---

**Last Updated**: 2024
**Status**: ✅ Week 1 Complete

