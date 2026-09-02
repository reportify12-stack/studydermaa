import React, { useState, useEffect } from 'react';
import { getAdminStudents, setStudentStatus, setStudentRole } from '../../services/adminService';
import { UserProfile, TingkatanType, TINGKATAN_OPTIONS } from '../../types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  CheckCircle,
  AlertTriangle,
  Award,
} from 'lucide-react';

interface AdminStudentsPageProps {
  navigate: (route: string) => void;
}

export const AdminStudentsPage: React.FC<AdminStudentsPageProps> = ({ navigate }) => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTingkatan, setSelectedTingkatan] = useState('all');

  // Promotion Confirmation Modal
  const [promoteModalUser, setPromoteModalUser] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const list = await getAdminStudents();
      setStudents(list);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      await setStudentStatus(user.uid, newStatus);
      setStudents((prev) =>
        prev.map((s) => (s.uid === user.uid ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleConfirmRolePromotion = async () => {
    if (!promoteModalUser) return;
    setActionLoading(true);
    try {
      const newRole = promoteModalUser.role === 'admin' ? 'student' : 'admin';
      await setStudentRole(promoteModalUser.uid, newRole);
      setStudents((prev) =>
        prev.map((s) => (s.uid === promoteModalUser.uid ? { ...s, role: newRole } : s))
      );
      setPromoteModalUser(null);
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesTing = selectedTingkatan === 'all' || s.tingkatan === selectedTingkatan;
    const sq = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !sq ||
      s.fullName.toLowerCase().includes(sq) ||
      s.username.toLowerCase().includes(sq) ||
      (s.school && s.school.toLowerCase().includes(sq));
    return matchesTing && matchesSearch;
  });

  return (
    <div id="admin-students-page" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
          Pengurusan Pelajar & Pengguna
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Senarai akaun pelajar sebenar yang berdaftar dalam sistem study.dermaa.
        </p>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, username, atau sekolah..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={selectedTingkatan}
            onChange={(e) => setSelectedTingkatan(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary transition-all"
          >
            <option value="all">Semua Tingkatan</option>
            {TINGKATAN_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          title="Belum ada pelajar berdaftar."
          description="Akaun pelajar baharu akan muncul di sini secara automatik selepas mereka melengkapkan borang pendaftaran."
          icon={Users}
        />
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Nama Pelajar / Username</th>
                  <th className="py-3.5 px-4">Tingkatan / Sekolah</th>
                  <th className="py-3.5 px-4 text-center">XP / Tahap</th>
                  <th className="py-3.5 px-4 text-center">Streak</th>
                  <th className="py-3.5 px-4 text-center">Peranan</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                {filteredStudents.map((stud) => (
                  <tr key={stud.uid} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">
                      <div className="text-stone-900 dark:text-stone-100">{stud.fullName}</div>
                      <div className="text-[11px] text-stone-400 font-mono">@{stud.username}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold">{stud.tingkatan}</div>
                      <div className="text-[11px] text-stone-400 truncate max-w-xs">
                        {stud.school || '-'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className="text-theme-primary">{stud.xp || 0} XP</span>
                      <span className="block text-[10px] text-stone-400">Tahap {stud.level || 1}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold">
                      {stud.streak || 0} Hari
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          stud.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                        }`}
                      >
                        {stud.role === 'admin' ? <Shield className="w-3 h-3" /> : null}
                        <span>{stud.role}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          stud.status === 'suspended'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {stud.status === 'suspended' ? 'Digantung' : 'Aktif'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                      {/* Toggle status */}
                      <button
                        onClick={() => handleToggleStatus(stud)}
                        className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                          stud.status === 'suspended'
                            ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                        }`}
                        title={stud.status === 'suspended' ? 'Aktifkan semula' : 'Gantung akaun'}
                      >
                        {stud.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>

                      {/* Role promote/demote */}
                      <button
                        onClick={() => setPromoteModalUser(stud)}
                        className="p-1.5 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
                        title={stud.role === 'admin' ? 'Jadikan Pelajar Biasa' : 'Lantik sebagai Pentadbir (Admin)'}
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Confirmation Modal */}
      {promoteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Tukar Peranan Pengguna
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Adakah anda pasti mahu menukar peranan untuk{' '}
                <strong>{promoteModalUser.fullName}</strong> (@{promoteModalUser.username}) kepada{' '}
                <strong className="text-purple-600 uppercase">
                  {promoteModalUser.role === 'admin' ? 'student' : 'admin'}
                </strong>
                ?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPromoteModalUser(null)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRolePromotion}
                disabled={actionLoading}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
              >
                {actionLoading ? 'Mengemas kini...' : 'Sahkan Pertukaran'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
