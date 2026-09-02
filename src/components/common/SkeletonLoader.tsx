import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl border border-stone-200/70 dark:border-stone-800 bg-white/60 dark:bg-stone-900/50 animate-pulse"
        >
          <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-800 mb-4" />
          <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded-md w-3/4 mb-3" />
          <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded-md w-full mb-2" />
          <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded-md w-1/2 mb-4" />
          <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded-lg w-1/3" />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded-lg w-1/4" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-10 bg-stone-100 dark:bg-stone-800/60 rounded-lg w-full" />
      ))}
    </div>
  );
};
