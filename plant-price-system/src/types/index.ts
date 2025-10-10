export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  plantType: 'ไม้ประดับ' | 'ไม้ล้อม' | 'ไม้คลุมดิน' | 'ไม้ดอก' | 'ไม้ใบ' | 'แคคตัส' | 'บอนไซ' | 'กล้วยไม้';
  measurementType: 'ความสูง' | 'ขนาดลำต้น' | 'ขนาดถุงดำ' | 'ขนาดกระถาง' | 'จำนวนกิ่ง';
  suppliers: Supplier[];
  hasSuppliers?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  price: number;
  phone: string;
  location: string;
  lastUpdated: string;
  size?: string; // ไซต์ต้นไม้ (เช่น 1m, 1.2m, 1.5m)
}

export interface QuoteItem {
  plant: Plant;
  quantity: number;
  selectedSupplier: Supplier | null;
}

export interface BillItem {
  name: string;
  price: number;
  quantity: number;
  confidenceScore: number;
}

export interface BillData {
  supplierInfo: {
    name: string;
    phone: string;
    province: string;
  };
  items: BillItem[];
  totalAmount: number;
  date: string;
}

export interface SearchResult {
  plant: Plant;
  isSelected: boolean;
}
