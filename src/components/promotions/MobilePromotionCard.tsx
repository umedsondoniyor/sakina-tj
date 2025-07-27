import React from 'react';

interface MobilePromotionCardProps {
  promo: {
    id: number;
    title: string;
    subtitle: string;
    discount: string;
    image: string;
  };
}

const MobilePromotionCard: React.FC<MobilePromotionCardProps> = ({ promo }) => {
  return (
    <div className="flex-none w-[280px] cursor-pointer">
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={promo.image}
          alt={promo.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
          <span className="inline-block bg-yellow-400 text-black px-2 py-1 rounded text-sm font-medium mb-2">
            {promo.discount}
          </span>
          <h3 className="text-white text-lg font-bold mb-1">{promo.title}</h3>
          <p className="text-white/80 text-sm">{promo.subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default MobilePromotionCard;