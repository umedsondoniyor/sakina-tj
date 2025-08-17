import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import QuizStepModal from './QuizStepModal';
import type { QuizStep } from '../../lib/types';

const AdminQuiz = () => {
  const [steps, setSteps] = useState<QuizStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<QuizStep | undefined>();

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_steps')
        .select(`
          *,
          options:quiz_step_options(*)
        `)
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
      toast.error('Failed to load quiz steps');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz step?')) return;

    try {
      const { error } = await supabase
        .from('quiz_steps')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSteps(steps.filter(step => step.id !== id));
      toast.success('Quiz step deleted successfully');
    } catch (error) {
      console.error('Error deleting quiz step:', error);
      toast.error('Failed to delete quiz step');
    }
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
      toast.success(`Quiz step ${step.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling quiz step status:', error);
      toast.error('Failed to update quiz step status');
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

      toast.success('Step order updated successfully');
    } catch (error) {
      console.error('Error updating step order:', error);
      toast.error('Failed to update step order');
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quiz Steps Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Step
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-12">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No quiz steps found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new quiz step.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-white rounded-lg shadow border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{step.label}</h3>
                    <span className="text-sm text-gray-500">({step.step_key})</span>
                    <button
                      onClick={() => toggleActive(step)}
                      className={`px-2 py-1 rounded text-xs ${
                        step.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {step.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  
                  {step.parent_step_key && (
                    <p className="text-sm text-gray-600 mb-2">
                      Показывается когда: {step.parent_step_key} = {step.parent_value}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    {step.options.length} опций • Порядок: {step.order_index}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveStep(step.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveStep(step.id, 'down')}
                      disabled={index === steps.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleEdit(step)}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(step.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Options Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {step.options.slice(0, 4).map((option) => (
                  <div key={option.id} className="relative">
                    <img
                      src={option.image_url}
                      alt={option.option_label}
                     className="w-full h-20 object-cover rounded"
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.src = 'https://via.placeholder.com/150x80/e5e7eb/9ca3af?text=No+Image';
                     }}
                    />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded flex items-end">
                      <p className="text-green-800 text-xs p-2 truncate font-medium">
                        {option.option_label}
                      </p>
                    </div>
                  </div>
                ))}
                {step.options.length > 4 && (
                  <div className="flex items-center justify-center bg-gray-100 rounded h-20">
                    <span className="text-sm text-gray-600">
                      +{step.options.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <QuizStepModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        step={selectedStep}
        onSuccess={fetchSteps}
      />
    </div>
  );
};

export default AdminQuiz;