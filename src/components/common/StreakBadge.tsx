import React from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  longestStreak?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak,
  longestStreak,
  size = 'md',
  showDetails = false,
}) => {
  const isZero = streak === 0;

  if (size === 'sm') {
    return (
      <div
        id="streak-badge-sm"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
          isZero
            ? 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
            : 'bg-orange-50 text-orange-600 border border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/60 shadow-xs'
        }`}
        title={`Streak pembelajaran: ${streak} hari`}
      >
        <Flame className={`w-3.5 h-3.5 ${isZero ? 'text-stone-400' : 'text-orange-500 fill-orange-500 animate-pulse'}`} />
        <span>{streak} Hari</span>
      </div>
    );
  }

  return (
    <div
      id="streak-badge-card"
      className="flex items-center gap-3 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 shadow-xs"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
          isZero
            ? 'bg-stone-100 text-stone-400 dark:bg-stone-800'
            : 'bg-orange-100/80 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50'
        }`}
      >
        <Flame className={`w-6 h-6 ${isZero ? '' : 'fill-orange-500 animate-pulse'}`} />
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            {streak}
          </span>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Hari Streak
          </span>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          {isZero
            ? 'Selesaikan nota/kuiz hari ini'
            : longestStreak && longestStreak > streak
            ? `Rekod terbaik: ${longestStreak} hari`
            : 'Streak aktif hari ini!'}
        </p>
      </div>
    </div>
  );
};
