import React, { createContext, useContext, useEffect, useState } from 'react';
import { PastelThemeName, ThemeConfig } from '../types';

export const THEME_CONFIGS: Record<PastelThemeName, ThemeConfig> = {
  'pastel-green': {
    id: 'pastel-green',
    name: 'Pastel Green (Sage)',
    description: 'Tenang, segar & mesra mata untuk fokus belajar',
    primaryColor: '#10b981',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    gradient: 'from-emerald-500 to-teal-600',
    tagClass: 'border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300',
  },
  'pastel-blue': {
    id: 'pastel-blue',
    name: 'Pastel Blue (Sky)',
    description: 'Jernih, menenangkan & merangsang logik pemikiran',
    primaryColor: '#0ea5e9',
    accentBg: 'bg-sky-50 dark:bg-sky-950/40',
    badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
    gradient: 'from-sky-500 to-blue-600',
    tagClass: 'border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300',
  },
  'pastel-purple': {
    id: 'pastel-purple',
    name: 'Pastel Purple (Lavender)',
    description: 'Kreatif, elegan & anggun untuk daya ingatan tinggi',
    primaryColor: '#8b5cf6',
    accentBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
    gradient: 'from-purple-500 to-indigo-600',
    tagClass: 'border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300',
  },
  'pastel-pink': {
    id: 'pastel-pink',
    name: 'Pastel Pink (Rose)',
    description: 'Ceria, bersemangat & memberi motivasi pembelajaran',
    primaryColor: '#ec4899',
    accentBg: 'bg-pink-50 dark:bg-pink-950/40',
    badgeBg: 'bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-200',
    gradient: 'from-pink-500 to-rose-600',
    tagClass: 'border-pink-200 dark:border-pink-800/60 text-pink-700 dark:text-pink-300',
  },
  'pastel-yellow': {
    id: 'pastel-yellow',
    name: 'Pastel Yellow (Buttercream)',
    description: 'Hangat, optimistik & membantu konsentrasi tajam',
    primaryColor: '#eab308',
    accentBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
    gradient: 'from-amber-500 to-yellow-600',
    tagClass: 'border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300',
  },
  'pastel-peach': {
    id: 'pastel-peach',
    name: 'Pastel Peach (Coral)',
    description: 'Lembut, dinamik & mesra untuk sesi ulangkaji panjang',
    primaryColor: '#f97316',
    accentBg: 'bg-orange-50 dark:bg-orange-950/40',
    badgeBg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
    gradient: 'from-orange-500 to-rose-500',
    tagClass: 'border-orange-200 dark:border-orange-800/60 text-orange-700 dark:text-orange-300',
  },
  'pastel-mint': {
    id: 'pastel-mint',
    name: 'Pastel Mint (Teal)',
    description: 'Dingin, menyegarkan & melegakan keletihan minda',
    primaryColor: '#14b8a6',
    accentBg: 'bg-teal-50 dark:bg-teal-950/40',
    badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200',
    gradient: 'from-teal-500 to-emerald-600',
    tagClass: 'border-teal-200 dark:border-teal-800/60 text-teal-700 dark:text-teal-300',
  },
};

type ColorMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: PastelThemeName;
  colorMode: ColorMode;
  themeConfig: ThemeConfig;
  setTheme: (theme: PastelThemeName) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'study_dermaa_theme';
const MODE_STORAGE_KEY = 'study_dermaa_color_mode';

function applyDarkClass(activeDark: boolean) {
  const root = document.documentElement;
  if (activeDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<PastelThemeName>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as PastelThemeName;
    return saved && THEME_CONFIGS[saved] ? saved : 'pastel-green';
  });

  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    const saved = localStorage.getItem(MODE_STORAGE_KEY) as ColorMode;
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'light';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(MODE_STORAGE_KEY) as ColorMode;
    const mode = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'light';
    if (mode === 'dark') return true;
    if (mode === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateDarkMode = () => {
      let activeDark = false;
      if (colorMode === 'dark') {
        activeDark = true;
      } else if (colorMode === 'system') {
        activeDark = mediaQuery.matches;
      } else {
        activeDark = false;
      }
      setIsDark(activeDark);
      applyDarkClass(activeDark);
    };

    updateDarkMode();
    mediaQuery.addEventListener('change', updateDarkMode);
    return () => mediaQuery.removeEventListener('change', updateDarkMode);
  }, [colorMode]);

  useEffect(() => {
    const root = document.documentElement;
    // Set theme attribute
    root.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: PastelThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const setColorMode = (newMode: ColorMode) => {
    setColorModeState(newMode);
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
    let activeDark = false;
    if (newMode === 'dark') {
      activeDark = true;
    } else if (newMode === 'system') {
      activeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      activeDark = false;
    }
    setIsDark(activeDark);
    applyDarkClass(activeDark);
  };

  const toggleColorMode = () => {
    setColorMode(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorMode,
        themeConfig: THEME_CONFIGS[theme] || THEME_CONFIGS['pastel-green'],
        setTheme,
        setColorMode,
        toggleColorMode,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
