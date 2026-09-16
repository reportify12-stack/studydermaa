import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  Award,
  ChevronLeft,
  LayoutDashboard,
  PlayCircle,
  History,
  GraduationCap,
  Crown,
} from 'lucide-react';

interface PkskLayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  navigate: (route: string) => void;
}

export const PkskLayout: React.FC<PkskLayoutProps> = ({ children, currentRoute, navigate }) => {
  const { userProfile } = useAuth();
  const level = userProfile?.pksk_target_level || (userProfile?.tingkatan === 'Tingkatan 3' ? 'Tingkatan 3' : 'Tahun 6');
  const targetSchool = userProfile?.pksk_sekolah_pilihan || 'MRSM Pengkalan Chepa';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Exclusive Premium Portal Top Header */}
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-stone-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-18 flex items-center justify-between gap-4">
            {/* Left: Exclusive Brand & Portal Tag */}
            <div className="flex items-center gap-3.5">
              <button
                id="pksk-exit-portal-btn"
                onClick={() => navigate('/dashboard')}
                className="p-2 -ml-2 rounded-xl text-stone-400 hover:text-amber-400 hover:bg-stone-900 transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Kembali ke Dashboard Utama"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden md:inline">study.dermaa</span>
              </button>

              <div className="h-6 w-px bg-stone-800 hidden md:block" />

              <div
                onClick={() => navigate('/pksk')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 p-0.5 shadow-md shadow-amber-500/10 transition-transform group-hover:scale-105">
                  <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center">
                    <Crown className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                      PORTAL PKSK
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      PREMIUM
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 font-medium line-clamp-1 hidden sm:block">
                    Pentaksiran Kemasukan Sekolah Khusus (MRSM • SBP • SMKA • MTD)
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Target School & Navigation Tabs */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs">
                <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-stone-400">Sasaran:</span>
                <span className="font-bold text-amber-200 max-w-[160px] truncate">{targetSchool}</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                  {level}
                </span>
              </div>

              <div className="flex items-center bg-stone-900/90 rounded-xl p-1 border border-stone-800 text-xs font-semibold">
                <button
                  id="pksk-nav-dashboard"
                  onClick={() => navigate('/pksk')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    currentRoute === '/pksk' || currentRoute === '/pksk/dashboard'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>

                <button
                  id="pksk-nav-simulation"
                  onClick={() => navigate('/pksk/simulasi')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    currentRoute.startsWith('/pksk/simulasi')
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Simulasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Exclusive Portal Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Exclusive Portal Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950/60 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Format Selaras Piawaian Pentaksiran KPM & MARA 2026</span>
          </div>
          <p>
            Modul PKSK Eksklusif • Kecerdasan Insaniah (20%) • Kecerdasan Intelek (70%) • Artikulasi Penulisan (10%)
          </p>
        </div>
      </footer>
    </div>
  );
};
