import React from 'react';

interface BenefitCardProps {
  benefit: {
    id: number;
    icon: string;
    title: string;
    subtitle: string;
    description: string;
  };
  isHovered: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  /** Mobile carousel: full content in-flow (no hover bubble; avoids overflow clipping) */
  staticLayout?: boolean;
}

const BenefitCard: React.FC<BenefitCardProps> = ({
  benefit,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  staticLayout = false,
}) => {
  if (staticLayout) {
    return (
      <article className="bg-white rounded-xl border border-gray-200/90 shadow-md shadow-gray-200/50 p-5 flex flex-col items-center text-center gap-3 h-full min-h-[280px]">
        <img
          src={benefit.icon}
          alt=""
          className="w-24 h-24 object-contain shrink-0"
        />
        <h3 className="text-base font-semibold text-brand-navy leading-tight">
          <span className="block">{benefit.title}</span>
          <span className="block text-sm font-medium text-gray-700 mt-1">{benefit.subtitle}</span>
        </h3>
        <p className="text-sm text-gray-700 leading-snug flex-1">{benefit.description}</p>
        {(benefit.id === 1 || benefit.id === 3) && (
          <a
            href="#"
            className="inline-block text-sm text-brand-turquoise hover:text-brand-navy underline mt-auto shrink-0"
          >
            Подробнее
          </a>
        )}
      </article>
    );
  }

  return (
    <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="flex flex-row items-center bg-white rounded-lg transition-all hover:cursor-pointer duration-300 hover:text-brand-turquoise">
        <img
          src={benefit.icon}
          alt={benefit.title}
          className="w-32 h-32 flex-shrink-0 p-4 object-contain"
          style={{ aspectRatio: 'auto' }}
        />
        <h3 className="text-lg font-medium">
          <span className="block">{benefit.title}</span>
          <span className="block">{benefit.subtitle}</span>
        </h3>
      </div>

      {/* Hover Information - Message Bubble */}
      <div
        className={`absolute left-0 right-0 top-full mt-2 transition-all duration-300 z-10 ${
          isHovered
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible translate-y-1'
        }`}
      >
        {/* Triangle Pointer */}
        <div
          className="absolute -top-2 left-8 w-4 h-4 bg-yellow-100 transform rotate-45"
          style={{ clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)' }}
        />

        {/* Message Content */}
        <div className="bg-yellow-100 rounded-lg p-4 relative">
          <p className="text-sm text-gray-800">{benefit.description}</p>
          {(benefit.id === 1 || benefit.id === 3) && (
            <a
              href="#"
              className="inline-block mt-2 text-sm text-brand-turquoise hover:text-brand-navy underline"
            >
              Подробнее
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BenefitCard;
