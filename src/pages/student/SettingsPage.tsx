import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeSelector } from '../../components/common/ThemeSelector';
import { Palette, LogOut, Info, ShieldCheck, Heart } from 'lucide-react';

interface SettingsPageProps {
  navigate: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ navigate }) => {
  const { userProfile, logout } = useAuth();

  return (
    <div id="settings-page" className="max-w-3xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight mb-2">
          Tetapan & Tema
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
          Sesuaikan pengalaman visual platform mengikut citarasa anda dengan pilihan tema pastel yang menenangkan mata.
        </p>
      </div>

      {/* Theme Customizer Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
          <Palette className="w-5 h-5 text-theme-primary" />
          <span>Kustomisasi Tema Visual</span>
        </div>

        <ThemeSelector />
      </div>

      {/* About study.dermaa Platform */}
      <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
          <Info className="w-5 h-5 text-theme-primary" />
          <span>Mengenai study.dermaa</span>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          <strong>study.dermaa</strong> merupakan platform pembelajaran digital inovatif yang dibina khusus untuk menyokong pelajar sekolah menengah di Malaysia mengikut Kurikulum Standard Sekolah Menengah (KSSM). Platform ini berpegang kepada moto <em>&quot;Belajar. Faham. Kuasai.&quot;</em> untuk membantu setiap pelajar mencapai potensi akademik terbaik.
        </p>
        <div className="pt-2 flex items-center gap-2 text-[11px] text-stone-400">
          <span>Versi 1.0.0 (Production)</span>
          <span>•</span>
          <span>Silibus KSSM Malaysia</span>
        </div>
      </div>

      {/* Account Actions */}
      {userProfile && (
        <div className="p-6 rounded-3xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Log Keluar Akaun
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Tamatkan sesi aktif pada peranti ini secara selamat.
            </p>
          </div>
          <button
            id="settings-logout-btn"
            onClick={() => logout()}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Keluar</span>
          </button>
        </div>
      )}
    </div>
  );
};
