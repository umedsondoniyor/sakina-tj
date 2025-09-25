export const buildDeliveryAddress = (formData: {
  deliveryType: 'home' | 'pickup';
  address: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
}) => {
  // Only build address string for home delivery
  if (formData.deliveryType !== 'home') return null;
  
  // If no main address provided, return null
  if (!formData.address?.trim()) return null;

  // Build concatenated address string in the required format
  // Format: "Адрес доставки, Квартира, Подъезд, Этаж, Домофон"
  return [
    formData.address,
    formData.apartment?.trim() ? `Кв. ${formData.apartment.trim()}` : '',
    formData.entrance?.trim() ? `Подъезд ${formData.entrance.trim()}` : '',
    formData.floor?.trim() ? `Этаж ${formData.floor.trim()}` : '',
    formData.intercom?.trim() ? `Домофон ${formData.intercom.trim()}` : ''
  ]
    .filter(Boolean)
    .join(', ');
};
