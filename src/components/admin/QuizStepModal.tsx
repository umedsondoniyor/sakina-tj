import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
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
  }, [step, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.label || !formData.step_key) {
        throw new Error('Label and step key are required');
      }

      // Validate options
      const validOptions = options.filter(opt => 
        opt.option_value && opt.option_label && opt.image_url
      );

      if (validOptions.length === 0) {
        throw new Error('At least one valid option is required');
      }

      const stepData = {
        ...formData,
        parent_step_key: formData.parent_step_key || null,
        parent_value: formData.parent_value || null,
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
        option_value: option.option_value!,
        option_label: option.option_label!,
        image_url: option.image_url!,
        order_index: index,
        is_active: option.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: optionsError } = await supabase
        .from('quiz_step_options')
        .insert(optionsData);

      if (optionsError) throw optionsError;

      toast.success(step?.id ? 'Quiz step updated successfully' : 'Quiz step created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving quiz step:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save quiz step';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {step ? 'Edit Quiz Step' : 'Add New Quiz Step'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Step Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Label *
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder={productType === 'bed' ? 'e.g., Для кого вы подбираете кровать?' : 'e.g., Для кого вы подбираете матрас?'}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type *
                </label>
                <select
                  required
                  value={formData.product_type}
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value as 'mattress' | 'bed' })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="mattress">Матрас</option>
                  <option value="bed">Кровать</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Step Key *
                </label>
                <input
                  type="text"
                  required
                  value={formData.step_key}
                  onChange={(e) => setFormData({ ...formData, step_key: e.target.value })}
                  placeholder="e.g., userType"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Index
                </label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
            </div>

            {/* Conditional Logic */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Conditional Logic (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Step Key
                  </label>
                  <input
                    type="text"
                    value={formData.parent_step_key}
                    onChange={(e) => setFormData({ ...formData, parent_step_key: e.target.value })}
                    placeholder="e.g., userType"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Parent Value
                  </label>
                  <input
                    type="text"
                    value={formData.parent_value}
                    onChange={(e) => setFormData({ ...formData, parent_value: e.target.value })}
                    placeholder="e.g., child"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                If specified, this step will only show when the parent step has the required value.
              </p>
            </div>

            {/* Options */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Options</h3>
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center px-3 py-1 text-sm bg-teal-500 text-white rounded hover:bg-teal-600"
                >
                  <Plus size={16} className="mr-1" />
                  Add Option
                </button>
              </div>

              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Value *
                        </label>
                        <input
                          type="text"
                          value={option.option_value || ''}
                          onChange={(e) => updateOption(index, 'option_value', e.target.value)}
                          placeholder="e.g., self"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label *
                        </label>
                        <input
                          type="text"
                          value={option.option_label || ''}
                          onChange={(e) => updateOption(index, 'option_label', e.target.value)}
                          placeholder="e.g., Для себя"
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Image URL *
                        </label>
                        <input
                          type="url"
                          value={option.image_url || ''}
                          onChange={(e) => updateOption(index, 'image_url', e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div className="flex items-end space-x-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={option.is_active ?? true}
                            onChange={(e) => updateOption(index, 'is_active', e.target.checked)}
                            className="rounded text-teal-600 focus:ring-teal-500 mr-2"
                          />
                          <label className="text-sm">Active</label>
                        </div>
                        {options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Image Preview */}
                    {option.image_url && (
                      <div className="mt-3">
                        <img
                          src={option.image_url}
                          alt={option.option_label || 'Preview'}
                          className="w-24 h-24 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : step ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizStepModal;