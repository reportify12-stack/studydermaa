import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Subject, TingkatanType, TINGKATAN_OPTIONS, Quiz } from '../../types';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Layers,
  Clock,
  Sparkles,
  Save,
  X,
  FileQuestion,
} from 'lucide-react';

export interface QuizQuestionItem {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

interface BinaKuizFormProps {
  initialQuiz?: Quiz | null;
  onSuccess?: (quizId: string) => void;
  onCancel?: () => void;
}

export const BinaKuizForm: React.FC<BinaKuizFormProps> = ({
  initialQuiz,
  onSuccess,
  onCancel,
}) => {
  // 1. Quiz Metadata States
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [subjectId, setSubjectId] = useState(initialQuiz?.subjectId || '');
  const [chapter, setChapter] = useState(initialQuiz?.chapter || initialQuiz?.chapterTitle || '');
  const [tingkatan, setTingkatan] = useState<TingkatanType>(
    initialQuiz?.tingkatan || 'Tingkatan 1'
  );
  const [isDLP, setIsDLP] = useState(Boolean(initialQuiz?.isDLP));
  const [durationMinutes, setDurationMinutes] = useState(initialQuiz?.durationMinutes || 15);
  const [passPercentage, setPassPercentage] = useState(initialQuiz?.passPercentage || 50);
  const [description, setDescription] = useState(initialQuiz?.description || '');
  const [published, setPublished] = useState(initialQuiz?.published ?? true);

  // Available subjects list from Firestore
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // 2. Dynamic Questions State
  // Initialized with one empty question object: [{ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }]
  const [questions, setQuestions] = useState<QuizQuestionItem[]>(() => {
    if (initialQuiz?.questions && initialQuiz.questions.length > 0) {
      return initialQuiz.questions.map((q) => ({
        questionText: q.questionText || '',
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['', '', '', ''],
        correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
      }));
    }
    return [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
      },
    ];
  });

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Fetch subjects from Firestore
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const snap = await getDocs(collection(db, 'subjects'));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
        const sorted = list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setSubjects(sorted);

