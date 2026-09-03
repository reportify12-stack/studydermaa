import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  GraduationCap,
  Calculator,
  FlaskConical,
  Landmark,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ChatUI } from '../../components/tutor/ChatUI';
import { KSSM_TUTOR_SUBJECTS } from '../../config/aiTutorConfig';

interface AiTutorPageProps {
  navigate: (route: string) => void;
}

export const AiTutorPage: React.FC<AiTutorPageProps> = ({ navigate }) => {
  const { userProfile } = useAuth();
  const [activeSubject, setActiveSubject] = useState<string>('all');

  const studentName = userProfile?.fullName || userProfile?.username || 'Pelajar';
  const tingkatan = userProfile?.tingkatan || 'KSSM';

  return (
    <div id="ai-tutor-dedicated-page" className="space-y-6">
      {/* Top Banner & Introduction */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent dark:from-emerald-950/40 dark:via-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-theme-primary px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
              KSSM Smart Assistant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-display">
            CikguDermarians
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
            Tutor pintar dan pembimbing peribadi khas untuk <strong>{studentName}</strong> ({tingkatan}). Tanyakan
            sebarang persoalan konsep KSSM, langkah kerja pengiraan, formula sains, atau teknik
            menjawab esei peperiksaan secara terperinci.
          </p>
        </div>

        {/* Quick Capabilities Pill Grid */}
        <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Penerangan Langkah Demi Langkah</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Format Peperiksaan KSSM & SPM</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Bilingual (Bahasa Melayu & English)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat Area + Side Guidance Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat UI Component Column */}
        <div className="lg:col-span-8 xl:col-span-9 order-2 lg:order-1">
          <ChatUI compact={false} title="Sesi Bimbingan CikguDermarians" />
        </div>

        {/* Sidebar Guidance & Study Tips Column */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4 order-1 lg:order-2">
          {/* Tip Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3>Tip Menyoal CikguDermarians</h3>
            </div>
            <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Sebutkan subjek dan topik:</strong> Contoh: <em>"Fizik Tingkatan 4: Hukum Gerakan Newton"</em>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Minta langkah kerja terperinci:</strong> Contoh: <em>"Tunjukkan jalan kerja pemfaktoran kuadratik satu demi satu"</em>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Uji kefahaman KBAT:</strong> Minta CikguDermarians memberikan 1 soalan mencabar untuk anda cuba jawab.
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Subject Launchers */}
          <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
                <GraduationCap className="w-4 h-4 text-theme-primary" />
                <h3>Pilihan Subjek KSSM</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => navigate('/belajar')}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-left transition-colors border border-stone-200/60 dark:border-stone-700/60 flex flex-col gap-1"
              >
                <Calculator className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Matematik</span>
                <span className="text-[10px] text-stone-400">Nota & Kuiz</span>
              </button>

              <button
                onClick={() => navigate('/belajar')}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-left transition-colors border border-stone-200/60 dark:border-stone-700/60 flex flex-col gap-1"
              >
                <FlaskConical className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Sains</span>
                <span className="text-[10px] text-stone-400">Nota & Kuiz</span>
              </button>

              <button
                onClick={() => navigate('/belajar')}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-left transition-colors border border-stone-200/60 dark:border-stone-700/60 flex flex-col gap-1"
              >
                <Landmark className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Sejarah</span>
                <span className="text-[10px] text-stone-400">Nota & Kuiz</span>
              </button>

              <button
                onClick={() => navigate('/belajar')}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-left transition-colors border border-stone-200/60 dark:border-stone-700/60 flex flex-col gap-1"
              >
                <BookOpen className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">B. Melayu</span>
                <span className="text-[10px] text-stone-400">Nota & Kuiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
