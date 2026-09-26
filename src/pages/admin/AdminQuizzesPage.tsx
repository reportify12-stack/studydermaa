import React, { useState, useEffect } from 'react';
import {
  getAdminQuizzes,
  getAdminSubjects,
  deleteQuiz,
} from '../../services/adminService';
import { Quiz, Subject } from '../../types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { BinaKuizForm } from '../../components/admin/BinaKuizForm';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  ListOrdered,
  Search,
  BookOpen,
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
  const [selectedQuizForEdit, setSelectedQuizForEdit] = useState<Quiz | null>(null);

  const fetchQuizzesAndSubjects = async () => {
    setLoading(true);
    try {
      const [qList, sList] = await Promise.all([getAdminQuizzes(), getAdminSubjects()]);
      setQuizzes(qList);
      setSubjects(sList);
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
    setSelectedQuizForEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (q: Quiz) => {
    setSelectedQuizForEdit(q);
    setModalOpen(true);
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
      (q.chapter && q.chapter.toLowerCase().includes(sq)) ||
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
            Konfigurasi set soalan kuiz, mata pelajaran, bab, dan soalan objektif murid.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl text-xs font-bold btn-theme-primary shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Bina Kuiz Baharu</span>
        </button>
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tajuk kuiz atau bab..."
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
          description="Cipta kuiz pertama anda dengan soalan objektif interaktif."
          icon={HelpCircle}
          actionText="Bina Kuiz Baharu"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Tajuk Kuiz</th>
                  <th className="py-3.5 px-4">Subjek / Bab</th>
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
                        {quiz.description || 'Tiada arahan tambahan'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-theme-primary">{quiz.subjectName}</span>
                        {quiz.isDLP && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                            DLP
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1">
                        <span>{quiz.tingkatan}</span>
                        {(quiz.chapter || quiz.chapterTitle) && (
                          <>
                            <span>&bull;</span>
                            <span className="text-stone-500 dark:text-stone-300 font-medium">
                              {quiz.chapter || quiz.chapterTitle}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                        {quiz.questions ? quiz.questions.length : quiz.questionCount || quiz.totalQuestions || 0}
                      </span>
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
                        className="p-1.5 rounded-lg border border-theme-primary/40 bg-theme-surface text-theme-primary text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        title="Urus Bank Soalan"
                      >
                        <ListOrdered className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Bank</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(quiz)}
                        className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                        title="Sunting Kuiz & Soalan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(quiz.id, quiz.title)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
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

      {/* Bina / Sunting Kuiz Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl my-auto max-h-[92vh] overflow-y-auto rounded-3xl">
            <BinaKuizForm
              initialQuiz={selectedQuizForEdit}
              onSuccess={async () => {
                setModalOpen(false);
                setSelectedQuizForEdit(null);
                await fetchQuizzesAndSubjects();
              }}
              onCancel={() => {
                setModalOpen(false);
                setSelectedQuizForEdit(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

