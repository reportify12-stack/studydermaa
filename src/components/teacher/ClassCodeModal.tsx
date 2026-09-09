import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClassRoom } from '../../types';
import { X, Copy, Check, QrCode, Share2, RefreshCw } from 'lucide-react';
import { regenerateClassJoinCode } from '../../services/teacherService';

interface ClassCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: ClassRoom | null;
  onCodeRegenerated?: (classId: string, newCode: string) => void;
}

export const ClassCodeModal: React.FC<ClassCodeModalProps> = ({
  isOpen,
  onClose,
  classroom,
  onCodeRegenerated,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  if (!isOpen || !classroom) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(classroom.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm(t('confirm_regenerate_code', 'Adakah anda pasti mahu menjana kod penyertaan baru? Kod lama tidak lagi boleh digunakan.'))) {
      return;
    }
    setRegenerating(true);
    try {
      const newCode = await regenerateClassJoinCode(classroom.id);
      if (onCodeRegenerated) {
        onCodeRegenerated(classroom.id, newCode);
      }
    } catch (err) {
      console.error('Failed to regenerate join code:', err);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div
      id="class-code-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="class-code-modal-container"
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-2xl overflow-hidden text-center p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-class-code-modal-btn"
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 mb-2">
          {classroom.schoolName || 'SMK Derma'}
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-display">
          {classroom.name}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          {classroom.tingkatan} • {classroom.subject}
        </p>

        {/* Big Projection Code Card */}
        <div className="my-6 p-6 sm:p-8 rounded-3xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 shadow-inner">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">
            {t('class_join_code', 'Kod Penyertaan Kelas')}
          </p>
          <div
            id="display-class-join-code"
            className="text-4xl sm:text-6xl font-black font-mono tracking-widest text-emerald-600 dark:text-emerald-400 select-all"
          >
            {classroom.joinCode}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-4">
            {t('instruct_students_to_join', 'Minta murid masukkan kod ini pada peranti mereka untuk menyertai kelas.')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="copy-class-code-btn"
            type="button"
            onClick={handleCopyCode}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>{t('copied_to_clipboard', 'Disalin!')}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t('copy_class_code', 'Salin Kod Kelas')}</span>
              </>
            )}
          </button>

          <button
            id="regenerate-class-code-btn"
            type="button"
            disabled={regenerating}
            onClick={handleRegenerate}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{t('reset_code', 'Jana Kod Baru')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
