export const buildDeliveryAddress = (formData: {
  deliveryType: 'home' | 'pickup';
  address: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
}) => {
  if (formData.deliveryType !== 'home') return null;

  return [
    formData.address,
    formData.apartment ? `Кв. ${formData.apartment}` : '',
    formData.entrance ? `Подъезд ${formData.entrance}` : '',
    formData.floor ? `Этаж ${formData.floor}` : '',
    formData.intercom ? `Домофон ${formData.intercom}` : ''
  ]
    .filter(Boolean)
    .join(', ');
};
