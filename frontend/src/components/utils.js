export const getCategoryFromName = (name) => {
    if (!name) return "Other";
    const nameLower = name.toLowerCase();
    if (nameLower.includes("scaun") || nameLower.includes("chair")) return "Chairs";
    if (nameLower.includes("masa") || nameLower.includes("table")) return "Tables";
    if (nameLower.includes("canapea") || nameLower.includes("sofa")) return "Sofas";
    if (nameLower.includes("pat") || nameLower.includes("dormitor") || nameLower.includes("bedroom")) return "Bedroom";
    return "Other";
  };
  
  // utils/priceUtils.js
  export const parsePrice = (price) => {
    if (price === null || price === undefined) return 0;
    
    // If already a number, return it
    if (typeof price === 'number') return price;
    
    // If string, remove any non-numeric characters except decimal point
    if (typeof price === 'string') {
      const numericString = price.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(numericString);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  };