import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, changeAppLanguage, SupportedLanguageCode } from '../../i18n';

interface LanguageSwitcherProps {
  /**
   * 'dropdown': compact dropdown menu suitable for headers/navbars
   * 'segmented': inline button group suitable for settings or modal dialogs
   */
  variant?: 'dropdown' | 'segmented';
  className?: string;
  showFlag?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  className = '',
  showFlag = true,
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize language code to first 2 characters ('en-US' -> 'en', 'ms-MY' -> 'ms')
  const currentCode = (i18n.language?.split('-')[0] || 'ms') as SupportedLanguageCode;
  const currentLang =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === currentCode) || SUPPORTED_LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: string) => {
    changeAppLanguage(code);
    setIsOpen(false);
  };

  // Segmented Button Group Variant
  if (variant === 'segmented') {
    return (
      <div
        id="language-switcher-segmented"
        className={`inline-flex items-center p-1 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 ${className}`}
        role="group"
        aria-label="Pilih Bahasa / Select Language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = currentCode === lang.code;
          return (
            <button
              key={lang.code}
              id={`lang-btn-${lang.code}`}
              type="button"
              onClick={() => handleSelectLanguage(lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white dark:bg-stone-900 text-theme-primary shadow-xs font-extrabold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/40 dark:hover:bg-stone-700/40'
              }`}
              aria-pressed={isActive}
            >
              {showFlag && <span className="text-sm leading-none">{lang.flag}</span>}
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Modern Dropdown Variant (Default for Navbar)
  return (
    <div
      ref={dropdownRef}
      id="language-switcher-dropdown"
      className={`relative inline-block text-left ${className}`}
    >
      <button
        id="language-switcher-toggle-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700/60 transition-all shadow-2xs text-xs font-bold focus:outline-hidden"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Bahasa semasa: ${currentLang.fullLabel}. Klik untuk tukar.`}
      >
        <Globe className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
        {showFlag && <span className="text-sm leading-none">{currentLang.flag}</span>}
        <span className="font-extrabold tracking-wide">{currentLang.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-theme-primary' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="language-dropdown-menu"
          className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          role="menu"
        >
          <div className="px-3 py-1.5 border-b border-stone-100 dark:border-stone-800/80 text-[10px] font-black uppercase tracking-wider text-stone-400">
            Bahasa / Language
          </div>

          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentCode === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`lang-option-${lang.code}`}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-theme-surface/70 dark:bg-stone-800 text-theme-primary font-bold'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-xs font-bold">{lang.fullLabel}</span>
                      <span className="text-[10px] text-stone-400 font-mono font-normal">
                        {lang.label}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-theme-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
