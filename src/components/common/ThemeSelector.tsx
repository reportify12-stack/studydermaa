import React from 'react';
import { useTheme, THEME_CONFIGS } from '../../contexts/ThemeContext';
import { PastelThemeName } from '../../types';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export const ThemeSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, setTheme, colorMode, setColorMode } = useTheme();

  return (
    <div id="theme-selector-container" className="space-y-6">
      {/* Mode Selector (Light / Dark / System) */}
      <div>
        <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-3">
          Mod Paparan
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            id="mode-light-btn"
            type="button"
            onClick={() => setColorMode('light')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
              colorMode === 'light'
                ? 'border-theme-primary bg-theme-surface text-theme-primary font-semibold shadow-xs'
                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Cerah</span>
          </button>
          <button
            id="mode-dark-btn"
            type="button"
            onClick={() => setColorMode('dark')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
              colorMode === 'dark'
                ? 'border-theme-primary bg-theme-surface text-theme-primary font-semibold shadow-xs'
                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Gelap</span>
          </button>
          <button
            id="mode-system-btn"
            type="button"
            onClick={() => setColorMode('system')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
              colorMode === 'system'
                ? 'border-theme-primary bg-theme-surface text-theme-primary font-semibold shadow-xs'
                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Sistem</span>
          </button>
        </div>
      </div>

      {/* Pastel Palettes */}
      <div>
        <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-3">
          Warna Tema Pastel
        </label>
        <div className={`grid ${compact ? 'grid-cols-2 gap-2.5' : 'grid-cols-1 sm:grid-cols-2 gap-3'}`}>
          {(Object.keys(THEME_CONFIGS) as PastelThemeName[]).map((themeKey) => {
            const item = THEME_CONFIGS[themeKey];
            const isSelected = theme === themeKey;
            return (
              <button
                key={themeKey}
                id={`theme-btn-${themeKey}`}
                type="button"
                onClick={() => setTheme(themeKey)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-theme-primary ring-2 ring-theme-primary/30 bg-white dark:bg-stone-900 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full shrink-0 shadow-xs flex items-center justify-center text-white"
                    style={{ backgroundColor: item.primaryColor }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                      {item.name}
                    </span>
                    {!compact && (
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 block line-clamp-1">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
