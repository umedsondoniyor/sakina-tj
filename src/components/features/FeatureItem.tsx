import React from 'react';

interface FeatureItemProps {
  feature: {
    icon: React.ElementType;
    title: string;
    description: string;
  };
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature }) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0">
        <feature.icon size={48} className="text-brand-turquoise" />
      </div>
      <div className="text-brand-navy">
        <h3 className="font-semibold text-lg">{feature.title}</h3>
        <p>{feature.description}</p>
      </div>
    </div>
  );
};

export default FeatureItem;