import React, { useState, useEffect } from 'react';
import { getAdminStatistics, getAdminStudents, getAdminQuizAttempts } from '../../services/adminService';
import { PlatformStats, UserProfile, QuizAttempt } from '../../types';
import { CardSkeleton, TableSkeleton } from '../../components/common/SkeletonLoader';
import {
  Users,
  BookOpen,
  FileText,
  HelpCircle,
  Award,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';

interface AdminOverviewPageProps {
  navigate: (route: string) => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({ navigate }) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentStudents, setRecentStudents] = useState<UserProfile[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const [st, studList, attList] = await Promise.all([
          getAdminStatistics(),
          getAdminStudents(),
          getAdminQuizAttempts(5),
        ]);
        setStats(st);
        setRecentStudents(studList.slice(0, 5));
        setRecentAttempts(attList);
      } catch (err) {
        console.error('Error fetching admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div id="admin-overview-page" className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-display">
            Ringkasan Platform Pentadbir
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Data statistik dan aktiviti masa nyata pangkalan data study.dermaa.
          </p>
        </div>

        {/* Quick Create buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/admin/notes')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold btn-theme-primary shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Nota</span>
          </button>
          <button
            onClick={() => navigate('/admin/quizzes')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kuiz</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Jumlah Pelajar
              </span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
              {stats?.totalStudents || 0}
            </span>
            <span className="text-[11px] text-stone-400 block mt-1">
              {stats?.activeStudentsToday || 0} aktif hari ini
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Subjek KSSM
              </span>
              <BookOpen className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
              {stats?.totalSubjects || 0}
            </span>
            <span className="text-[11px] text-stone-400 block mt-1">Tingkatan 1 - 5</span>
          </div>

          <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Nota Diterbitkan
              </span>
              <FileText className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
              {stats?.totalNotes || 0}
            </span>
            <span className="text-[11px] text-stone-400 block mt-1">Modul silibus</span>
          </div>

          <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Kuiz Interaktif
              </span>
              <HelpCircle className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
              {stats?.totalQuizzes || 0}
            </span>
            <span className="text-[11px] text-stone-400 block mt-1">Set latihan</span>
          </div>

          <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Percubaan Kuiz
              </span>
              <Award className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
              {stats?.totalQuizAttempts || 0}
            </span>
            <span className="text-[11px] text-stone-400 block mt-1">Selesai dijawab</span>
          </div>

          <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Purata Skor Kuiz
              </span>
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
              {stats?.averageQuizScore || 0}%
            </span>
            <span className="text-[11px] text-stone-400 block mt-1">Pencapaian pelajar</span>
          </div>
        </div>
      )}

      {/* Two columns: Recent Students & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display">
              Pelajar Terkini
            </h2>
            <button
              onClick={() => navigate('/admin/students')}
              className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
            >
              <span>Semua Pelajar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentStudents.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">
              Belum ada pelajar berdaftar.
            </p>
          ) : (
            <div className="space-y-2">
              {recentStudents.map((stud) => (
                <div
                  key={stud.uid}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">
                      {stud.fullName}
                    </span>
                    <span className="text-stone-400">
                      @{stud.username} • {stud.tingkatan}
                    </span>
                  </div>
                  <span className="font-bold text-theme-primary">
                    {stud.xp || 0} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quiz Attempts */}
        <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display">
              Percubaan Kuiz Terkini
            </h2>
            <button
              onClick={() => navigate('/admin/results')}
              className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
            >
              <span>Semua Keputusan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentAttempts.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">
              Belum ada rekod percubaan kuiz.
            </p>
          ) : (
            <div className="space-y-2">
              {recentAttempts.map((att) => (
                <div
                  key={att.id}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">
                      {att.quizTitle}
                    </span>
                    <span className="text-stone-400">
                      {att.studentUsername} • {att.percentage}%
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      att.status === 'passed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {att.status === 'passed' ? 'Lulus' : 'Gagal'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
