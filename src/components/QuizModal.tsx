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
  const submittedRef = useRef(false); // prevent duplicate submit

  // Load steps when modal opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        submittedRef.current = false;
        const data = await getQuizSteps();
        setSteps(Array.isArray(data) ? data : []);
        setActiveStep(0);
        setSelections({});
      } catch (err) {
        console.error(err);
        setError('Failed to load quiz steps');
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  // Scroll lock while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC to close + lightweight focus trap
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus(); e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus(); e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Focus first interactive element once open & loaded
  useEffect(() => {
    if (open && !loading) {
      setTimeout(() => firstFocusableRef.current?.focus(), 0);
    }
  }, [open, loading]);

  const filterBySelections = useCallback(
    (ss: Record<string, string>) =>
      steps.filter((step) => {
        if (!step.parent_step_key || !step.parent_value) return true;
        return ss[step.parent_step_key] === step.parent_value;
      }),
    [steps]
  );

  const availableSteps = useMemo(() => filterBySelections(selections), [filterBySelections, selections]);

  const currentStep = useMemo(() => availableSteps[activeStep] ?? null, [availableSteps, activeStep]);

  const totalSteps = availableSteps.length || 1;
  const progress = Math.min(100, Math.max(0, ((activeStep + 1) / totalSteps) * 100));

  // When no current step (end of flow), submit once (avoid side-effects in render)
  useEffect(() => {
    if (!open || loading) return;
    if (!currentStep && !submittedRef.current && steps.length > 0) {
      submittedRef.current = true;
      handleSubmit(selections);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, open, loading, steps.length]);

  const handleSelect = (option: string) => {
    if (!currentStep) return;

    const newSelections = { ...selections, [currentStep.step_key]: option };
    setSelections(newSelections);

    const nextAvailable = filterBySelections(newSelections);
    const nextIndex = activeStep + 1;

    if (nextIndex >= nextAvailable.length) {
      // last step for this flow
      handleSubmit(newSelections);
      return;
    }
    setActiveStep(nextIndex);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((p) => p - 1);
  };

  const handleSubmit = (finalSelections = selections) => {
    // Keep your existing filter mapping (unchanged)
    const filters = {
      hardness: finalSelections.hardness ? [finalSelections.hardness] : [],
      width: finalSelections.self_size ? [parseInt(finalSelections.self_size.split('_')[0])] : [],
      length: finalSelections.self_size ? [parseInt(finalSelections.self_size.split('_')[1])] : [],
      price: [],
      inStock: true,
    };

    navigate('/products', {
      state: {
        filters,
        selections: finalSelections,
      },
    });
    onClose();
  };

  // Early exits (preserve your behavior)
  if (!open) return null;

  if (loading) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Загрузка опросника"
      >
        <div
          className="w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-lg p-8 text-center"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
          <p>Загрузка опросника...</p>
        </div>
      </div>,
      document.body
    );
  }

  if (error || steps.length === 0) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Ошибка загрузки опросника"
      >
        <div
          className="w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-lg p-8 text-center"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <p className="mb-4 text-red-600">{error || 'Опросник не настроен'}</p>
          <button
            onClick={onClose}
            className="rounded-lg bg-teal-500 px-4 py-2 text-white hover:bg-teal-600"
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
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-title"
    >
      <div
        ref={dialogRef}
        className="
          w-full md:max-w-3xl max-h-[90vh] overflow-y-auto
          bg-white rounded-t-2xl md:rounded-2xl shadow-lg
          pt-[max(0.75rem,env(safe-area-inset-top))]
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 pt-4 pb-2 md:px-6 md:pt-5 md:pb-3 border-b">
          <h2 id="quiz-title" className="text-lg md:text-xl font-semibold text-center">
            {currentStep?.label || 'Опросник'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 -m-2 p-2 rounded-lg text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 md:px-6 pt-4">
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Options */}
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentStep?.options.map((option, idx) => (
              <button
                key={option.option_value}
                ref={idx === 0 ? firstFocusableRef : undefined}
                onClick={() => handleSelect(option.option_value)}
                className={`
                  relative overflow-hidden rounded-lg transition-all
                  focus:outline-none focus:ring-2 focus:ring-teal-500
                  ${selections[currentStep.step_key] === option.option_value
                    ? 'ring-2 ring-teal-500'
                    : 'hover:shadow-lg'}
                `}
              >
                <div className="aspect-square">
                  <img
                    src={option.image_url}
                    alt={option.option_label}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-center font-medium text-white">{option.option_label}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Nav row */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className={`
                rounded-lg px-5 py-2 transition-colors
                ${activeStep === 0
                  ? 'cursor-not-allowed text-gray-400'
                  : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              Назад
            </button>
            {/* (Optional) Next button could be added here if you want explicit next; 
                current flow advances on selection, so we leave it out to avoid behavior change */}
          </div>

          <div className="pb-[max(0.5rem,env(safe-area-inset-bottom))]" />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QuizModal;
