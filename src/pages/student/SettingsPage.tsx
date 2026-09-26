import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeSelector } from '../../components/common/ThemeSelector';
import { updateUserProfile } from '../../firebase/authService';
import { Palette, LogOut, Info, ShieldCheck, Heart, Globe, CheckCircle2, Loader2 } from 'lucide-react';

interface SettingsPageProps {
  navigate: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ navigate }) => {
  const { userProfile, logout, refreshProfile } = useAuth();
  const [updatingDlp, setUpdatingDlp] = useState(false);
  const [dlpSuccess, setDlpSuccess] = useState(false);

  const handleToggleDlp = async (newVal: boolean) => {
    if (!userProfile) return;
    setUpdatingDlp(true);
    setDlpSuccess(false);
    try {
      await updateUserProfile(userProfile.uid, { isDLP: newVal });
      await refreshProfile();
      setDlpSuccess(true);
      setTimeout(() => setDlpSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating DLP setting:', err);
    } finally {
      setUpdatingDlp(false);
    }
  };

  return (
    <div id="settings-page" className="max-w-3xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight mb-2">
          Tetapan Pembelajaran & Tema
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
          Sesuaikan bahasa pembelajaran kurikulum DLP dan pengalaman visual tema platform mengikut citarasa anda.
        </p>
      </div>

      {/* Dual Language Programme (DLP) Settings Card */}
      {userProfile && (
        <div className="p-6 sm:p-8 rounded-3xl border border-sky-200/80 dark:border-sky-800/80 bg-white dark:bg-stone-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm font-bold text-stone-900 dark:text-stone-100">
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span>Program DwiBahasa (Dual Language Programme - DLP)</span>
                <p className="text-[11px] font-normal text-stone-500 dark:text-stone-400">
                  Diguna pakai secara khusus untuk subjek <strong>Matematik</strong> dan <strong>Sains</strong>.
                </p>
              </div>
            </div>
            {updatingDlp && <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />}
          </div>

          <div className="p-4 rounded-2xl border border-sky-100 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Status DLP Akaun:
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                    userProfile.isDLP
                      ? 'bg-sky-500 text-white'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {userProfile.isDLP ? 'DLP (Versi Bahasa Inggeris)' : 'Bukan DLP (Versi Bahasa Melayu)'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xl">
                Bila diaktifkan, nota dan latihan bagi subjek <strong>Matematik</strong> dan <strong>Sains</strong> akan ditapis secara automatik kepada kandungan versi Bahasa Inggeris (DLP).
              </p>
            </div>

            {/* Switch Toggle */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                id="settings-dlp-toggle"
                type="checkbox"
                checked={Boolean(userProfile.isDLP)}
                onChange={(e) => handleToggleDlp(e.target.checked)}
                disabled={updatingDlp}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {dlpSuccess && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Status DLP berjaya dikemaskini dalam pangkalan data!</span>
            </div>
          )}
        </div>
      )}

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
