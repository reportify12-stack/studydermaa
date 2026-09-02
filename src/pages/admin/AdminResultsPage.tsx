import React, { useState, useEffect } from 'react';
import { getAdminQuizAttempts } from '../../services/adminService';
import { QuizAttempt } from '../../types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { Award, Search, CheckCircle, XCircle, Clock } from 'lucide-react';

interface AdminResultsPageProps {
  navigate: (route: string) => void;
}

export const AdminResultsPage: React.FC<AdminResultsPageProps> = ({ navigate }) => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all');

  useEffect(() => {
    const fetchAttempts = async () => {
      setLoading(true);
      try {
        const list = await getAdminQuizAttempts(100);
        setAttempts(list);
      } catch (err) {
        console.error('Error fetching quiz attempts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const filteredAttempts = attempts.filter((att) => {
    const matchesStatus = filterStatus === 'all' || att.status === filterStatus;
    const sq = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !sq ||
      att.quizTitle.toLowerCase().includes(sq) ||
      att.studentUsername.toLowerCase().includes(sq);
    return matchesStatus && matchesSearch;
  });

  return (
    <div id="admin-results-page" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
          Rekod Keputusan Kuiz Pelajar
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Pantau prestasi, skor markah, dan masa menjawab semua pelajar di platform.
        </p>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kuiz atau nama pengguna..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary transition-all"
          >
            <option value="all">Semua Status (Lulus & Gagal)</option>
            <option value="passed">Lulus Sahaja</option>
            <option value="failed">Gagal Sahaja</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : filteredAttempts.length === 0 ? (
        <EmptyState
          title="Belum ada rekod percubaan kuiz."
          description="Rekod jawapan pelajar akan direkodkan di sini secara automatik selepas mereka menyelesaikan ujian."
          icon={Award}
        />
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Pelajar</th>
                  <th className="py-3.5 px-4">Tajuk Kuiz</th>
                  <th className="py-3.5 px-4 text-center">Skor</th>
                  <th className="py-3.5 px-4 text-center">Peratusan</th>
                  <th className="py-3.5 px-4 text-center">Masa Diambil</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Tarikh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                {filteredAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-stone-900 dark:text-stone-100">
                      @{att.studentUsername}
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      {att.quizTitle}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold">
                      {att.score} / {att.totalMarks}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-theme-primary">
                      {att.percentage}%
                    </td>

                    <td className="py-3.5 px-4 text-center text-stone-400">
                      {Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          att.status === 'passed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {att.status === 'passed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{att.status === 'passed' ? 'Lulus' : 'Gagal'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right text-stone-400 text-xs">
                      {new Date(att.completedAt).toLocaleDateString('ms-MY', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
