import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchAssignmentSubmissions,
  fetchAssignmentById,
  fetchTeacherAssignments,
  gradeSubmission,
} from '../../services/teacherService';
import { Assignment, AssignmentSubmission } from '../../types';
import {
  Printer,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ArrowLeft,
  X,
  Calendar,
  Award,
  ExternalLink,
  MessageSquare,
  Sparkles,
  School,
  User,
  Check,
  RefreshCw,
  Send,
  Loader2,
  ChevronDown,
} from 'lucide-react';

interface TeacherSubmissionsProps {
  assignmentId?: string;
  navigate: (route: string) => void;
  onBack?: () => void;
}

export const TeacherSubmissions: React.FC<TeacherSubmissionsProps> = ({
  assignmentId: initialAssignmentId,
  navigate,
  onBack,
}) => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();

  const [currentAssignmentId, setCurrentAssignmentId] = useState<string>(initialAssignmentId || '');
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [allTeacherAssignments, setAllTeacherAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'graded'>('all');

  // Modal / Selected Student Submission for Full View & Print
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);

  // Quick grading state inside full answer view
  const [gradeInput, setGradeInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [savingGrade, setSavingGrade] = useState(false);
  const [gradeSuccessMessage, setGradeSuccessMessage] = useState<string | null>(null);

  // 1. Initial Load: Fetch teacher assignments list if needed
  useEffect(() => {
    async function loadAssignments() {
      if (!userProfile) return;
      try {
        const list = await fetchTeacherAssignments(userProfile.uid);
        setAllTeacherAssignments(list);

        if (!currentAssignmentId && list.length > 0) {
          setCurrentAssignmentId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load teacher assignments:', err);
      }
    }
    loadAssignments();
  }, [userProfile]);

  // 2. Fetch submissions and assignment data whenever currentAssignmentId changes
  const loadSubmissionsData = async (isManual = false) => {
    if (!currentAssignmentId) {
      setLoading(false);
      return;
    }

    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [assignmentData, subsData] = await Promise.all([
        fetchAssignmentById(currentAssignmentId),
        fetchAssignmentSubmissions(currentAssignmentId),
      ]);

      if (assignmentData) {
        setAssignment(assignmentData);
      } else {
        const found = allTeacherAssignments.find((a) => a.id === currentAssignmentId);
        if (found) setAssignment(found);
      }

      setSubmissions(subsData);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentAssignmentId) {
      loadSubmissionsData();
    }
  }, [currentAssignmentId]);

  // Sync grading input state when a submission is opened
  useEffect(() => {
    if (selectedSubmission) {
      setGradeInput(selectedSubmission.grade !== undefined ? String(selectedSubmission.grade) : '');
      setFeedbackInput(selectedSubmission.feedback || '');
      setGradeSuccessMessage(null);
    }
  }, [selectedSubmission]);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const numGrade = Number(gradeInput);
    if (isNaN(numGrade) || numGrade < 0) {
      alert('Sila masukkan markah yang sah.');
      return;
    }

    setSavingGrade(true);
    try {
      await gradeSubmission(selectedSubmission.id, numGrade, feedbackInput);
      setGradeSuccessMessage('Markah & maklum balas berjaya disimpan!');

      // Update in local state
      const updated: AssignmentSubmission = {
        ...selectedSubmission,
        grade: numGrade,
        feedback: feedbackInput.trim(),
        status: 'graded',
      };
      setSelectedSubmission(updated);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );

      setTimeout(() => setGradeSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to grade submission:', err);
      alert('Gagal menyimpan markah. Sila cuba lagi.');
    } finally {
      setSavingGrade(false);
    }
  };

  // Filter submissions by search query and status
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const nameMatch =
        sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.studentEmail && sub.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        sub.content.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch =
        statusFilter === 'all' ||
        (statusFilter === 'graded' && sub.status === 'graded') ||
        (statusFilter === 'submitted' && sub.status !== 'graded');

      return nameMatch && statusMatch;
    });
  }, [submissions, searchQuery, statusFilter]);

  const deadlineDate = assignment?.deadline ? new Date(assignment.deadline) : null;
  const schoolDisplayName = userProfile?.school || 'SMK DERMA, KANGAR, PERLIS';

  return (
    <div id="teacher-submissions-container" className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. SCREEN VIEW HEADER & NAVIGATION (Hidden during print) */}
      {/* ========================================================================= */}
      <div className="print:hidden space-y-4">
        {/* Top Back & Assignment Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="back-to-teacher-dashboard-btn"
              type="button"
              onClick={() => {
                if (onBack) onBack();
                else navigate('/teacher/assignments');
              }}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Tugasan</span>
            </button>

            {/* Assignment Switcher if multiple exist */}
            {allTeacherAssignments.length > 1 && (
              <div className="relative">
                <select
                  id="assignment-dropdown-select"
                  value={currentAssignmentId}
                  onChange={(e) => setCurrentAssignmentId(e.target.value)}
                  className="pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 cursor-pointer appearance-none shadow-2xs"
                >
                  {allTeacherAssignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.className})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-submissions-btn"
              type="button"
              onClick={() => loadSubmissionsData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-2xs"
              title="Muat semula senarai serahan"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Kemas Kini</span>
            </button>
          </div>
        </div>

        {/* Assignment Hero Card */}
        {assignment && (
          <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                    {assignment.className}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                    {submissions.length} Serahan Diterima
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                  Semakan Serahan: {assignment.title}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 line-clamp-2 leading-relaxed">
                  {assignment.description || 'Tiada arahan khusus.'}
                </p>
              </div>

              {/* Meta Stats */}
              <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs text-emerald-100/80">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-200" />
                  <span>
                    Tarikh Akhir:{' '}
                    <strong className="text-white">
                      {deadlineDate
                        ? deadlineDate.toLocaleDateString('ms-MY', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Tiada'}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    Markah Maksimum: <strong className="text-white">{assignment.points || 100} M</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-students-submissions-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari murid mengikut nama, emel, atau kandungan jawapan..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Semua ({submissions.length})
            </button>
            <button
              onClick={() => setStatusFilter('submitted')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'submitted'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Belum Disemak
            </button>
            <button
              onClick={() => setStatusFilter('graded')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'graded'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Telah Disemak
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUBMISSIONS LIST / TABLE UI (Hidden during print) */}
      {/* ========================================================================= */}
      <div className="print:hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Memuatkan serahan jawapan murid...
            </p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 space-y-3">
            <FileText className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
            <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
              Tiada serahan dijumpai
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Tiada rekod murid yang sepadan dengan carian anda.'
                : 'Murid belum menghantar jawapan untuk tugasan ini.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/50 text-[11px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    <th className="py-3.5 px-4 sm:px-6">Nama Murid</th>
                    <th className="py-3.5 px-4">Tarikh & Masa Serahan</th>
                    <th className="py-3.5 px-4">Status & Gred</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 text-stone-700 dark:text-stone-300">
                  {filteredSubmissions.map((sub) => {
                    const isGraded = sub.status === 'graded';
                    const subDate = sub.submittedAt ? new Date(sub.submittedAt) : null;

                    return (
                      <tr
                        key={sub.id}
                        className="hover:bg-emerald-50/40 dark:hover:bg-stone-800/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        {/* Student Info */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center shrink-0 text-xs">
                              {sub.studentName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <button
                                type="button"
                                className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-left"
                              >
                                {sub.studentName}
                              </button>
                              <p className="text-[11px] text-stone-400">
                                {sub.studentEmail || 'Pelajar KSSM'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Submission Date */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-stone-500 dark:text-stone-400">
                          {subDate ? (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              {subDate.toLocaleDateString('ms-MY', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}{' '}
                              •{' '}
                              {subDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Status & Grade */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {isGraded ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                              <CheckCircle2 className="w-3 h-3 text-blue-500" />
                              Gred: {sub.grade}/{assignment?.points || 100}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <Clock className="w-3 h-3 text-emerald-500" />
                              Dihantar
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubmission(sub);
                            }}
                            className="px-3 py-1.5 rounded-xl font-bold text-xs bg-stone-100 dark:bg-stone-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all text-stone-700 dark:text-stone-200 cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Lihat Jawapan</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. STUDENT FULL ANSWER VIEW MODAL (On-screen Interactive View) */}
      {/* ========================================================================= */}
      {selectedSubmission && (
        <div
          id="student-answer-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto print:hidden"
        >
          <div className="relative w-full max-w-3xl my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {assignment?.className || 'Kelas Murid'}
                  </span>
                  {selectedSubmission.status === 'graded' ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-500" />
                      Telah Disemak: {selectedSubmission.grade}/{assignment?.points || 100}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-500" />
                      Dihantar
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 font-display">
                  Jawapan: {selectedSubmission.studentName}
                </h2>

                <p className="text-xs text-stone-400">
                  Tugasan: <strong className="text-stone-700 dark:text-stone-300">{assignment?.title}</strong> • Dihantar:{' '}
                  {selectedSubmission.submittedAt
                    ? new Date(selectedSubmission.submittedAt).toLocaleString('ms-MY', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : '—'}
                </p>
              </div>

              {/* Action Buttons: Prominent 'Cetak Jawapan' & Close */}
              <div className="flex items-center gap-2">
                <button
                  id="print-submission-btn"
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                  title="Cetak Salinan Jawapan Murid"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Jawapan</span>
                </button>

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Answer Content Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Kandungan Jawapan / Hantaran Murid:
                </h3>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-100 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto font-mono text-xs sm:text-sm">
                {selectedSubmission.content}
              </div>

              {/* Check if content contains links */}
              {selectedSubmission.content.includes('http') && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pautan dikesan dalam jawapan. Anda boleh membuka pautan luaran murid secara terus.</span>
                  </span>
                </div>
              )}
            </div>

            {/* Teacher Grading & Feedback Form */}
            <form
              onSubmit={handleSaveGrade}
              className="p-4 rounded-2xl bg-stone-100/70 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Penilaian & Maklum Balas Guru
                </span>
                {gradeSuccessMessage && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {gradeSuccessMessage}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label
                    htmlFor="grade-input"
                    className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1"
                  >
                    Markah (Max: {assignment?.points || 100})
                  </label>
                  <input
                    id="grade-input"
                    type="number"
                    min="0"
                    max={assignment?.points || 100}
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    placeholder="Contoh: 95"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="feedback-input"
                    className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1"
                  >
                    Ulasan / Maklum Balas Guru
                  </label>
                  <input
                    id="feedback-input"
                    type="text"
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Contoh: Jawapan yang bernas dan fakta KSSM tepat. Teruskan usaha!"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={savingGrade}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 dark:bg-stone-100 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-stone-950 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingGrade ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Simpan Penilaian</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Modal Footer Close */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-stone-400">
                Klik 'Cetak Jawapan' untuk mencetak rekod A4 tanpa bar navigasi.
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DEDICATED PRINT-ONLY A4 RECORD SHEET */}
      {/* Visible ONLY when printing (print:block hidden) */}
      {/* ========================================================================= */}
      {selectedSubmission && (
        <div
          id="printable-submission-record"
          className="hidden print:block print:w-full print:m-0 print:p-8 print:bg-white print:text-black font-sans"
        >
          {/* Official School Header */}
          <div className="border-b-2 border-black pb-4 mb-6 text-center space-y-1">
            <h1 className="text-xl font-black uppercase tracking-wider text-black">
              {schoolDisplayName}
            </h1>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black">
              PORTAL PEMBELAJARAN KSSM • REKOD SERAHAN TUGASAN MURID
            </h2>
            <p className="text-[11px] text-stone-600">
              Dokumen Rasmi Bukti Pembelajaran & Pentaksiran Bilik Darjah (PBD)
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="border border-black rounded-lg p-4 mb-6 grid grid-cols-2 gap-y-3 gap-x-6 text-xs text-black">
            <div>
              <span className="font-bold text-stone-600 block text-[10px] uppercase">
                Nama Murid:
              </span>
              <span className="font-black text-sm uppercase">{selectedSubmission.studentName}</span>
            </div>

            <div>
              <span className="font-bold text-stone-600 block text-[10px] uppercase">
                Kelas / Tingkatan:
              </span>
              <span className="font-bold text-sm">{assignment?.className || '—'}</span>
            </div>

            <div>
              <span className="font-bold text-stone-600 block text-[10px] uppercase">
                Tajuk Tugasan:
              </span>
              <span className="font-bold text-sm">{assignment?.title || 'Tugasan KSSM'}</span>
            </div>

            <div>
              <span className="font-bold text-stone-600 block text-[10px] uppercase">
                Tarikh & Masa Serahan:
              </span>
              <span className="font-bold">
                {selectedSubmission.submittedAt
                  ? new Date(selectedSubmission.submittedAt).toLocaleString('ms-MY', {
                      dateStyle: 'full',
                      timeStyle: 'medium',
                    })
                  : '—'}
              </span>
            </div>

            <div>
              <span className="font-bold text-stone-600 block text-[10px] uppercase">
                Emel Murid / ID Pengguna:
              </span>
              <span>{selectedSubmission.studentEmail || selectedSubmission.studentId}</span>
            </div>

            <div>
              <span className="font-bold text-stone-600 block text-[10px] uppercase">
                Markah / Gred Disemak:
              </span>
              <span className="font-black text-sm">
                {selectedSubmission.grade !== undefined
                  ? `${selectedSubmission.grade} / ${assignment?.points || 100}`
                  : `Belum Disemak (Maksimum: ${assignment?.points || 100} Markah)`}
              </span>
            </div>
          </div>

          {/* Teacher's Instructions brief */}
          {assignment?.description && (
            <div className="mb-6 border-b border-stone-300 pb-4 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-stone-700 mb-1">
                Arahan & Butiran Tugasan:
              </h3>
              <p className="text-stone-800 leading-relaxed italic">{assignment.description}</p>
            </div>
          )}

          {/* Student's Full Exact Answer */}
          <div className="mb-8 space-y-2">
            <h3 className="font-black uppercase tracking-wider text-xs border-b border-black pb-1">
              Jawapan Lengkap Murid:
            </h3>
            <div className="p-4 rounded-lg border border-black bg-white text-xs leading-relaxed whitespace-pre-wrap min-h-60 font-mono">
              {selectedSubmission.content}
            </div>
          </div>

          {/* Teacher Evaluation & Signature Area */}
          <div className="border border-black rounded-lg p-4 space-y-4 text-xs">
            <h3 className="font-black uppercase tracking-wider text-[11px]">
              Penilaian & Pengesahan Guru
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-stone-600 block text-[10px] uppercase">
                  Ulasan Guru:
                </span>
                <p className="text-xs italic pt-1">
                  {selectedSubmission.feedback || 'Tiada ulasan bertulis.'}
                </p>
              </div>

              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Markah Akhir:</span>
                  <span className="font-black text-sm border-b border-black px-4">
                    {selectedSubmission.grade !== undefined
                      ? `${selectedSubmission.grade} / ${assignment?.points || 100}`
                      : '_____ / ' + (assignment?.points || 100)}
                  </span>
                </div>

                <div className="pt-6 border-t border-dotted border-stone-400 flex items-center justify-between text-[11px]">
                  <span>Tandatangan Guru: _______________________</span>
                  <span>Tarikh Semakan: _______________</span>
                </div>
              </div>
            </div>
          </div>

          {/* Print Footer */}
          <div className="mt-8 pt-4 border-t border-stone-300 text-center text-[10px] text-stone-500">
            Dicetak melalui Sistem Portal Pembelajaran KSSM study.dermaa • {new Date().toLocaleDateString('ms-MY')}
          </div>
        </div>
      )}
    </div>
  );
};
