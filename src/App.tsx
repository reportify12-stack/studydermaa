import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AdminLayout } from './components/layout/AdminLayout';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { SplashScreen } from './components/common/SplashScreen';

// Pages - Auth & Public
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LandingPage } from './pages/student/LandingPage';

// Pages - Student
import { DashboardPage } from './pages/student/DashboardPage';
import { BelajarPage } from './pages/student/BelajarPage';
import { NotesListPage } from './pages/student/NotesListPage';
import { NoteDetailPage } from './pages/student/NoteDetailPage';
import { QuizListPage } from './pages/student/QuizListPage';
import { QuizDetailPage } from './pages/student/QuizDetailPage';
import { ProgressPage } from './pages/student/ProgressPage';
import { BookmarksPage } from './pages/student/BookmarksPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { SettingsPage } from './pages/student/SettingsPage';
import { SeminarsPage } from './pages/student/SeminarsPage';
import { AiTutorPage } from './pages/student/AiTutorPage';
import { AiTutorWidget } from './components/tutor/AiTutorWidget';

// Pages - Admin
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminSubjectsPage } from './pages/admin/AdminSubjectsPage';
import { AdminNotesPage } from './pages/admin/AdminNotesPage';
import { AdminQuizzesPage } from './pages/admin/AdminQuizzesPage';
import { AdminQuestionsPage } from './pages/admin/AdminQuestionsPage';
import { AdminResultsPage } from './pages/admin/AdminResultsPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminStatisticsPage } from './pages/admin/AdminStatisticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminSeminarsPage } from './pages/admin/AdminSeminarsPage';

