import { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { QuizStep, QuizStepOption } from '../../lib/types';

interface QuizStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  step?: QuizStep;
  productType?: 'mattress' | 'bed';
  onSuccess: () => void;
}

const QuizStepModal: React.FC<QuizStepModalProps> = ({ isOpen, onClose, step, productType = 'mattress', onSuccess }) => {
  const [formData, setFormData] = useState({
    label: '',
    step_key: '',
    order_index: 0,
    is_active: true,
    product_type: productType,
    parent_step_key: '',
    parent_value: ''
  });
  const [options, setOptions] = useState<Partial<QuizStepOption>[]>([
    { option_value: '', option_label: '', image_url: '', order_index: 0, is_active: true }
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (step) {
      setFormData({
        label: step.label,
        step_key: step.step_key,
        order_index: step.order_index,
        is_active: step.is_active,
        product_type: step.product_type || productType,
        parent_step_key: step.parent_step_key || '',
        parent_value: step.parent_value || ''
      });
      setOptions(step.options.length > 0 ? step.options : [
        { option_value: '', option_label: '', image_url: '', order_index: 0, is_active: true }
      ]);
    } else {
      setFormData({
        label: '',
        step_key: '',
        order_index: 0,
        is_active: true,
        product_type: productType,
        parent_step_key: '',
        parent_value: ''
      });
      setOptions([
        { option_value: '', option_label: '', image_url: '', order_index: 0, is_active: true }
      ]);
    }
    setErrors({});
    setImageLoading({});
  }, [step, isOpen, productType]);

  const addOption = () => {
    setOptions([...options, {
      option_value: '',
      option_label: '',
      image_url: '',
      order_index: options.length,
      is_active: true
    }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: keyof QuizStepOption, value: string | number | boolean) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label?.trim()) {
      newErrors.label = 'Вопрос обязателен для заполнения';
    }

    if (!formData.step_key?.trim()) {
      newErrors.step_key = 'Ключ шага обязателен для заполнения';
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.step_key)) {
      newErrors.step_key = 'Ключ шага должен начинаться с буквы и содержать только буквы, цифры и подчеркивания';
    }

    // Validate options
    const validOptions = options.filter(opt => 
      opt.option_value?.trim() && opt.option_label?.trim() && opt.image_url?.trim()
    );

    if (validOptions.length === 0) {
      newErrors.options = 'Необходимо добавить хотя бы один вариант ответа';
    }

    // Validate each option
    options.forEach((option, index) => {
      if (!option.option_value?.trim() && (option.option_label?.trim() || option.image_url?.trim())) {
        newErrors[`option_value_${index}`] = 'Значение варианта обязательно';
      }
      if (!option.option_label?.trim() && (option.option_value?.trim() || option.image_url?.trim())) {
        newErrors[`option_label_${index}`] = 'Название варианта обязательно';
      }
      if (option.image_url?.trim() && !/^https?:\/\/.+/.test(option.image_url)) {
        newErrors[`option_image_${index}`] = 'Введите корректный URL изображения';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const validOptions = options.filter(opt => 
        opt.option_value?.trim() && opt.option_label?.trim() && opt.image_url?.trim()
      );

      const stepData = {
        ...formData,
        label: formData.label.trim(),
        step_key: formData.step_key.trim(),
        parent_step_key: formData.parent_step_key?.trim() || null,
        parent_value: formData.parent_value?.trim() || null,
        updated_at: new Date().toISOString()
      };

      let stepId = step?.id;

      if (step?.id) {
        // Update existing step
        const { error: stepError } = await supabase
          .from('quiz_steps')
          .update(stepData)
          .eq('id', step.id);

        if (stepError) throw stepError;

        // Delete existing options
        const { error: deleteError } = await supabase
          .from('quiz_step_options')
          .delete()
          .eq('step_id', step.id);

        if (deleteError) throw deleteError;
      } else {
        // Create new step
        const { data: newStep, error: stepError } = await supabase
          .from('quiz_steps')
          .insert([{
            ...stepData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (stepError) throw stepError;
        stepId = newStep.id;
      }

      // Insert options
      const optionsData = validOptions.map((option, index) => ({
        step_id: stepId,
        option_value: option.option_value!.trim(),
        option_label: option.option_label!.trim(),
        image_url: option.image_url!.trim(),
        order_index: index,
        is_active: option.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: optionsError } = await supabase
        .from('quiz_step_options')
        .insert(optionsData);

      if (optionsError) throw optionsError;

      toast.success(step?.id ? 'Шаг квиза успешно обновлен' : 'Шаг квиза успешно создан');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving quiz step:', error);
      const errorMessage = error instanceof Error ? error.message : 'Не удалось сохранить шаг квиза';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {step ? 'Редактировать шаг квиза' : 'Добавить новый шаг квиза'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Step Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о шаге</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    Заполните основную информацию о шаге квиза. Поля, отмеченные <span className="text-red-500">*</span>, обязательны для заполнения.
                  </p>
                </div>
                <div>
                  <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                    Вопрос <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="label"
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => {
                      setFormData({ ...formData, label: e.target.value });
                      if (errors.label) setErrors({ ...errors, label: '' });
                    }}
                    placeholder={productType === 'bed' ? 'Например: Для кого вы подбираете кровать?' : 'Например: Для кого вы подбираете матрас?'}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.label ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.label && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.label}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="product_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Тип продукта <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="product_type"
                    required
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value as 'mattress' | 'bed' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="mattress">Матрас</option>
                    <option value="bed">Кровать</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="step_key" className="block text-sm font-medium text-gray-700 mb-1">
                    Ключ шага <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="step_key"
                    type="text"
                    required
                    value={formData.step_key}
                    onChange={(e) => {
                      setFormData({ ...formData, step_key: e.target.value });
                      if (errors.step_key) setErrors({ ...errors, step_key: '' });
                    }}
                    placeholder="Например: userType"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.step_key ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.step_key && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.step_key}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Уникальный идентификатор (только латинские буквы, цифры и подчеркивания)</p>
                </div>

                <div>
                  <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-1">
                    Порядок отображения
                  </label>
                  <input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">Число для сортировки шагов (меньше = выше в списке)</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-teal-500 mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Активен
                  </label>
                </div>
              </div>
            </div>

            {/* Conditional Logic */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Условная логика (необязательно)</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Подсказка:</strong> Используйте условную логику, чтобы показывать этот шаг только при определенных ответах на предыдущие вопросы.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parent_step_key" className="block text-sm font-medium text-gray-700 mb-1">
                    Ключ родительского шага
                  </label>
                  <input
                    id="parent_step_key"
                    type="text"
                    value={formData.parent_step_key}
                    onChange={(e) => setFormData({ ...formData, parent_step_key: e.target.value })}
                    placeholder="Например: userType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Ключ шага, от которого зависит отображение этого шага</p>
                </div>

                <div>
                  <label htmlFor="parent_value" className="block text-sm font-medium text-gray-700 mb-1">
                    Требуемое значение родительского шага
                  </label>
                  <input
                    id="parent_value"
                    type="text"
                    value={formData.parent_value}
                    onChange={(e) => setFormData({ ...formData, parent_value: e.target.value })}
                    placeholder="Например: child"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Значение, которое должно быть выбрано в родительском шаге</p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Варианты ответов
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({options.filter(opt => opt.option_value?.trim() && opt.option_label?.trim() && opt.image_url?.trim()).length} заполнено из {options.length})
                    </span>
                  </h3>
                  {errors.options && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.options}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center px-4 py-2 text-sm bg-brand-turquoise text-white hover:bg-brand-navy transition-colors shadow-sm"
                  aria-label="Добавить вариант"
                >
                  <Plus size={16} className="mr-1" />
                  Добавить вариант
                </button>
              </div>

              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-4 hover:border-teal-400 transition-colors bg-gray-50 hover:bg-white">
                    <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                      <span className="text-sm font-semibold text-gray-700">Вариант {index + 1}</span>
                      {option.option_value?.trim() && option.option_label?.trim() && option.image_url?.trim() && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Заполнено</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Значение <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={option.option_value || ''}
                          onChange={(e) => {
                            updateOption(index, 'option_value', e.target.value);
                            if (errors[`option_value_${index}`]) {
                              const newErrors = { ...errors };
                              delete newErrors[`option_value_${index}`];
                              setErrors(newErrors);
                            }
                          }}
                          placeholder="Например: self"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            errors[`option_value_${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`option_value_${index}`] && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {errors[`option_value_${index}`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Название <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={option.option_label || ''}
                          onChange={(e) => {
                            updateOption(index, 'option_label', e.target.value);
                            if (errors[`option_label_${index}`]) {
                              const newErrors = { ...errors };
                              delete newErrors[`option_label_${index}`];
                              setErrors(newErrors);
                            }
                          }}
                          placeholder="Например: Для себя"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            errors[`option_label_${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`option_label_${index}`] && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {errors[`option_label_${index}`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL изображения <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          value={option.image_url || ''}
                          onChange={(e) => {
                            updateOption(index, 'image_url', e.target.value);
                            if (errors[`option_image_${index}`]) {
                              const newErrors = { ...errors };
                              delete newErrors[`option_image_${index}`];
                              setErrors(newErrors);
                            }
                            if (e.target.value.trim()) {
                              setImageLoading({ ...imageLoading, [index]: true });
                            }
                          }}
                          placeholder="https://..."
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            errors[`option_image_${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`option_image_${index}`] && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {errors[`option_image_${index}`]}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Введите полный URL изображения (начинается с http:// или https://)</p>
                      </div>

                      <div className="flex items-end space-x-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`option_active_${index}`}
                            checked={option.is_active ?? true}
                            onChange={(e) => updateOption(index, 'is_active', e.target.checked)}
                            className="rounded text-teal-600 focus:ring-teal-500 mr-2"
                          />
                          <label htmlFor={`option_active_${index}`} className="text-sm text-gray-700 cursor-pointer">
                            Активен
                          </label>
                        </div>
                        {options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            aria-label="Удалить вариант"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Image Preview */}
                    {option.image_url && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">Предпросмотр изображения:</p>
                        <div className="relative inline-block">
                          {imageLoading[index] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 w-32 h-32">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                            </div>
                          )}
                          <img
                            src={option.image_url}
                            alt={option.option_label || 'Предпросмотр'}
                            className={`w-32 h-32 object-cover rounded-lg border-2 border-gray-300 shadow-sm ${imageLoading[index] ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                            onLoad={() => {
                              setImageLoading({ ...imageLoading, [index]: false });
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect width="128" height="128" fill="%23f3f4f6" rx="8"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EОшибка загрузки%3C/text%3E%3C/svg%3E';
                              setImageLoading({ ...imageLoading, [index]: false });
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t pt-4 mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand-turquoise text-white hover:bg-brand-navy disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Сохранение...' : step ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizStepModal;