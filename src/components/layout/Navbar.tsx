import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import {
  Menu,
  X,
  Search,
  BookOpen,
  Palette,
  Shield,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { StreakBadge } from '../common/StreakBadge';
import { XpBadge } from '../common/XpBadge';

interface NavbarProps {
  onOpenSearch: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  currentRoute?: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  currentRoute = '/',
  navigate,
}) => {
  const { t } = useTranslation();
  const { userProfile, role, isAdmin, logout } = useAuth();
  const { themeConfig, isDark, toggleColorMode } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-30 w-full border-b border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          {onToggleMobileMenu && (
            <button
              id="mobile-menu-toggle-btn"
              type="button"
              onClick={() => {
                if (typeof onToggleMobileMenu === 'function') {
                  onToggleMobileMenu();
                }
              }}
              className="md:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus:outline-hidden"
              aria-label="Buka menu navigasi"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <button
            id="brand-logo-btn"
            onClick={() => navigate(userProfile ? '/dashboard' : '/')}
            className="flex items-center text-left group focus:outline-hidden py-1"
            aria-label="study.dermaa Laman Utama"
          >
            <img
              src="/logo-light.png"
              alt="Logo"
              className="h-10 w-auto block dark:hidden object-contain transition-transform group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
            <img
              src="/logo-dark.png"
              alt="Logo"
              className="h-10 w-auto hidden dark:block object-contain transition-transform group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>

        {/* Center: Search trigger button */}
        <div className="flex-1 max-w-md hidden sm:block">
          <button
            id="navbar-search-btn"
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:border-stone-300 dark:hover:border-stone-700 transition-all text-xs sm:text-sm text-left shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-stone-400" />
              <span>{t('search_placeholder')}</span>
            </span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon */}
          <button
            id="mobile-search-icon-btn"
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Cari"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Language Switcher Dropdown */}
          <LanguageSwitcher variant="dropdown" />

          {/* Theme Mode Toggle Button (Sun / Moon) */}
          <button
            id="navbar-theme-toggle-btn"
            type="button"
            onClick={toggleColorMode}
            className="p-2 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700/60 transition-all shadow-2xs focus:outline-hidden"
            title={isDark ? t('theme_light') : t('theme_dark')}
            aria-label={isDark ? t('theme_light') : t('theme_dark')}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-500 animate-fade-in" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600 animate-fade-in" />
            )}
          </button>

          {userProfile ? (
            <>
              {/* Streak Pill */}
              <div className="hidden xs:block">
                <StreakBadge streak={userProfile.streak || 0} size="sm" />
              </div>

              {/* XP Pill */}
              <div className="hidden md:block">
                <XpBadge xp={userProfile.xp || 0} level={userProfile.level || 1} compact />
              </div>

              {/* Admin Portal shortcut if user is admin */}
              {isAdmin && (
                <button
                  id="navbar-admin-shortcut-btn"
                  onClick={() => navigate(currentRoute.startsWith('/admin') ? '/dashboard' : '/admin')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-200 dark:border-purple-800/60 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors shadow-2xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{currentRoute.startsWith('/admin') ? 'Portal Pelajar' : 'Panel Admin'}</span>
                </button>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-all text-left shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-theme-surface text-theme-primary font-bold text-xs flex items-center justify-center border border-theme-primary/30 uppercase">
                    {userProfile.fullName ? userProfile.fullName.charAt(0) : 'P'}
                  </div>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 max-w-[90px] truncate hidden md:block">
                    {userProfile.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden md:block" />
                </button>

                {profileDropdownOpen && (
                  <div
                    id="profile-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 py-2 z-40 animate-fade-in"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800">
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                        {userProfile.fullName}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate">
                        @{userProfile.username} • {userProfile.tingkatan}
                      </p>
                    </div>

                    <button
                      id="dropdown-profile-link"
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors"
                    >
                      <User className="w-4 h-4 text-stone-400" />
                      <span>Profil Saya</span>
                    </button>

                    <button
                      id="dropdown-settings-link"
                      onClick={() => navigate('/settings')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors"
                    >
                      <Palette className="w-4 h-4 text-stone-400" />
                      <span>Tetapan & Tema</span>
                    </button>

                    {isAdmin && (
                      <button
                        id="dropdown-admin-link"
                        onClick={() => navigate('/admin')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        <span>Panel Pentadbir</span>
                      </button>
                    )}

                    <div className="border-t border-stone-100 dark:border-stone-800 my-1" />

                    <button
                      id="dropdown-logout-btn"
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav_logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="navbar-login-btn"
                onClick={() => navigate('/login')}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {t('login_button')}
              </button>
              <button
                id="navbar-register-btn"
                onClick={() => navigate('/register')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold btn-theme-primary shadow-xs"
              >
                {t('register_button')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
