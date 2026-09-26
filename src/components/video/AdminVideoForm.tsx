import React, { useState, useEffect } from 'react';
import { extractYouTubeVideoId, isValidYouTubeUrl, getYoutubeThumbnailUrl } from '../../utils/youtube';
import { addLearningVideo, updateLearningVideo } from '../../services/videoService';
import { LearningVideo, KSSM_DEFAULT_SUBJECTS, TINGKATAN_OPTIONS, TingkatanType } from '../../types';
import {
  Film,
  Link2,
  BookOpen,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
  Sparkles,
  Info,
  Clock,
  GraduationCap,
} from 'lucide-react';

interface AdminVideoFormProps {
  initialData?: LearningVideo | null;
  onSuccess: (videoId?: string) => void;
  onCancel?: () => void;
  adminName?: string;
}

export const AdminVideoForm: React.FC<AdminVideoFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
  adminName = 'Pentadbir',
}) => {
  const [subject, setSubject] = useState(initialData?.subject || 'Matematik');
  const [customSubject, setCustomSubject] = useState('');
  const [chapter, setChapter] = useState(initialData?.chapter || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [youtubeLink, setYoutubeLink] = useState(initialData?.youtubeLink || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [tingkatan, setTingkatan] = useState<TingkatanType | string>(
    initialData?.tingkatan || 'Tingkatan 1'
  );
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [order, setOrder] = useState<number>(initialData?.order ?? 1);

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Extracted YouTube Info
  const extractedVideoId = extractYouTubeVideoId(youtubeLink);
  const isLinkValid = isValidYouTubeUrl(youtubeLink);
  const thumbnailUrl = extractedVideoId ? getYoutubeThumbnailUrl(extractedVideoId, 'hqdefault') : null;

  // Auto-fill title if empty and user enters chapter
  useEffect(() => {
    if (!initialData && chapter && !title) {
      const activeSubj = subject === 'Lain-lain' ? customSubject : subject;
      setTitle(`${activeSubj || 'Subjek'} - ${chapter}`);
    }
  }, [chapter, subject, customSubject, initialData, title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const activeSubject = subject === 'Lain-lain' ? customSubject.trim() : subject.trim();

    if (!activeSubject) {
      setErrorMessage('Sila pilih atau masukkan nama subjek.');
      return;
    }
    if (!chapter.trim()) {
      setErrorMessage('Sila masukkan bab / topik video (contoh: Bab 1: Nombor Nisbah).');
      return;
    }
    if (!youtubeLink.trim()) {
      setErrorMessage('Sila masukkan pautan YouTube.');
      return;
    }
    if (!extractedVideoId) {
      setErrorMessage(
        'Format pautan YouTube tidak sah. Sila masukkan pautan seperti https://www.youtube.com/watch?v=... atau https://youtu.be/...'
      );
      return;
    }

    try {
      setLoading(true);

      if (initialData?.id) {
        // Edit mode
        await updateLearningVideo(initialData.id, {
          subject: activeSubject,
          chapter: chapter.trim(),
          title: title.trim() || `${activeSubject} - ${chapter.trim()}`,
          youtubeLink: youtubeLink.trim(),
          youtubeVideoId: extractedVideoId,
          description: description.trim(),
          tingkatan,
          duration: duration.trim(),
          order: Number(order) || 0,
        });
        setSuccessMessage('Video pembelajaran berjaya dikemaskini!');
        setTimeout(() => onSuccess(initialData.id), 800);
      } else {
        // Create mode
        const newId = await addLearningVideo({
          subject: activeSubject,
          chapter: chapter.trim(),
          title: title.trim() || `${activeSubject} - ${chapter.trim()}`,
          youtubeLink: youtubeLink.trim(),
          description: description.trim(),
          tingkatan,
          duration: duration.trim(),
          order: Number(order) || 1,
          createdBy: adminName,
        });
        setSuccessMessage('Video pembelajaran berjaya disimpan ke pangkalan data!');
        setTimeout(() => onSuccess(newId), 800);
      }
    } catch (err: unknown) {
      console.error('Error saving video:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan video. Sila cuba lagi.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      id="admin-video-form"
      onSubmit={handleSubmit}
      className="space-y-6 text-stone-900 dark:text-stone-100"
    >
      {/* Alert Messages */}
      {errorMessage && (
        <div
          id="admin-video-form-error"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div
          id="admin-video-form-success"
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Subject Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Subjek Pembelajaran <span className="text-rose-500">*</span>
          </label>
          <select
            id="admin-video-subject-select"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            required
          >
            {KSSM_DEFAULT_SUBJECTS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.code})
              </option>
            ))}
            <option value="Lain-lain">Lain-lain (Subjek Tambahan)</option>
          </select>

          {subject === 'Lain-lain' && (
            <input
              type="text"
              id="admin-video-custom-subject"
              placeholder="Masukkan nama subjek..."
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          )}
        </div>

        {/* Tingkatan Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Tahap / Tingkatan
          </label>
          <select
            id="admin-video-tingkatan-select"
            value={tingkatan}
            onChange={(e) => setTingkatan(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          >
            <option value="Semua Tingkatan">Semua Tingkatan</option>
            {TINGKATAN_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Chapter Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Bab / Topik <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="admin-video-chapter-input"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="e.g. Bab 1: Nombor Nisbah"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            required
          />
          <p className="text-[11px] text-stone-400">
            Digunakan untuk penapisan bab oleh pelajar dalam pemain video.
          </p>
        </div>

        {/* Video Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Tajuk Video (Pilihan)
          </label>
          <input
            type="text"
            id="admin-video-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Pengenalan Integer & Operasi Asas"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>
      </div>

      {/* YouTube Link Input with Extractor Preview */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Pautan YouTube (youtubeLink) <span className="text-rose-500">*</span>
          </span>
          {extractedVideoId && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" />
              ID: {extractedVideoId}
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type="url"
            id="admin-video-youtube-link"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
            className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 transition-all ${
              youtubeLink && !extractedVideoId
                ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500'
                : 'border-stone-200 dark:border-stone-700 focus:ring-purple-500'
            }`}
            required
          />
          {extractedVideoId && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          )}
        </div>

        {/* Real-time YouTube Extraction Feedback */}
        {youtubeLink && !extractedVideoId ? (
          <p className="text-[11px] text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Pautan YouTube tidak sah. Pastikan format https://youtube.com/watch?v=... atau https://youtu.be/...
          </p>
        ) : (
          <p className="text-[11px] text-stone-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Sistem mengekstrak Video ID secara automatik untuk embedding HTML &lt;iframe&gt; tanpa iklan luaran.
          </p>
        )}
      </div>

      {/* Live YouTube Preview Card */}
      {extractedVideoId && (
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              Pratonton Semakan Video
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              https://www.youtube.com/embed/{extractedVideoId}
            </span>
          </div>

          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/90 relative shadow-sm border border-stone-200/60 dark:border-stone-800">
            <iframe
              id="admin-video-preview-iframe"
              src={`https://www.youtube.com/embed/${extractedVideoId}?rel=0`}
              title="Pratonton Video KSSM"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Description & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
            Penerangan / Nota Ringkas
          </label>
          <textarea
            id="admin-video-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Ringkasan konsep yang diajar dalam video ini..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              Durasi (Pilihan)
            </label>
            <input
              type="text"
              id="admin-video-duration-input"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 15:30"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Susunan Bab (Order)
            </label>
            <input
              type="number"
              id="admin-video-order-input"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              min={1}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            id="admin-video-cancel-btn"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all disabled:opacity-50"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          id="admin-video-submit-btn"
          disabled={loading || !extractedVideoId}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan ke Firestore...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialData ? 'Kemaskini Video' : 'Simpan Video'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
