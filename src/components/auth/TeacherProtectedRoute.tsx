import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, ShieldAlert, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface TeacherProtectedRouteProps {
  children: React.ReactNode;
  navigate: (route: string) => void;
}

export const TeacherProtectedRoute: React.FC<TeacherProtectedRouteProps> = ({
  children,
  navigate,
}) => {
  const { t } = useTranslation();
  const { user, userProfile, isTeacher, loading, setUserRole } = useAuth();
  const [upgradingRole, setUpgradingRole] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  // 1. Loading state while checking Firebase Auth and Firestore user profile
  if (loading) {
    return (
      <div
        id="teacher-route-loading"
        className="min-h-screen flex flex-col items-center justify-center bg-stone-50/60 dark:bg-stone-950 p-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs mb-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
          {t('verifying_teacher_access', 'Mengesahkan kelayakan portal guru...')}
        </p>
      </div>
    );
  }

  // 2. Unauthenticated user -> redirect to Login
  if (!user || !userProfile) {
    return (
      <div
        id="teacher-route-unauthenticated"
        className="min-h-screen flex flex-col items-center justify-center bg-stone-50/60 dark:bg-stone-950 p-4 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center mb-4">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          {t('login_required_title', 'Log Masuk Diperlukan')}
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mb-6">
          {t('login_required_teacher_desc', 'Sila log masuk dengan akaun guru untuk mengakses Portal Guru study.dermaa.')}
        </p>
        <button
          id="teacher-route-login-btn"
          type="button"
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          {t('login_button', 'Log Masuk')}
        </button>
      </div>
    );
  }

  // 3. Authenticated, but role in Firestore is NOT 'teacher'
  if (userProfile.role !== 'teacher' && !isTeacher) {
    const handleBecomeTeacher = async () => {
      try {
        setUpgradingRole(true);
        await setUserRole('teacher');
        setUpgradeSuccess(true);
        setTimeout(() => {
          setUpgradeSuccess(false);
        }, 1500);
      } catch (err) {
        console.error('Failed to set teacher role:', err);
      } finally {
        setUpgradingRole(false);
      }
    };

    return (
      <div
        id="teacher-route-denied"
        className="min-h-screen flex flex-col items-center justify-center bg-stone-50/60 dark:bg-stone-950 p-4 text-center"
      >
        <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display mb-2">
            {t('teacher_access_restricted_title', 'Akses Khas Guru SMK Derma')}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
            {t(
              'teacher_access_restricted_desc',
              'Akaun anda didaftarkan sebagai pelajar. Portal ini dikhaskan untuk tenaga pengajar bagi mengurus kelas, menjana kod penyertaan, dan mengedarkan tugasan KSSM.'
            )}
          </p>

          <div className="space-y-3">
            {/* Quick switcher for easy testing in development */}
            <button
              id="activate-teacher-role-btn"
              type="button"
              disabled={upgradingRole || upgradeSuccess}
              onClick={handleBecomeTeacher}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {upgradingRole ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('updating_role', 'Mengemas kini peranan...')}</span>
                </>
              ) : upgradeSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>{t('role_updated', 'Peranan Diaktifkan!')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('activate_teacher_demo', 'Aktifkan Peranan Guru (Mod Pengujian)')}</span>
                </>
              )}
            </button>

            <button
              id="back-to-student-dashboard-btn"
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back_to_student_dashboard', 'Kembali ke Dashboard Pelajar')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized teacher -> grant access
  return <>{children}</>;
};
