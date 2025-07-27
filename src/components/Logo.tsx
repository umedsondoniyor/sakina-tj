import React from 'react';

interface LogoProps {
  variant?: 'horizontal' | 'vertical';
  className?: string;
  color?: 'default' | 'white' | 'navy';
}

const Logo: React.FC<LogoProps> = ({ variant = 'horizontal', className = '', color = 'default' }) => {
  const getColors = () => {
    switch (color) {
      case 'white':
        return {
          icon: '#FFFFFF',
          text: '#FFFFFF'
        };
      case 'navy':
        return {
          icon: '#0C4A6E',
          text: '#0C4A6E'
        };
      default:
        return {
          icon: '#33D9C7',
          text: '#0C4A6E'
        };
    }
  };

  const colors = getColors();
  const baseHeight = variant === 'horizontal' ? 32 : 48;
  const spacing = baseHeight * 0.5;

  const cloudIcon = (
    <svg
      viewBox="0 0 271 225"
      fill="none"
      className={`${variant === 'horizontal' ? 'w-8 h-8' : 'w-12 h-12'}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: variant === 'horizontal' ? 0 : 0, marginBottom: variant === 'vertical' ? spacing : 0 }}
    >
      <path
        d="M191.874 177.104C209.961 172.26 220.486 160.737 222.469 142.666C224.197 126.921 217.58 114.261 204.127 105.871C191.551 98.027 178.208 97.699 165.18 104.81C151.978 112.016 145.132 123.492 144.871 138.581C144.389 166.421 125.943 189.44 99.42 195.041C68.51 201.568 38.728 182.594 31.454 151.741C24.383 121.746 42.763 91.331 72.966 83.621C77.266 82.523 78.994 80.809 80.154 76.518C85.866 55.38 99.429 41.288 120.544 35.563C141.425 29.902 160.072 35.011 175.774 50.048C180.788 54.85 181.132 59.908 177.09 64.048C173.18 68.053 167.899 67.713 162.955 63.139C140.02 41.923 104.884 52.069 97.567 82.079C96.865 84.961 96.912 88.021 96.532 90.988C95.775 96.915 92.6 99.885 86.575 99.98C66.896 100.293 47.823 116.072 48.384 139.925C48.913 162.401 67.308 178.864 89.48 177.981C108.526 177.223 125.352 161.241 126.024 142.198C126.632 124.982 131.407 109.854 143.98 97.613C160.024 81.992 185.013 77.228 205.672 85.965C227.13 95.04 240.981 115.555 241.004 138.295C241.037 170.362 215.58 196.492 184.661 196.127C178.623 196.056 174.789 192.758 174.563 187.444C174.334 182.062 178.349 178.309 184.54 177.973C186.855 177.848 189.156 177.453 191.874 177.104Z"
        fill={colors.icon}
      />
    </svg>
  );

  const containerClasses = `
    ${className}
    ${variant === 'vertical' ? 'flex flex-col items-center' : 'flex items-center'}
  `;

  return (
    <div className={containerClasses}>
      {cloudIcon}
      <span 
        className={`font-bold ${variant === 'horizontal' ? 'text-2xl' : 'text-3xl mt-2'}`}
        style={{ color: colors.text }}
      >
        sakina
      </span>
    </div>
  );
};

export default Logo;