import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, userProfile, isAdmin, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Sync state with popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setMobileMenuOpen(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    setMobileMenuOpen(false);
    if (to !== window.location.pathname) {
      window.history.pushState({}, '', to);
      setCurrentPath(to);
      window.scrollTo(0, 0);
    }
  }, []);

  // Clear access denied alert after 5s
  useEffect(() => {
    if (accessDeniedMessage) {
      const timer = setTimeout(() => {
        setAccessDeniedMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [accessDeniedMessage]);

  // Handle Dynamic Route Matching
  const renderCurrentRoute = () => {
    // Auth routes
    if (currentPath === '/login') {
      if (user && userProfile) {
        navigate(userProfile.role === 'admin' ? '/admin' : '/dashboard');
        return null;
      }
      return <LoginPage navigate={navigate} />;
    }

    if (currentPath === '/register') {
      if (user && userProfile) {
        navigate(userProfile.role === 'admin' ? '/admin' : '/dashboard');
        return null;
      }
      return <RegisterPage navigate={navigate} />;
    }

    if (currentPath === '/forgot-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }

    // Admin Routes
    if (currentPath.startsWith('/admin')) {
      if (!user || !userProfile) {
        navigate('/login');
        return null;
      }
      if (!isAdmin) {
        // Not authorized as admin -> redirect to student dashboard with error
        if (accessDeniedMessage !== 'Akses ditolak. Halaman ini hanya untuk pentadbir.') {
          setAccessDeniedMessage('Akses ditolak. Halaman ini hanya untuk pentadbir.');
        }
        navigate('/dashboard');
        return null;
      }

      let adminView = <AdminOverviewPage navigate={navigate} />;
      if (currentPath === '/admin/students') {
        adminView = <AdminStudentsPage navigate={navigate} />;
      } else if (currentPath === '/admin/subjects') {
        adminView = <AdminSubjectsPage navigate={navigate} />;
      } else if (currentPath === '/admin/notes') {
        adminView = <AdminNotesPage navigate={navigate} />;
      } else if (currentPath === '/admin/quizzes') {
        adminView = <AdminQuizzesPage navigate={navigate} />;
      } else if (currentPath === '/admin/questions') {
        adminView = <AdminQuestionsPage navigate={navigate} />;
      } else if (currentPath === '/admin/results') {
        adminView = <AdminResultsPage navigate={navigate} />;
      } else if (currentPath === '/admin/announcements') {
        adminView = <AdminAnnouncementsPage navigate={navigate} />;
      } else if (currentPath === '/admin/seminars') {
        adminView = <AdminSeminarsPage navigate={navigate} />;
      } else if (currentPath === '/admin/statistics') {
        adminView = <AdminStatisticsPage navigate={navigate} />;
      } else if (currentPath === '/admin/settings') {
        adminView = <AdminSettingsPage navigate={navigate} />;
      }

      return (
        <AdminLayout currentRoute={currentPath} navigate={navigate}>
          {adminView}
        </AdminLayout>
      );
    }

    // Public Landing (if not logged in)
    if (currentPath === '/' || currentPath === '/landing') {
      if (user && userProfile) {
        navigate(userProfile.role === 'admin' ? '/admin' : '/dashboard');
        return null;
      }
      return (
        <div className="min-h-screen bg-stone-50/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between">
          <Navbar
            onOpenSearch={() => setSearchModalOpen(true)}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            isMobileMenuOpen={mobileMenuOpen}
            currentRoute={currentPath}
            navigate={navigate}
          />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex-1">
            <LandingPage navigate={navigate} />
          </main>
          <footer className="py-6 border-t border-stone-200/80 dark:border-stone-800 text-center text-xs text-stone-400">
            study.dermaa &copy; {new Date().getFullYear()} • Platform Pembelajaran KSSM Malaysia • Belajar. Faham. Kuasai.
          </footer>
        </div>
      );
    }

    // Protected Student Routes (requires login)
    if (!user || !userProfile) {
      navigate('/login');
      return null;
    }

    // Match Note Detail Route: /nota/:noteId
    const noteDetailMatch = currentPath.match(/^\/nota\/([a-zA-Z0-9_-]+)$/);
    if (noteDetailMatch) {
      const noteId = noteDetailMatch[1];
      return (
        <div className="min-h-screen bg-stone-50/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
          <Navbar
            onOpenSearch={() => setSearchModalOpen(true)}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            isMobileMenuOpen={mobileMenuOpen}
            currentRoute={currentPath}
            navigate={navigate}
          />
          <Sidebar
            currentRoute={currentPath}
            navigate={navigate}
            isMobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <NoteDetailPage noteId={noteId} navigate={navigate} />
          </div>
        </div>
      );
    }

    // Match Quiz Detail Route: /kuiz/:quizId
    const quizDetailMatch = currentPath.match(/^\/kuiz\/([a-zA-Z0-9_-]+)$/);
    if (quizDetailMatch) {
      const quizId = quizDetailMatch[1];
      return (
        <div className="min-h-screen bg-stone-50/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
          <Navbar
            onOpenSearch={() => setSearchModalOpen(true)}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            isMobileMenuOpen={mobileMenuOpen}
            currentRoute={currentPath}
            navigate={navigate}
          />
          <Sidebar
            currentRoute={currentPath}
            navigate={navigate}
            isMobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <QuizDetailPage quizId={quizId} navigate={navigate} />
          </div>
        </div>
      );
    }

    // Match Subject Notes Route: /subjek/:subjectId
    const subjectNotesMatch = currentPath.match(/^\/subjek\/([a-zA-Z0-9_-]+)$/);
    if (subjectNotesMatch) {
      const subjectId = subjectNotesMatch[1];
      return (
        <div className="min-h-screen bg-stone-50/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col">
          <Navbar
            onOpenSearch={() => setSearchModalOpen(true)}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            isMobileMenuOpen={mobileMenuOpen}
            currentRoute={currentPath}
            navigate={navigate}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1">
            <div className="flex gap-0 md:gap-8">
              {/* Sidebar: hidden on mobile, w-64 on desktop, drawer portaled */}
              <Sidebar
                currentRoute="/belajar"
                navigate={navigate}
                isMobileOpen={mobileMenuOpen}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
              <main className="w-full flex-1 min-w-0">
                <NotesListPage subjectIdProp={subjectId} navigate={navigate} />
              </main>
            </div>
          </div>
        </div>
      );
    }

    // Student Views with Standard Layout
    let studentView = <DashboardPage navigate={navigate} />;
    if (currentPath === '/belajar' || currentPath === '/learn') {
      studentView = <BelajarPage navigate={navigate} />;
    } else if (currentPath === '/nota' || currentPath === '/notes') {
      studentView = <NotesListPage navigate={navigate} />;
    } else if (currentPath === '/kuiz' || currentPath === '/quizzes' || currentPath === '/quiz') {
      studentView = <QuizListPage navigate={navigate} />;
    } else if (currentPath === '/kemajuan' || currentPath === '/progress') {
      studentView = <ProgressPage navigate={navigate} />;
    } else if (currentPath === '/bookmark' || currentPath === '/bookmarks') {
      studentView = <BookmarksPage navigate={navigate} />;
    } else if (currentPath === '/profil' || currentPath === '/profile') {
      studentView = <ProfilePage navigate={navigate} />;
    } else if (currentPath === '/tetapan' || currentPath === '/settings') {
      studentView = <SettingsPage navigate={navigate} />;
    } else if (currentPath === '/seminars' || currentPath === '/seminar' || currentPath === '/live-seminar') {
      studentView = <SeminarsPage navigate={navigate} />;
    } else if (currentPath === '/ai-tutor' || currentPath === '/tutor') {
      studentView = <AiTutorPage navigate={navigate} />;
    } else if (currentPath === '/dashboard' || currentPath === '/utama') {
      studentView = <DashboardPage navigate={navigate} />;
    }

    return (
      <div className="min-h-screen bg-stone-50/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col relative">
        <Navbar
          onOpenSearch={() => setSearchModalOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMobileMenuOpen={mobileMenuOpen}
          currentRoute={currentPath}
          navigate={navigate}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1">
          <div className="flex gap-0 md:gap-8">
            {/* Sidebar: hidden on mobile, w-64 on desktop, drawer portaled to body */}
            <Sidebar
              currentRoute={currentPath}
              navigate={navigate}
              isMobileOpen={mobileMenuOpen}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />

            {/* Main Content Area: full width on mobile, fills remaining space on desktop */}
            <main className="w-full flex-1 min-w-0">
              {accessDeniedMessage && (
                <div
                  id="access-denied-alert"
                  className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center justify-between shadow-2xs animate-in fade-in slide-in-from-top-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                    <p className="text-xs sm:text-sm font-bold">{accessDeniedMessage}</p>
                  </div>
                  <button
                    onClick={() => setAccessDeniedMessage(null)}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-100 text-xs font-bold underline px-2 py-1"
                  >
                    Tutup
                  </button>
                </div>
              )}
              {studentView}
            </main>
          </div>
        </div>

        {/* Global Search Modal */}
        <GlobalSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          navigate={navigate}
        />

        {/* Floating AI Tutor Widget */}
        <AiTutorWidget navigate={navigate} currentRoute={currentPath} />
      </div>
    );
  };

  // Initial splash screen gatekeeper
  if (showSplash) {
    return (
      <>
        <SplashScreen onFinish={() => setShowSplash(false)} />
        {!loading && renderCurrentRoute()}
      </>
    );
  }

  // Global loading state while resolving auth (if auth is still pending after splash)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-stone-50 dark:bg-stone-950 text-stone-600 dark:text-stone-300">
        <div className="w-12 h-12 rounded-2xl bg-theme-surface text-theme-primary flex items-center justify-center font-black text-xl shadow-xs border border-theme-primary/20 animate-pulse">
          SD
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
          <Loader2 className="w-4 h-4 animate-spin text-theme-primary" />
          <span>Memuatkan study.dermaa...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {renderCurrentRoute()}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        navigate={navigate}
      />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
