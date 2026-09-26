import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Quote,
  Target,
  Bell,
  Check,
  Copy,
  Edit2,
  CalendarDays,
  ListTodo,
  Timer,
  ChevronRight,
  AlertCircle,
  Coffee,
  Brain,
  Layers,
} from 'lucide-react';
import {
  ExamTarget,
  HomeworkTask,
  ScheduleBlock,
  DailyMotivation,
  DEFAULT_SCHEDULE_DAYS,
  getStoredExamTarget,
  saveStoredExamTarget,
  getStoredHomeworkTasks,
  saveStoredHomeworkTasks,
  getStoredScheduleBlocks,
  saveStoredScheduleBlocks,
  getStoredPomodoroStats,
  incrementPomodoroSession,
  fetchDailyMotivationQuote,
  DAILY_MOTIVATION_HIDDEN_PROMPT,
} from '../../services/plannerService';

interface StudentPlannerProps {
  navigate?: (route: string) => void;
}

export const StudentPlanner: React.FC<StudentPlannerProps> = ({ navigate }) => {
  // ==========================================
  // SECTION 1: EXAM COUNTDOWN STATE
  // ==========================================
  const [examTarget, setExamTarget] = useState<ExamTarget>(() => getStoredExamTarget());
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [editExamTitle, setEditExamTitle] = useState(examTarget.title);
  const [editExamDate, setEditExamDate] = useState(examTarget.targetDate);

  // Real-time Countdown calculation (Days, Hours, Minutes, Seconds)
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
    totalSeconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    totalSeconds: 0,
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const targetTime = new Date(examTarget.targetDate).getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
          totalSeconds: 0,
        });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        isPast: false,
        totalSeconds,
      });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [examTarget.targetDate]);

  const handleSaveExamTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExamTitle.trim() || !editExamDate) return;
    const updated: ExamTarget = {
      title: editExamTitle.trim(),
      targetDate: editExamDate,
    };
    setExamTarget(updated);
    saveStoredExamTarget(updated);
    setIsEditingExam(false);
  };

  const handleSetQuickExamPreset = (title: string, monthsAhead: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    d.setHours(8, 0, 0, 0);
    const dateStr = d.toISOString().slice(0, 16);
    setEditExamTitle(title);
    setEditExamDate(dateStr);
  };

  // ==========================================
  // SECTION 2: POMODORO TIMER STATE
  // ==========================================
  const FOCUS_SECONDS = 25 * 60; // 25 minutes
  const BREAK_SECONDS = 5 * 60;  // 5 minutes

  const [pomodoroMode, setPomodoroMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [pomodoroStats, setPomodoroStats] = useState(() => getStoredPomodoroStats());
  const [timerAlertMessage, setTimerAlertMessage] = useState<string | null>(null);

  // Timer interval
  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Session finished!
      if (pomodoroMode === 'focus') {
        const updated = incrementPomodoroSession(25);
        setPomodoroStats(updated);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#0ea5e9', '#f59e0b'],
        });
        setTimerAlertMessage('Tahniah! Sesi Fokus 25 minit selesai. Sila berehat 5 minit untuk menyegarkan minda anda.');
        setPomodoroMode('break');
        setTimeLeft(BREAK_SECONDS);
      } else {
        setTimerAlertMessage('Masa rehat 5 minit telah tamat. Bersedia untuk sesi fokus seterusnya!');
        setPomodoroMode('focus');
        setTimeLeft(FOCUS_SECONDS);
      }
      setIsRunning(false);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, pomodoroMode]);

  const toggleTimer = () => {
    setTimerAlertMessage(null);
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(pomodoroMode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
    setTimerAlertMessage(null);
  };

  const handleSwitchPomodoroMode = (mode: 'focus' | 'break') => {
    setIsRunning(false);
    setPomodoroMode(mode);
    setTimeLeft(mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
    setTimerAlertMessage(null);
  };

  const formatTimerDigits = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pomodoroProgressPercent = useMemo(() => {
    const total = pomodoroMode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
    return ((total - timeLeft) / total) * 100;
  }, [timeLeft, pomodoroMode]);

  // ==========================================
  // SECTION 3: HOMEWORK TRACKER STATE
  // ==========================================
  const [tasks, setTasks] = useState<HomeworkTask[]>(() => getStoredHomeworkTasks());
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Matematik');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'rendah' | 'sederhana' | 'tinggi'>('sederhana');
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: HomeworkTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      dueDate: newTaskDueDate || undefined,
      completed: false,
      priority: newTaskPriority,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveStoredHomeworkTasks(updated);

    // Reset Form
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setShowAddTaskForm(false);
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    saveStoredHomeworkTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveStoredHomeworkTasks(updated);
  };

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'pending') return tasks.filter((t) => !t.completed);
    if (taskFilter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, taskFilter]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [tasks]);

  // ==========================================
  // SECTION 4: STUDY SCHEDULE STATE
  // ==========================================
  const currentDayName = useMemo(() => {
    const dayMap = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
    return dayMap[new Date().getDay()];
  }, []);

  const [selectedDay, setSelectedDay] = useState<string>(currentDayName);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>(() => getStoredScheduleBlocks());
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);

  // New Block Form
  const [blockSubject, setBlockSubject] = useState('Matematik');
  const [blockTitle, setBlockTitle] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('14:00');
  const [blockEndTime, setBlockEndTime] = useState('15:30');
  const [blockColor, setBlockColor] = useState('emerald');

  const dayBlocks = useMemo(() => {
    return scheduleBlocks
      .filter((b) => b.day === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [scheduleBlocks, selectedDay]);

  const handleAddScheduleBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle.trim()) return;

    const newBlock: ScheduleBlock = {
      id: `sb-${Date.now()}`,
      day: selectedDay,
      startTime: blockStartTime,
      endTime: blockEndTime,
      subject: blockSubject,
      title: blockTitle.trim(),
      color: blockColor,
    };

    const updated = [...scheduleBlocks, newBlock];
    setScheduleBlocks(updated);
    saveStoredScheduleBlocks(updated);

    setBlockTitle('');
    setShowAddBlockModal(false);
  };

  const handleDeleteScheduleBlock = (blockId: string) => {
    const updated = scheduleBlocks.filter((b) => b.id !== blockId);
    setScheduleBlocks(updated);
    saveStoredScheduleBlocks(updated);
  };

  // Helper to check if a schedule block is currently active right now
  const isBlockCurrentTime = (startTime: string, endTime: string, day: string) => {
    if (day !== currentDayName) return false;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    return currentMins >= startTotal && currentMins <= endTotal;
  };

  // ==========================================
  // SECTION 5: DAILY MOTIVATION (AI FETCH)
  // ==========================================
  const [motivation, setMotivation] = useState<DailyMotivation | null>(null);
  const [quoteLoading, setQuoteLoading] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Exact hidden prompt logic implemented in fetchDailyMotivationQuote
  useEffect(() => {
    let isMounted = true;

    const loadDailyQuote = async () => {
      setQuoteLoading(true);
      try {
        const quoteData = await fetchDailyMotivationQuote(false);
        if (isMounted) {
          setMotivation(quoteData);
        }
      } catch (err) {
        console.error('Error fetching motivational quote:', err);
      } finally {
        if (isMounted) {
          setQuoteLoading(false);
        }
      }
    };

    loadDailyQuote();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshQuote = async () => {
    setQuoteLoading(true);
    try {
      const refreshed = await fetchDailyMotivationQuote(true);
      setMotivation(refreshed);
    } catch (err) {
      console.error('Failed to refresh quote:', err);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleCopyQuote = () => {
    if (!motivation) return;
    navigator.clipboard.writeText(`"${motivation.quote}" — ${motivation.author}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Common Malaysian KSSM Subject options
  const SUBJECT_OPTIONS = [
    'Matematik',
    'Matematik Tambahan',
    'Sains',
    'Sains (DLP)',
    'Biologi',
    'Fizik',
    'Kimia',
    'Sejarah',
    'Bahasa Melayu',
    'Bahasa Inggeris',
    'Pendidikan Islam',
    'Pendidikan Moral',
    'Geografi',
    'Prinsip Perakaunan',
    'Perniagaan',
    'Ekonomi',
  ];

  return (
    <div id="student-planner-dashboard" className="space-y-8 pb-16 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-theme-surface text-theme-primary border border-theme-primary/30">
              <CalendarDays className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-theme-primary">
              Hab Pengurusan Pembelajaran
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display mt-1">
            Student Planner
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Urus sasaran peperiksaan, teknik fokus Pomodoro, tugasan harian, dan jadual waktu kendiri anda.
          </p>
        </div>

        {/* Quick Action / Status */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            <span>{pomodoroStats.focusSessionsCompleted} Sesi Selesai Hari Ini</span>
          </div>
        </div>
      </div>

      {/* TOP ROW: DAILY MOTIVATION (Section 5) */}
      <section id="daily-motivation-section" className="relative overflow-hidden rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-theme-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-white/10 text-emerald-400 backdrop-blur-xs">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Mutiara Kata Harian • Budaya Belajar Positif
              </span>
            </div>

            {quoteLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-6 bg-white/20 rounded-md w-3/4" />
                <div className="h-4 bg-white/15 rounded-md w-1/3" />
              </div>
            ) : (
              <div>
                <p className="text-base sm:text-xl font-bold leading-relaxed text-stone-100 font-display italic">
                  "{motivation?.quote}"
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-4 h-0.5 bg-emerald-400 rounded-full" />
                  <span className="text-xs font-semibold text-stone-300">
                    {motivation?.author}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={handleCopyQuote}
              disabled={quoteLoading}
              title="Salin kata-kata semangat"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Disalin' : 'Salin'}</span>
            </button>
            <button
              onClick={handleRefreshQuote}
              disabled={quoteLoading}
              title="Jana kata-kata semangat baharu"
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${quoteLoading ? 'animate-spin' : ''}`} />
              <span>Jana Baharu</span>
            </button>
          </div>
        </div>
      </section>

      {/* TWO-COLUMN GRID: EXAM COUNTDOWN (Section 1) & POMODORO TIMER (Section 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==========================================
            SECTION 1: EXAM COUNTDOWN
           ========================================== */}
        <div id="exam-countdown-card" className="lg:col-span-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Target className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Sasaran Utama
                </span>
              </div>
              <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
                {examTarget.title}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Tarikh: {new Date(examTarget.targetDate).toLocaleDateString('ms-MY', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <button
              onClick={() => setIsEditingExam(!isEditingExam)}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Tukar</span>
            </button>
          </div>

          {/* Edit Target Form Modal / Inline Box */}
          {isEditingExam && (
            <form onSubmit={handleSaveExamTarget} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/80 space-y-3 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Tetapkan Peperiksaan & Tarikh Sasaran
              </span>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetQuickExamPreset('Peperiksaan SPM 2026', 3)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 hover:border-theme-primary text-stone-700 dark:text-stone-200"
                >
                  SPM 2026
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickExamPreset('Peperiksaan Percubaan SPM', 1)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 hover:border-theme-primary text-stone-700 dark:text-stone-200"
                >
                  Percubaan SPM
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickExamPreset('Ujian Akhir Sesi Akademik (UASA)', 2)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 hover:border-theme-primary text-stone-700 dark:text-stone-200"
                >
                  UASA Tingkatan 1-3
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">
                  Nama Peperiksaan
                </label>
                <input
                  type="text"
                  value={editExamTitle}
                  onChange={(e) => setEditExamTitle(e.target.value)}
                  placeholder="Cth: Peperiksaan SPM 2026"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">
                  Tarikh & Masa Peperiksaan
                </label>
                <input
                  type="datetime-local"
                  value={editExamDate}
                  onChange={(e) => setEditExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 cursor-pointer"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingExam(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl btn-theme-primary text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Sasaran
                </button>
              </div>
            </form>
          )}

          {/* Real-Time Countdown Blocks (Days, Hours, Minutes, Seconds) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 py-2">
            <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-center">
              <span className="block text-2xl sm:text-4xl font-black text-amber-700 dark:text-amber-300 font-mono tracking-tight">
                {countdown.days}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-800/80 dark:text-amber-400 uppercase tracking-wider mt-1 block">
                Hari
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-center">
              <span className="block text-2xl sm:text-4xl font-black text-amber-700 dark:text-amber-300 font-mono tracking-tight">
                {countdown.hours.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-800/80 dark:text-amber-400 uppercase tracking-wider mt-1 block">
                Jam
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-center">
              <span className="block text-2xl sm:text-4xl font-black text-amber-700 dark:text-amber-300 font-mono tracking-tight">
                {countdown.minutes.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-800/80 dark:text-amber-400 uppercase tracking-wider mt-1 block">
                Minit
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-center">
              <span className="block text-2xl sm:text-4xl font-black text-amber-700 dark:text-amber-300 font-mono tracking-tight">
                {countdown.seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-800/80 dark:text-amber-400 uppercase tracking-wider mt-1 block">
                Saat
              </span>
            </div>
          </div>

          {/* Motivational Reminder Note */}
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>
                {countdown.days > 30
                  ? `${countdown.days} hari lagi. Tetapkan matlamat ulangkaji 1 bab sehari!`
                  : countdown.days > 0
                  ? `Fasa pecutan akhir! Tinggal ${countdown.days} hari. Fokus kepada soalan percubaan.`
                  : 'Hari peperiksaan telah tiba! Semoga beroleh kejayaan cemerlang.'}
              </span>
            </span>
          </div>
        </div>

        {/* ==========================================
            SECTION 2: POMODORO TIMER
           ========================================== */}
        <div id="pomodoro-timer-card" className="lg:col-span-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-theme-surface text-theme-primary">
                  <Timer className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Teknik Fokus Pomodoro
                </span>
              </div>
              <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
                {pomodoroMode === 'focus' ? 'Sesi Fokus Belajar (25m)' : 'Sesi Rehat Minda (5m)'}
              </h2>
            </div>

            {/* Mode Switch Pills */}
            <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleSwitchPomodoroMode('focus')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  pomodoroMode === 'focus'
                    ? 'bg-white dark:bg-stone-900 text-theme-primary shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Fokus 25m</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchPomodoroMode('break')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  pomodoroMode === 'break'
                    ? 'bg-white dark:bg-stone-900 text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Rehat 5m</span>
              </button>
            </div>
          </div>

          {/* Alert Message upon session completion */}
          {timerAlertMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{timerAlertMessage}</span>
            </div>
          )}

          {/* Big Time Display & Visual Progress Bar */}
          <div className="flex flex-col items-center justify-center py-2 space-y-4">
            <div className="relative flex items-center justify-center">
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-stone-900 dark:text-stone-100">
                {formatTimerDigits(timeLeft)}
              </span>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  pomodoroMode === 'focus' ? 'btn-theme-primary' : 'bg-teal-500'
                }`}
                style={{ width: `${pomodoroProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Controls: Start/Pause and Reset */}
          <div className="flex items-center gap-3">
            <button
              id="pomodoro-toggle-btn"
              type="button"
              onClick={toggleTimer}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.99] ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'btn-theme-primary text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Jeda / Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Mula Sesi {pomodoroMode === 'focus' ? 'Fokus' : 'Rehat'}</span>
                </>
              )}
            </button>

            <button
              id="pomodoro-reset-btn"
              type="button"
              onClick={handleResetTimer}
              className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              title="Tetapkan Semula Masa"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* LOWER TWO-COLUMN GRID: HOMEWORK TRACKER (Section 3) & STUDY SCHEDULE (Section 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==========================================
            SECTION 3: HOMEWORK TRACKER
           ========================================== */}
        <div id="homework-tracker-card" className="lg:col-span-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-theme-surface text-theme-primary">
                  <ListTodo className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Senarai Tugasan
                </span>
              </div>
              <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
                Homework Tracker
              </h2>
            </div>

            <button
              id="add-homework-btn"
              type="button"
              onClick={() => setShowAddTaskForm(!showAddTaskForm)}
              className="px-3 py-1.5 rounded-xl btn-theme-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-stone-600 dark:text-stone-300">Kemajuan Tugasan</span>
              <span className="text-theme-primary">{taskStats.completed} / {taskStats.total} ({taskStats.percent}%)</span>
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
              <div
                className="btn-theme-primary h-full transition-all duration-300"
                style={{ width: `${taskStats.percent}%` }}
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 text-xs font-bold">
            <button
              onClick={() => setTaskFilter('all')}
              className={`pb-1 px-1 transition-colors cursor-pointer border-b-2 ${
                taskFilter === 'all'
                  ? 'border-theme-primary text-theme-primary'
                  : 'border-transparent text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              Semua ({tasks.length})
            </button>
            <button
              onClick={() => setTaskFilter('pending')}
              className={`pb-1 px-1 transition-colors cursor-pointer border-b-2 ${
                taskFilter === 'pending'
                  ? 'border-theme-primary text-theme-primary'
                  : 'border-transparent text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              Belum Selesai ({tasks.filter((t) => !t.completed).length})
            </button>
            <button
              onClick={() => setTaskFilter('completed')}
              className={`pb-1 px-1 transition-colors cursor-pointer border-b-2 ${
                taskFilter === 'completed'
                  ? 'border-theme-primary text-theme-primary'
                  : 'border-transparent text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              Selesai ({tasks.filter((t) => t.completed).length})
            </button>
          </div>

          {/* Add Task Form */}
          {showAddTaskForm && (
            <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-3 animate-in fade-in">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Tambah Kerja Rumah / Tugasan Baru
              </span>

              <div>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Tajuk tugasan (cth: Siapkan Latihan Sains ms 45)"
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                    Subjek
                  </label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  >
                    {SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                    Tarikh Akhir (Due Date)
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddTaskForm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-200/60 dark:hover:bg-stone-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl btn-theme-primary text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Tugasan
                </button>
              </div>
            </form>
          )}

          {/* Task List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                Tiada tugasan dalam senarai ini. Klik butang <strong>+ Tambah</strong> di atas.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    task.completed
                      ? 'bg-stone-50/50 dark:bg-stone-800/30 border-stone-200/60 dark:border-stone-800/60 opacity-70'
                      : 'bg-white dark:bg-stone-800/60 border-stone-200/80 dark:border-stone-700 shadow-2xs hover:border-theme-primary/40'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 text-stone-400 hover:text-theme-primary cursor-pointer shrink-0 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-bold leading-snug break-words ${
                          task.completed
                            ? 'line-through text-stone-400 dark:text-stone-500'
                            : 'text-stone-900 dark:text-stone-100'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                        <span className="font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300">
                          {task.subject}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
                            <Clock className="w-3 h-3" />
                            <span>Due: {task.dueDate}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-stone-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                    title="Padam Tugasan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ==========================================
            SECTION 4: STUDY SCHEDULE (TIME-BLOCK UI)
           ========================================== */}
        <div id="study-schedule-card" className="lg:col-span-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-theme-surface text-theme-primary">
                  <Calendar className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Jadual Waktu Harian
                </span>
              </div>
              <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
                Study Schedule
              </h2>
            </div>

            <button
              id="add-schedule-block-btn"
              type="button"
              onClick={() => setShowAddBlockModal(true)}
              className="px-3 py-1.5 rounded-xl btn-theme-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Blok</span>
            </button>
          </div>

          {/* Days Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {DEFAULT_SCHEDULE_DAYS.map((day) => {
              const isToday = day === currentDayName;
              const isSelected = day === selectedDay;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'btn-theme-primary text-white shadow-2xs'
                      : isToday
                      ? 'bg-theme-surface text-theme-primary border border-theme-primary/30'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {day} {isToday && '•'}
                </button>
              );
            })}
          </div>

          {/* Time-Block Schedule Timeline */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {dayBlocks.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                Tiada blok waktu belajar untuk hari <strong>{selectedDay}</strong>. Klik butang <strong>+ Tambah Blok</strong> untuk menyusun masa anda.
              </div>
            ) : (
              dayBlocks.map((block) => {
                const isNow = isBlockCurrentTime(block.startTime, block.endTime, block.day);

                return (
                  <div
                    key={block.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 relative overflow-hidden ${
                      isNow
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500/30'
                        : 'border-stone-200/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 hover:bg-stone-50 dark:hover:bg-stone-800/80'
                    }`}
                  >
                    {isNow && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-wider">
                        Sedang Berlangsung
                      </div>
                    )}

                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Time Column */}
                      <div className="w-16 shrink-0 text-left">
                        <span className="text-xs font-black text-stone-900 dark:text-stone-100 font-mono block">
                          {block.startTime}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono block">
                          hingga {block.endTime}
                        </span>
                      </div>

                      {/* Line Separator */}
                      <div className="w-1 self-stretch rounded-full bg-theme-primary/40 shrink-0" />

                      {/* Content */}
                      <div className="space-y-1 min-w-0">
                        <span className="text-[11px] font-black uppercase text-theme-primary block tracking-wider">
                          {block.subject}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                          {block.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteScheduleBlock(block.id)}
                      className="p-1.5 rounded-lg text-stone-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                      title="Padam Blok Waktu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal: Add Schedule Time Block */}
      {showAddBlockModal && (
        <div
          id="add-schedule-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowAddBlockModal(false)}
        >
          <div
            id="add-schedule-modal"
            className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
                Tambah Blok Jadual ({selectedDay})
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBlockModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddScheduleBlock} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block mb-1 uppercase">
                  Subjek
                </label>
                <select
                  value={blockSubject}
                  onChange={(e) => setBlockSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block mb-1 uppercase">
                  Aktiviti / Topik Ulangkaji
                </label>
                <input
                  type="text"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  placeholder="Cth: Latihan KBAT Bab 4 & Ringkasan Formula"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block mb-1 uppercase">
                    Masa Mula
                  </label>
                  <input
                    type="time"
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block mb-1 uppercase">
                    Masa Tamat
                  </label>
                  <input
                    type="time"
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBlockModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-theme-primary text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Blok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