        if (!subjectId && sorted.length > 0) {
          setSubjectId(sorted[0].id);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Determine DLP eligibility (Math / Science)
  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const currentSubjectName = selectedSubject?.name || '';
  const isDlpEligible =
    currentSubjectName.toLowerCase().includes('matematik') ||
    currentSubjectName.toLowerCase().includes('sains') ||
    currentSubjectName === 'Mathematics' ||
    currentSubjectName === 'Science';

  // ========================================================
  // QUESTION HANDLERS
  // ========================================================

  // Add Question Logic: Appends a new empty question object to the array
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
      },
    ]);
  };

  // Remove Question Logic: Remove question by index
  const handleRemoveQuestion = (indexToRemove: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Update question text
  const handleQuestionTextChange = (qIndex: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], questionText: text };
      return updated;
    });
  };

  // Update specific option text for a question
  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const newOptions = [...updated[qIndex].options];
      newOptions[optIndex] = text;
      updated[qIndex] = { ...updated[qIndex], options: newOptions };
      return updated;
    });
  };

  // Update correct answer index (0, 1, 2, or 3)
  const handleCorrectOptionChange = (qIndex: number, correctIdx: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], correctOptionIndex: correctIdx };
      return updated;
    });
  };

  // ========================================================
  // FIRESTORE SUBMISSION
  // ========================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validation checks
    if (!title.trim()) {
      setFormError('Sila masukkan tajuk kuiz.');
      return;
    }
    if (!subjectId) {
      setFormError('Sila pilih mata pelajaran.');
      return;
    }
    if (!chapter.trim()) {
      setFormError('Sila masukkan maklumat bab atau topik kuiz.');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setFormError(`Soalan ${i + 1} belum mempunyai teks soalan.`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j] || !q.options[j].trim()) {
          setFormError(`Soalan ${i + 1}: Sila lengkapkan Pilihan ${String.fromCharCode(65 + j)}.`);
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      const now = new Date().toISOString();
      const questionCount = questions.length;
      const totalMarks = questionCount; // 1 mark per question by default

      // Format consolidated questions list
      const formattedQuestions = questions.map((q, idx) => ({
        id: `q_${Date.now()}_${idx + 1}`,
        questionText: q.questionText.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctOptionIndex: Number(q.correctOptionIndex) || 0,
      }));

      // Consolidated Object (metadata + the full questions array)
      const consolidatedQuizData = {
        title: title.trim(),
        subjectId,
        subjectName: selectedSubject?.name || 'KSSM',
        chapter: chapter.trim(),
        chapterTitle: chapter.trim(),
        tingkatan,
        isDLP: isDlpEligible ? Boolean(isDLP) : false,
        durationMinutes: Number(durationMinutes) || 15,
        passPercentage: Number(passPercentage) || 50,
        totalMarks,
        questionCount,
        totalQuestions: questionCount,
        description: description.trim(),
        published: Boolean(published),
        questions: formattedQuestions,
        updatedAt: now,
      };

      let finalQuizId = initialQuiz?.id;

      if (initialQuiz?.id) {
        // Update existing quiz
        const quizRef = doc(db, 'quizzes', initialQuiz.id);
        await updateDoc(quizRef, consolidatedQuizData);
      } else {
        // Save new quiz into quizzes Firestore collection
        const docRef = await addDoc(collection(db, 'quizzes'), {
          ...consolidatedQuizData,
          createdAt: now,
        });
        finalQuizId = docRef.id;
      }

      setFormSuccess('Kuiz dan set soalan berjaya disimpan ke Firestore!');

      if (onSuccess && finalQuizId) {
        setTimeout(() => {
          onSuccess(finalQuizId!);
        }, 1200);
      }
    } catch (err: any) {
      console.error('Error saving quiz to Firestore:', err);
      setFormError(`Ralat menyimpan kuiz: ${err.message || 'Sila cuba lagi'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm"
    >
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-theme-primary/10 text-theme-primary">
              <FileQuestion className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
              {initialQuiz ? 'Kemaskini Set Kuiz' : 'Bina Kuiz Baharu'}
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Lengkapkan maklumat metadata kuiz dan bina soalan objektif secara dinamik.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="self-start sm:self-auto p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Tutup Borang"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Notifications */}
      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="font-semibold">{formError}</div>
        </div>
      )}

      {formSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          <div className="font-semibold">{formSuccess}</div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 1: QUIZ METADATA */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-theme-primary">
          <BookOpen className="w-4 h-4" />
          <span>1. Metadata Kuiz</span>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1.5">
            Tajuk Kuiz <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="cth: Kuiz Bab 1 - Pengenalan Kepada Penyiasatan Saintifik"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary focus:ring-1 focus:ring-theme-primary transition-all font-medium"
            required
          />
        </div>

        {/* Subject, Tingkatan & Chapter Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1.5">
              Mata Pelajaran <span className="text-rose-500">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary focus:ring-1 focus:ring-theme-primary transition-all font-medium"
              required
            >
              {loadingSubjects ? (
                <option value="">Memuatkan senarai subjek...</option>
              ) : (
                subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code || s.category})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Tingkatan Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1.5">
              Tingkatan <span className="text-rose-500">*</span>
            </label>
            <select
              value={tingkatan}
              onChange={(e) => setTingkatan(e.target.value as TingkatanType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary focus:ring-1 focus:ring-theme-primary transition-all font-medium"
              required
            >
              {TINGKATAN_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter / Bab Input */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1.5">
              Bab / Topik <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="cth: Bab 1 - Kaedah Saintifik"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary focus:ring-1 focus:ring-theme-primary transition-all font-medium"
              required
            />
          </div>
        </div>

        {/* DLP Toggle (Dual Language Programme for Math/Science) */}
        {isDlpEligible && (
          <div className="p-4 rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 flex items-center justify-between gap-4 animate-fade-in transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-sky-950 dark:text-sky-100">
                  Versi DLP (English Medium)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 font-black uppercase tracking-wider">
                  Dual Language Programme
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Aktifkan jika set soalan kuiz disediakan dalam Bahasa Inggeris khas bagi kelas DLP subjek {currentSubjectName}.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isDLP}
                onChange={(e) => setIsDLP(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
        )}

        {/* Time, Pass Percentage & Published Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Tempoh Masa (Minit)</span>
            </label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              min={1}
              max={180}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1.5">
              Syarat Lulus (%)
            </label>
            <input
              type="number"
              value={passPercentage}
              onChange={(e) => setPassPercentage(Number(e.target.value))}
              min={10}
              max={100}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1.5">
              Status Paparan
            </label>
            <div className="flex items-center h-10 gap-2">
              <input
                type="checkbox"
                id="quiz-published-toggle"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded text-theme-primary focus:ring-theme-primary border-stone-300"
              />
              <label
                htmlFor="quiz-published-toggle"
                className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer"
              >
                Terbitkan kepada murid serta-merta
              </label>
            </div>
          </div>
        </div>

        {/* Description / Instructions */}
        <div>
          <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1.5">
            Arahan / Penerangan Kuiz (Pilihan)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="cth: Jawab semua soalan objektif dalam masa yang ditetapkan. Pilih satu jawapan yang paling tepat."
            rows={2}
            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary transition-all"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: DYNAMIC QUESTIONS UI */}
      {/* ======================================================== */}
      <div className="space-y-6 pt-4 border-t border-stone-200 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-theme-primary/10 text-theme-primary text-xs font-black">
              2
            </span>
            <h3 className="text-base font-black text-stone-900 dark:text-stone-100 font-display">
              Senarai Soalan Kuiz ({questions.length} Soalan)
            </h3>
          </div>
          <span className="text-xs font-medium text-stone-500">
            Pilih jawapan yang betul untuk setiap soalan dengan menandakan radio button atau dropdown.
          </span>
        </div>

        {/* Questions Cards List */}
        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="p-5 sm:p-6 rounded-2xl border-2 border-stone-200/90 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 shadow-xs hover:border-theme-primary/40 transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-theme-primary text-white shadow-xs">
                    Soalan {qIndex + 1}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">
                    1 Markah &bull; 4 Pilihan Jawapan
                  </span>
                </div>

                {/* 'Buang Soalan' Button: only show if questions.length > 1 */}
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                    title="Buang Soalan Ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Buang Soalan</span>
                  </button>
                )}
              </div>

              {/* Question Text Area */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                  Pernyataan / Teks Soalan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={question.questionText}
                  onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                  placeholder={`Masukkan soalan nombor ${qIndex + 1} di sini...`}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary focus:ring-1 focus:ring-theme-primary transition-all font-normal placeholder:text-stone-400"
                  required
                />
              </div>

              {/* 4 Options Fields */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300">
                    Pilihan Jawapan (A, B, C, D) & Jawapan Betul <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-stone-400">
                    Klik butang radio untuk pilih jawapan yang betul
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {optionLabels.map((label, optIndex) => {
                    const isCorrect = question.correctOptionIndex === optIndex;
                    return (
                      <div
                        key={optIndex}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                          isCorrect
                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 dark:border-emerald-600 ring-1 ring-emerald-500/30'
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900'
                        }`}
                      >
                        {/* Radio Button to select correct option */}
                        <label className="flex items-center gap-2 cursor-pointer shrink-0 pl-1">
                          <input
                            type="radio"
                            name={`correct_answer_radio_${qIndex}`}
                            checked={isCorrect}
                            onChange={() => handleCorrectOptionChange(qIndex, optIndex)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span
                            className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            {label}
                          </span>
                        </label>

                        {/* Input for option text */}
                        <input
                          type="text"
                          value={question.options[optIndex]}
                          onChange={(e) =>
                            handleOptionChange(qIndex, optIndex, e.target.value)
                          }
                          placeholder={`Pilihan ${label}...`}
                          className="flex-1 px-3 py-1.5 rounded-lg border-0 bg-transparent text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-hidden focus:ring-0 placeholder:text-stone-400"
                          required
                        />

                        {isCorrect && (
                          <span className="shrink-0 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                            Betul
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Alternative explicit dropdown to choose correct answer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-800/60 text-xs">
                <span className="text-stone-500 dark:text-stone-400 font-medium">
                  Atau pilih jawapan betul melalui menu lungsur:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-700 dark:text-stone-300">
                    Kunci Jawapan:
                  </span>
                  <select
                    value={question.correctOptionIndex}
                    onChange={(e) =>
                      handleCorrectOptionChange(qIndex, Number(e.target.value))
                    }
                    aria-label={`Kunci Jawapan Soalan ${qIndex + 1}`}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-bold text-emerald-700 dark:text-emerald-400 focus:outline-hidden focus:border-theme-primary cursor-pointer"
                  >
                    {optionLabels.map((lbl, idx) => (
                      <option key={idx} value={idx}>
                        Pilihan {lbl} {question.options[idx] ? `(${question.options[idx].slice(0, 24)}...)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ======================================================== */}
        {/* ADD QUESTION BUTTON (Prominent 'Tambah Soalan' Button) */}
        {/* ======================================================== */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-4 px-6 rounded-2xl border-2 border-dashed border-theme-primary/50 hover:border-theme-primary bg-theme-primary/5 hover:bg-theme-primary/10 text-theme-primary font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs group cursor-pointer"
          >
            <span className="p-1.5 rounded-xl bg-theme-primary text-white group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </span>
            <span>Tambah Soalan Baharu (Soalan {questions.length + 1})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: SUBMIT / SAVE ACTIONS */}
      {/* ======================================================== */}
      <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-stone-500 dark:text-stone-400">
          Ringkasan: <span className="font-bold text-stone-800 dark:text-stone-200">{questions.length} soalan</span>, {durationMinutes} minit, {passPercentage}% lulus.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Batal
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold btn-theme-primary shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>
              {submitting
                ? 'Menyimpan Kuiz...'
                : initialQuiz
                ? 'Simpan Perubahan Kuiz'
                : 'Simpan & Terbitkan Kuiz'}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};
