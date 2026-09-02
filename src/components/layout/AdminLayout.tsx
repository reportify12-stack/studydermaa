import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  HelpCircle,
  ListOrdered,
  Award,
  Bell,
  BarChart3,
  Settings,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  currentRoute: string;
  navigate: (route: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentRoute,
  navigate,
  children,
}) => {
  const { userProfile, isAdmin } = useAuth();

  const adminNavItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, id: 'admin-nav-overview' },
    { label: 'Pelajar', path: '/admin/students', icon: Users, id: 'admin-nav-students' },
    { label: 'Subjek KSSM', path: '/admin/subjects', icon: BookOpen, id: 'admin-nav-subjects' },
    { label: 'Nota Pelajaran', path: '/admin/notes', icon: FileText, id: 'admin-nav-notes' },
    { label: 'Kuiz', path: '/admin/quizzes', icon: HelpCircle, id: 'admin-nav-quizzes' },
    { label: 'Bank Soalan', path: '/admin/questions', icon: ListOrdered, id: 'admin-nav-questions' },
    { label: 'Keputusan Kuiz', path: '/admin/results', icon: Award, id: 'admin-nav-results' },
    { label: 'Pengumuman', path: '/admin/announcements', icon: Bell, id: 'admin-nav-announcements' },
    { label: 'Statistik', path: '/admin/statistics', icon: BarChart3, id: 'admin-nav-stats' },
    { label: 'Tetapan Sistem', path: '/admin/settings', icon: Settings, id: 'admin-nav-settings' },
  ];

  return (
    <div id="admin-panel-root" className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-stone-50/60 dark:bg-stone-950/60">
      {/* Admin Sidebar */}
      <aside
        id="admin-sidebar"
        className="w-full md:w-64 shrink-0 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                  Panel Pentadbir
                </span>
                <span className="text-[10px] text-stone-400">study.dermaa</span>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentRoute === item.path ||
                (item.path !== '/admin' && currentRoute.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  id={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800/80 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Back to student portal */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
          <button
            id="admin-back-to-student-btn"
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Portal Pelajar</span>
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main id="admin-main-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
