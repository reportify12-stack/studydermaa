import React, { useState, useEffect } from 'react';
import { getAdminStatistics, getAdminStudents } from '../../services/adminService';
import { PlatformStats, UserProfile, TINGKATAN_OPTIONS } from '../../types';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { BarChart3, Users, Award, TrendingUp, BookOpen, CheckCircle } from 'lucide-react';

interface AdminStatisticsPageProps {
  navigate: (route: string) => void;
}

export const AdminStatisticsPage: React.FC<AdminStatisticsPageProps> = ({ navigate }) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [st, studList] = await Promise.all([
          getAdminStatistics(),
          getAdminStudents(),
        ]);
        setStats(st);
        setStudents(studList);
      } catch (err) {
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute breakdown by Tingkatan
  const tingkatanBreakdown = TINGKATAN_OPTIONS.map((ting) => {
    const count = students.filter((s) => s.tingkatan === ting).length;
    const percentage = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
    return { ting, count, percentage };
  });

  return (
    <div id="admin-statistics-page" className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
          Analitik & Statistik Platform
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Laporan terperinci mengenai demografi pelajar, kadar penglibatan, dan pencapaian ujian KSSM.
        </p>
      </div>

      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase">Jumlah Pelajar</span>
              <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
                {stats?.totalStudents || 0}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase">Jumlah Nota KSSM</span>
              <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
                {stats?.totalNotes || 0}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase">Ujian Diselesaikan</span>
              <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
                {stats?.totalQuizAttempts || 0}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase">Purata Skor Keseluruhan</span>
              <div className="text-2xl font-black text-theme-primary mt-1">
                {stats?.averageQuizScore || 0}%
              </div>
            </div>
          </div>

          {/* Demographic Breakdown: Tingkatan */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-theme-primary" />
              <span>Taburan Pelajar Mengikut Tingkatan</span>
            </h2>

            <div className="space-y-3">
              {tingkatanBreakdown.map((item) => (
                <div key={item.ting} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700 dark:text-stone-300">{item.ting}</span>
                    <span className="text-stone-500">
                      {item.count} pelajar ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div
                      className="h-full btn-theme-primary transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
