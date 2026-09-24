import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { joinClassByCode, JoinClassResult } from '../../services/teacherService';
import { ClassRoom } from '../../types';
import {
  GraduationCap,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Sparkles,
  ArrowRight,
  BookOpen,
  School,
  X,
} from 'lucide-react';

interface JoinClassSectionProps {
  onClassJoined?: (newClass: ClassRoom) => void;
  className?: string;
  showModalTriggerOnly?: boolean;
}

export const JoinClassSection: React.FC<JoinClassSectionProps> = ({
  onClassJoined,
  className = '',
  showModalTriggerOnly = false,
}) => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();

  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [joinedClass, setJoinedClass] = useState<ClassRoom | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userProfile) return;

    const trimmed = classCode.trim().toUpperCase();
    if (!trimmed) {
      setErrorMsg('Sila masukkan kod kelas yang diberikan oleh guru anda.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res: JoinClassResult = await joinClassByCode(trimmed, userProfile.uid);

      if (res.success && res.classRoom) {
        setJoinedClass(res.classRoom);
        setSuccessMsg(
          `Tahniah! Anda berjaya menyertai kelas "${res.classRoom.name}" (${res.classRoom.subject}) yang dikendalikan oleh ${res.classRoom.teacherName}.`
        );
        setClassCode('');
        if (onClassJoined) {
          onClassJoined(res.classRoom);
        }
      } else {
        setErrorMsg(res.error || 'Kod kelas tidak sah atau telah berlaku ralat.');
      }
    } catch (err: any) {
      console.error('Join class error:', err);
      setErrorMsg(err?.message || 'Ralat sambungan. Sila semak talian internet anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessMsg(null);
    setJoinedClass(null);
    if (isModalOpen) setIsModalOpen(false);
  };

  const formContent = (
    <div className="space-y-4">
      {/* Alerts */}
      {errorMsg && (
        <div
          id="join-class-error-alert"
          className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-start gap-3 text-xs font-semibold animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5 text-rose-700 dark:text-rose-300">
              Penyertaan Tidak Berjaya
            </span>
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMsg && (
        <div
          id="join-class-success-alert"
          className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 space-y-2 animate-in fade-in"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-bold text-sm block mb-1 text-emerald-800 dark:text-emerald-300">
                Berjaya Menyertai Kelas! 🎉
              </span>
              <p className="leading-relaxed">{successMsg}</p>
            </div>
            <button
              type="button"
              onClick={handleCloseSuccess}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {joinedClass && (
            <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1">
                <School className="w-3.5 h-3.5" /> {joinedClass.schoolName || 'SMK Derma'}
              </span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                {joinedClass.tingkatan}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Input & Join Button Form */}
      <form onSubmit={handleJoin} className="space-y-3">
        <div>
          <label
            htmlFor="join-class-code-input"
            className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5"
          >
            Kod Jemputan Kelas (Class Code) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="join-class-code-input"
              type="text"
              maxLength={8}
              value={classCode}
              onChange={(e) => {
                setClassCode(e.target.value.toUpperCase());
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="cth: DRM4X2"
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono font-bold tracking-widest text-base sm:text-lg focus:outline-hidden focus:border-theme-primary focus:ring-4 focus:ring-theme-primary/10 transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-xs placeholder:text-stone-400"
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 flex items-center gap-1.5">
            <span>Dapatkan kod 6-aksara daripada guru mata pelajaran anda.</span>
          </p>
        </div>

        <button
          id="join-class-submit-btn"
          type="submit"
          disabled={loading || !classCode.trim()}
          className="w-full py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyertai Kelas...</span>
            </>
          ) : (
            <>
              <GraduationCap className="w-4 h-4" />
              <span>Sertai Kelas Sekarang / Join Class</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  // If only showing the trigger button for a modal
  if (showModalTriggerOnly) {
    return (
      <>
        <button
          id="open-join-class-modal-btn"
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Sertai Kelas</span>
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display">
                      Sertai Kelas Guru
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Masukkan kod jemputan kelas anda
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formContent}
            </div>
          </div>
        )}
      </>
    );
  }

  // Full section card layout for student dashboard
  return (
    <div
      id="join-class-card"
      className={`p-5 sm:p-6 rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/90 shadow-xs relative overflow-hidden ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-stone-100 dark:border-stone-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
                Sertai Kelas Guru (Join Class)
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                Bilik Darjah
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Sambungkan akaun anda ke bilik darjah SMK Derma untuk menerima tugasan, nota, dan penilaian.
            </p>
          </div>
        </div>
      </div>

      {formContent}
    </div>
  );
};
