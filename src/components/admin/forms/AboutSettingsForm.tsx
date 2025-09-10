import React, { useState } from 'react';
import { validateForm, aboutValidationRules } from '../../../lib/validation';
import ImageUploadField from '../ImageUploadField';
import type { AboutSettings } from '../../../lib/aboutApi';

interface AboutSettingsFormProps {
  initial: AboutSettings;
  onSave: (payload: Partial<AboutSettings>) => Promise<void>;
  onCancel: () => void;
}

const AboutSettingsForm: React.FC<AboutSettingsFormProps> = ({
  initial,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    hero_title: initial.hero_title ?? '',
    hero_subtitle: initial.hero_subtitle ?? '',
    hero_image_url: initial.hero_image_url ?? ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm(formData, aboutValidationRules.settings);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await onSave({ 
        id: initial.id, 
        ...formData 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Заголовок <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.hero_title}
          onChange={(e) => handleInputChange('hero_title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            errors.hero_title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="О компании Sakina"
        />
        {errors.hero_title && (
          <p className="mt-1 text-sm text-red-600">{errors.hero_title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Подзаголовок
        </label>
        <textarea
          value={formData.hero_subtitle}
          onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            errors.hero_subtitle ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Краткое описание компании..."
        />
        {errors.hero_subtitle && (
          <p className="mt-1 text-sm text-red-600">{errors.hero_subtitle}</p>
        )}
      </div>

      <ImageUploadField
        label="Hero изображение"
        value={formData.hero_image_url}
        onChange={(url) => handleInputChange('hero_image_url', url)}
        placeholder="https://example.com/hero-image.jpg"
      />
      {errors.hero_image_url && (
        <p className="mt-1 text-sm text-red-600">{errors.hero_image_url}</p>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 transition-colors"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
};

export default AboutSettingsForm;