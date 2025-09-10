// Validation utilities for About page forms

export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateField(value: any, rules: ValidationRule): string | null {
  // Required check
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'Это поле обязательно для заполнения';
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  const stringValue = String(value).trim();

  // Length checks
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `Минимальная длина: ${rules.minLength} символов`;
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `Максимальная длина: ${rules.maxLength} символов`;
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return 'Неверный формат';
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

export function validateForm(data: Record<string, any>, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field], fieldRules);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

// Predefined validation rules for About page
export const aboutValidationRules = {
  settings: {
    hero_title: { required: true, minLength: 3, maxLength: 100 },
    hero_subtitle: { maxLength: 500 },
    hero_image_url: { 
      pattern: /^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i,
      custom: (url: string) => {
        if (url && !url.startsWith('http')) {
          return 'URL должен начинаться с http:// или https://';
        }
        return null;
      }
    }
  },
  stat: {
    number: { required: true, maxLength: 20 },
    label: { required: true, minLength: 2, maxLength: 100 },
    icon: { required: true },
    order: { 
      required: true,
      custom: (value: number) => {
        if (typeof value !== 'number' || value < 0) {
          return 'Порядок должен быть положительным числом';
        }
        return null;
      }
    }
  },
  value: {
    title: { required: true, minLength: 3, maxLength: 100 },
    description: { required: true, minLength: 10, maxLength: 500 },
    icon: { required: true },
    order: { 
      required: true,
      custom: (value: number) => {
        if (typeof value !== 'number' || value < 0) {
          return 'Порядок должен быть положительным числом';
        }
        return null;
      }
    }
  },
  timeline: {
    year: { required: true, pattern: /^\d{4}$/ },
    title: { required: true, minLength: 3, maxLength: 100 },
    description: { required: true, minLength: 10, maxLength: 300 },
    order: { 
      required: true,
      custom: (value: number) => {
        if (typeof value !== 'number' || value < 0) {
          return 'Порядок должен быть положительным числом';
        }
        return null;
      }
    }
  },
  team: {
    name: { required: true, minLength: 2, maxLength: 100 },
    position: { required: true, minLength: 2, maxLength: 100 },
    description: { maxLength: 300 },
    image_url: { 
      pattern: /^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i,
      custom: (url: string) => {
        if (url && !url.startsWith('http')) {
          return 'URL должен начинаться с http:// или https://';
        }
        return null;
      }
    },
    order: { 
      required: true,
      custom: (value: number) => {
        if (typeof value !== 'number' || value < 0) {
          return 'Порядок должен быть положительным числом';
        }
        return null;
      }
    }
  }
};

// ---- Convenience wrappers so callers can import named validators ----
export const validateAboutSettings = (data: Record<string, any>) =>
  validateForm(data, aboutValidationRules.settings);

export const validateAboutStat = (data: Record<string, any>) =>
  validateForm(data, aboutValidationRules.stat);

export const validateAboutValue = (data: Record<string, any>) =>
  validateForm(data, aboutValidationRules.value);

export const validateAboutTimelineItem = (data: Record<string, any>) =>
  validateForm(data, aboutValidationRules.timeline);

export const validateAboutTeamMember = (data: Record<string, any>) =>
  validateForm(data, aboutValidationRules.team);
