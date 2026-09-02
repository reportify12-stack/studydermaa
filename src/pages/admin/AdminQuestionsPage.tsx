import React, { useState, useEffect } from 'react';
import {
  getAdminQuizzes,
  getQuizQuestions,
  saveQuestion,
  deleteQuestion,
} from '../../services/adminService';
import { Question, Quiz } from '../../types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ListOrdered,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface AdminQuestionsPageProps {
  navigate: (route: string) => void;
}

export const AdminQuestionsPage: React.FC<AdminQuestionsPageProps> = ({ navigate }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [questionText, setQuestionText] = useState('');
  const [type, setType] = useState<'objective' | 'subjective' | 'kbat'>('objective');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [marks, setMarks] = useState(1);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('quizId');

    getAdminQuizzes()
      .then((qList) => {
        setQuizzes(qList);
        if (qParam && qList.some((q) => q.id === qParam)) {
          setSelectedQuizId(qParam);
        } else if (qList.length > 0) {
          setSelectedQuizId(qList[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchQuestions = async () => {
    if (!selectedQuizId) {
      setQuestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const qList = await getQuizQuestions(selectedQuizId);
      setQuestions(qList);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedQuizId]);

  const handleOpenAdd = () => {
    setEditId(null);
    setQuestionText('');
    setType('objective');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('A');
    setMarks(1);
    setExplanation('');
    setModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditId(q.id);
    setQuestionText(q.question);
    setType(q.type);

    if (q.options && Array.isArray(q.options)) {
      setOptionA(q.options[0] || '');
      setOptionB(q.options[1] || '');
      setOptionC(q.options[2] || '');
      setOptionD(q.options[3] || '');
    } else {
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
    }

    setCorrectAnswer(String(q.correctAnswer || 'A'));
    setMarks(q.marks || 1);
    setExplanation(q.explanation || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId || !questionText.trim()) return;

    let options: string[] | undefined = undefined;
    if (type === 'objective') {
      options = [
        optionA.trim(),
        optionB.trim(),
        optionC.trim(),
        optionD.trim(),
      ];
    }

    setSaving(true);
    try {
      await saveQuestion(selectedQuizId, {
        id: editId || undefined,
        quizId: selectedQuizId,
        question: questionText.trim(),
        type,
        options,
        correctAnswer: type === 'objective' ? correctAnswer : undefined,
        marks: Number(marks) || 1,
        explanation: explanation.trim() || undefined,
        order: editId ? undefined : questions.length + 1,
      });

      setModalOpen(false);
      await fetchQuestions();
    } catch (err) {
      console.error('Error saving question:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (q: Question) => {
    if (!window.confirm('Adakah anda pasti mahu memadam soalan ini?')) return;
    try {
      await deleteQuestion(q.id, selectedQuizId, q.marks);
      setQuestions((prev) => prev.filter((item) => item.id !== q.id));
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

  return (
    <div id="admin-questions-page" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
            Bank Soalan Kuiz
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Urus soalan objektif, subjektif, dan KBAT untuk setiap set ujian.
          </p>
        </div>

        {selectedQuizId && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold btn-theme-primary shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Soalan</span>
          </button>
        )}
      </div>

      {/* Quiz Selector */}
      <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col sm:flex-row items-center gap-3">
        <label className="text-xs font-bold uppercase text-stone-500 whitespace-nowrap">
          Pilih Set Kuiz:
        </label>
        <select
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
        >
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.subjectName} - {q.title} ({q.tingkatan})
            </option>
          ))}
        </select>
      </div>

      {/* Questions list */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : !selectedQuizId ? (
        <EmptyState
          title="Sila pilih kuiz terlebih dahulu."
          description="Pilih atau cipta set kuiz dari menu Kuiz sebelum memasukkan soalan."
          icon={HelpCircle}
        />
      ) : questions.length === 0 ? (
        <EmptyState
          title="Belum ada soalan dalam kuiz ini."
          description={`Kuiz "${selectedQuiz?.title}" belum mempunyai soalan latihan.`}
          icon={ListOrdered}
          actionText="Tambah Soalan Pertama"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const letterLabels = ['A', 'B', 'C', 'D'];
            return (
              <div
                key={q.id}
                className="p-5 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      Soalan {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {q.type}
                    </span>
                    <span className="text-xs text-stone-400 font-semibold">{q.marks} Markah</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                      title="Sunting Soalan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                      title="Padam Soalan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-relaxed">
                  {q.question}
                </p>

                {q.type === 'objective' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((optText, optIdx) => {
                      const optLetter = letterLabels[optIdx] || String(optIdx + 1);
                      const isCorrect = String(q.correctAnswer) === optLetter;
                      return (
                        <div
                          key={optLetter}
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                              : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-md bg-stone-200 dark:bg-stone-700 flex items-center justify-center font-bold text-[10px]">
                            {optLetter}
                          </span>
                          <span>{optText}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.explanation && (
                  <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60">
                    <span className="font-bold">Skema: </span>
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {editId ? 'Sunting Soalan' : 'Tambah Soalan Baharu'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                    Jenis Soalan
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                  >
                    <option value="objective">Objektif (Aneka Pilihan)</option>
                    <option value="kbat">KBAT (Kemahiran Berfikir Aras Tinggi)</option>
                    <option value="subjective">Subjektif (Struktur)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                    Peruntukan Markah
                  </label>
                  <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    min={1}
                    max={20}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Teks Soalan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Taipkan soalan lengkap di sini..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                  required
                />
              </div>

              {/* Options for Objective */}
              {type === 'objective' && (
                <div className="space-y-2.5 pt-1">
                  <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300">
                    Pilihan Jawapan & Jawapan Betul
                  </label>

                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                    const optVal =
                      optKey === 'A'
                        ? optionA
                        : optKey === 'B'
                        ? optionB
                        : optKey === 'C'
                        ? optionC
                        : optionD;
                    const setOptVal =
                      optKey === 'A'
                        ? setOptionA
                        : optKey === 'B'
                        ? setOptionB
                        : optKey === 'C'
                        ? setOptionC
                        : setOptionD;

                    return (
                      <div key={optKey} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctAnswerRadio"
                          checked={correctAnswer === optKey}
                          onChange={() => setCorrectAnswer(optKey)}
                          className="w-4 h-4 text-theme-primary focus:ring-theme-primary"
                          title={`Tandakan ${optKey} sebagai jawapan betul`}
                        />
                        <span className="w-6 font-bold text-xs">{optKey}.</span>
                        <input
                          type="text"
                          value={optVal}
                          onChange={(e) => setOptVal(e.target.value)}
                          placeholder={`Teks pilihan ${optKey}`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-hidden focus:border-theme-primary"
                          required
                        />
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-stone-400">
                    * Klik pada butang bulat radio di sebelah kiri untuk menetapkan jawapan yang betul.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Penjelasan Jawapan / Skema Pemarkahan
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Penerangan mengapa jawapan tersebut betul..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                />
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
                  {saving ? 'Menyimpan...' : 'Simpan Soalan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
