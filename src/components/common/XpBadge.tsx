import React from 'react';
import { Award, Zap } from 'lucide-react';
import { calculateLevelFromXp } from '../../services/xpService';

interface XpBadgeProps {
  xp: number;
  level: number;
  compact?: boolean;
}

export const XpBadge: React.FC<XpBadgeProps> = ({ xp, level, compact = false }) => {
  const levelInfo = calculateLevelFromXp(xp);

  if (compact) {
    return (
      <div
        id="xp-badge-compact"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-theme-surface text-theme-primary border border-theme-primary/30"
        title={`${xp} XP - Level ${levelInfo.level} (${levelInfo.title})`}
      >
        <Zap className="w-3.5 h-3.5 fill-current" />
        <span>Lvl {levelInfo.level}</span>
        <span className="text-stone-400 dark:text-stone-500 font-normal">|</span>
        <span>{xp} XP</span>
      </div>
    );
  }

  return (
    <div
      id="xp-badge-card"
      className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 shadow-xs space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-theme-surface text-theme-primary flex items-center justify-center border border-theme-primary/30 font-extrabold text-sm">
            {levelInfo.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Tahap {levelInfo.level}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                {levelInfo.title}
              </span>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {xp} Mata Pengalaman (XP)
            </span>
          </div>
        </div>
        <Award className="w-6 h-6 text-amber-500" />
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400 font-medium mb-1">
          <span>{xp} XP</span>
          <span>{levelInfo.nextLevelMinXp} XP (Tahap Seterusnya)</span>
        </div>
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full btn-theme-primary transition-all duration-500 rounded-full"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
