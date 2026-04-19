import React from 'react';
import { getLucideIconByName } from '../../lib/navigationIcons';
import type { ClubHomeBenefitItem } from '../../lib/types';

interface ClubBenefitsProps {
  items: ClubHomeBenefitItem[];
}

const ClubBenefits: React.FC<ClubBenefitsProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-4">
      {items.map((b, i) => {
        const Icon = getLucideIconByName(b.icon_name);
        return (
          <div key={`${b.icon_name}-${i}`} className="text-center sm:text-left">
            <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-turquoise mx-auto sm:mx-0" />
            <p className="text-sm text-gray-600 mt-2">{b.body}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ClubBenefits;
