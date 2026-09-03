import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  BookOpen,
  FileText,
  HelpCircle,
  TrendingUp,
  Bookmark,
  User,
  Settings,
  Shield,
  Sparkles,
  Video,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  navigate,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { t } = useTranslation();
  const { userProfile, isAdmin } = useAuth();

  const studentNavItems = [
    { label: t('nav_home'), path: '/dashboard', icon: Home, id: 'nav-home' },
    { label: t('nav_ai_tutor'), path: '/ai-tutor', icon: Sparkles, id: 'nav-ai-tutor', badge: 'KSSM' },
    { label: t('nav_seminars'), path: '/seminars', icon: Video, id: 'nav-seminars' },
    { label: t('nav_study'), path: '/belajar', icon: BookOpen, id: 'nav-belajar' },
    { label: t('nav_notes'), path: '/nota', icon: FileText, id: 'nav-nota' },
    { label: t('nav_quiz'), path: '/kuiz', icon: HelpCircle, id: 'nav-kuiz' },
    { label: t('nav_progress'), path: '/progress', icon: TrendingUp, id: 'nav-progress' },
    { label: t('nav_bookmarks'), path: '/bookmark', icon: Bookmark, id: 'nav-bookmark' },
    { label: t('nav_profile'), path: '/profile', icon: User, id: 'nav-profile' },
    { label: t('nav_settings'), path: '/settings', icon: Settings, id: 'nav-settings' },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    if (typeof onCloseMobile === 'function') {
      onCloseMobile();
    }
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4 space-y-4">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
          Menu Pelajar
        </div>
        {studentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentRoute === item.path ||
            (item.path === '/ai-tutor' && (currentRoute === '/ai-tutor' || currentRoute === '/tutor')) ||
            (item.path === '/seminars' && (currentRoute === '/seminars' || currentRoute === '/seminar' || currentRoute === '/live-seminar')) ||
            (item.path === '/progress' && (currentRoute === '/kemajuan' || currentRoute === '/progress')) ||
            (item.path === '/bookmark' && (currentRoute === '/bookmark' || currentRoute === '/bookmarks')) ||
            (item.path === '/profile' && (currentRoute === '/profil' || currentRoute === '/profile')) ||
            (item.path === '/settings' && (currentRoute === '/tetapan' || currentRoute === '/settings')) ||
            (item.path === '/belajar' && (currentRoute === '/belajar' || currentRoute === '/learn' || currentRoute.startsWith('/subjek/'))) ||
            (item.path === '/nota' && (currentRoute === '/nota' || currentRoute === '/notes' || currentRoute.startsWith('/nota/'))) ||
            (item.path === '/kuiz' && (currentRoute === '/kuiz' || currentRoute === '/quizzes' || currentRoute.startsWith('/kuiz/'))) ||
            (item.path !== '/dashboard' && currentRoute.startsWith(item.path));
          return (
            <button
              key={item.path}
              id={item.id}
              onClick={() => handleItemClick(item.path)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                isActive
                  ? 'bg-theme-surface text-theme-primary font-bold shadow-2xs border border-theme-primary/30'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100/80 dark:hover:bg-stone-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-theme-primary' : 'text-stone-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Admin Link if Admin */}
      {isAdmin && (
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Pentadbiran
          </div>
          <button
            id="nav-admin-panel"
            onClick={() => handleItemClick('/admin')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
              currentRoute.startsWith('/admin')
                ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-200 border border-purple-300 dark:border-purple-800'
                : 'text-purple-700 dark:text-purple-300 bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100/80'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Panel Admin</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="desktop-sidebar"
        className="hidden md:block w-64 shrink-0 border-r border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-md min-h-[calc(100vh-4rem)]"
      >
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div
          id="mobile-sidebar-backdrop"
          className="fixed inset-0 z-40 md:hidden bg-stone-900/60 backdrop-blur-xs flex animate-fade-in"
          onClick={() => {
            if (typeof onCloseMobile === 'function') {
              onCloseMobile();
            }
          }}
        >
          <div
            id="mobile-sidebar-drawer"
            className="w-72 max-w-[80vw] bg-white dark:bg-stone-900 h-full shadow-2xl overflow-y-auto border-r border-stone-200 dark:border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <button
                onClick={() => handleItemClick('/dashboard')}
                className="flex items-center text-left focus:outline-hidden"
                aria-label="study.dermaa"
              >
                <img
                  src="/logo-light.png"
                  alt="Logo"
                  className="h-10 w-auto block dark:hidden object-contain"
                  referrerPolicy="no-referrer"
                />
                <img
                  src="/logo-dark.png"
                  alt="Logo"
                  className="h-10 w-auto hidden dark:block object-contain"
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
