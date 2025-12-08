import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, MessageSquare, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';
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
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

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
      toast.error('Не удалось загрузить SMS шаблоны');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот SMS шаблон?')) return;

    try {
      const { error } = await supabase
        .from('sms_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTemplates(templates.filter(template => template.id !== id));
      toast.success('SMS шаблон успешно удален');
    } catch (error) {
      console.error('Error deleting SMS template:', error);
      toast.error('Не удалось удалить SMS шаблон');
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
      toast.success(`SMS шаблон ${template.is_active ? 'деактивирован' : 'активирован'} успешно`);
    } catch (error) {
      console.error('Error toggling SMS template status:', error);
      toast.error('Не удалось обновить статус SMS шаблона');
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

      toast.success('Порядок шаблонов обновлен');
    } catch (error) {
      console.error('Error updating template order:', error);
      toast.error('Не удалось обновить порядок шаблонов');
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVariable(text);
    toast.success('Переменная скопирована');
    setTimeout(() => setCopiedVariable(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const variables = [
    { var: '{{orderTitle}}', desc: 'Название заказа' },
    { var: '{{payment.customer_name}}', desc: 'Имя клиента' },
    { var: '{{payment.customer_phone}}', desc: 'Телефон клиента' },
    { var: '{{payment.customer_email}}', desc: 'Email клиента' },
    { var: '{{payment.amount}}', desc: 'Сумма оплаты' },
    { var: '{{payment.currency}}', desc: 'Валюта (TJS)' },
    { var: '{{payment.status}}', desc: 'Статус платежа' },
    { var: '{{payment.alif_transaction_id}}', desc: 'ID транзакции' },
    { var: '{{payment.payment_gateway}}', desc: 'Способ оплаты' },
    { var: '{{payment.delivery_type}}', desc: 'Тип доставки' },
    { var: '{{payment.delivery_address}}', desc: 'Адрес доставки' },
    { var: '{{items_list}}', desc: 'Список товаров с количеством и ценой' },
    { var: '{{items_count}}', desc: 'Количество позиций' },
    { var: '{{items_total_quantity}}', desc: 'Общее количество товаров' },
    { var: '{{manager_phone}}', desc: 'Телефон менеджера' },
    { var: '{{delivery_phone}}', desc: 'Телефон службы доставки' },
  ];

  const phoneVariables = [
    { var: '{{payment.customer_phone}}', desc: 'Телефон клиента' },
    { var: '{{payment.delivery_phone}}', desc: 'Телефон службы доставки' },
    { var: '{{manager_phone}}', desc: 'Телефон менеджера' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Управление SMS шаблонами</h1>
          <p className="text-gray-600 mt-1">Управление SMS уведомлениями, отправляемыми при изменении статуса платежей</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить шаблон
        </button>
      </div>

      {/* Variables Help */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg p-5 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Доступные переменные для текста сообщения:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {variables.map((v) => (
            <div
              key={v.var}
              className="flex items-center justify-between bg-white rounded px-3 py-2 border border-blue-100 hover:border-blue-300 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <code className="text-blue-700 font-mono text-xs break-all">{v.var}</code>
                <div className="text-gray-600 text-xs mt-0.5">{v.desc}</div>
              </div>
              <button
                onClick={() => copyToClipboard(v.var)}
                className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Копировать"
              >
                {copiedVariable === v.var ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 text-sm">Переменные для поля "Номер телефона":</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            {phoneVariables.map((v) => (
              <div
                key={v.var}
                className="flex items-center justify-between bg-white rounded px-3 py-2 border border-teal-100 hover:border-teal-300 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <code className="text-teal-700 font-mono text-xs">{v.var}</code>
                  <div className="text-gray-600 text-xs mt-0.5">{v.desc}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(v.var)}
                  className="ml-2 p-1 text-gray-400 hover:text-teal-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Копировать"
                >
                  {copiedVariable === v.var ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">SMS шаблоны не найдены</h3>
          <p className="mt-1 text-sm text-gray-500">Начните с создания нового SMS шаблона.</p>
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
                      {template.is_active ? 'Активен' : 'Неактивен'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Телефон:</span>
                      <span className="ml-2 font-mono text-gray-800">{template.phone_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Отправитель:</span>
                      <span className="ml-2 text-gray-800">{template.sender_address}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Приоритет:</span>
                      <span className="ml-2 text-gray-800">{template.priority}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Тип SMS:</span>
                      <span className="ml-2 text-gray-800">{template.sms_type}</span>
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
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Шаблон сообщения:</h4>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap font-mono break-words">
                    {template.text_template || <span className="text-gray-400 italic">Шаблон пуст</span>}
                  </p>
                </div>
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