import React, { useState, useEffect } from 'react';
import {
  getAllSeminarsAdmin,
  createSeminar,
  updateSeminar,
  deleteSeminar,
} from '../../services/seminarService';
import { Seminar, SeminarStatus, TingkatanType, KSSM_DEFAULT_SUBJECTS } from '../../types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Video,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  User,
  BookOpen,
  Search,
  X,
  Link2,
  Radio,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

interface AdminSeminarsPageProps {
  navigate: (route: string) => void;
}

export const AdminSeminarsPage: React.FC<AdminSeminarsPageProps> = ({ navigate }) => {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SeminarStatus>('all');

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [status, setStatus] = useState<SeminarStatus>('upcoming');
  const [speaker, setSpeaker] = useState('');
  const [subject, setSubject] = useState('');
  const [tingkatan, setTingkatan] = useState<TingkatanType | 'Semua Tingkatan'>('Semua Tingkatan');
  const [targetAudience, setTargetAudience] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchSeminars = async () => {
    setLoading(true);
    try {
      const data = await getAllSeminarsAdmin();
      setSeminars(data);
    } catch (err) {
      console.error('Error fetching admin seminars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeminars();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('20:00 - 21:30');
    setMeetingLink('');
    setStatus('upcoming');
    setSpeaker('');
    setSubject(KSSM_DEFAULT_SUBJECTS[0]?.name || 'Sains');
    setTingkatan('Semua Tingkatan');
    setTargetAudience('Semua Pelajar KSSM');
    setRecordingUrl('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (s: Seminar) => {
    setEditId(s.id);
    setTitle(s.title);
    setDescription(s.description);
    setDate(s.date);
    setTime(s.time);
    setMeetingLink(s.meetingLink);
    setStatus(s.status);
    setSpeaker(s.speaker || '');
    setSubject(s.subject || '');
    setTingkatan((s.tingkatan as any) || 'Semua Tingkatan');
    setTargetAudience(s.targetAudience || '');
    setRecordingUrl(s.recordingUrl || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Sila masukkan tajuk seminar.');
      return;
    }
    if (!description.trim()) {
      setFormError('Sila masukkan deskripsi seminar.');
      return;
    }
    if (!date) {
      setFormError('Sila pilih tarikh seminar.');
      return;
    }
    if (!time.trim()) {
      setFormError('Sila nyatakan masa seminar (contoh: 20:30 - 22:00).');
      return;
    }
    if (!meetingLink.trim()) {
      setFormError('Sila masukkan pautan Zoom atau Google Meet.');
      return;
    }

    // Basic URL format validation
    if (!meetingLink.startsWith('http://') && !meetingLink.startsWith('https://')) {
      setFormError('Pautan mesyuarat mestilah bermula dengan https:// atau http://');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        date,
        time: time.trim(),
        meetingLink: meetingLink.trim(),
        status,
        speaker: speaker.trim(),
        subject: subject.trim(),
        tingkatan,
        targetAudience: targetAudience.trim(),
        recordingUrl: recordingUrl.trim(),
      };

      if (editId) {
        await updateSeminar(editId, payload);
      } else {
        await createSeminar(payload);
      }

      setModalOpen(false);
      await fetchSeminars();
    } catch (err: any) {
      console.error('Error saving seminar:', err);
      setFormError(err?.message || 'Gagal menyimpan maklumat seminar.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (s: Seminar, newStatus: SeminarStatus) => {
    try {
      await updateSeminar(s.id, { status: newStatus });
      setSeminars((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleDelete = async (id: string, sTitle: string) => {
    if (!window.confirm(`Adakah anda pasti mahu memadam seminar "${sTitle}"? Tindakan ini tidak boleh diundur.`)) {
      return;
    }
    try {
      await deleteSeminar(id);
      setSeminars((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting seminar:', err);
      alert('Gagal memadam seminar.');
    }
  };

  // Filtered list
  const filteredSeminars = seminars.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.title.toLowerCase().includes(q) ||
      (s.speaker && s.speaker.toLowerCase().includes(q)) ||
      (s.subject && s.subject.toLowerCase().includes(q)) ||
      s.description.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const liveCount = seminars.filter((s) => s.status === 'live').length;
  const upcomingCount = seminars.filter((s) => s.status === 'upcoming').length;
  const completedCount = seminars.filter((s) => s.status === 'completed').length;

  return (
    <div id="admin-seminars-page" className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
              <Video className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Modul Live Seminar
            </span>
          </div>
          <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
            Pengurusan Live Seminar & Webinar
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Cipta dan kendalikan sesi seminar interaktif KSSM secara langsung melalui Zoom atau Google Meet untuk para pelajar.
          </p>
        </div>

        <button
          id="admin-add-seminar-btn"
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl text-xs font-bold btn-theme-primary shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cipta Seminar Baharu</span>
        </button>
      </div>

      {/* Stats Quick Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border transition-all text-left ${
            statusFilter === 'all'
              ? 'border-purple-300 dark:border-purple-700 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block">Semua Seminar</span>
          <span className="text-xl font-black text-stone-900 dark:text-white mt-0.5 block">{seminars.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('live')}
          className={`p-3.5 rounded-2xl border transition-all text-left ${
            statusFilter === 'live'
              ? 'border-red-300 dark:border-red-700 bg-red-50/70 dark:bg-red-950/40 text-red-900 dark:text-red-200 font-bold ring-2 ring-red-400/20'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-bold">Sedang LIVE</span>
          </div>
          <span className="text-xl font-black text-red-600 dark:text-red-400 mt-0.5 block">{liveCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('upcoming')}
          className={`p-3.5 rounded-2xl border transition-all text-left ${
            statusFilter === 'upcoming'
              ? 'border-blue-300 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block">Akan Datang</span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5 block">{upcomingCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('completed')}
          className={`p-3.5 rounded-2xl border transition-all text-left ${
            statusFilter === 'completed'
              ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-stone-300'
          }`}
        >
          <span className="text-[11px] block">Telah Selesai</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{completedCount}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="admin-seminar-search-input"
            type="text"
            placeholder="Cari seminar mengikut tajuk, penceramah, subjek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:border-theme-primary"
          />
        </div>

        <select
          id="admin-seminar-status-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-hidden"
        >
          <option value="all">Semua Status ({seminars.length})</option>
          <option value="live">🔴 Sedang LIVE ({liveCount})</option>
          <option value="upcoming">⏳ Akan Datang ({upcomingCount})</option>
          <option value="completed">✓ Selesai ({completedCount})</option>
        </select>
      </div>

      {/* Seminars List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredSeminars.length === 0 ? (
        <EmptyState
          title="Tiada seminar ditemui"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Cuba ubah kata carian atau penapis status anda.'
              : 'Mulakan dengan mencipta seminar pertama untuk pelajar study.dermaa.'
          }
          icon={Video}
          actionText="Cipta Seminar Baharu"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSeminars.map((s) => {
            const isLive = s.status === 'live';
            const isUpcoming = s.status === 'upcoming';
            const isCompleted = s.status === 'completed';

            return (
              <div
                key={s.id}
                className={`p-5 sm:p-6 rounded-3xl border bg-white dark:bg-stone-900 transition-all flex flex-col justify-between gap-4 ${
                  isLive
                    ? 'border-red-300 dark:border-red-900 shadow-md ring-1 ring-red-400/20'
                    : 'border-stone-200 dark:border-stone-800 shadow-2xs'
                }`}
              >
                <div className="space-y-3">
                  {/* Status & Badges Bar */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {isLive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                          SEDANG LIVE
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <Clock className="w-3 h-3" />
                          Akan Datang
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Selesai
                        </span>
                      )}

                      {s.subject && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-theme-surface text-theme-primary border border-theme-primary/30">
                          {s.subject}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Status Quick Changer */}
                      <select
                        aria-label="Tukar status seminar"
                        value={s.status}
                        onChange={(e) => handleQuickStatusChange(s, e.target.value as SeminarStatus)}
                        className="text-[11px] font-semibold py-1 px-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 focus:outline-hidden"
                      >
                        <option value="upcoming">Tukar: Akan Datang</option>
                        <option value="live">Tukar: LIVE Sekarang</option>
                        <option value="completed">Tukar: Selesai</option>
                      </select>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 leading-snug">
                      {s.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  {/* Date, Time, Speaker & Audience info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-300 pt-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{s.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{s.time}</span>
                    </div>
                    {s.speaker && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{s.speaker}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{s.tingkatan || 'Semua Tingkatan'}</span>
                    </div>
                  </div>

                  {/* Dedicated Meeting Link Display */}
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wider">
                          Pautan Bilik Mesyuarat:
                        </span>
                        <a
                          href={s.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-purple-700 dark:text-purple-300 hover:underline truncate block"
                          title={s.meetingLink}
                        >
                          {s.meetingLink}
                        </a>
                      </div>
                    </div>

                    <a
                      href={s.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 border border-stone-200 dark:border-stone-600 flex items-center gap-1 shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka</span>
                    </a>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(s)}
                      className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Kemaskini</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, s.title)}
                      className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Padam</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-stone-400">
                    ID: <code className="font-mono">{s.id.slice(0, 6)}...</code>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div
          id="admin-seminar-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto"
        >
          <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 font-display">
                    {editId ? 'Kemaskini Live Seminar' : 'Cipta Live Seminar Baharu'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Isi butiran seminar untuk disiarkan di platform pelajar.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner if any */}
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Seminar Title */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Tajuk Seminar <span className="text-red-500">*</span>
                </label>
                <input
                  id="seminar-form-title"
                  type="text"
                  required
                  placeholder="Contoh: Seminar Eksklusif SPM: Teknik Menjawab Sains Kertas 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-theme-primary font-medium"
                />
              </div>

              {/* Seminar Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Deskripsi & Objektif Seminar <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="seminar-form-description"
                  required
                  rows={3}
                  placeholder="Terangkan topik yang akan dipelajari, soalan yang dibincangkan, dan tip persediaan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-theme-primary"
                />
              </div>

              {/* Dedicated Meeting Link URL */}
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Pautan Mesyuarat (Zoom / Google Meet URL)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  {meetingLink && (
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Uji Pautan</span>
                    </a>
                  )}
                </div>
                <input
                  id="seminar-form-meeting-link"
                  type="url"
                  required
                  placeholder="https://meet.google.com/abc-defg-hij atau https://zoom.us/j/123456789"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-stone-900 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-purple-500"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Pelajar akan dibawa terus ke bilik seminar ini apabila mereka menekan butang <strong>"Sertai Seminar"</strong>.
                </p>
              </div>

              {/* Date, Time & Status in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Tarikh <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="seminar-form-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Waktu/Masa <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="seminar-form-time"
                    type="text"
                    required
                    placeholder="Contoh: 20:30 - 22:00"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Status Seminar <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="seminar-form-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SeminarStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden font-semibold"
                  >
                    <option value="upcoming">⏳ Akan Datang (Upcoming)</option>
                    <option value="live">🔴 Sedang LIVE (Aktifkan Sekarang)</option>
                    <option value="completed">✓ Telah Selesai (Completed)</option>
                  </select>
                </div>
              </div>

              {/* Subject, Speaker & Tingkatan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Subjek
                  </label>
                  <input
                    id="seminar-form-subject"
                    type="text"
                    placeholder="Contoh: Sains, Matematik..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Nama Penceramah
                  </label>
                  <input
                    id="seminar-form-speaker"
                    type="text"
                    placeholder="Contoh: Cikgu Noraini (Pakar SPM)"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Sasaran Tingkatan
                  </label>
                  <select
                    id="seminar-form-tingkatan"
                    value={tingkatan}
                    onChange={(e) => setTingkatan(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  >
                    <option value="Semua Tingkatan">Semua Tingkatan</option>
                    <option value="Tingkatan 1">Tingkatan 1</option>
                    <option value="Tingkatan 2">Tingkatan 2</option>
                    <option value="Tingkatan 3">Tingkatan 3</option>
                    <option value="Tingkatan 4">Tingkatan 4</option>
                    <option value="Tingkatan 5">Tingkatan 5</option>
                  </select>
                </div>
              </div>

              {/* Target Audience & Recording URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Sasaran Pelajar / Kumpulan
                  </label>
                  <input
                    id="seminar-form-audience"
                    type="text"
                    placeholder="Contoh: Calon SPM 2026 atau Menengah Atas"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Pautan Rakaman (Jika Selesai)
                  </label>
                  <input
                    id="seminar-form-recording"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={recordingUrl}
                    onChange={(e) => setRecordingUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Batal
                </button>
                <button
                  id="seminar-submit-btn"
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold btn-theme-primary shadow-xs flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editId ? 'Simpan Perubahan' : 'Cipta Seminar'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
