import React from 'react';
import { CheckCircle, User, Truck, CreditCard } from 'lucide-react';

interface CheckoutStepsProps {
  currentStep: number;
}

const steps = [
  { id: 1, title: 'Контактные данные', icon: User },
  { id: 2, title: 'Доставка', icon: Truck },
  { id: 3, title: 'Оплата', icon: CreditCard },
  { id: 4, title: 'Подтверждение', icon: CheckCircle }
];

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Mobile: horizontal scroll with snapping; Desktop: spread evenly */}
        <ol
          role="list"
          className="
            flex md:items-center md:justify-between gap-3 md:gap-0
            overflow-x-auto md:overflow-visible
            snap-x snap-mandatory md:snap-none
            pb-2 md:pb-0
          "
        >
          {steps.map((step, index) => {
            const isDone = currentStep > step.id;
            const isActive = currentStep === step.id || currentStep > step.id;
            const Icon = isDone ? CheckCircle : step.icon;

            return (
              <li
                key={step.id}
                className="
                  flex items-center flex-none md:flex-1
                  snap-start
                  min-w-[180px] sm:min-w-[220px] md:min-w-0
                  md:max-w-none
                "
                aria-current={currentStep === step.id ? 'step' : undefined}
              >
                {/* Step bubble */}
                <div
                  className={[
                    'flex items-center justify-center',
                    'w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 shrink-0',
                    isActive
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : 'border-gray-300 text-gray-400'
                  ].join(' ')}
                >
                  <Icon size={18} />
                </div>

                {/* Label */}
                <span
                  className={[
                    'ml-2 sm:ml-3 text-xs sm:text-sm font-medium',
                    'truncate',
                    isActive ? 'text-teal-600' : 'text-gray-400'
                  ].join(' ')}
                  title={step.title}
                >
                  {step.title}
                </span>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div
                    className={[
                      // mobile: short connector; desktop: flexible line
                      'mx-3 sm:mx-4 h-0.5',
                      'w-8 sm:w-12 md:w-auto md:flex-1',
                      isDone ? 'bg-teal-500' : 'bg-gray-300'
                    ].join(' ')}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default CheckoutSteps;
