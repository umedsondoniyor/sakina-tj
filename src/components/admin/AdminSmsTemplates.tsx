import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, MessageSquare, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import SmsTemplateModal from './SmsTemplateModal';

interface SmsTemplate {
  id: string;
  name: string;
  description: string;
  phone_number: string;
  text_template: string;
  sender_address: string;
  priority: number;
  sms_type: number;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

const AdminSmsTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | undefined>();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching SMS templates:', error);
      toast.error('Failed to load SMS templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SMS template?')) return;

    try {
      const { error } = await supabase
        .from('sms_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTemplates(templates.filter(template => template.id !== id));
      toast.success('SMS template deleted successfully');
    } catch (error) {
      console.error('Error deleting SMS template:', error);
      toast.error('Failed to delete SMS template');
    }
  };

  const toggleActive = async (template: SmsTemplate) => {
    try {
      const { error } = await supabase
        .from('sms_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;
      
      setTemplates(templates.map(t => 
        t.id === template.id ? { ...t, is_active: !t.is_active } : t
      ));
      toast.success(`SMS template ${template.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling SMS template status:', error);
      toast.error('Failed to update SMS template status');
    }
  };

  const moveTemplate = async (templateId: string, direction: 'up' | 'down') => {
    const templateIndex = templates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) return;

    const newIndex = direction === 'up' ? templateIndex - 1 : templateIndex + 1;
    if (newIndex < 0 || newIndex >= templates.length) return;

    try {
      const template1 = templates[templateIndex];
      const template2 = templates[newIndex];

      // Swap order_index values
      await Promise.all([
        supabase
          .from('sms_templates')
          .update({ order_index: template2.order_index })
          .eq('id', template1.id),
        supabase
          .from('sms_templates')
          .update({ order_index: template1.order_index })
          .eq('id', template2.id)
      ]);

      // Update local state
      const newTemplates = [...templates];
      [newTemplates[templateIndex], newTemplates[newIndex]] = [newTemplates[newIndex], newTemplates[templateIndex]];
      setTemplates(newTemplates);

      toast.success('Template order updated successfully');
    } catch (error) {
      console.error('Error updating template order:', error);
      toast.error('Failed to update template order');
    }
  };

  const handleEdit = (template: SmsTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedTemplate(undefined);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">SMS Templates Management</h1>
          <p className="text-gray-600 mt-1">Manage SMS notifications sent when payments are completed</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </button>
      </div>

      {/* Variables Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-2">Available Variables:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
          <div><code>{'{{orderTitle}}'}</code> - Product title</div>
          <div><code>{'{{payment.customer_phone}}'}</code> - Customer phone</div>
          <div><code>{'{{payment.customer_name}}'}</code> - Customer name</div>
          <div><code>{'{{payment.customer_email}}'}</code> - Customer email</div>
          <div><code>{'{{payment.delivery_phone}}'}</code> - Delivery phone</div>
          <div><code>{'{{payment.amount}}'}</code> - Payment amount</div>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No SMS templates found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new SMS template.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template, index) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{template.description}</h3>
                    <span className="text-sm text-gray-500">({template.name})</span>
                    <button
                      onClick={() => toggleActive(template)}
                      className={`px-2 py-1 rounded text-xs ${
                        template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {template.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-mono">{template.phone_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Sender:</span>
                      <span className="ml-2">{template.sender_address}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Priority:</span>
                      <span className="ml-2">{template.priority}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">SMS Type:</span>
                      <span className="ml-2">{template.sms_type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveTemplate(template.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveTemplate(template.id, 'down')}
                      disabled={index === templates.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Message Template:</h4>
                <p className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                  {template.text_template}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <SmsTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={selectedTemplate}
        onSuccess={fetchTemplates}
      />
    </div>
  );
};

export default AdminSmsTemplates;