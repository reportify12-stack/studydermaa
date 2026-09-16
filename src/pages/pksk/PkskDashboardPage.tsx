import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  PkskLevel,
  PkskSimulationResult,
  PKSK_TARGET_SCHOOLS,
} from '../../types/pksk';
import {
  fetchUserPkskAttempts,
  updateStudentTargetSchool,
  updateStudentTargetLevel,
  updateStudentExamDate,
} from '../../services/pkskService';
import {
  PlayCircle,
  GraduationCap,
  Clock,
  Edit3,
  Calendar,
  Sparkles,
  Trophy,
  Brain,
  Zap,
  CheckCircle2,
  ChevronRight,
  School,
  X,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface PkskDashboardPageProps {
  navigate: (route: string) => void;
}

export const PkskDashboardPage: React.FC<PkskDashboardPageProps> = ({ navigate }) => {
  const { user, userProfile, refreshProfile } = useAuth();

  // Target level state (Tahun 6 vs Tingkatan 3)
  const currentLevel: PkskLevel =
    userProfile?.pksk_target_level ||
    (userProfile?.tingkatan === 'Tingkatan 3' ? 'Tingkatan 3' : 'Tahun 6');

  // Target school state
  const currentTargetSchool =
    userProfile?.pksk_sekolah_pilihan || 'MRSM Pengkalan Chepa (Premier)';

  // Target exam date: default mid October 2026
  const currentExamDate =
    userProfile?.pksk_exam_date || '2026-10-15T08:30:00';

  // Modal states
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(currentTargetSchool);
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [isSavingSchool, setIsSavingSchool] = useState(false);

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [customDateValue, setCustomDateValue] = useState(currentExamDate.split('T')[0]);

  // Attempts history
  const [attempts, setAttempts] = useState<PkskSimulationResult[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  // Dynamic Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  // Calculate live countdown
  useEffect(() => {
    const updateCountdown = () => {
      const examTime = new Date(currentExamDate).getTime();
      const now = new Date().getTime();
      const difference = examTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [currentExamDate]);

  // Load past simulation attempts
  useEffect(() => {
    let isMounted = true;
    if (user) {
      fetchUserPkskAttempts(user.uid)
        .then((res) => {
          if (isMounted) {
            setAttempts(res);
            setLoadingAttempts(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoadingAttempts(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle Level Toggle
  const handleLevelChange = async (newLevel: PkskLevel) => {
    if (!user) return;
    try {
      await updateStudentTargetLevel(user.uid, newLevel);
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      console.error('Failed to change PKSK level:', err);
    }
  };

  // Handle Save Target School
  const handleSaveSchool = async () => {
    if (!user) return;
    const schoolToSave = customSchoolName.trim() || selectedSchool;
    if (!schoolToSave) return;

    setIsSavingSchool(true);
    try {
      await updateStudentTargetSchool(user.uid, schoolToSave);
      if (refreshProfile) await refreshProfile();
      setIsSchoolModalOpen(false);
      setCustomSchoolName('');
    } catch (err) {
      console.error('Failed to update target school:', err);
    } finally {
      setIsSavingSchool(false);
    }
  };

  // Handle Save Exam Date
  const handleSaveDate = async () => {
    if (!user || !customDateValue) return;
    try {
      const fullDate = `${customDateValue}T08:30:00`;
      await updateStudentExamDate(user.uid, fullDate);
      if (refreshProfile) await refreshProfile();
      setIsDateModalOpen(false);
    } catch (err) {
      console.error('Failed to update exam date:', err);
    }
  };

  // Average score calculation
  const averageScore = attempts.length > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.scorePercentage, 0) / attempts.length)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Greeting & Level Selector */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PKSK 2026
              </span>
              <span className="text-xs text-stone-400">
                Pentaksiran Kemasukan Sekolah Khusus
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Selamat Datang, {userProfile?.fullName || 'Calon PKSK'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl">
              Portal simulasi berformat rasmi KPM & MARA. Latih tubi soalan Kecerdasan Insaniah (EQ) dan Kecerdasan Intelek (IQ) dengan bimbingan analitik pintar.
            </p>
          </div>

          {/* Level Toggle: Tahun 6 vs Tingkatan 3 */}
          <div className="bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 flex items-center shrink-0">
            <button
              id="pksk-level-tahun-6-btn"
              onClick={() => handleLevelChange('Tahun 6')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentLevel === 'Tahun 6'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Tahun 6 (Ke Tingkatan 1)
            </button>
            <button
              id="pksk-level-tingkatan-3-btn"
              onClick={() => handleLevelChange('Tingkatan 3')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentLevel === 'Tingkatan 3'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Tingkatan 3 (Ke Tingkatan 4)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Countdown + Sekolah Pilihan + Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Countdown Timer Section (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-stone-900/80 border border-stone-800/80 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Kiraan Detik Hari Peperiksaan</h2>
                <p className="text-xs text-stone-400">
                  Sasaran: {new Date(currentExamDate).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <button
              id="pksk-edit-date-btn"
              onClick={() => setIsDateModalOpen(true)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Tukar Tarikh</span>
            </button>
          </div>

          {/* Countdown Clock Units */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 my-2">
            {[
              { label: 'HARI', value: timeLeft.days },
              { label: 'JAM', value: timeLeft.hours },
              { label: 'MINIT', value: timeLeft.minutes },
              { label: 'SAAT', value: timeLeft.seconds },
            ].map((unit, idx) => (
              <div
                key={idx}
                className="p-3 sm:p-4 rounded-2xl bg-stone-950/70 border border-stone-800/90 text-center flex flex-col items-center justify-center"
              >
                <div className="text-2xl sm:text-4xl font-black text-amber-400 tabular-nums tracking-tight">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mt-1">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sesi Pentaksiran Berpusat KPM 2026</span>
            </div>
            <span className="text-stone-500 font-medium">Baki masa persediaan diri</span>
          </div>
        </div>

        {/* Sekolah Pilihan (Target School) Section (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-stone-900/80 border border-stone-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Sekolah Pilihan</h2>
                  <p className="text-xs text-stone-400">Institusi sasaran kemasukan</p>
                </div>
              </div>

              <button
                id="pksk-edit-school-btn"
                onClick={() => {
                  setSelectedSchool(currentTargetSchool);
                  setIsSchoolModalOpen(true);
                }}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah</span>
              </button>
            </div>

            {/* Display Target School Badge & Info */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-950 to-stone-900 border border-stone-800/90 mt-2">
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Pilihan Utama
                </span>
                <span className="text-[11px] font-semibold text-stone-400">
                  Sasaran: {currentLevel}
                </span>
              </div>
              <h3 className="text-lg font-black text-white leading-snug">
                {currentTargetSchool}
              </h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Persaingan kemasukan memerlukan markah seimbang dalam komponen Kecerdasan Insaniah (20%) dan Kecerdasan Intelek (70%).
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs">
            <span className="text-stone-400 font-medium">Status Penanda Aras</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gred Layak: 80% Ke Atas</span>
            </span>
          </div>
        </div>
      </div>

      {/* Prominent 'Mula Simulasi' Action Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 text-stone-950 shadow-xl shadow-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/15 text-stone-950 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulasi Masa Nyata AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Bersedia untuk Ujian PKSK Hari Ini?
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-stone-900/85 mt-1 leading-relaxed">
            Mulakan set simulasi 5 soalan (2 Kecerdasan Insaniah + 3 Kecerdasan Intelek) khas mengikut silibus dan sekolah pilihan anda.
          </p>
        </div>

        <button
          id="pksk-start-simulation-btn"
          onClick={() => navigate('/pksk/simulasi')}
          className="w-full md:w-auto px-8 py-4 rounded-2xl bg-stone-950 hover:bg-stone-900 text-amber-300 font-black text-base shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 shrink-0 cursor-pointer"
        >
          <PlayCircle className="w-6 h-6 text-amber-400" />
          <span>Mula Simulasi</span>
          <ArrowUpRight className="w-5 h-5 text-amber-400" />
        </button>
      </div>

      {/* Statistics & Past Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Past Attempts Table/Cards (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-stone-900/80 border border-stone-800/80">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Rekod Percubaan Simulasi</h2>
            </div>
            <span className="text-xs text-stone-400 font-medium">
              {attempts.length} Percubaan
            </span>
          </div>

          {loadingAttempts ? (
            <div className="py-10 text-center text-xs text-stone-400">
              Memuatkan rekod simulasi...
            </div>
          ) : attempts.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-stone-950/40 border border-stone-800/60 p-6">
              <Brain className="w-10 h-10 text-stone-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-white mb-1">Belum Ada Percubaan Simulasi</p>
              <p className="text-xs text-stone-400 max-w-sm mx-auto mb-4">
                Uji tahap kecerdasan insaniah dan kecerdasan intelek anda sekarang untuk melihat analisis markah.
              </p>
              <button
                onClick={() => navigate('/pksk/simulasi')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 transition-colors"
              >
                <span>Mula Ujian Pertama</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.slice(0, 5).map((att, idx) => (
                <div
                  key={att.id || idx}
                  className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                        att.scorePercentage >= 80
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : att.scorePercentage >= 60
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {att.scorePercentage}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{att.sekolahPilihan}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-300">
                          {att.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Betul {att.correctCount} / {att.totalQuestions} • EQ: {att.insaniahScore.correct}/{att.insaniahScore.total} • IQ: {att.intelekScore.correct}/{att.intelekScore.total}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-xs text-stone-500">
                    {new Date(att.completedAt).toLocaleDateString('ms-MY', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PKSK Format Guide & Blueprint (4 cols) */}
        <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-stone-900/80 border border-stone-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Komposisi PKSK KPM</h2>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400">Bahagian A: Kecerdasan Insaniah</span>
                  <span className="font-black text-white">20%</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  EQ, keperibadian, kematangan emosi, empati, integriti, dan kepimpinan asrama.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-indigo-400">Bahagian B: Kecerdasan Intelek</span>
                  <span className="font-black text-white">70%</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  IQ, penaakulan logik, celik STEM, aplikasi sains, dan kenegaraan/sejarah Malaysia.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-400">Bahagian C: Artikulasi Penulisan</span>
                  <span className="font-black text-white">10%</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Kemahiran mengekspresi pandangan secara kritis dan bernas dalam Bahasa Melayu.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-400">Purata Skor Anda:</span>
            <span className="font-black text-amber-400 text-sm">{averageScore}%</span>
          </div>
        </div>
      </div>

      {/* Modal: Edit Target School */}
      {isSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-stone-900 border border-stone-800 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsSchoolModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <School className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Pilih Sekolah Sasaran</h3>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              Pilih institusi sekolah khusus yang menjadi impian kemasukan anda:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 mb-4">
              {PKSK_TARGET_SCHOOLS.map((school) => (
                <button
                  key={school.id}
                  type="button"
                  onClick={() => {
                    setSelectedSchool(school.name);
                    setCustomSchoolName('');
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedSchool === school.name && !customSchoolName
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{school.name}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">{school.description}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-stone-800 text-stone-300 shrink-0 ml-2">
                    {school.badge}
                  </span>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                Atau masukkan nama sekolah lain:
              </label>
              <input
                type="text"
                value={customSchoolName}
                onChange={(e) => setCustomSchoolName(e.target.value)}
                placeholder="Contoh: Kolej GENIUS@Pintar Negara"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSchoolModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-bold text-stone-300 hover:bg-stone-700 transition-colors"
              >
                Batal
              </button>
              <button
                id="pksk-confirm-school-btn"
                type="button"
                disabled={isSavingSchool}
                onClick={handleSaveSchool}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSavingSchool ? 'Menyimpan...' : 'Simpan Pilihan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Exam Date */}
      {isDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-stone-900 border border-stone-800 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsDateModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Tarikh Peperiksaan PKSK</h3>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              Pilih tarikh sesi pentaksiran PKSK sebenar yang dijadualkan oleh pihak sekolah anda:
            </p>

            <div className="mb-5">
              <input
                type="date"
                value={customDateValue}
                onChange={(e) => setCustomDateValue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-bold text-stone-300 hover:bg-stone-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveDate}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Kemas Kini Pemasa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
