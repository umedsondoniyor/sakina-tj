import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

interface SmsTemplate {
  id?: string;
  name: string;
  description: string;
  phone_number: string;
  text_template: string;
  sender_address: string;
  priority: number;
  sms_type: number;
  is_active: boolean;
  order_index: number;
}

interface SmsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: SmsTemplate;
  onSuccess: () => void;
}

const SmsTemplateModal: React.FC<SmsTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  onSuccess
}) => {
  const [formData, setFormData] = useState<SmsTemplate>({
    name: '',
    description: '',
    phone_number: '',
    text_template: '',
    sender_address: 'SAKINA',
    priority: 1,
    sms_type: 2,
    is_active: true,
    order_index: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        id: template.id,
        name: template.name,
        description: template.description,
        phone_number: template.phone_number,
        text_template: template.text_template,
        sender_address: template.sender_address,
        priority: template.priority,
        sms_type: template.sms_type,
        is_active: template.is_active,
        order_index: template.order_index
      });
    } else {
      setFormData({
        name: '',
        description: '',
        phone_number: '',
        text_template: '',
        sender_address: 'SAKINA',
        priority: 1,
        sms_type: 2,
        is_active: true,
        order_index: 0
      });
    }
  }, [template, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.description || !formData.phone_number || !formData.text_template) {
        throw new Error('Please fill in all required fields');
      }

      const dataToSend = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      let error;

      if (template?.id) {
        // Update existing template
        const { error: updateError } = await supabase
          .from('sms_templates')
          .update(dataToSend)
          .eq('id', template.id);
        error = updateError;
      } else {
        // Create new template
        const { error: insertError } = await supabase
          .from('sms_templates')
          .insert([{
            ...dataToSend,
            created_at: new Date().toISOString()
          }]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(template?.id ? 'SMS template updated successfully' : 'SMS template created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving SMS template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save SMS template';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {template ? 'Edit SMS Template' : 'Add New SMS Template'}
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
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name * (Internal ID)
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., customer_payment_success"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Customer payment success notification"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="e.g., {{payment.customer_phone}} or +992936337785"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use variables like {'{{payment.customer_phone}}'} or static phone numbers
              </p>
            </div>

            {/* Message Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Template *
              </label>
              <textarea
                required
                value={formData.text_template}
                onChange={(e) => setFormData({ ...formData, text_template: e.target.value })}
                rows={4}
                placeholder="e.g., ✅ Оплата прошла успешно! Ваш заказ: «{{orderTitle}}». Спасибо!"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use variables like {'{{orderTitle}}'}, {'{{payment.customer_name}}'}, etc.
              </p>
            </div>

            {/* SMS Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Address
                </label>
                <input
                  type="text"
                  value={formData.sender_address}
                  onChange={(e) => setFormData({ ...formData, sender_address: e.target.value })}
                  placeholder="SAKINA"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value={1}>1 (High)</option>
                  <option value={2}>2 (Medium)</option>
                  <option value={3}>3 (Low)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMS Type
                </label>
                <select
                  value={formData.sms_type}
                  onChange={(e) => setFormData({ ...formData, sms_type: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value={1}>1 (Flash)</option>
                  <option value={2}>2 (Normal)</option>
                  <option value={3}>3 (Binary)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                />
              </div>
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
                Active (will be sent when payments are completed)
              </label>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview (with sample data):</h4>
              <div className="bg-white p-3 rounded border text-sm">
                <div className="text-gray-600 mb-1">To: {formData.phone_number}</div>
                <div className="text-gray-600 mb-1">From: {formData.sender_address}</div>
                <div className="border-t pt-2 mt-2">
                  {formData.text_template
                    .replace(/\{\{orderTitle\}\}/g, 'Подушка Шерсть')
                    .replace(/\{\{payment\.customer_name\}\}/g, 'Умед')
                    .replace(/\{\{payment\.customer_phone\}\}/g, '+992 93 633 77 85')
                    .replace(/\{\{payment\.customer_email\}\}/g, 'umedz@gmail.com')
                    .replace(/\{\{payment\.delivery_phone\}\}/g, '+992936337785')
                    .replace(/\{\{payment\.amount\}\}/g, '446')
                  }
                </div>
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
              {loading ? 'Saving...' : template ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmsTemplateModal;