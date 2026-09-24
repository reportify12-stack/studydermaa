import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
  ClassRoom,
  Assignment,
  ClassStudent,
} from '../../types';
import {
  fetchTeacherClasses,
  fetchTeacherAssignments,
  fetchClassStudents,
  deleteClass,
  deleteAssignment,
  createClass,
} from '../../services/teacherService';
import { TaskAssignmentModal } from '../../components/teacher/TaskAssignmentModal';
import { CreateClassModal } from '../../components/teacher/CreateClassModal';
import { ClassCodeModal } from '../../components/teacher/ClassCodeModal';
import {
  School,
  Users,
  FileText,
  Plus,
  Copy,
  Check,
  Maximize2,
  Trash2,
  Calendar,
  Clock,
  Search,
  BookOpen,
  Award,
  Loader2,
  Sparkles,
  ExternalLink,
  GraduationCap,
  Printer,
  Eye,
} from 'lucide-react';

interface TeacherDashboardPageProps {
  navigate: (route: string) => void;
  currentRoute?: string;
}

type TabType = 'classes' | 'assignments' | 'students';

export const TeacherDashboardPage: React.FC<TeacherDashboardPageProps> = ({
  navigate,
  currentRoute,
}) => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (currentRoute === '/teacher/assignments') return 'assignments';
    if (currentRoute === '/teacher/students') return 'students';
    return 'classes';
  });

  useEffect(() => {
    if (currentRoute === '/teacher/assignments') {
      setActiveTab('assignments');
    } else if (currentRoute === '/teacher/students') {
      setActiveTab('students');
    } else if (currentRoute === '/teacher' || currentRoute === '/teacher-dashboard') {
      setActiveTab('classes');
    }
  }, [currentRoute]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createClassModalOpen, setCreateClassModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedClassForTask, setSelectedClassForTask] = useState<string | undefined>(undefined);
  const [codeModalClass, setCodeModalClass] = useState<ClassRoom | null>(null);

  // Student list view state
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<string>('');
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Copied feedback mapping
  const [copiedClassId, setCopiedClassId] = useState<string | null>(null);

  // Initial data load
  const loadData = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const [fetchedClasses, fetchedAssignments] = await Promise.all([
        fetchTeacherClasses(userProfile.uid),
        fetchTeacherAssignments(userProfile.uid),
      ]);
      setClasses(fetchedClasses);
      setAssignments(fetchedAssignments);

      if (fetchedClasses.length > 0 && !selectedClassForStudents) {
        setSelectedClassForStudents(fetchedClasses[0].id);
      }
    } catch (err) {
      console.error('Error loading teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userProfile]);

  // Load students when selectedClassForStudents changes
  useEffect(() => {
    const activeClass = classes.find((c) => c.id === selectedClassForStudents);
    if (activeClass && activeClass.studentIds && activeClass.studentIds.length > 0) {
      setLoadingStudents(true);
      fetchClassStudents(activeClass.studentIds)
        .then((res) => setClassStudents(res))
        .finally(() => setLoadingStudents(false));
    } else {
      setClassStudents([]);
      setLoadingStudents(false);
    }
  }, [selectedClassForStudents, classes]);

  // Handle Quick Seed for Demo / Testing
  const handleSeedDemoClass = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const demo1 = await createClass({
        name: '5 Arif - Matematik Tambahan',
        subject: 'Matematik',
        tingkatan: 'Tingkatan 5',
        teacherId: userProfile.uid,
        teacherName: userProfile.fullName || 'Cikgu SMK Derma',
        teacherEmail: userProfile.email,
        schoolName: userProfile.school || 'SMK Derma',
        section: 'Bilik 205 (Sesi Pagi)',
        description: 'Bimbingan intensif format SPM KSSM Matematik Tambahan.',
      });

      const demo2 = await createClass({
        name: '4 Gemilang - Sains',
        subject: 'Sains',
        tingkatan: 'Tingkatan 4',
        teacherId: userProfile.uid,
        teacherName: userProfile.fullName || 'Cikgu SMK Derma',
        teacherEmail: userProfile.email,
        schoolName: userProfile.school || 'SMK Derma',
        section: 'Makmal Sains 1',
        description: 'Eksperimen makmal dan modul pengukuhan KBAT KSSM.',
      });

      setClasses((prev) => [demo1, demo2, ...prev]);
      setSelectedClassForStudents(demo1.id);
    } catch (err) {
      console.error('Failed to seed demo class:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (classItem: ClassRoom) => {
    try {
      await navigator.clipboard.writeText(classItem.joinCode);
      setCopiedClassId(classItem.id);
      setTimeout(() => setCopiedClassId(null), 2000);
    } catch (err) {
      console.warn('Failed to copy code:', err);
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!window.confirm(t('confirm_delete_class', `Padam kelas "${className}"? Semua data berkaitan akan dialih keluar.`))) {
      return;
    }
    try {
      await deleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      setAssignments((prev) => prev.filter((a) => a.classId !== classId));
      if (selectedClassForStudents === classId) {
        const remaining = classes.filter((c) => c.id !== classId);
        setSelectedClassForStudents(remaining[0]?.id || '');
      }
    } catch (err) {
      console.error('Failed to delete class:', err);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string, title: string) => {
    if (!window.confirm(t('confirm_delete_task', `Padam tugasan "${title}"?`))) {
      return;
    }
    try {
      await deleteAssignment(assignmentId);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    }
  };

  // Compute stats
  const totalStudents = useMemo(() => {
    return classes.reduce((sum, c) => sum + (c.studentCount || c.studentIds?.length || 0), 0);
  }, [classes]);

  // Filter students by query
  const filteredStudents = useMemo(() => {
    const q = studentSearchQuery.toLowerCase().trim();
    if (!q) return classStudents;
    return classStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [classStudents, studentSearchQuery]);

  const activeClassForStudents = classes.find((c) => c.id === selectedClassForStudents);

  return (
    <div id="teacher-portal-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 uppercase tracking-wider">
                <School className="w-3.5 h-3.5" />
                {userProfile?.school || 'SMK Derma'} • {t('teacher_portal', 'Portal Guru')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              {t('teacher_welcome', 'Bilik Darjah Guru')}, {userProfile?.fullName || 'Cikgu'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              {t(
                'teacher_dashboard_desc',
                'Urus kelas KSSM, jana kod penyertaan murid, dan edarkan tugasan interaktif berpusat.'
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="header-create-class-btn"
              type="button"
              onClick={() => setCreateClassModalOpen(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white text-emerald-800 hover:bg-emerald-50 shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>{t('create_class', 'Bina Kelas')}</span>
            </button>

            <button
              id="header-create-task-btn"
              type="button"
              disabled={classes.length === 0}
              onClick={() => {
                setSelectedClassForTask(undefined);
                setTaskModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500/30 hover:bg-emerald-500/40 text-white border border-white/20 backdrop-blur-md shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>{t('assign_task', 'Beri Tugasan')}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/15 max-w-xl">
          <div>
            <span className="text-2xl sm:text-3xl font-black">{classes.length}</span>
            <p className="text-[11px] sm:text-xs text-emerald-100 font-medium">
              {t('total_classes', 'Kelas Aktif')}
            </p>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black">{totalStudents}</span>
            <p className="text-[11px] sm:text-xs text-emerald-100 font-medium">
              {t('total_students', 'Jumlah Murid')}
            </p>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black">{assignments.length}</span>
            <p className="text-[11px] sm:text-xs text-emerald-100 font-medium">
              {t('total_assignments', 'Tugasan Diedar')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Google Classroom style) */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 overflow-x-auto">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            id="tab-classes-btn"
            type="button"
            onClick={() => setActiveTab('classes')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'classes'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('teacher_classes', 'Kelas Saya')}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
              {classes.length}
            </span>
          </button>

          <button
            id="tab-students-btn"
            type="button"
            onClick={() => setActiveTab('students')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'students'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('teacher_students', 'Senarai Pelajar')}</span>
          </button>

          <button
            id="tab-assignments-btn"
            type="button"
            onClick={() => setActiveTab('assignments')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('teacher_assignments', 'Tugasan & Kerja Rumah')}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
              {assignments.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t('loading_teacher_data', 'Memuatkan bilik darjah & tugasan...')}
          </p>
        </div>
      ) : (
        <>
          {/* TAB 1: CLASSES */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              {classes.length === 0 ? (
                <div
                  id="empty-classes-card"
                  className="p-8 sm:p-12 rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800 text-center bg-white/40 dark:bg-stone-900/40"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
                    <School className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-display">
                    {t('no_classes_yet', 'Belum Ada Bilik Darjah')}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto mt-1.5 mb-6">
                    {t(
                      'no_classes_desc',
                      'Cipta bilik darjah pertama anda untuk mula mengurus murid SMK Derma dan mengedarkan kod penyertaan unik.'
                    )}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      id="empty-create-class-btn"
                      type="button"
                      onClick={() => setCreateClassModalOpen(true)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('create_first_class', 'Bina Kelas Sekarang')}</span>
                    </button>
                    <button
                      id="seed-demo-class-btn"
                      type="button"
                      onClick={handleSeedDemoClass}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{t('load_sample_classes', 'Muatkan Contoh Kelas SMK Derma')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {classes.map((cls) => {
                    const classAssignmentsCount = assignments.filter((a) => a.classId === cls.id).length;
                    return (
                      <div
                        key={cls.id}
                        id={`class-card-${cls.id}`}
                        className="group bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        {/* Class Card Header */}
                        <div>
                          <div className="p-5 bg-linear-to-br from-emerald-600 to-teal-800 text-white relative">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white mb-1">
                                  {cls.tingkatan} • {cls.subject}
                                </span>
                                <h3 className="text-lg font-black font-display tracking-tight text-white group-hover:text-emerald-100 transition-colors line-clamp-1">
                                  {cls.name}
                                </h3>
                                <p className="text-xs text-emerald-100 mt-0.5">
                                  {cls.section ? `${cls.section} • ` : ''}
                                  {cls.schoolName || 'SMK Derma'}
                                </p>
                              </div>
                              <button
                                id={`delete-class-${cls.id}-btn`}
                                type="button"
                                title={t('delete_class', 'Padam Kelas')}
                                onClick={() => handleDeleteClass(cls.id, cls.name)}
                                className="p-1.5 rounded-lg bg-black/20 hover:bg-rose-500/80 text-white/80 hover:text-white transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Class Card Body */}
                          <div className="p-5 space-y-4">
                            {/* Class Code Box */}
                            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 flex items-center justify-between gap-3">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                                  {t('class_code', 'Kod Kelas')}
                                </span>
                                <span className="text-base font-black font-mono tracking-wider text-emerald-600 dark:text-emerald-400">
                                  {cls.joinCode}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  id={`copy-code-${cls.id}-btn`}
                                  type="button"
                                  onClick={() => handleCopyCode(cls)}
                                  title={t('copy_code', 'Salin Kod')}
                                  className="p-2 rounded-xl bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:text-emerald-600 transition-colors cursor-pointer shadow-2xs"
                                >
                                  {copiedClassId === cls.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  id={`project-code-${cls.id}-btn`}
                                  type="button"
                                  onClick={() => setCodeModalClass(cls)}
                                  title={t('project_code', 'Pancarkan Kod')}
                                  className="p-2 rounded-xl bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:text-emerald-600 transition-colors cursor-pointer shadow-2xs"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Class Metrics */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400">
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50/50 dark:bg-stone-800/30">
                                <Users className="w-4 h-4 text-stone-400" />
                                <span>
                                  {cls.studentCount || cls.studentIds?.length || 0}{' '}
                                  {t('students_enrolled', 'Murid')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50/50 dark:bg-stone-800/30">
                                <FileText className="w-4 h-4 text-stone-400" />
                                <span>
                                  {classAssignmentsCount} {t('assignments', 'Tugasan')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Class Card Footer */}
                        <div className="px-5 pb-5 pt-1 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-2">
                          <button
                            id={`view-students-btn-${cls.id}`}
                            type="button"
                            onClick={() => {
                              setSelectedClassForStudents(cls.id);
                              setActiveTab('students');
                            }}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-center cursor-pointer"
                          >
                            {t('view_students', 'Lihat Pelajar')}
                          </button>
                          <button
                            id={`assign-task-btn-${cls.id}`}
                            type="button"
                            onClick={() => {
                              setSelectedClassForTask(cls.id);
                              setTaskModalOpen(true);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-center cursor-pointer"
                          >
                            {t('assign_task', 'Beri Tugasan')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STUDENT ROSTER */}
          {activeTab === 'students' && (
            <div className="space-y-5">
              {/* Class Selector Header */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <label
                      htmlFor="select-roster-class"
                      className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block"
                    >
                      {t('selected_class', 'Kelas Dipilih')}
                    </label>
                    <select
                      id="select-roster-class"
                      value={selectedClassForStudents}
                      onChange={(e) => setSelectedClassForStudents(e.target.value)}
                      className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 bg-transparent border-0 focus:outline-hidden cursor-pointer"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id} className="dark:bg-stone-900">
                          {c.name} ({c.tingkatan} • {c.joinCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search in student list */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    id="search-students-input"
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder={t('search_students', 'Cari nama atau emel...')}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Students List Display */}
              {loadingStudents ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">{t('loading_students', 'Memuatkan senarai murid...')}</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 sm:p-12 rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800 text-center bg-white/40 dark:bg-stone-900/40">
                  <Users className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
                    {activeClassForStudents
                      ? t('no_students_in_class', 'Belum Ada Murid Menyertai Kelas Ini')
                      : t('no_class_selected', 'Sila Pilih Kelas Terlebih Dahulu')}
                  </h3>
                  {activeClassForStudents && (
                    <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto space-y-3">
                      <p>
                        {t('invite_using_code', 'Kongsikan Kod Penyertaan kepada murid:')}
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-sm">
                        <span>{activeClassForStudents.joinCode}</span>
                        <button
                          id="copy-join-code-roster-btn"
                          type="button"
                          onClick={() => handleCopyCode(activeClassForStudents)}
                          className="hover:underline cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs">
                  <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400">
                    <span>{t('student_roster', 'Senarai Murid Berdaftar')} ({filteredStudents.length})</span>
                    <span>{activeClassForStudents?.name}</span>
                  </div>

                  <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
                    {filteredStudents.map((student, idx) => (
                      <div
                        key={student.uid}
                        className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center uppercase">
                            {student.fullName ? student.fullName.charAt(0) : 'P'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                              {student.fullName}
                            </p>
                            <p className="text-xs text-stone-400">
                              @{student.username} • {student.email}
                            </p>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          <span className="inline-block px-2.5 py-0.5 rounded-full font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                            {student.tingkatan || activeClassForStudents?.tingkatan}
                          </span>
                          {student.school && (
                            <p className="text-[11px] text-stone-400 mt-0.5">{student.school}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-display">
                    {t('distributed_assignments', 'Tugasan & Kerja Rumah KSSM')}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {t('track_submissions_desc', 'Pantau status penghantaran dan semakan kerja murid')}
                  </p>
                </div>
                <button
                  id="tab-create-task-btn"
                  type="button"
                  disabled={classes.length === 0}
                  onClick={() => {
                    setSelectedClassForTask(undefined);
                    setTaskModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('create_new_task', 'Cipta Tugasan')}</span>
                </button>
              </div>

              {assignments.length === 0 ? (
                <div className="p-8 sm:p-12 rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-800 text-center bg-white/40 dark:bg-stone-900/40">
                  <FileText className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
                    {t('no_assignments_yet', 'Belum Ada Tugasan Diedarkan')}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 mb-5">
                    {t(
                      'no_assignments_desc',
                      'Beri latihan KBAT, kerja rumah, atau kuiz bertulis kepada kelas anda dengan tarikh akhir.'
                    )}
                  </p>
                  <button
                    id="empty-create-task-action-btn"
                    type="button"
                    disabled={classes.length === 0}
                    onClick={() => {
                      setSelectedClassForTask(undefined);
                      setTaskModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('create_task', 'Bina Tugasan')}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => {
                    const deadlineDate = new Date(assignment.deadline);
                    const isPast = deadlineDate.getTime() < Date.now();

                    return (
                      <div
                        key={assignment.id}
                        id={`assignment-card-${assignment.id}`}
                        className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              {assignment.className}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPast
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              }`}
                            >
                              {isPast ? t('deadline_passed', 'Tamat') : t('deadline_active', 'Aktif')}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                            {assignment.title}
                          </h4>

                          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                            {assignment.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {t('due_date', 'Tarikh Akhir')}: {deadlineDate.toLocaleDateString()} (
                                {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            </div>

                            {assignment.points && (
                              <div className="flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5" />
                                <span>{assignment.points} {t('points', 'Markah')}</span>
                              </div>
                            )}

                            {assignment.attachments && assignment.attachments.length > 0 && (
                              <a
                                href={assignment.attachments[0].url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>{assignment.attachments[0].title || 'Pautan'}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Right side: Submissions count, View Submissions & Delete */}
                        <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 dark:border-stone-800">
                          <div className="text-left sm:text-right">
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                              {assignment.submissionsCount || 0} {t('submissions', 'Dihantar')}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              {t('all_submissions', 'Jumlah serahan')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              id={`view-submissions-${assignment.id}-btn`}
                              type="button"
                              onClick={() => navigate(`/teacher/submissions/${assignment.id}`)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                              title={t('view_and_print_submissions', 'Lihat serahan murid & cetak')}
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>{t('view_submissions', 'Lihat Serahan')}</span>
                            </button>

                            <button
                              id={`delete-assignment-${assignment.id}-btn`}
                              type="button"
                              onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                              className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title={t('delete_task', 'Padam Tugasan')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal: Create Class */}
      {userProfile && (
        <CreateClassModal
          isOpen={createClassModalOpen}
          onClose={() => setCreateClassModalOpen(false)}
          teacherId={userProfile.uid}
          teacherName={userProfile.fullName || 'Cikgu'}
          teacherEmail={userProfile.email}
          defaultSchool={userProfile.school || 'SMK Derma'}
          onClassCreated={(newCls) => {
            setClasses((prev) => [newCls, ...prev]);
            setSelectedClassForStudents(newCls.id);
          }}
        />
      )}

      {/* Modal: Create Task Assignment */}
      {userProfile && (
        <TaskAssignmentModal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          classes={classes}
          selectedClassId={selectedClassForTask}
          teacherId={userProfile.uid}
          onAssignmentCreated={(newAssignment) => {
            setAssignments((prev) => [newAssignment, ...prev]);
          }}
        />
      )}

      {/* Modal: Enlarge Class Code for Classroom Projector */}
      <ClassCodeModal
        isOpen={!!codeModalClass}
        classroom={codeModalClass}
        onClose={() => setCodeModalClass(null)}
        onCodeRegenerated={(classId, newCode) => {
          setClasses((prev) =>
            prev.map((c) => (c.id === classId ? { ...c, joinCode: newCode } : c))
          );
          if (codeModalClass?.id === classId) {
            setCodeModalClass((prev) => (prev ? { ...prev, joinCode: newCode } : null));
          }
        }}
      />
    </div>
  );
};
