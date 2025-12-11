import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import QuizStepModal from './QuizStepModal';
import type { QuizStep } from '../../lib/types';

const AdminQuiz = () => {
  const [steps, setSteps] = useState<QuizStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<QuizStep | undefined>();
  const [productType, setProductType] = useState<'mattress' | 'bed'>('mattress');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchSteps();
  }, [productType]);

  const fetchSteps = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_steps')
        .select(`
          *,
          options:quiz_step_options(*)
        `)
        .eq('product_type', productType)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      // Transform data to include sorted options
      const transformedData = (data || []).map(step => ({
        ...step,
        options: (step.options || []).sort((a: any, b: any) => a.order_index - b.order_index)
      }));
      
      setSteps(transformedData);
    } catch (error) {
      console.error('Error fetching quiz steps:', error);
      toast.error('Не удалось загрузить шаги квиза');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;

    try {
      const { error } = await supabase
        .from('quiz_steps')
        .delete()
        .eq('id', deleteConfirmId);

      if (error) throw error;
      
      setSteps(steps.filter(step => step.id !== deleteConfirmId));
      toast.success('Шаг квиза успешно удален');
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting quiz step:', error);
      toast.error('Не удалось удалить шаг квиза');
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const toggleActive = async (step: QuizStep) => {
    try {
      const { error } = await supabase
        .from('quiz_steps')
        .update({ is_active: !step.is_active })
        .eq('id', step.id);

      if (error) throw error;
      
      setSteps(steps.map(s => 
        s.id === step.id ? { ...s, is_active: !s.is_active } : s
      ));
      toast.success(`Шаг квиза успешно ${step.is_active ? 'деактивирован' : 'активирован'}`);
    } catch (error) {
      console.error('Error toggling quiz step status:', error);
      toast.error('Не удалось обновить статус шага квиза');
    }
  };

  const moveStep = async (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    try {
      const step1 = steps[stepIndex];
      const step2 = steps[newIndex];

      // Swap order_index values
      await Promise.all([
        supabase
          .from('quiz_steps')
          .update({ order_index: step2.order_index })
          .eq('id', step1.id),
        supabase
          .from('quiz_steps')
          .update({ order_index: step1.order_index })
          .eq('id', step2.id)
      ]);

      // Update local state
      const newSteps = [...steps];
      [newSteps[stepIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[stepIndex]];
      setSteps(newSteps);

      toast.success('Порядок шагов успешно обновлен');
    } catch (error) {
      console.error('Error updating step order:', error);
      toast.error('Не удалось обновить порядок шагов');
    }
  };

  const handleEdit = (step: QuizStep) => {
    setSelectedStep(step);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedStep(undefined);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <span className="text-gray-600">Загрузка шагов квиза...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление шагами квиза</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          aria-label="Добавить шаг квиза"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить шаг
        </button>
      </div>

      {/* Product Type Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setProductType('mattress')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              productType === 'mattress'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Матрасы
          </button>
          <button
            onClick={() => setProductType('bed')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              productType === 'bed'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Кровати
          </button>
        </nav>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-12">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Шаги квиза не найдены
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Начните с создания нового шага квиза для {productType === 'mattress' ? 'матрасов' : 'кроватей'}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{step.label}</h3>
                    <span className="text-sm text-gray-500">({step.step_key})</span>
                    <button
                      onClick={() => toggleActive(step)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        step.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      title={step.is_active ? 'Деактивировать шаг' : 'Активировать шаг'}
                    >
                      {step.is_active ? 'Активен' : 'Неактивен'}
                    </button>
                    {!step.is_active && (
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        (Не отображается на сайте)
                      </span>
                    )}
                  </div>
                  
                  {step.parent_step_key && (
                    <p className="text-sm text-gray-600 mb-2 bg-blue-50 border border-blue-200 rounded px-3 py-1 inline-block">
                      Показывается когда: <span className="font-medium">{step.parent_step_key}</span> = <span className="font-medium">{step.parent_value}</span>
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    {step.options.length} {step.options.length === 1 ? 'опция' : step.options.length < 5 ? 'опции' : 'опций'} • Порядок: {step.order_index}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveStep(step.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Переместить вверх"
                      title="Переместить вверх"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveStep(step.id, 'down')}
                      disabled={index === steps.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Переместить вниз"
                      title="Переместить вниз"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleEdit(step)}
                    className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors"
                    aria-label="Редактировать шаг"
                    title="Редактировать"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(step.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    aria-label="Удалить шаг"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Options Preview */}
              {step.options.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {step.options.slice(0, 4).map((option) => (
                    <div key={option.id} className="relative group">
                      <img
                        src={option.image_url}
                        alt={option.option_label}
                        className="w-full h-20 object-cover rounded border border-gray-200 group-hover:border-teal-300 transition-colors"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/150x80/e5e7eb/9ca3af?text=Нет+изображения';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent rounded flex items-end">
                        <p className="text-white text-xs p-2 truncate font-medium drop-shadow">
                          {option.option_label}
                        </p>
                      </div>
                    </div>
                  ))}
                  {step.options.length > 4 && (
                    <div className="flex items-center justify-center bg-gray-100 rounded h-20 border border-gray-200">
                      <span className="text-sm text-gray-600 font-medium">
                        +{step.options.length - 4} {step.options.length - 4 === 1 ? 'еще' : 'еще'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-500">Опции не добавлены</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Подтвердите удаление
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Вы уверены, что хотите удалить этот шаг квиза? Это действие нельзя отменить. Все опции этого шага также будут удалены.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <QuizStepModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStep(undefined);
        }}
        step={selectedStep}
        productType={productType}
        onSuccess={fetchSteps}
      />
    </div>
  );
};

export default AdminQuiz;