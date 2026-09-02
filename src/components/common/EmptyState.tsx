import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  id = 'empty-state-card',
}) => {
  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 shadow-xs backdrop-blur-xs my-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-theme-surface flex items-center justify-center text-theme-primary mb-4 border border-theme-primary/30">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          id={`${id}-action-btn`}
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm btn-theme-primary shadow-xs active:scale-98 transition-transform"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
