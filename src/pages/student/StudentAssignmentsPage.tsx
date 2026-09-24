import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchStudentJoinedClasses,
  fetchStudentAssignments,
  fetchStudentSubmissions,
} from '../../services/teacherService';
import { Assignment, AssignmentSubmission, ClassRoom } from '../../types';
import { AssignmentDetailModal } from '../../components/student/AssignmentDetailModal';
import { JoinClassSection } from '../../components/student/JoinClassSection';
import {
  ClipboardList,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  FolderOpen,
  Coffee,
  GraduationCap,
  Layers,
} from 'lucide-react';

interface StudentAssignmentsPageProps {
  navigate: (route: string) => void;
}

export const StudentAssignmentsPage: React.FC<StudentAssignmentsPageProps> = ({
  navigate,
}) => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission>>({});

  // Active filters and modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadAssignmentsData = async (isManualRefresh = false) => {
    if (!userProfile) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Get the classIds the current student is enrolled in
      const enrolledClasses = await fetchStudentJoinedClasses(userProfile.uid);
      setClasses(enrolledClasses);

      // Collect all classIds
      const classIdsSet = new Set<string>();
      enrolledClasses.forEach((c) => classIdsSet.add(c.id));

      if (Array.isArray(userProfile.joinedClasses)) {
        userProfile.joinedClasses.forEach((cid) => classIdsSet.add(cid));
      }

      const enrolledClassIds = Array.from(classIdsSet);

      if (enrolledClassIds.length === 0) {
        setAssignments([]);
        setSubmissions({});
        return;
      }

      // 2. Query the assignments Firestore collection matching those classIds
      const [fetchedAssignments, studentSubmissions] = await Promise.all([
        fetchStudentAssignments(userProfile.uid, enrolledClassIds),
        fetchStudentSubmissions(userProfile.uid),
      ]);

      setAssignments(fetchedAssignments);
      setSubmissions(studentSubmissions);
    } catch (err) {
      console.error('Failed to load student assignments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAssignmentsData();
  }, [userProfile?.uid]);

  const handleOpenAssignment = (assignment: Assignment) => {
    setActiveAssignment(assignment);
    setIsDetailModalOpen(true);
  };

  const handleSubmissionSuccess = (updatedSub: AssignmentSubmission) => {
    setSubmissions((prev) => ({
      ...prev,
      [updatedSub.assignmentId]: updatedSub,
    }));
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass =
      selectedClassFilter === 'all' || item.classId === selectedClassFilter;

    const sub = submissions[item.id];
    let matchesStatus = true;
    if (filterStatus === 'pending') {
      matchesStatus = !sub || sub.status === 'late';
    } else if (filterStatus === 'submitted') {
      matchesStatus = sub?.status === 'submitted';
    } else if (filterStatus === 'graded') {
      matchesStatus = sub?.status === 'graded';
    }

    return matchesSearch && matchesClass && matchesStatus;
  });

  const getStatusBadge = (assignment: Assignment) => {
    const sub = submissions[assignment.id];
    const isPastDue = assignment.deadline
      ? new Date(assignment.deadline).getTime() < new Date().getTime()
      : false;

    if (sub?.status === 'graded') {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-blue-500" />
          Disemak ({sub.grade || 0}/{assignment.points || 100})
        </span>
      );
    }

    if (sub?.status === 'submitted') {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Telah Dihantar
        </span>
      );
    }

    if (isPastDue) {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
          <Clock className="w-3 h-3 text-rose-500" />
          Tamat Tempoh
        </span>
      );
    }

    return (
      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
        <Clock className="w-3 h-3 text-amber-500" />
        Perlu Dihantar
      </span>
    );
  };

  const getDueTimeText = (deadlineStr?: string) => {
    if (!deadlineStr) return 'Tiada had tarikh';
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return 'Telah tamat tarikh akhir';
    }
    if (diffDays === 0) {
      return 'Tarikh akhir hari ini!';
    }
    if (diffDays === 1) {
      return 'Tinggal 1 hari lagi';
    }
    return `Tinggal ${diffDays} hari lagi`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-100 uppercase tracking-wider">
              <ClipboardList className="w-3.5 h-3.5 text-emerald-300" />
              <span>Bilik Darjah KSSM SMK Derma</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              Tugasan Saya (My Assignments)
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Semak tugasan, kerja rumah, dan projek yang diagihkan oleh guru bagi kelas-kelas yang telah anda sertai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadAssignmentsData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Muat Semula Tugasan"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Kemas Kini</span>
            </button>

            <JoinClassSection showModalTriggerOnly onClassJoined={() => loadAssignmentsData(true)} />
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-emerald-400/20 blur-xl pointer-events-none" />
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tugasan mengikut tajuk atau kelas..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          {classes.length > 0 && (
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Kelas ({classes.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Semua ({assignments.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Perlu Hantar
            </button>
            <button
              onClick={() => setFilterStatus('submitted')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'submitted'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Dihantar
            </button>
            <button
              onClick={() => setFilterStatus('graded')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'graded'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Disemak
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-white dark:bg-stone-900 p-6 border border-stone-200/80 dark:border-stone-800 animate-pulse space-y-4"
            >
              <div className="h-4 w-24 bg-stone-200 dark:bg-stone-800 rounded-md" />
              <div className="h-6 w-3/4 bg-stone-200 dark:bg-stone-800 rounded-md" />
              <div className="h-16 w-full bg-stone-100 dark:bg-stone-800/50 rounded-xl" />
              <div className="h-10 w-full bg-stone-200 dark:bg-stone-800 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        /* Empty State */
        <div
          id="student-assignments-empty-state"
          className="p-10 sm:p-14 text-center rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 flex flex-col items-center justify-center space-y-4 shadow-xs"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <Coffee className="w-10 h-10 animate-bounce" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 font-display">
              Tiada tugasan setakat ini. Masa untuk berehat!
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              Semua kerja sekolah atau tugasan KSSM anda sudah selesai atau belum ada tugasan baharu yang dimuat naik oleh guru anda.
            </p>
          </div>

          {classes.length === 0 && (
            <div className="pt-2">
              <p className="text-xs text-stone-400 mb-3">
                Anda belum menyertai sebarang kelas guru?
              </p>
              <JoinClassSection
                showModalTriggerOnly
                onClassJoined={() => loadAssignmentsData(true)}
              />
            </div>
          )}
        </div>
      ) : (
        /* Grid of Assignments */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssignments.map((task) => {
            const isPastDue = task.deadline
              ? new Date(task.deadline).getTime() < new Date().getTime()
              : false;
            const dueNotice = getDueTimeText(task.deadline);
            const sub = submissions[task.id];

            return (
              <div
                key={task.id}
                id={`assignment-card-${task.id}`}
                className="p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800/80 transition-all flex flex-col justify-between gap-5 group"
              >
                {/* Top Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 truncate max-w-[160px]">
                      {task.className}
                    </span>
                    {getStatusBadge(task)}
                  </div>

                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {task.title}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {task.description || 'Tiada penerangan tambahan.'}
                    </p>
                  </div>
                </div>

                {/* Bottom Details & Open Assignment Button */}
                <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span className="text-[11px]">
                        Tarikh Akhir:{' '}
                        <strong className={isPastDue ? 'text-rose-600 font-bold' : 'text-stone-700 dark:text-stone-300'}>
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString('ms-MY', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Tiada Had'}
                        </strong>
                      </span>
                    </div>

                    {task.points && (
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {task.points} M
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-stone-400 flex items-center justify-between">
                    <span className={isPastDue ? 'text-rose-500 font-semibold' : 'text-stone-400'}>
                      {dueNotice}
                    </span>
                    {task.attachments && task.attachments.length > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {task.attachments.length} Lampiran
                      </span>
                    )}
                  </div>

                  {/* Open Assignment Button */}
                  <button
                    id={`open-task-btn-${task.id}`}
                    type="button"
                    onClick={() => handleOpenAssignment(task)}
                    className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-stone-900 dark:bg-stone-100 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-stone-950 dark:hover:text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Buka Tugasan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Submission Modal */}
      <AssignmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setActiveAssignment(null);
        }}
        assignment={activeAssignment}
        submission={activeAssignment ? submissions[activeAssignment.id] : null}
        onSubmissionSuccess={handleSubmissionSuccess}
      />
    </div>
  );
};
