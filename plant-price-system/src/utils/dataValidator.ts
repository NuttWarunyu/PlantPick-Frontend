// 🔍 Data Validator - ระบบตรวจสอบความถูกต้องของข้อมูล
// ป้องกันข้อมูลผิดพลาดและเพิ่มความน่าเชื่อถือ

import { Plant, Supplier } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'email' | 'phone' | 'date' | 'array';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => string | null;
}

export class DataValidator {
  private static instance: DataValidator;

  private constructor() {}

  public static getInstance(): DataValidator {
    if (!DataValidator.instance) {
      DataValidator.instance = new DataValidator();
    }
    return DataValidator.instance;
  }

  // 🌱 ตรวจสอบข้อมูลต้นไม้
  public validatePlant(plant: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // ตรวจสอบฟิลด์ที่จำเป็น
    if (!plant.id || typeof plant.id !== 'string' || plant.id.trim() === '') {
      errors.push('ID ต้นไม้ไม่ถูกต้อง');
    }

    if (!plant.name || typeof plant.name !== 'string' || plant.name.trim() === '') {
      errors.push('ชื่อต้นไม้ไม่ถูกต้อง');
    } else if (plant.name.length < 2) {
      errors.push('ชื่อต้นไม้ต้องมีอย่างน้อย 2 ตัวอักษร');
    } else if (plant.name.length > 100) {
      errors.push('ชื่อต้นไม้ต้องไม่เกิน 100 ตัวอักษร');
    }

    if (!plant.scientificName || typeof plant.scientificName !== 'string' || plant.scientificName.trim() === '') {
      errors.push('ชื่อวิทยาศาสตร์ไม่ถูกต้อง');
    } else if (!this.isValidScientificName(plant.scientificName)) {
      warnings.push('ชื่อวิทยาศาสตร์อาจไม่ถูกต้อง');
    }

    if (!plant.category || typeof plant.category !== 'string' || plant.category.trim() === '') {
      errors.push('หมวดหมู่ไม่ถูกต้อง');
    } else if (!this.isValidCategory(plant.category)) {
      warnings.push('หมวดหมู่ไม่ตรงกับมาตรฐาน');
    }

    if (!plant.plantType || typeof plant.plantType !== 'string' || plant.plantType.trim() === '') {
      errors.push('ประเภทต้นไม้ไม่ถูกต้อง');
    } else if (!this.isValidPlantType(plant.plantType)) {
      warnings.push('ประเภทต้นไม้ไม่ตรงกับมาตรฐาน');
    }

    if (!plant.measurementType || typeof plant.measurementType !== 'string' || plant.measurementType.trim() === '') {
      errors.push('หน่วยวัดไม่ถูกต้อง');
    } else if (!this.isValidMeasurementType(plant.measurementType)) {
      warnings.push('หน่วยวัดไม่ตรงกับมาตรฐาน');
    }

    // ตรวจสอบ suppliers
    if (!Array.isArray(plant.suppliers)) {
      errors.push('ข้อมูลผู้จัดจำหน่ายต้องเป็น Array');
    } else {
      plant.suppliers.forEach((supplier: any, index: number) => {
        const supplierValidation = this.validateSupplier(supplier);
        if (!supplierValidation.isValid) {
          errors.push(`ผู้จัดจำหน่ายที่ ${index + 1}: ${supplierValidation.errors.join(', ')}`);
        }
        if (supplierValidation.warnings.length > 0) {
          warnings.push(`ผู้จัดจำหน่ายที่ ${index + 1}: ${supplierValidation.warnings.join(', ')}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // 🏪 ตรวจสอบข้อมูลผู้จัดจำหน่าย
  public validateSupplier(supplier: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // ตรวจสอบฟิลด์ที่จำเป็น
    if (!supplier.id || typeof supplier.id !== 'string' || supplier.id.trim() === '') {
      errors.push('ID ผู้จัดจำหน่ายไม่ถูกต้อง');
    }

    if (!supplier.name || typeof supplier.name !== 'string' || supplier.name.trim() === '') {
      errors.push('ชื่อผู้จัดจำหน่ายไม่ถูกต้อง');
    } else if (supplier.name.length < 2) {
      errors.push('ชื่อผู้จัดจำหน่ายต้องมีอย่างน้อย 2 ตัวอักษร');
    } else if (supplier.name.length > 100) {
      errors.push('ชื่อผู้จัดจำหน่ายต้องไม่เกิน 100 ตัวอักษร');
    }

    if (typeof supplier.price !== 'number' || isNaN(supplier.price)) {
      errors.push('ราคาต้องเป็นตัวเลข');
    } else if (supplier.price < 0) {
      errors.push('ราคาต้องไม่เป็นลบ');
    } else if (supplier.price > 1000000) {
      warnings.push('ราคาสูงมาก ตรวจสอบความถูกต้อง');
    }

    if (!supplier.phone || typeof supplier.phone !== 'string' || supplier.phone.trim() === '') {
      errors.push('เบอร์โทรศัพท์ไม่ถูกต้อง');
    } else if (!this.isValidPhone(supplier.phone)) {
      warnings.push('รูปแบบเบอร์โทรศัพท์อาจไม่ถูกต้อง');
    }

    if (!supplier.location || typeof supplier.location !== 'string' || supplier.location.trim() === '') {
      errors.push('ที่ตั้งไม่ถูกต้อง');
    } else if (supplier.location.length < 2) {
      errors.push('ที่ตั้งต้องมีอย่างน้อย 2 ตัวอักษร');
    }

    if (!supplier.lastUpdated || typeof supplier.lastUpdated !== 'string' || supplier.lastUpdated.trim() === '') {
      errors.push('วันที่อัปเดตไม่ถูกต้อง');
    } else if (!this.isValidDate(supplier.lastUpdated)) {
      warnings.push('รูปแบบวันที่อาจไม่ถูกต้อง');
    }

    // ตรวจสอบ size (ถ้ามี)
    if (supplier.size && typeof supplier.size !== 'string') {
      warnings.push('ขนาดต้องเป็นข้อความ');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // 📊 ตรวจสอบข้อมูลจำนวนมาก
  public validateBulkData(data: any[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('ข้อมูลต้องเป็น Array');
      return { isValid: false, errors, warnings };
    }

    if (data.length === 0) {
      errors.push('ไม่มีข้อมูลให้ตรวจสอบ');
      return { isValid: false, errors, warnings };
    }

    if (data.length > 1000) {
      warnings.push('ข้อมูลจำนวนมาก อาจใช้เวลานานในการประมวลผล');
    }

    // ตรวจสอบแต่ละรายการ
    data.forEach((item, index) => {
      if (!item.plantId || typeof item.plantId !== 'string') {
        errors.push(`รายการที่ ${index + 1}: plantId ไม่ถูกต้อง`);
      }

      if (!item.supplierId || typeof item.supplierId !== 'string') {
        errors.push(`รายการที่ ${index + 1}: supplierId ไม่ถูกต้อง`);
      }

      if (typeof item.newPrice !== 'number' || isNaN(item.newPrice)) {
        errors.push(`รายการที่ ${index + 1}: newPrice ต้องเป็นตัวเลข`);
      } else if (item.newPrice < 0) {
        errors.push(`รายการที่ ${index + 1}: ราคาต้องไม่เป็นลบ`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // 🔄 ตรวจสอบข้อมูล Import
  public validateImportData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // ตรวจสอบโครงสร้างพื้นฐาน
    if (!data || typeof data !== 'object') {
      errors.push('ข้อมูลไม่ถูกต้อง');
      return { isValid: false, errors, warnings };
    }

    if (!data.version || typeof data.version !== 'string') {
      errors.push('เวอร์ชันข้อมูลไม่ถูกต้อง');
    }

    if (!data.timestamp || typeof data.timestamp !== 'string') {
      errors.push('เวลาสร้างข้อมูลไม่ถูกต้อง');
    } else if (!this.isValidDate(data.timestamp)) {
      warnings.push('รูปแบบเวลาอาจไม่ถูกต้อง');
    }

    // ตรวจสอบข้อมูลต้นไม้
    if (data.plants) {
      if (!Array.isArray(data.plants)) {
        errors.push('ข้อมูลต้นไม้ต้องเป็น Array');
      } else {
        data.plants.forEach((plant: any, index: number) => {
          const plantValidation = this.validatePlant(plant);
          if (!plantValidation.isValid) {
            errors.push(`ต้นไม้ที่ ${index + 1}: ${plantValidation.errors.join(', ')}`);
          }
          if (plantValidation.warnings.length > 0) {
            warnings.push(`ต้นไม้ที่ ${index + 1}: ${plantValidation.warnings.join(', ')}`);
          }
        });
      }
    }

    // ตรวจสอบข้อมูลผู้จัดจำหน่าย
    if (data.suppliers) {
      if (!Array.isArray(data.suppliers)) {
        errors.push('ข้อมูลผู้จัดจำหน่ายต้องเป็น Array');
      } else {
        data.suppliers.forEach((supplier: any, index: number) => {
          const supplierValidation = this.validateSupplier(supplier);
          if (!supplierValidation.isValid) {
            errors.push(`ผู้จัดจำหน่ายที่ ${index + 1}: ${supplierValidation.errors.join(', ')}`);
          }
          if (supplierValidation.warnings.length > 0) {
            warnings.push(`ผู้จัดจำหน่ายที่ ${index + 1}: ${supplierValidation.warnings.join(', ')}`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // 🧹 ทำความสะอาดข้อมูล
  public sanitizePlant(plant: any): Plant {
    return {
      id: String(plant.id || '').trim(),
      name: String(plant.name || '').trim(),
      scientificName: String(plant.scientificName || '').trim(),
      category: String(plant.category || '').trim(),
      plantType: this.validatePlantType(String(plant.plantType || 'ไม้ประดับ').trim()),
      measurementType: this.validateMeasurementType(String(plant.measurementType || 'ความสูง').trim()),
      suppliers: Array.isArray(plant.suppliers) ? 
        plant.suppliers.map((supplier: any) => this.sanitizeSupplier(supplier)) : [],
      hasSuppliers: Array.isArray(plant.suppliers) && plant.suppliers.length > 0
    };
  }

  public sanitizeSupplier(supplier: any): Supplier {
    return {
      id: String(supplier.id || '').trim(),
      name: String(supplier.name || '').trim(),
      price: Number(supplier.price) || 0,
      phone: String(supplier.phone || '').trim(),
      location: String(supplier.location || '').trim(),
      lastUpdated: String(supplier.lastUpdated || new Date().toISOString()).trim(),
      size: supplier.size ? String(supplier.size).trim() : undefined
    };
  }

  // Private helper methods
  private isValidScientificName(name: string): boolean {
    // ตรวจสอบรูปแบบชื่อวิทยาศาสตร์ (Genus species)
    const pattern = /^[A-Z][a-z]+ [a-z]+/;
    return pattern.test(name);
  }

  private isValidCategory(category: string): boolean {
    const validCategories = [
      'ไม้ใบ', 'ไม้ดอก', 'ไม้ล้อม', 'ไม้คลุมดิน', 
      'แคคตัส', 'บอนไซ', 'กล้วยไม้', 'ไม้ไผ่'
    ];
    return validCategories.includes(category);
  }

  private isValidPlantType(plantType: string): boolean {
    const validTypes = [
      'ไม้ประดับ', 'ไม้ล้อม', 'ไม้คลุมดิน', 'ไม้ดอก', 
      'ไม้ใบ', 'แคคตัส', 'บอนไซ', 'กล้วยไม้'
    ];
    return validTypes.includes(plantType);
  }

  private isValidMeasurementType(measurementType: string): boolean {
    const validTypes = [
      'ความสูง', 'ขนาดลำต้น', 'ขนาดถุงดำ', 'ขนาดกระถาง', 'จำนวนกิ่ง'
    ];
    return validTypes.includes(measurementType);
  }

  private isValidPhone(phone: string): boolean {
    // ตรวจสอบเบอร์โทรศัพท์ไทย
    const pattern = /^(\+66|0)[0-9]{8,9}$/;
    return pattern.test(phone.replace(/[\s-]/g, ''));
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  private validatePlantType(plantType: string): 'ไม้ประดับ' | 'ไม้ล้อม' | 'ไม้คลุมดิน' | 'ไม้ดอก' | 'ไม้ใบ' | 'แคคตัส' | 'บอนไซ' | 'กล้วยไม้' {
    const validTypes: ('ไม้ประดับ' | 'ไม้ล้อม' | 'ไม้คลุมดิน' | 'ไม้ดอก' | 'ไม้ใบ' | 'แคคตัส' | 'บอนไซ' | 'กล้วยไม้')[] = [
      'ไม้ประดับ', 'ไม้ล้อม', 'ไม้คลุมดิน', 'ไม้ดอก', 'ไม้ใบ', 'แคคตัส', 'บอนไซ', 'กล้วยไม้'
    ];
    return validTypes.includes(plantType as any) ? plantType as any : 'ไม้ประดับ';
  }

  private validateMeasurementType(measurementType: string): 'ความสูง' | 'ขนาดลำต้น' | 'ขนาดถุงดำ' | 'ขนาดกระถาง' | 'จำนวนกิ่ง' {
    const validTypes: ('ความสูง' | 'ขนาดลำต้น' | 'ขนาดถุงดำ' | 'ขนาดกระถาง' | 'จำนวนกิ่ง')[] = [
      'ความสูง', 'ขนาดลำต้น', 'ขนาดถุงดำ', 'ขนาดกระถาง', 'จำนวนกิ่ง'
    ];
    return validTypes.includes(measurementType as any) ? measurementType as any : 'ความสูง';
  }
}

// Export singleton instance
export const dataValidator = DataValidator.getInstance();
