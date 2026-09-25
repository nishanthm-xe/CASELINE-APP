import React from 'react';
import {
  LogIn,
  Languages,
  HeartPulse,
  Mic,
  Calendar,
  FileText,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  Check,
} from 'lucide-react';

interface StepProgressBarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const INTAKE_STEPS = [
  { id: 1, label: 'Choose Preferred Language', short: 'Language', icon: Languages },
  { id: 2, label: 'Patient Login', short: 'Login', icon: LogIn },
  { id: 3, label: 'Begin Health Interview', short: 'Intake Prep', icon: HeartPulse },
  { id: 4, label: 'Clinical Voice Interview', short: 'Voice AI', icon: Mic },
  { id: 5, label: 'Medical Timeline', short: 'Timeline', icon: Calendar },
  { id: 6, label: 'Clinical Summary', short: 'Summary', icon: FileText },
  { id: 7, label: 'Add Medical Records', short: 'ABDM OCR', icon: ScanLine },
  { id: 8, label: 'Review Before Submission', short: 'Review', icon: ShieldCheck },
  { id: 9, label: 'Doctor Portal Hand-off', short: 'Hand-off', icon: Stethoscope },
];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-xs mb-6">
      {/* Desktop / Tablet Stepper */}
      <div className="hidden lg:flex items-center justify-between relative px-2">
        {/* Connecting progress line */}
        <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-teal-600 transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.max(0, ((currentStep - 1) / (INTAKE_STEPS.length - 1)) * 100))}%`,
            }}
          />
        </div>

        {INTAKE_STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isAccessible = step.id <= currentStep;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onStepClick(step.id)}
              className={`flex flex-col items-center group relative z-10 focus:outline-hidden ${
                isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200 text-xs font-bold ${
                  isCompleted
                    ? 'bg-teal-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-slate-900 text-white ring-4 ring-teal-100 shadow-md scale-105'
                    : 'bg-white text-slate-400 border-2 border-slate-200 group-hover:border-slate-300'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className="text-[9px] font-bold mt-1.5 uppercase tracking-wider text-slate-400">
                Step {step.id}
              </span>
              <span
                className={`text-[11px] font-semibold text-center max-w-[80px] mt-0.5 transition-colors line-clamp-1 ${
                  isCurrent
                    ? 'text-slate-900 font-bold'
                    : isCompleted
                    ? 'text-teal-800'
                    : 'text-slate-500'
                }`}
                title={step.label}
              >
                {step.short}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Stepper View */}
      <div className="lg:hidden space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Step {currentStep} of 9: {INTAKE_STEPS[currentStep - 1]?.short || 'Intake'}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {Math.round((currentStep / 9) * 100)}% Completed
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 9) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>{INTAKE_STEPS[currentStep - 1]?.label}</span>
          {currentStep > 1 && (
            <button
              onClick={() => onStepClick(currentStep - 1)}
              className="text-teal-700 text-xs font-bold underline cursor-pointer"
            >
              Previous Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
