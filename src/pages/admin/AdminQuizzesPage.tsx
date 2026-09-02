import React, { useState, useEffect } from 'react';
import {
  getAdminQuizzes,
  getAdminSubjects,
  saveQuiz,
  deleteQuiz,
} from '../../services/adminService';
import { Quiz, Subject, TingkatanType, TINGKATAN_OPTIONS } from '../../types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  ListOrdered,
  Search,
  Eye,
  Clock,
  Award,
} from 'lucide-react';

interface AdminQuizzesPageProps {
  navigate: (route: string) => void;
}

export const AdminQuizzesPage: React.FC<AdminQuizzesPageProps> = ({ navigate }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
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
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [totalMarks, setTotalMarks] = useState(20);
  const [passPercentage, setPassPercentage] = useState(50);
  const [published, setPublished] = useState(true);

  const fetchQuizzesAndSubjects = async () => {
    setLoading(true);
    try {
      const [qList, sList] = await Promise.all([getAdminQuizzes(), getAdminSubjects()]);
      setQuizzes(qList);
      setSubjects(sList);
      if (sList.length > 0 && !subjectId) {
        setSubjectId(sList[0].id);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzesAndSubjects();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setTitle('');
    setSubjectId(subjects.length > 0 ? subjects[0].id : '');
    setTingkatan('Tingkatan 1');
    setDescription('');
    setDurationMinutes(15);
    setTotalMarks(20);
    setPassPercentage(50);
    setPublished(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (q: Quiz) => {
    setEditId(q.id);
    setTitle(q.title);
    setSubjectId(q.subjectId);
    setTingkatan(q.tingkatan);
    setDescription(q.description || '');
    setDurationMinutes(q.durationMinutes);
    setTotalMarks(q.totalMarks);
    setPassPercentage(q.passPercentage);
    setPublished(q.published);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const selSubject = subjects.find((s) => s.id === subjectId);
    if (!title.trim() || !subjectId) return;

    setSaving(true);
    try {
      await saveQuiz({
        id: editId || undefined,
        title: title.trim(),
        subjectId,
        subjectName: selSubject?.name || 'KSSM',
        tingkatan,
        description: description.trim(),
        durationMinutes: Number(durationMinutes) || 15,
        totalMarks: Number(totalMarks) || 20,
        passPercentage: Number(passPercentage) || 50,
        published,
      });

      setModalOpen(false);
      await fetchQuizzesAndSubjects();
    } catch (err) {
      console.error('Error saving quiz:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, qTitle: string) => {
    if (!window.confirm(`Adakah anda pasti mahu memadam kuiz "${qTitle}"?`)) return;
    try {
      await deleteQuiz(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error('Error deleting quiz:', err);
    }
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSubject = filterSubjectId === 'all' || q.subjectId === filterSubjectId;
    const sq = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !sq ||
      q.title.toLowerCase().includes(sq) ||
      q.subjectName.toLowerCase().includes(sq) ||
      (q.description && q.description.toLowerCase().includes(sq));
    return matchesSubject && matchesSearch;
  });

  return (
    <div id="admin-quizzes-page" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
            Pengurusan Kuiz Latihan
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Konfigurasi set soalan kuiz, tempoh masa ujian, dan peratusan kelulusan.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl text-xs font-bold btn-theme-primary shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Kuiz Baharu</span>
        </button>
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tajuk kuiz..."
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

      {/* Quizzes List Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredQuizzes.length === 0 ? (
        <EmptyState
          title="Belum ada kuiz didaftarkan."
          description="Cipta kuiz pertama anda dan masukkan soalan ke dalam Bank Soalan."
          icon={HelpCircle}
          actionText="Tambah Kuiz Baharu"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Tajuk Kuiz</th>
                  <th className="py-3.5 px-4">Subjek / Tingkatan</th>
                  <th className="py-3.5 px-4 text-center">Soalan</th>
                  <th className="py-3.5 px-4 text-center">Tempoh</th>
                  <th className="py-3.5 px-4 text-center">Lulus</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">
                      <div className="text-stone-900 dark:text-stone-100">{quiz.title}</div>
                      <div className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                        {quiz.description || 'Tiada deskripsi'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-theme-primary">{quiz.subjectName}</div>
                      <div className="text-[11px] text-stone-400">{quiz.tingkatan}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold">
                      {quiz.totalQuestions || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium text-stone-500">
                      {quiz.durationMinutes} min
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {quiz.passPercentage}%
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          quiz.published
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                        }`}
                      >
                        {quiz.published ? 'Diterbitkan' : 'Draf'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                      {/* Bank Soalan link */}
                      <button
                        onClick={() => navigate(`/admin/questions?quizId=${quiz.id}`)}
                        className="p-1.5 rounded-lg border border-theme-primary/40 bg-theme-surface text-theme-primary text-xs font-bold inline-flex items-center gap-1"
                        title="Urus Bank Soalan"
                      >
                        <ListOrdered className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Soalan</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(quiz)}
                        className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                        title="Sunting Kuiz"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(quiz.id, quiz.title)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                        title="Padam Kuiz"
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

      {/* Create / Edit Quiz Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {editId ? 'Sunting Kuiz Latihan' : 'Cipta Kuiz Baharu'}
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
                  Tajuk Kuiz <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="cth: Kuiz Bab 1 - Pengenalan Kimia"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                    Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                    required
                  >
                    {TINGKATAN_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                    Masa (Minit)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    min={1}
                    max={180}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                    Jumlah Markah
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                    Syarat Lulus (%)
                  </label>
                  <input
                    type="number"
                    value={passPercentage}
                    onChange={(e) => setPassPercentage(Number(e.target.value))}
                    min={10}
                    max={100}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Arahan / Penerangan Kuiz
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Arahan sebelum pelajar memulakan ujian ini..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="quiz-published-check"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded text-theme-primary focus:ring-theme-primary"
                />
                <label
                  htmlFor="quiz-published-check"
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
                  {saving ? 'Menyimpan...' : 'Simpan Kuiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
