// ✅ Supplier Validation Service
// Validates supplier data, especially location for route optimization

const routeOptimizationService = require('./routeOptimizationService');

class SupplierValidationService {
  // Validate supplier location by attempting to geocode it
  async validateSupplierLocation(location) {
    if (!location || location.trim() === '') {
      return {
        isValid: false,
        error: 'ที่อยู่ไม่สามารถว่างได้'
      };
    }

    try {
      const coords = await routeOptimizationService.geocodeAddress(location);
      return {
        isValid: true,
        coords: {
          lat: coords.lat,
          lng: coords.lng
        },
        formatted_address: coords.formatted_address,
        place_id: coords.place_id
      };
    } catch (error) {
      return {
        isValid: false,
        error: `ไม่สามารถหาพิกัดที่อยู่ได้: ${error.message}. กรุณาระบุที่อยู่ให้ชัดเจนขึ้น (เช่น เพิ่มเลขที่ ถนน ตำบล อำเภอ จังหวัด)`
      };
    }
  }

  // Validate scraping result before approval
  async validateScrapingResult(result) {
    const errors = [];

    // Check required fields
    if (!result.supplier_name || result.supplier_name.trim() === '') {
      errors.push('ต้องมีชื่อ Supplier');
    }

    if (!result.supplier_location || result.supplier_location.trim() === '') {
      errors.push('ต้องมี supplier_location สำหรับ Route Optimization');
    }

    if (!result.plant_name || result.plant_name.trim() === '') {
      errors.push('ต้องมีชื่อต้นไม้');
    }

    // Validate location if provided
    if (result.supplier_location) {
      const locationValidation = await this.validateSupplierLocation(result.supplier_location);
      
      if (!locationValidation.isValid) {
        errors.push(locationValidation.error);
      } else {
        // Add geocoded coordinates to result
        result.validatedLocation = locationValidation;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      validatedData: result
    };
  }

  // Validate supplier data before saving
  async validateSupplier(supplierData) {
    const errors = [];
    const warnings = [];

    // Required fields
    if (!supplierData.name || supplierData.name.trim() === '') {
      errors.push('ชื่อร้านค้าไม่สามารถว่างได้');
    }

    if (!supplierData.location || supplierData.location.trim() === '') {
      errors.push('ที่อยู่ไม่สามารถว่างได้');
    }

    // Validate location
    if (supplierData.location) {
      const locationValidation = await this.validateSupplierLocation(supplierData.location);
      
      if (!locationValidation.isValid) {
        errors.push(locationValidation.error);
      } else {
        // Add geocoded coordinates
        supplierData.latitude = locationValidation.coords.lat;
        supplierData.longitude = locationValidation.coords.lng;
        supplierData.formatted_address = locationValidation.formatted_address;
      }
    }

    // Optional but recommended fields
    if (!supplierData.phone || supplierData.phone.trim() === '') {
      warnings.push('แนะนำให้เพิ่มเบอร์โทรศัพท์');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validatedData: supplierData
    };
  }

  // Batch validate multiple suppliers
  async validateSuppliers(suppliers) {
    const results = [];
    for (const supplier of suppliers) {
      const validation = await this.validateSupplier(supplier);
      results.push({
        supplier,
        ...validation
      });
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return results;
  }
}

module.exports = new SupplierValidationService();

