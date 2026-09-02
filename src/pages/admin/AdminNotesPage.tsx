import React, { useState, useEffect } from 'react';
import {
  getAdminNotes,
  getAdminSubjects,
  saveNote,
  deleteNote,
} from '../../services/adminService';
import { Note, Subject, TingkatanType, TINGKATAN_OPTIONS } from '../../types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  X,
  Clock,
  Sparkles,
  BookOpen,
  Search,
  Eye,
} from 'lucide-react';

interface AdminNotesPageProps {
  navigate: (route: string) => void;
}

export const AdminNotesPage: React.FC<AdminNotesPageProps> = ({ navigate }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('all');

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [tingkatan, setTingkatan] = useState<TingkatanType>('Tingkatan 1');
  const [chapterTitle, setChapterTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [keyPointsInput, setKeyPointsInput] = useState('');
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [published, setPublished] = useState(true);

  const fetchNotesAndSubjects = async () => {
    setLoading(true);
    try {
      const [nList, sList] = await Promise.all([getAdminNotes(), getAdminSubjects()]);
      setNotes(nList);
      setSubjects(sList);
      if (sList.length > 0 && !subjectId) {
        setSubjectId(sList[0].id);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesAndSubjects();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setTitle('');
    setSubjectId(subjects.length > 0 ? subjects[0].id : '');
    setTingkatan('Tingkatan 1');
    setChapterTitle('');
    setSummary('');
    setContent('');
    setKeyPointsInput('');
    setReadTimeMinutes(5);
    setPublished(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (n: Note) => {
    setEditId(n.id);
    setTitle(n.title);
    setSubjectId(n.subjectId);
    setTingkatan(n.tingkatan);
    setChapterTitle(n.chapterTitle || '');
    setSummary(n.summary || '');
    setContent(n.content);
    setKeyPointsInput((n.keyPoints || []).join('\n'));
    setReadTimeMinutes(n.readTimeMinutes || 5);
    setPublished(n.published);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const selSubject = subjects.find((s) => s.id === subjectId);
    if (!title.trim() || !content.trim() || !subjectId) return;

    setSaving(true);
    try {
      const keyPoints = keyPointsInput
        .split('\n')
        .map((k) => k.trim())
        .filter(Boolean);

      await saveNote({
        id: editId || undefined,
        title: title.trim(),
        subjectId,
        subjectName: selSubject?.name || 'KSSM',
        tingkatan,
        chapterTitle: chapterTitle.trim(),
        summary: summary.trim(),
        content: content.trim(),
        keyPoints,
        readTimeMinutes: Number(readTimeMinutes) || 5,
        published,
      });

      setModalOpen(false);
      await fetchNotesAndSubjects();
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nTitle: string) => {
    if (!window.confirm(`Adakah anda pasti mahu memadam nota "${nTitle}"?`)) return;
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSubject = filterSubjectId === 'all' || n.subjectId === filterSubjectId;
    const sq = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !sq ||
      n.title.toLowerCase().includes(sq) ||
      n.subjectName.toLowerCase().includes(sq) ||
      (n.chapterTitle && n.chapterTitle.toLowerCase().includes(sq));
    return matchesSubject && matchesSearch;
  });

  return (
    <div id="admin-notes-page" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
            Pengurusan Nota Pelajaran
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Cipta, sunting, dan kemaskini modul nota padat KSSM bagi setiap subjek.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl text-xs font-bold btn-theme-primary shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cipta Nota Baharu</span>
        </button>
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tajuk nota atau bab..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary transition-all"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={filterSubjectId}
          onChange={(e) => setFilterSubjectId(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary transition-all"
        >
          <option value="all">Semua Subjek</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Notes List Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredNotes.length === 0 ? (
        <EmptyState
          title="Belum ada nota didaftarkan."
          description="Cipta nota pertama anda untuk membolehkan pelajar mengulangkaji topik ini."
          icon={FileText}
          actionText="Cipta Nota Pertama"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Tajuk Nota / Bab</th>
                  <th className="py-3.5 px-4">Subjek / Tingkatan</th>
                  <th className="py-3.5 px-4 text-center">Masa Bacaan</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                {filteredNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">
                      <div className="text-stone-900 dark:text-stone-100">{note.title}</div>
                      <div className="text-[11px] text-stone-400">
                        {note.chapterTitle ? `Bab: ${note.chapterTitle}` : 'Topik Am'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-theme-primary">{note.subjectName}</div>
                      <div className="text-[11px] text-stone-400">{note.tingkatan}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium text-stone-500">
                      {note.readTimeMinutes || 5} min
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          note.published
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                        }`}
                      >
                        {note.published ? 'Diterbitkan' : 'Draf'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/nota/${note.id}`)}
                        className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                        title="Pratonton Nota"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                        title="Sunting Nota"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id, note.title)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                        title="Padam Nota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Note Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {editId ? 'Sunting Nota Pelajaran' : 'Cipta Nota Pelajaran Baharu'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Tajuk Nota <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="cth: Struktur Sel & Fungsinya"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                    Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                    required
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                    Tingkatan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={tingkatan}
                    onChange={(e) => setTingkatan(e.target.value as TingkatanType)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                    required
                  >
                    {TINGKATAN_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                    Masa Bacaan (min)
                  </label>
                  <input
                    type="number"
                    value={readTimeMinutes}
                    onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                    min={1}
                    max={60}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Nama Bab / Topik
                </label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="cth: Bab 2 - Biologi Sel dan Organisasi Sel"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Rumusan / Ringkasan Padat
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Ringkasan 1-2 ayat tentang nota ini..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Fakta Penting / Key Points (Satu baris setiap fakta)
                </label>
                <textarea
                  value={keyPointsInput}
                  onChange={(e) => setKeyPointsInput(e.target.value)}
                  placeholder="Sel haiwan tidak mempunyai dinding sel.&#10;Mitokondria merupakan tapak penjanaan tenaga ATP.&#10;Kloroplas mengandungi pigmen klorofil."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Kandungan Penuh Nota <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan nota lengkap mengikut silibus KSSM..."
                  rows={8}
                  className="w-full p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary font-sans leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="note-published-check"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded text-theme-primary focus:ring-theme-primary"
                />
                <label
                  htmlFor="note-published-check"
                  className="text-xs font-semibold text-stone-700 dark:text-stone-300"
                >
                  Terbitkan terus kepada pelajar (Published)
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold btn-theme-primary shadow-xs"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
