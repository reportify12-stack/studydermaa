import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClassRoom, Assignment } from '../../types';
import { createAssignment } from '../../services/teacherService';
import { X, Calendar, FileText, Award, Link2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  selectedClassId?: string;
  teacherId: string;
  onAssignmentCreated: (newAssignment: Assignment) => void;
}

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  isOpen,
  onClose,
  classes,
  selectedClassId,
  teacherId,
  onAssignmentCreated,
}) => {
  const { t } = useTranslation();

  const [classId, setClassId] = useState<string>(selectedClassId || (classes[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(() => {
    // Default deadline: 7 days from now at 23:59
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [points, setPoints] = useState(100);
  const [attachmentTitle, setAttachmentTitle] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) {
      setErrorMessage(t('error_select_class', 'Sila pilih kelas untuk tugasan ini.'));
      return;
    }

    if (!title.trim()) {
      setErrorMessage(t('error_title_required', 'Sila masukkan tajuk tugasan.'));
      return;
    }

    if (!deadline) {
      setErrorMessage(t('error_deadline_required', 'Sila tetapkan tarikh & masa akhir penghantaran.'));
      return;
    }

    setLoading(true);
    try {
      const attachments = attachmentUrl.trim()
        ? [{ title: attachmentTitle.trim() || t('reference_link', 'Pautan Rujukan'), url: attachmentUrl.trim() }]
        : [];

      const created = await createAssignment({
        classId: targetClass.id,
        className: targetClass.name,
        teacherId,
        title,
        description,
        deadline,
        points: Number(points) || 100,
        attachments,
      });

      onAssignmentCreated(created);
      onClose();
    } catch (err: any) {
      console.error('Failed to create assignment:', err);
      setErrorMessage(err.message || t('error_create_task_failed', 'Gagal mencipta tugasan. Sila cuba lagi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="task-assignment-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="task-assignment-modal-container"
        className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-display">
                {t('create_new_task', 'Cipta Tugasan / Kerja Rumah')}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t('create_task_subtitle', 'Edarkan tugasan KSSM terus kepada murid dalam kelas')}
              </p>
            </div>
          </div>
          <button
            id="close-task-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div
              id="task-modal-error-alert"
              className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Class Selector */}
          <div>
            <label
              htmlFor="task-class-select"
              className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
            >
              {t('target_class', 'Kelas Sasaran')}
            </label>
            <select
              id="task-class-select"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
              required
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tingkatan} • {c.subject})
                </option>
              ))}
            </select>
          </div>

          {/* Task Title */}
          <div>
            <label
              htmlFor="task-title-input"
              className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
            >
              {t('task_title', 'Tajuk Tugasan')}
            </label>
            <input
              id="task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('task_title_placeholder', 'cth: Latihan Pengukuhan Bab 3 - Persamaan Garis Lurus')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              required
            />
          </div>

          {/* Task Description / Instructions */}
          <div>
            <label
              htmlFor="task-description-input"
              className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
            >
              {t('task_instructions', 'Arahan Tugasan')}
            </label>
            <textarea
              id="task-description-input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(
                'task_instructions_placeholder',
                'Nyatakan arahan langkah demi langkah, rujukan buku teks KSSM, atau kriteria penilaian...'
              )}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              required
            />
          </div>

          {/* Deadline & Points Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="task-deadline-input"
                className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
              >
                {t('task_deadline', 'Tarikh & Masa Akhir')}
              </label>
              <div className="relative">
                <input
                  id="task-deadline-input"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label
                htmlFor="task-points-input"
                className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
              >
                {t('task_points', 'Markah Penuh')}
              </label>
              <div className="relative">
                <input
                  id="task-points-input"
                  type="number"
                  min={1}
                  max={500}
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <Award className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Optional Reference Link / Attachment */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800/70">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                {t('optional_attachment', 'Pautan Rujukan (Pilihan)')}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                id="task-attachment-title"
                type="text"
                value={attachmentTitle}
                onChange={(e) => setAttachmentTitle(e.target.value)}
                placeholder={t('attachment_name_placeholder', 'Tajuk Fail / Nota')}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-xs focus:outline-hidden focus:border-emerald-500"
              />
              <input
                id="task-attachment-url"
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://drive.google.com/... atau pautan nota"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              id="cancel-task-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              {t('cancel', 'Batal')}
            </button>
            <button
              id="submit-task-btn"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('distributing_task', 'Mengedarkan Tugasan...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('distribute_task', 'Edar Tugasan')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
