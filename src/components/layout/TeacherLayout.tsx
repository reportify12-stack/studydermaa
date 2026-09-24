import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
  School,
  Users,
  FileText,
  ArrowLeft,
  GraduationCap,
  Shield,
  BookOpen,
  LogOut,
  Printer,
} from 'lucide-react';

interface TeacherLayoutProps {
  currentRoute: string;
  navigate: (route: string) => void;
  children: React.ReactNode;
}

export const TeacherLayout: React.FC<TeacherLayoutProps> = ({
  currentRoute,
  navigate,
  children,
}) => {
  const { t } = useTranslation();
  const { userProfile, isAdmin, logout } = useAuth();

  const teacherNavItems = [
    {
      label: t('teacher_nav_classes', 'Bilik Darjah & Kelas'),
      path: '/teacher',
      icon: School,
      id: 'teacher-nav-classes',
    },
    {
      label: t('teacher_nav_assignments', 'Tugasan & Kerja Rumah'),
      path: '/teacher/assignments',
      icon: FileText,
      id: 'teacher-nav-assignments',
    },
    {
      label: t('teacher_nav_submissions', 'Semakan Serahan & Cetak'),
      path: '/teacher/submissions',
      icon: Printer,
      id: 'teacher-nav-submissions',
    },
    {
      label: t('teacher_nav_students', 'Senarai Murid'),
      path: '/teacher/students',
      icon: Users,
      id: 'teacher-nav-students',
    },
  ];

  return (
    <div
      id="teacher-portal-root"
      className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-stone-50/60 dark:bg-stone-950/60 print:bg-white print:block print:m-0 print:p-0"
    >
      {/* Teacher Sidebar */}
      <aside
        id="teacher-sidebar"
        className="w-full md:w-64 shrink-0 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 flex flex-col justify-between print:hidden"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shadow-2xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                  {t('teacher_portal', 'Portal Guru')}
                </span>
                <span className="text-[10px] text-stone-400">
                  {userProfile?.school || 'SMK Derma'}
                </span>
              </div>
            </div>
          </div>

          {/* Teacher Profile Summary Card */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
              {userProfile?.fullName || 'Cikgu SMK Derma'}
            </p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
              {t('teacher_educator_role', 'Tenaga Pengajar KSSM')}
            </p>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {teacherNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentRoute === item.path ||
                (item.path !== '/teacher' && currentRoute.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  id={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/80 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
          {isAdmin && (
            <button
              id="teacher-to-admin-btn"
              type="button"
              onClick={() => navigate('/admin')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t('admin_panel', 'Panel Pentadbir')}</span>
            </button>
          )}

          {isAdmin ? (
            <button
              id="teacher-back-to-student-btn"
              type="button"
              onClick={() => navigate('/student-dashboard')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('back_to_student_portal', 'Kembali ke Portal Pelajar')}</span>
            </button>
          ) : (
            <button
              id="teacher-logout-btn"
              type="button"
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('nav_logout', 'Log Keluar')}</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="teacher-main-content" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto print:p-0 print:m-0 print:overflow-visible">
        <div className="max-w-6xl mx-auto print:max-w-none print:w-full print:m-0 print:p-0">{children}</div>
      </main>
    </div>
  );
};
