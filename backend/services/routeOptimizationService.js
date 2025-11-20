// 🗺️ Route Optimization Service
// Handles geocoding, distance calculation, and route optimization using AI

const aiService = require('./aiService');

class RouteOptimizationService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  }

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(coord1, coord2) {
    const R = 6371; // Earth radius in km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Geocode address using Google Maps Geocoding API
  async geocodeAddress(address) {
    if (!this.googleMapsApiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not set. Please configure it in environment variables.');
    }

    if (!address || address.trim() === '') {
      throw new Error('Address is required for geocoding');
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.googleMapsApiKey}&language=th&region=th`
      );

      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'ZERO_RESULTS') {
        throw new Error(`Cannot geocode address: ${address}`);
      }

      if (data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      if (data.results.length === 0) {
        throw new Error(`No results found for address: ${address}`);
      }

      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
        location_type: result.geometry.location_type
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  // Batch geocode multiple addresses
  async geocodeAddresses(addresses) {
    const results = [];
    for (const address of addresses) {
      try {
        const geocoded = await this.geocodeAddress(address);
        results.push({ address, ...geocoded, success: true });
      } catch (error) {
        results.push({ address, success: false, error: error.message });
      }
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return results;
  }

  // Solve Traveling Salesman Problem using AI
  async solveTSPWithAI(projectLocation, suppliers, distances) {
    const prompt = `คุณเป็น AI ผู้เชี่ยวชาญด้าน Route Optimization

โปรเจกต์: ${projectLocation}

ร้านที่ต้องไปรับของ:
${suppliers.map((s, i) => `
${i+1}. ${s.name}
   - Location: ${s.location}
   - Coordinates: ${s.coords.lat}, ${s.coords.lng}
   - Items: ${s.items?.length || 0} รายการ
   - Total Value: ${s.totalValue || 0} บาท
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
}

ตอบเป็น JSON ล้วนๆ เท่านั้น ห้ามใส่โค้ดบล็อก`;

    try {
      const response = await aiService.analyzeText(prompt);
      return response;
    } catch (error) {
      console.error('TSP AI solving error:', error);
      // Fallback to simple nearest neighbor algorithm
      return this.solveTSPNearestNeighbor(projectLocation, suppliers, distances);
    }
  }

  // Fallback: Simple Nearest Neighbor algorithm
  solveTSPNearestNeighbor(projectLocation, suppliers, distances) {
    if (suppliers.length === 0) {
      return {
        route: [
          { location: projectLocation, distance_to_next: 0 }
        ],
        total_distance: 0,
        reasoning: 'No suppliers to visit'
      };
    }

    const route = [{ location: projectLocation }];
    const visited = new Set();
    let currentIndex = -1; // -1 represents project location
    let totalDistance = 0;

    // Visit all suppliers
    while (visited.size < suppliers.length) {
      let nearestIndex = -1;
      let nearestDistance = Infinity;

      // Find nearest unvisited supplier
      for (let i = 0; i < suppliers.length; i++) {
        if (visited.has(i)) continue;

        const distance = currentIndex === -1
          ? this.calculateDistance(
              { lat: suppliers[i].coords.lat, lng: suppliers[i].coords.lng },
              { lat: suppliers[i].coords.lat, lng: suppliers[i].coords.lng } // Project location would need coords
            )
          : distances[`${Math.min(currentIndex, i)}-${Math.max(currentIndex, i)}`] || Infinity;

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      if (nearestIndex === -1) break;

      visited.add(nearestIndex);
      route[route.length - 1].distance_to_next = nearestDistance;
      route.push({ location: suppliers[nearestIndex].name });
      totalDistance += nearestDistance;
      currentIndex = nearestIndex;
    }

    // Return to project
    route[route.length - 1].distance_to_next = 0;
    route.push({ location: projectLocation, distance_to_next: 0 });

    return {
      route,
      total_distance: totalDistance,
      reasoning: 'Used Nearest Neighbor algorithm (fallback)'
    };
  }

  // Generate Google Maps URL for directions
  generateGoogleMapsUrl(route, projectLocation) {
    if (route.length < 2) {
      return null;
    }

    const waypoints = route
      .slice(1, -1)
      .map(r => r.location)
      .filter(loc => loc !== projectLocation)
      .map(loc => encodeURIComponent(loc))
      .join('|');

    const origin = encodeURIComponent(route[0].location);
    const destination = encodeURIComponent(route[route.length - 1].location);

    if (waypoints) {
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
    } else {
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    }
  }

  // Main route optimization function
  async optimizeRoute(projectLocation, selectedSuppliers) {
    if (!projectLocation || !selectedSuppliers || selectedSuppliers.length === 0) {
      throw new Error('Project location and at least one supplier are required');
    }

    try {
      // 1. Geocode project location
      console.log(`🗺️ Geocoding project location: ${projectLocation}`);
      const projectCoords = await this.geocodeAddress(projectLocation);
      console.log(`✅ Project location geocoded: ${projectCoords.formatted_address}`);

      // 2. Geocode all supplier locations
      console.log(`🗺️ Geocoding ${selectedSuppliers.length} supplier locations...`);
      const geocodedSuppliers = await Promise.all(
        selectedSuppliers.map(async (supplier) => {
          try {
            const coords = await this.geocodeAddress(supplier.location);
            return {
              ...supplier,
              coords,
              geocoded: true
            };
          } catch (error) {
            console.error(`❌ Failed to geocode ${supplier.name}: ${error.message}`);
            return {
              ...supplier,
              geocoded: false,
              error: error.message
            };
          }
        })
      );

      // Filter out suppliers that failed to geocode
      const validSuppliers = geocodedSuppliers.filter(s => s.geocoded);
      if (validSuppliers.length === 0) {
        throw new Error('No suppliers could be geocoded. Please check addresses.');
      }

      console.log(`✅ Successfully geocoded ${validSuppliers.length}/${selectedSuppliers.length} suppliers`);

      // 3. Calculate distances between all points
      const distances = {};
      const allPoints = [
        { name: 'โปรเจกต์', coords: projectCoords, type: 'project' },
        ...validSuppliers.map(s => ({ name: s.name, coords: s.coords, type: 'supplier' }))
      ];

      for (let i = 0; i < allPoints.length; i++) {
        for (let j = i + 1; j < allPoints.length; j++) {
          const dist = this.calculateDistance(allPoints[i].coords, allPoints[j].coords);
          distances[`${i}-${j}`] = dist;
          distances[`${j}-${i}`] = dist; // Symmetric
        }
      }

      // 4. Solve TSP using AI
      console.log(`🤖 Solving TSP for ${validSuppliers.length} suppliers...`);
      const tspResult = await this.solveTSPWithAI(projectLocation, validSuppliers, distances);

      // 5. Calculate costs and time
      const totalDistance = tspResult.total_distance || tspResult.route.reduce((sum, leg, idx) => {
        return sum + (leg.distance_to_next || 0);
      }, 0);

      const fuelCostPerKm = 0.75; // 6 บาท/km ÷ 8 km/L
      const averageSpeed = 50; // km/hr
      const fuelCost = totalDistance * fuelCostPerKm;
      const estimatedTime = Math.ceil(totalDistance / averageSpeed); // hours

      // 6. Generate Google Maps URL
      const mapUrl = this.generateGoogleMapsUrl(tspResult.route, projectLocation);

      const result = {
        route: tspResult.route,
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        estimatedTime,
        fuelCost: parseFloat(fuelCost.toFixed(2)),
        mapUrl,
        projectLocation: {
          address: projectLocation,
          coords: projectCoords
        },
        suppliers: validSuppliers.map(s => ({
          name: s.name,
          location: s.location,
          coords: s.coords,
          items: s.items || [],
          totalValue: s.totalValue || 0
        })),
        failedSuppliers: geocodedSuppliers.filter(s => !s.geocoded).map(s => ({
          name: s.name,
          location: s.location,
          error: s.error
        })),
        reasoning: tspResult.reasoning || 'Route optimized successfully'
      };

      console.log(`✅ Route optimization completed: ${totalDistance.toFixed(2)} km, ${fuelCost.toFixed(2)} บาท fuel cost`);
      return result;
    } catch (error) {
      console.error('❌ Route optimization error:', error);
      throw error;
    }
  }
}

  // AI Analysis for Route Optimization - วิเคราะห์และให้คำแนะนำด้วย AI
  async analyzeRouteWithAI(routeData, orderData) {
    const { route, totalDistance, estimatedTime, fuelCost, suppliers, projectLocation } = routeData;
    const { totalPrice, items, locationGroups } = orderData;

    const prompt = `คุณเป็น AI Consultant ผู้เชี่ยวชาญด้านการวางแผนการขนส่งต้นไม้และจัดสวน

ข้อมูลคำสั่งซื้อ:
- ปลายทาง: ${projectLocation}
- ราคาสินค้ารวม: ฿${totalPrice.toLocaleString()}
- จำนวนรายการ: ${items.length} รายการ
- จำนวนที่ตั้งที่ต้องไป: ${Object.keys(locationGroups).length} แห่ง

ข้อมูลเส้นทาง:
- ระยะทางรวม: ${totalDistance.toFixed(1)} กม.
- เวลาโดยประมาณ: ${estimatedTime} ชั่วโมง
- ค่าน้ำมัน: ฿${fuelCost.toLocaleString()}

รายละเอียดที่ตั้งที่ต้องไป:
${Object.entries(locationGroups).map(([location, items]) => `
- ${location}: ${items.length} รายการ, ราคารวม ฿${items.reduce((sum, item) => sum + ((item.selectedSupplier?.price || 0) * item.quantity), 0).toLocaleString()}
`).join('')}

เส้นทางที่แนะนำ:
${route.map((step, index) => `${index + 1}. ${step.location}${step.distance_to_next ? ` → ${step.distance_to_next.toFixed(1)} กม.` : ''}`).join('\n')}

TASK: วิเคราะห์และให้คำแนะนำที่ครอบคลุมสำหรับการวางแผนการขนส่ง

กรุณาวิเคราะห์และให้คำแนะนำในหัวข้อต่อไปนี้:

1. **การวิเคราะห์ต้นทุนรวม**
   - ต้นทุนสินค้า: ฿${totalPrice.toLocaleString()}
   - ค่าขนส่ง (น้ำมัน): ฿${fuelCost.toLocaleString()}
   - ค่าแรง (ประมาณ): คำนวณจากเวลา ${estimatedTime} ชม.
   - ต้นทุนรวมทั้งหมด
   - สัดส่วนค่าขนส่งต่อราคาสินค้า (%)

2. **การวิเคราะห์จำนวนรถที่เหมาะสม**
   - จำนวนรายการทั้งหมด: ${items.reduce((sum, item) => sum + item.quantity, 0)} ต้น
   - มูลค่ารวม: ฿${totalPrice.toLocaleString()}
   - แนะนำจำนวนรถที่ควรใช้ (พิจารณาจากขนาดต้นไม้, ปริมาณ, ระยะทาง)
   - เปรียบเทียบ: ใช้ 1 คัน vs หลายคัน (ข้อดี-ข้อเสีย)

3. **การวิเคราะห์ความเสี่ยง**
   - ความเสี่ยงจากระยะทางไกล (ต้นไม้ตาย, เสียหาย)
   - ความเสี่ยงจากเวลาขนส่งนาน
   - ความเสี่ยงจากสภาพอากาศ/การจราจร
   - ระดับความเสี่ยงโดยรวม (ต่ำ/ปานกลาง/สูง)

4. **คำแนะนำการจัดซื้อ**
   - ควรซื้อจากที่ไหนก่อน (ลำดับความสำคัญ)
   - ควรใช้เวลาเท่าไหร่ต่อจุด
   - ควรไปวันไหน (ถ้ามีข้อมูล)
   - คำแนะนำการจัดเรียงสินค้าในรถ

5. **การวิเคราะห์ ROI และความคุ้มค่า**
   - คุ้มค่าหรือไม่ (เปรียบเทียบต้นทุนขนส่งกับราคาสินค้า)
   - ควรดำเนินการหรือไม่
   - ทางเลือกอื่นที่ควรพิจารณา

6. **คำแนะนำการประหยัดต้นทุน**
   - วิธีลดค่าขนส่ง
   - วิธีลดความเสี่ยง
   - วิธีเพิ่มประสิทธิภาพ

7. **คำแนะนำการวางแผน**
   - ควรเริ่มต้นเวลาเท่าไหร่
   - ควรใช้เวลาต่อจุดเท่าไหร่
   - ควรมี buffer time เท่าไหร่
   - คำแนะนำเพิ่มเติม

Return JSON:
{
  "costAnalysis": {
    "productCost": ${totalPrice},
    "transportCost": ${fuelCost},
    "laborCost": 0, // คำนวณจากเวลา
    "totalCost": 0,
    "transportPercentage": 0, // % ของค่าขนส่งต่อราคาสินค้า
    "isCostEffective": true/false,
    "reasoning": "..."
  },
  "truckRecommendation": {
    "recommendedTrucks": 1,
    "trucksByQuantity": 0, // คำนวณจากจำนวนต้นไม้
    "trucksByValue": 0, // คำนวณจากมูลค่า
    "singleTruckPros": ["..."],
    "singleTruckCons": ["..."],
    "multipleTrucksPros": ["..."],
    "multipleTrucksCons": ["..."],
    "recommendation": "ใช้ 1 คัน" หรือ "ใช้หลายคัน",
    "reasoning": "..."
  },
  "riskAnalysis": {
    "distanceRisk": "low/medium/high",
    "timeRisk": "low/medium/high",
    "weatherRisk": "low/medium/high",
    "overallRisk": "low/medium/high",
    "riskFactors": ["..."],
    "mitigation": ["..."] // วิธีลดความเสี่ยง
  },
  "purchaseRecommendation": {
    "priorityOrder": ["ที่ตั้ง 1", "ที่ตั้ง 2", ...],
    "timePerLocation": {"ที่ตั้ง 1": 30, ...}, // นาที
    "loadingOrder": ["ต้นไม้ขนาดใหญ่", "ต้นไม้ขนาดเล็ก", ...],
    "reasoning": "..."
  },
  "roiAnalysis": {
    "isWorthIt": true/false,
    "transportToProductRatio": 0, // % ค่าขนส่งต่อราคาสินค้า
    "recommendation": "ควรดำเนินการ" หรือ "ควรพิจารณาใหม่",
    "alternatives": ["..."],
    "reasoning": "..."
  },
  "costSavingTips": [
    "คำแนะนำ 1",
    "คำแนะนำ 2",
    ...
  ],
  "planningRecommendation": {
    "startTime": "06:00",
    "timePerLocation": 30, // นาที
    "bufferTime": 60, // นาที
    "totalTimeNeeded": 0, // นาที
    "tips": ["..."]
  },
  "overallRecommendation": "สรุปคำแนะนำโดยรวม",
  "confidence": 85 // 0-100
}

ตอบเป็น JSON ล้วนๆ เท่านั้น ห้ามใส่โค้ดบล็อก`;

    try {
      const response = await aiService.analyzeText(prompt);
      return response;
    } catch (error) {
      console.error('AI Route Analysis Error:', error);
      // Return basic analysis if AI fails
      return this.getBasicRouteAnalysis(routeData, orderData);
    }
  }

  // Basic analysis fallback
  getBasicRouteAnalysis(routeData, orderData) {
    const { totalDistance, estimatedTime, fuelCost } = routeData;
    const { totalPrice } = orderData;
    
    const transportPercentage = (fuelCost / totalPrice) * 100;
    const laborCost = estimatedTime * 500; // 500 บาท/ชม.
    const totalCost = totalPrice + fuelCost + laborCost;
    
    return {
      costAnalysis: {
        productCost: totalPrice,
        transportCost: fuelCost,
        laborCost,
        totalCost,
        transportPercentage: parseFloat(transportPercentage.toFixed(2)),
        isCostEffective: transportPercentage < 10,
        reasoning: transportPercentage < 10 
          ? 'ค่าขนส่งต่ำกว่า 10% ของราคาสินค้า ถือว่าคุ้มค่า'
          : 'ค่าขนส่งสูงกว่า 10% ของราคาสินค้า ควรพิจารณาเพิ่มเติม'
      },
      truckRecommendation: {
        recommendedTrucks: 1,
        reasoning: 'แนะนำใช้ 1 คันสำหรับการขนส่งนี้'
      },
      riskAnalysis: {
        overallRisk: totalDistance > 200 ? 'high' : totalDistance > 100 ? 'medium' : 'low',
        reasoning: `ระยะทาง ${totalDistance.toFixed(1)} กม. ${totalDistance > 200 ? 'มีความเสี่ยงสูง' : totalDistance > 100 ? 'มีความเสี่ยงปานกลาง' : 'มีความเสี่ยงต่ำ'}`
      },
      overallRecommendation: 'ควรดำเนินการตามแผนที่วางไว้',
      confidence: 70
    };
  }
}

module.exports = new RouteOptimizationService();

