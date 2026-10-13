import React from 'react';
import {
  Target,
  Flame,
  Sparkles,
  Gamepad2,
  Check,
  Shield,
  Zap,
  Clock,
  HeartPulse,
  Layers,
  ChevronRight,
  Award,
} from 'lucide-react';

export type QuizModeType = 'focus' | 'survival' | 'match3';

export interface QuizModeSelectorProps {
  selectedMode: QuizModeType;
  onSelectMode: (mode: QuizModeType) => void;
  onStartQuiz: () => void;
  quizTitle: string;
  totalQuestions: number;
  durationMinutes: number;
}

export const QuizModeSelector: React.FC<QuizModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  onStartQuiz,
  quizTitle,
  totalQuestions,
  durationMinutes,
}) => {
  const modes = [
    {
      id: 'focus' as const,
      name: 'Mod Fokus',
      badge: 'Peperiksaan Piawai',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      icon: Target,
      accentGradient: 'from-indigo-500 to-sky-600',
      borderActive: 'border-indigo-500 ring-2 ring-indigo-500/30',
      bgActive: 'bg-indigo-50/40 dark:bg-indigo-950/20',
      tagline: 'Simulasi Peperiksaan Sebenar & Ulangkaji Bersih',
      description:
        'Sesuai untuk ujian format SPM/KSSM tanpa sebarang gangguan. Jawab soalan satu demi satu dengan pemasa rasmi.',
      features: [
        'Format peperiksaan objektif rasmi KSSM',
        'Navigasi grid soalan bebas',
        'Pemasa berperingkat mengikut durasi kuiz',
        'Ulasan jawapan dan penerangan penuh',
      ],
      xpBonus: '1x XP Piawai',
    },
    {
      id: 'survival' as const,
      name: 'Mod Survival',
      badge: 'Dinosaur Runner 🦖',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: Flame,
      accentGradient: 'from-emerald-500 to-teal-600',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-500/30',
      bgActive: 'bg-emerald-50/40 dark:bg-emerald-950/20',
      tagline: 'Lari, Lompat & Jawab Soalan untuk Revive!',
      description:
        'Kawal dinosaur retro melompat kaktus. Apabila terlanggar, jawab soalan kuiz untuk hidup kembali dan teruskan rekod larian!',
      features: [
        'Kawalan papan kekunci (Spacebar) & sentuhan mudah alih',
        'Soalan kuiz menjadi talian hayat (Revive)',
        'Jawapan betul beri kebal sementara & skor berganda',
        'Cabaran refleks pantas & fokus tinggi',
      ],
      xpBonus: '1.5x XP Bonus Survival',
    },
    {
      id: 'match3' as const,
      name: 'Mod Teka-Teki',
      badge: 'Match-3 Gems 💎',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: Sparkles,
      accentGradient: 'from-rose-500 via-pink-500 to-purple-600',
      borderActive: 'border-rose-500 ring-2 ring-rose-500/30',
      bgActive: 'bg-rose-50/40 dark:bg-rose-950/20',
      tagline: 'Padan Permata & Jawab Soalan Untuk Tambah Moves',
      description:
        'Papan teka-teki Match-3 Candy Crush style! Setiap jawapan tepat pada kuiz menambah +5 langkah bagi meledakkan kombo!',
      features: [
        'Grid 7x7 permata warna-warni & kesan letupan',
        'Butang khusus "Jawab Soalan Untuk +5 Moves"',
        'Cipta kombo 3, 4, dan 5 baris berturut-turut',
        'Latihan santai merangsang pemikiran logik',
      ],
      xpBonus: '1.5x XP Bonus Kombo',
    },
  ];

  return (
    <div id="quiz-mode-selection" className="space-y-8 animate-fade-in">
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-theme-surface text-theme-primary text-xs font-bold border border-theme-primary/30 shadow-2xs">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Pilih Gaya Pembelajaran Anda</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-stone-900 dark:text-stone-100">
          Mod Gamifikasi Kuiz
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          Pilih mod yang sesuai dengan tenaga dan matlamat belajar anda hari ini. Semua soalan kuiz tetap direkodkan ke dalam profil pembelajaran anda.
        </p>
      </div>

      {/* 3 Large Aesthetic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id;
          const Icon = mode.icon;

          return (
            <div
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`group relative p-6 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 ${
                isSelected
                  ? `${mode.borderActive} ${mode.bgActive} shadow-xl scale-101`
                  : 'border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-md hover:-translate-y-1'
              }`}
            >
              {/* Selected Tick Indicator */}
              <div className="absolute top-5 right-5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-theme-primary text-white shadow-md'
                      : 'border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Card Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mode.accentGradient} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${mode.badgeColor}`}
                    >
                      {mode.badge}
                    </span>
                    <h3 className="text-xl font-black font-display text-stone-900 dark:text-stone-100 mt-1">
                      {mode.name}
                    </h3>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200 leading-snug">
                    {mode.tagline}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    {mode.description}
                  </p>
                </div>

                {/* Feature Bullet Points */}
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                  {mode.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-stone-600 dark:text-stone-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-primary mt-1.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Tag */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">Ganjaran:</span>
                <span className="text-xs font-black text-theme-primary flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{mode.xpBonus}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Action Bar */}
      <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
            <span>Kuiz Dipilih:</span>
            <span className="text-theme-primary font-black">{quizTitle}</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Mengandungi <strong>{totalQuestions} Soalan</strong> • Mod Aktif:{' '}
            <strong className="text-stone-800 dark:text-stone-200">
              {selectedMode === 'focus'
                ? 'Mod Fokus (Piawai)'
                : selectedMode === 'survival'
                ? 'Mod Survival (Dinosaur Game)'
                : 'Mod Teka-Teki (Match-3 Gems)'}
            </strong>
          </p>
        </div>

        <button
          id="confirm-start-quiz-btn"
          type="button"
          onClick={onStartQuiz}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm btn-theme-primary shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <span>MULA DENGAN {selectedMode === 'focus' ? 'MOD FOKUS' : selectedMode === 'survival' ? 'MOD SURVIVAL' : 'MOD TEKA-TEKI'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
