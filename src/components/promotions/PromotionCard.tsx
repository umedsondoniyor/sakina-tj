import React from 'react';

interface PromotionCardProps {
  promo: {
    id: number;
    title: string;
    subtitle: string;
    discount: string;
    image: string;
  };
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promo }) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={promo.image}
          alt={promo.title}
          className="w-full h-80 object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col justify-end">
          <span className="inline-block bg-yellow-400 text-black px-2 py-1 rounded text-sm font-medium mb-2">
            {promo.discount}
          </span>
          <h3 className="text-white text-xl font-bold mb-2">{promo.title}</h3>
          <p className="text-white/80">{promo.subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default PromotionCard;