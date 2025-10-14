import { Plant } from '../types';
import { plantsData } from '../data/plants';

// อัปเดตราคาในฐานข้อมูล
export const updateSupplierPrice = (
  plantId: string, 
  supplierId: string, 
  newPrice: number
): Plant[] => {
  const updatedPlants = plantsData.map(plant => {
    if (plant.id === plantId) {
      return {
        ...plant,
        suppliers: plant.suppliers.map(supplier => {
          if (supplier.id === supplierId) {
            return {
              ...supplier,
              price: newPrice,
              lastUpdated: new Date().toISOString().split('T')[0]
            };
          }
          return supplier;
        })
      };
    }
    return plant;
  });
  
  return updatedPlants;
};

// บันทึกราคาใหม่ลง localStorage
export const saveUpdatedPrices = (updatedPlants: Plant[]) => {
  localStorage.setItem('updatedPlantPrices', JSON.stringify(updatedPlants));
};

// โหลดราคาที่อัปเดตแล้ว
export const getUpdatedPlants = (): Plant[] => {
  const savedPrices = localStorage.getItem('updatedPlantPrices');
  if (savedPrices) {
    return JSON.parse(savedPrices);
  }
  return plantsData;
};

// อัปเดตราคาและบันทึก
export const updateAndSavePrice = (
  plantId: string, 
  supplierId: string, 
  newPrice: number
): Plant[] => {
  const updatedPlants = updateSupplierPrice(plantId, supplierId, newPrice);
  saveUpdatedPrices(updatedPlants);
  return updatedPlants;
};
