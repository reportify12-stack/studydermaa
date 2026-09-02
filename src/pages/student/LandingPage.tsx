import React, { useState, useEffect } from 'react';
import { getPublishedSubjects } from '../../services/contentService';
import { Subject } from '../../types';
import {
  BookOpen,
  HelpCircle,
  TrendingUp,
  Award,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    getPublishedSubjects()
      .then((list) => setSubjects(list.slice(0, 6)))
      .catch(() => {});
  }, []);

  return (
    <div id="landing-page-root" className="space-y-16 pb-20 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center pt-8 sm:pt-14 max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-theme-surface text-theme-primary text-xs font-bold border border-theme-primary/30 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Platform Pembelajaran KSSM Malaysia</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 dark:text-stone-50 font-display tracking-tight leading-tight">
          Belajar Lebih Mudah, <br />
          <span className="text-theme-primary">Faham & Kuasai</span> Setiap Topik.
        </h1>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl mx-auto">
          Akses modul nota padat, soalan KBAT, dan latihan kuiz interaktif Tingkatan 1 hingga 5 secara percuma di <strong>study.dermaa</strong>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="hero-register-btn"
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-sm btn-theme-primary shadow-md flex items-center justify-center gap-2"
          >
            <span>Daftar Akaun Pelajar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="hero-login-btn"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
          >
            Log Masuk
          </button>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
            Nota Padat & Ringkas
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Disusun mengikut standard DSKP KSSM terbaharu dengan rumusan fakta utama untuk ulangkaji pantas.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
            Kuiz & Soalan KBAT
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Semak tahap pemahaman melalui soalan objektif, subjektif, dan skema penjelasan yang komprehensif.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
            Gamifikasi & Streak
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Bina tabiat belajar yang konsisten dengan sistem rentak pembelajaran harian dan mata pengalaman (XP).
          </p>
        </div>
      </section>

      {/* Featured Subjects */}
      {subjects.length > 0 && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 font-display">
              Mata Pelajaran KSSM
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Meliputi mata pelajaran teras, elektif, dan bahasa untuk Tingkatan 1 hingga Tingkatan 5
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 text-center shadow-2xs"
              >
                <div className="w-10 h-10 rounded-xl bg-theme-surface text-theme-primary mx-auto flex items-center justify-center font-bold text-sm mb-2 border border-theme-primary/20">
                  {sub.code || sub.name.substring(0, 2)}
                </div>
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                  {sub.name}
                </h4>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to action footer banner */}
      <section className="p-8 sm:p-12 rounded-3xl btn-theme-primary text-white shadow-xl text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
          Mulakan Perjalanan Akademik Anda Hari Ini
        </h2>
        <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto">
          Cipta akaun pelajar anda dalam masa 30 saat dan teroka dunia pembelajaran digital yang mudah dan berkesan.
        </p>
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-3 rounded-xl bg-white text-stone-900 font-black text-xs sm:text-sm shadow-md hover:bg-stone-100 transition-colors"
        >
          Daftar Percuma Sekarang
        </button>
      </section>
    </div>
  );
};
