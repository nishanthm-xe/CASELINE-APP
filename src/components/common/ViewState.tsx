import React from 'react';
import { Loader2, AlertCircle, RefreshCw, FolderOpen, LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
  minHeight?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading your medical information...',
  subtext = 'Securely fetching encrypted clinical records from sovereign database.',
  minHeight = 'min-h-[300px]',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-white/70 border border-slate-200/80 shadow-xs ${minHeight}`}
    >
      <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
      <h3 className="text-base font-bold text-slate-800">{message}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-md">{subtext}</p>
    </div>
  );
};

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  minHeight?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title = 'No medical information available yet.',
  description = 'There are no records recorded under this category at this time.',
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  minHeight = 'min-h-[300px]',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-white border border-slate-200/90 shadow-xs ${minHeight}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">{description}</p>
      
      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  minHeight?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load this information.',
  message = 'A network or processing issue occurred while retrieving clinical data. Please retry.',
  onRetry,
  minHeight = 'min-h-[300px]',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-rose-50/50 border border-rose-200 shadow-xs ${minHeight}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mb-4 text-rose-600">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-rose-900">{title}</h3>
      <p className="text-xs text-rose-700 mt-1 max-w-md leading-relaxed">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
