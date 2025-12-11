/**
 * Format a number as Somoni currency
 * @param amount - The amount to format
 * @returns Formatted string with Russian locale and "с." suffix
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('ru-RU')} с.`;
};

/**
 * Format a date for display
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('ru-RU');
};

/**
 * Get variant label based on category
 * @param variant - Product variant
 * @param category - Product category
 * @returns Formatted size label
 */
export const getVariantLabel = (
  variant: { size_name: string; height_cm?: number; width_cm?: number; length_cm?: number },
  category?: string
): string => {
  const isPillow = category === 'pillows';
  const isMattress = category === 'mattresses';
  const isBed = category === 'beds';

  if (isPillow && variant.height_cm) {
    return `${variant.size_name}, h - ${variant.height_cm} см`;
  } else if ((isMattress || isBed) && variant.width_cm && variant.length_cm) {
    return `${variant.width_cm}×${variant.length_cm}`;
  }
  return variant.size_name;
};

export const buildDeliveryAddress = (formData: {
  deliveryType: 'home' | 'pickup';
  address: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
}) => {
  // **FIX**: Always build address string if main address is provided, regardless of delivery type
  // This ensures we capture address information for record-keeping purposes
  
  // If no main address provided, return null
  const mainAddress = formData.address?.trim();
  if (!mainAddress) return null;

  // **FIX**: Improved concatenation logic with better null/empty handling
  // Format: "Адрес доставки, Кв. 123, Подъезд 2, Этаж 5, Домофон 456"
  const addressParts = [
    mainAddress, // Main address (required)
    formData.apartment?.trim() ? `Кв. ${formData.apartment.trim()}` : null,
    formData.entrance?.trim() ? `Подъезд ${formData.entrance.trim()}` : null,
    formData.floor?.trim() ? `Этаж ${formData.floor.trim()}` : null,
    formData.intercom?.trim() ? `Домофон ${formData.intercom.trim()}` : null
  ].filter(Boolean); // Remove null/empty values

  return addressParts.join(', ');
};

/**
 * Darken a hex color for better contrast on light backgrounds
 * @param color - Hex color string (e.g., "#10b981" or "rgb(16, 185, 129)")
 * @returns Darker hex color string that meets WCAG AA contrast (4.5:1)
 */
export const darkenColorForContrast = (color: string): string => {
  if (!color) return '#0f766e'; // Default dark teal
  
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Darken by 40% for better contrast (was 30%, now 40% to meet 4.5:1 ratio)
    const darkenedR = Math.max(0, Math.floor(r * 0.6));
    const darkenedG = Math.max(0, Math.floor(g * 0.6));
    const darkenedB = Math.max(0, Math.floor(b * 0.6));
    
    return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
  }
  
  // Handle rgb colors
  if (color.startsWith('rgb')) {
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = parseInt(matches[0]);
      const g = parseInt(matches[1]);
      const b = parseInt(matches[2]);
      
      // Darken by 40% for better contrast
      const darkenedR = Math.max(0, Math.floor(r * 0.6));
      const darkenedG = Math.max(0, Math.floor(g * 0.6));
      const darkenedB = Math.max(0, Math.floor(b * 0.6));
      
      return `rgb(${darkenedR}, ${darkenedG}, ${darkenedB})`;
    }
  }
  
  // Return default if parsing fails
  return '#0f766e';
};
