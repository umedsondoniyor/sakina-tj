import React from 'react';

interface StatItemProps {
  stat: {
    image: string;
    number: string;
    label: string;
  };
}

const StatItem: React.FC<StatItemProps> = ({ stat }) => {
  return (
    <div className="flex items-center space-x-3 md:space-x-4">
      <div className="w-16 h-16 md:w-24 md:h-24 flex-shrink-0">
        <img
          src={stat.image}
          alt={stat.label}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div>
        <div className="text-2xl md:text-4xl font-bold text-teal-500">{stat.number}</div>
        <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
      </div>
    </div>
  );
};

export default StatItem;