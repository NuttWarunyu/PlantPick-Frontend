// 🗺️ Geocode Existing Suppliers
// Script to geocode all existing suppliers that don't have coordinates

require('dotenv').config();
const { pool } = require('../database');
const routeOptimizationService = require('../services/routeOptimizationService');

async function geocodeSuppliers() {
  try {
    console.log('🗺️ Starting supplier geocoding...\n');

    // Get all suppliers without coordinates
    const result = await pool.query(`
      SELECT id, name, location, latitude, longitude
      FROM suppliers
      WHERE location IS NOT NULL 
        AND location != ''
        AND (latitude IS NULL OR longitude IS NULL)
      ORDER BY created_at DESC
    `);

    const suppliers = result.rows;
    console.log(`📊 Found ${suppliers.length} suppliers to geocode\n`);

    if (suppliers.length === 0) {
      console.log('✅ All suppliers already have coordinates!');
      process.exit(0);
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (let i = 0; i < suppliers.length; i++) {
      const supplier = suppliers[i];
      console.log(`[${i + 1}/${suppliers.length}] Geocoding: ${supplier.name} - ${supplier.location}`);

      try {
        const geocoded = await routeOptimizationService.geocodeAddress(supplier.location);

        // Update supplier with coordinates
        await pool.query(`
          UPDATE suppliers
          SET latitude = $1,
              longitude = $2,
              formatted_address = $3,
              updated_at = NOW()
          WHERE id = $4
        `, [
          geocoded.lat,
          geocoded.lng,
          geocoded.formatted_address,
          supplier.id
        ]);

        console.log(`  ✅ Success: ${geocoded.formatted_address}`);
        console.log(`     Coordinates: ${geocoded.lat}, ${geocoded.lng}\n`);
        successCount++;

        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}\n`);
        failCount++;
        errors.push({
          supplier: supplier.name,
          location: supplier.location,
          error: error.message
        });
      }
    }

    // Summary
    console.log('\n📊 Geocoding Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Success Rate: ${((successCount / suppliers.length) * 100).toFixed(1)}%`);

    if (errors.length > 0) {
      console.log('\n❌ Failed Suppliers:');
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.supplier} - ${err.location}`);
        console.log(`   Error: ${err.error}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  geocodeSuppliers();
}

module.exports = { geocodeSuppliers };

