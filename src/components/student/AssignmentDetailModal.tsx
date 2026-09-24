import React, { useState } from 'react';
import { Assignment, AssignmentSubmission } from '../../types';
import { submitStudentAssignment } from '../../services/teacherService';
import { useAuth } from '../../contexts/AuthContext';
import {
  X,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Loader2,
  ExternalLink,
  BookOpen,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface AssignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  submission?: AssignmentSubmission | null;
  onSubmissionSuccess?: (sub: AssignmentSubmission) => void;
}

export const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  isOpen,
  onClose,
  assignment,
  submission,
  onSubmissionSuccess,
}) => {
  const { userProfile } = useAuth();
  const [content, setContent] = useState(submission?.content || '');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !assignment) return null;

  const isGraded = submission?.status === 'graded';
  const isSubmitted = submission?.status === 'submitted' || isGraded;

  const isPastDue = assignment.deadline
    ? new Date(assignment.deadline).getTime() < new Date().getTime()
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    if (!content.trim()) {
      setErrorMsg('Sila taip jawapan atau pautan tugasan anda.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await submitStudentAssignment({
        assignmentId: assignment.id,
        classId: assignment.classId,
        studentId: userProfile.uid,
        studentName: userProfile.fullName || 'Pelajar SMK Derma',
        studentEmail: userProfile.email || userProfile.authEmail,
        content: content.trim(),
        existingSubmissionId: submission?.id,
      });

      setSuccessMsg(
        isSubmitted
          ? 'Tugasan berjaya dikemas kini!'
          : 'Tugasan berjaya dihantar kepada guru anda!'
      );
      if (onSubmissionSuccess) {
        onSubmissionSuccess(res);
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err?.message || 'Gagal menghantar tugasan. Sila cuba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 p-6 sm:p-7 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {assignment.className}
              </span>
              {assignment.points && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {assignment.points} Markah
                </span>
              )}
              {isGraded ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                  Telah Disemak: {submission?.grade}/{assignment.points || 100}
                </span>
              ) : isSubmitted ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Telah Dihantar
                </span>
              ) : isPastDue ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-500" />
                  Tamat Tempoh
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  Belum Dihantar
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 font-display">
              {assignment.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Tarikh Akhir:{' '}
                <strong className={isPastDue ? 'text-rose-600 font-bold' : 'text-stone-800 dark:text-stone-200'}>
                  {assignment.deadline ? new Date(assignment.deadline).toLocaleString('ms-MY', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }) : 'Tiada had'}
                </strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Assignment Instructions / Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Arahan & Butiran Tugasan
          </h3>
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
            {assignment.description || 'Tiada arahan tambahan diberikan.'}
          </div>
        </div>

        {/* Attachments if any */}
        {assignment.attachments && assignment.attachments.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Bahan Rujukan & Lampiran Guru
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {assignment.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-emerald-600 hover:border-emerald-300 transition-colors group"
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">{att.title}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-500 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Teacher Feedback if Graded */}
        {isGraded && (
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 space-y-2 text-xs">
            <div className="flex items-center justify-between text-blue-900 dark:text-blue-200 font-bold">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                Maklum Balas Guru
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-200/80 dark:bg-blue-900 text-blue-900 dark:text-blue-200 font-extrabold">
                Markah: {submission?.grade} / {assignment.points || 100}
              </span>
            </div>
            <p className="text-blue-800 dark:text-blue-300 whitespace-pre-wrap leading-relaxed">
              {submission?.feedback || 'Bagus! Tugasan telah dinilai.'}
            </p>
          </div>
        )}

        {/* Submission Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center gap-2.5 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Student Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="submission-content"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300"
              >
                Jawapan / Hantaran Anda <span className="text-rose-500">*</span>
              </label>
              {submission?.submittedAt && (
                <span className="text-[11px] text-stone-400">
                  Dihantar pada:{' '}
                  {new Date(submission.submittedAt).toLocaleString('ms-MY', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              )}
            </div>

            <textarea
              id="submission-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis jawapan, ringkasan, atau pautan dokumen/Google Drive/pautan kerja rumah anda di sini..."
              className="w-full p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-stone-400"
              disabled={submitting}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Tutup
            </button>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menghantar...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isSubmitted ? 'Kemas Kini Hantaran' : 'Hantar Tugasan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
