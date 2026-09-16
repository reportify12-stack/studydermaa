import React from 'react';
import { Sparkles, ArrowRight, BookOpen, Volume2 } from 'lucide-react';
import { LanguageModuleConfig } from '../../types/languageHub';
import { speakNativeLanguageWord } from '../../services/languageHubService';

interface LanguageCardProps {
  module: LanguageModuleConfig;
  isSelected: boolean;
  onSelect: (module: LanguageModuleConfig) => void;
  isLoading?: boolean;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({
  module,
  isSelected,
  onSelect,
  isLoading = false,
}) => {
  const handlePlayGreeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakNativeLanguageWord(module.nativeGreeting, module.id);
  };

  return (
    <div
      id={`module-card-${module.id}`}
      onClick={() => onSelect(module)}
      className={`group relative rounded-3xl p-6 transition-all duration-300 cursor-pointer border text-left flex flex-col justify-between overflow-hidden shadow-2xs ${
        isSelected
          ? `bg-white dark:bg-stone-900 ring-2 ring-theme-primary shadow-md border-transparent`
          : `bg-white/80 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-stone-900 ${module.borderClass}`
      }`}
    >
      {/* Subtle background glow/gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${module.gradientClass} opacity-60 pointer-events-none`}
      />

      {/* Top Bar: Flag & Script Badge */}
      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl filter drop-shadow-xs" role="img" aria-label={module.country}>
            {module.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-theme-primary transition-colors">
                {module.name}
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {module.country} • {module.scriptName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePlayGreeting}
          title="Dengar sebutan sapaan"
          aria-label={`Dengar sebutan ${module.nativeGreeting}`}
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors shrink-0"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Greeting Display */}
      <div className="relative z-10 my-2 p-3.5 rounded-2xl bg-stone-50/90 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            {module.nativeGreeting}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">
            {module.greeting}
          </span>
        </div>
      </div>

      {/* Tagline / Description */}
      <p className="relative z-10 text-xs text-stone-600 dark:text-stone-300 line-clamp-2 my-2 font-normal leading-relaxed">
        {module.tagline}
      </p>

      {/* Topic Chips */}
      <div className="relative z-10 my-3 flex flex-wrap gap-1.5">
        {module.popularTopics.slice(0, 2).map((topic, i) => (
          <span
            key={i}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-stone-100/90 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 border border-stone-200/60 dark:border-stone-700/60"
          >
            {topic}
          </span>
        ))}
      </div>

      {/* Card Footer Button */}
      <div className="relative z-10 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
          <BookOpen className="w-3.5 h-3.5" />
          <span>5 Kosa Kata & 3 Frasa</span>
        </div>

        <button
          type="button"
          id={`btn-select-language-${module.id}`}
          disabled={isLoading}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
            isSelected
              ? 'bg-theme-primary text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          {isSelected ? (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dipilih</span>
            </>
          ) : (
            <>
              <span>Mula Belajar</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
