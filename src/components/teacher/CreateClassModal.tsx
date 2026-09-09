import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TingkatanType, TINGKATAN_OPTIONS, KSSM_DEFAULT_SUBJECTS, ClassRoom } from '../../types';
import { createClass } from '../../services/teacherService';
import { X, School, BookOpen, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  defaultSchool?: string;
  onClassCreated: (newClass: ClassRoom) => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  teacherId,
  teacherName,
  teacherEmail,
  defaultSchool = 'SMK Derma',
  onClassCreated,
}) => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Matematik');
  const [tingkatan, setTingkatan] = useState<TingkatanType>('Tingkatan 4');
  const [schoolName, setSchoolName] = useState(defaultSchool);
  const [section, setSection] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage(t('error_class_name_required', 'Sila masukkan nama kelas.'));
      return;
    }

    setLoading(true);
    try {
      const created = await createClass({
        name: name.trim(),
        subject: subject.trim(),
        tingkatan,
        teacherId,
        teacherName,
        teacherEmail,
        schoolName: schoolName.trim() || 'SMK Derma',
        section: section.trim(),
        description: description.trim(),
      });

      onClassCreated(created);
      onClose();
    } catch (err: any) {
      console.error('Failed to create class:', err);
      setErrorMessage(err.message || t('error_create_class_failed', 'Gagal mencipta kelas. Sila cuba lagi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="create-class-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="create-class-modal-container"
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-display">
                {t('create_new_classroom', 'Cipta Bilik Darjah KSSM')}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t('create_class_subtitle', 'Bina kelas maya untuk murid SMK Derma dan edarkan kod')}
              </p>
            </div>
          </div>
          <button
            id="close-create-class-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div
              id="create-class-error-alert"
              className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Class Name */}
          <div>
            <label
              htmlFor="class-name-input"
              className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
            >
              {t('class_name', 'Nama Kelas')}
            </label>
            <input
              id="class-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('class_name_placeholder', 'cth: 5 Arif - Matematik Tambahan')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              required
            />
          </div>

          {/* Subject & Tingkatan Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="class-subject-select"
                className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
              >
                {t('class_subject', 'Mata Pelajaran')}
              </label>
              <div className="relative">
                <select
                  id="class-subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                >
                  {KSSM_DEFAULT_SUBJECTS.map((sub) => (
                    <option key={sub.code} value={sub.name}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                  <option value="Lain-lain">Lain-lain Subjek</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="class-tingkatan-select"
                className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
              >
                {t('class_tingkatan', 'Tingkatan')}
              </label>
              <select
                id="class-tingkatan-select"
                value={tingkatan}
                onChange={(e) => setTingkatan(e.target.value as TingkatanType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
              >
                {TINGKATAN_OPTIONS.map((ting) => (
                  <option key={ting} value={ting}>
                    {ting}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* School Name & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="class-school-input"
                className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
              >
                {t('class_school', 'Nama Sekolah')}
              </label>
              <input
                id="class-school-input"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="SMK Derma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label
                htmlFor="class-section-input"
                className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
              >
                {t('class_section', 'Bilik Darjah / Bahagian')}
              </label>
              <input
                id="class-section-input"
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder={t('section_placeholder', 'cth: Bilik 204 / Sesi Pagi')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="class-desc-input"
              className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
            >
              {t('class_description', 'Penerangan Ringkas')}
            </label>
            <input
              id="class-desc-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('class_desc_placeholder', 'cth: Kelas bimbingan intensif persediaan SPM KSSM')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              id="cancel-create-class-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              {t('cancel', 'Batal')}
            </button>
            <button
              id="submit-create-class-btn"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('creating_classroom', 'Membina Kelas...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('create_class_action', 'Bina Kelas')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
