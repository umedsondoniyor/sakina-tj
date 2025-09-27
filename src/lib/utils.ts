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
