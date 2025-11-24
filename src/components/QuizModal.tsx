import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Load steps when opening
  useEffect(() => {
    let mounted = true;
    const loadQuizSteps = async () => {
      try {
        setLoading(true);
        const data = await getQuizSteps();
        if (!mounted) return;
        setSteps(data);
        setError(null);
        setActiveStep(0); // reset flow on each open
        setSelections({});
      } catch (err) {
        if (!mounted) return;
        setError('Failed to load quiz steps');
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (open) loadQuizSteps();
    return () => {
      mounted = false;
    };
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus handling + focus trap + ESC
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstFocusableRef.current?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const nodes = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Compute available steps for current selections
  const availableSteps = useMemo(() => {
    return steps.filter(step => {
      if (!step.parent_step_key || !step.parent_value) return true;
      return selections[step.parent_step_key] === step.parent_value;
    });
  }, [steps, selections]);

  // Current step (based on activeStep within available steps)
  const currentStep = useMemo(() => {
    return availableSteps[activeStep] ?? null;
  }, [availableSteps, activeStep]);

  // Map quiz values to filter values
  const mapHardnessToFilter = (hardness: string): string => {
    const hardnessMap: Record<string, string> = {
      'soft': 'Мягкий',
      'middle': 'Средняя',
      'hard': 'Жесткий'
    };
    return hardnessMap[hardness] || hardness;
  };

  // Submit logic - map quiz selections to product filters
  const handleSubmit = useCallback((finalSelections = selections) => {
    const width = finalSelections.self_size ? parseInt(finalSelections.self_size.split('_')[0]) : undefined;
    const length = finalSelections.self_size ? parseInt(finalSelections.self_size.split('_')[1]) : undefined;

    const filters = {
      hardness: finalSelections.hardness ? [mapHardnessToFilter(finalSelections.hardness)] : [],
      width: width ? [width, -1] : [],
      length: length ? [length, -1] : [],
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
  }, [navigate, onClose, selections]);

  // If no current step but we have steps loaded, submit automatically (same behavior, but not during render)
  useEffect(() => {
    if (!open || loading) return;
    if (steps.length > 0 && availableSteps.length > 0 && currentStep == null) {
      handleSubmit();
    }
  }, [open, loading, steps.length, availableSteps.length, currentStep, handleSubmit]);

  const handleSelect = (option: string) => {
    if (!currentStep) return;
    const newSelections = { ...selections, [currentStep.step_key]: option };
    setSelections(newSelections);

    const nextAvailable = steps.filter(step => {
      if (!step.parent_step_key || !step.parent_value) return true;
      return newSelections[step.parent_step_key] === step.parent_value;
    });

    // If last, submit; else next
    if (activeStep >= nextAvailable.length - 1) {
      handleSubmit(newSelections);
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep(prev => prev - 1);
  };

  const progress = useMemo(() => {
    const total = Math.max(availableSteps.length, 1);
    return ((Math.min(activeStep, total - 1) + 1) / total) * 100;
  }, [availableSteps.length, activeStep]);

  if (!open) return null;

  // Loading state
  if (loading) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog" aria-modal="true" aria-label="Загрузка опросника"
      >
        <div
          className="w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl p-8 text-center"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
          <p>Загрузка опросника...</p>
        </div>
      </div>,
      document.body
    );
  }

  // Error / No steps
  if (error || steps.length === 0) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog" aria-modal="true" aria-label="Ошибка опросника"
      >
        <div
          className="w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl p-8 text-center"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <p className="text-red-600 mb-4">{error || 'Опросник не настроен'}</p>
          <button
            type="button"
            onClick={onClose}
            ref={firstFocusableRef}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg"
          >
            Закрыть
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // Main dialog
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby="quiz-title"
    >
      <div
        ref={dialogRef}
        className="
          w-full md:max-w-3xl max-h-[90vh]
          bg-white rounded-t-2xl md:rounded-2xl
          overflow-y-auto
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 pt-4 pb-2 md:px-6 md:pt-5 md:pb-3 border-b">
          <h2 id="quiz-title" className="text-lg md:text-xl font-semibold text-center">
            {currentStep?.label}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 p-2 -m-2 text-gray-500 hover:text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Закрыть"
            ref={firstFocusableRef}
          >
            <X size={22} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 md:px-6 pt-3">
          <div className="h-2 bg-gray-200 rounded-full mb-4 md:mb-6">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Options */}
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
            {currentStep?.options.map((option) => {
              const selected = selections[currentStep.step_key] === option.option_value;
              return (
                <button
                  key={option.option_value}
                  onClick={() => handleSelect(option.option_value)}
                  className={`relative rounded-lg overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    selected ? 'ring-2 ring-teal-500' : 'hover:shadow-lg'
                  }`}
                >
                  <div className="aspect-square">
                    <img
                      src={option.image_url}
                      alt={option.option_label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-center font-medium">
                      {option.option_label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Nav */}
          <div className="flex justify-between">
            <button
              type="button"
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
            {/* (Forward button is implicit: selecting an option moves forward) */}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuizModal;
