import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getQuizSteps } from '../lib/api';
import type { QuizStep } from '../lib/types';

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
}


const QuizModal: React.FC<QuizModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [steps, setSteps] = useState<QuizStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      loadQuizSteps();
    }
  }, [open]);

  const loadQuizSteps = async () => {
    try {
      setLoading(true);
      const data = await getQuizSteps();
      setSteps(data);
    } catch (err) {
      setError('Failed to load quiz steps');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  if (loading) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg w-full max-w-md p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Загрузка опросника...</p>
        </div>
      </div>
    );
  }

  if (error || steps.length === 0) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg w-full max-w-md p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-red-600 mb-4">{error || 'Опросник не настроен'}</p>
          <button
            onClick={onClose}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  // Get the appropriate step based on user type and current progress
  const getCurrentStep = () => {
    // Filter steps based on current selections and conditional logic
    const availableSteps = steps.filter(step => {
      // If step has no parent, it's always available
      if (!step.parent_step_key || !step.parent_value) {
        return true;
      }
      
      // Check if parent condition is met
      return selections[step.parent_step_key] === step.parent_value;
    });

    return availableSteps[activeStep] || null;
  };

  const handleSelect = (option: string) => {
    const currentStep = getCurrentStep();
    if (!currentStep) return;

    const newSelections = {
      ...selections,
      [currentStep.step_key]: option,
    };
    setSelections(newSelections);

    // Check if this is the last step for current flow
    const nextAvailableSteps = steps.filter(step => {
      if (!step.parent_step_key || !step.parent_value) {
        return true;
      }
      return newSelections[step.parent_step_key] === step.parent_value;
    });

    // If we've reached the end of available steps, submit
    if (activeStep >= nextAvailableSteps.length - 1) {
      handleSubmit(newSelections);
      return;
    }

    handleNext();
  };

  const handleNext = () => {
    // Get available steps for current selections
    const availableSteps = steps.filter(step => {
      if (!step.parent_step_key || !step.parent_value) {
        return true;
      }
      return selections[step.parent_step_key] === step.parent_value;
    });

    const nextStepIndex = activeStep + 1;
    
    // If we've reached the end of available steps, submit
    if (nextStepIndex >= availableSteps.length) {
      handleSubmit();
      return;
    }

    setActiveStep(nextStepIndex);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (finalSelections = selections) => {
    const filters = {
      hardness: finalSelections.hardness ? [finalSelections.hardness] : [],
      width: finalSelections.self_size ? [parseInt(finalSelections.self_size.split('_')[0])] : [],
      length: finalSelections.self_size ? [parseInt(finalSelections.self_size.split('_')[1])] : [],
      price: [],
      inStock: true
    };

    navigate('/products', { 
      state: { 
        filters,
        selections: finalSelections
      } 
    });
    onClose();
  };

  const currentStep = getCurrentStep();
  
  // Calculate total steps based on current selections
  const availableSteps = steps.filter(step => {
    if (!step.parent_step_key || !step.parent_value) {
      return true;
    }
    return selections[step.parent_step_key] === step.parent_value;
  });
  
  const totalSteps = availableSteps.length;
  const progress = ((activeStep + 1) / totalSteps) * 100;

  // Return early if no current step is found
  if (!currentStep) {
    handleSubmit();
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="h-2 bg-gray-200 rounded-full mb-6">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="text-xl font-semibold text-center mb-6">
            {currentStep.label}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {currentStep.options.map((option) => (
              <button
                key={option.option_value}
                onClick={() => handleSelect(option.option_value)}
                className={`relative rounded-lg overflow-hidden transition-all ${
                  selections[currentStep.step_key] === option.option_value
                    ? 'ring-2 ring-teal-500'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={option.image_url}
                    alt={option.option_label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-center font-medium">
                    {option.option_label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;