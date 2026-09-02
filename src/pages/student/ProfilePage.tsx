import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../firebase/authService';
import { TingkatanType, TINGKATAN_OPTIONS } from '../../types';
import { calculateLevelFromXp } from '../../services/xpService';
import {
  User,
  School,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Award,
  Zap,
  Flame,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface ProfilePageProps {
  navigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { userProfile, isAdmin, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [tingkatan, setTingkatan] = useState<TingkatanType>(userProfile?.tingkatan || 'Tingkatan 1');
  const [school, setSchool] = useState(userProfile?.school || '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!userProfile) return null;

  const levelInfo = calculateLevelFromXp(userProfile.xp || 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg('Nama penuh mestilah sekurang-kurangnya 2 aksara.');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(userProfile.uid, {
        fullName: fullName.trim(),
        tingkatan,
        school: school.trim() || undefined,
      });
      await refreshProfile();
      setSuccessMsg('Profil berjaya dikemas kini!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setErrorMsg(err.message || 'Gagal mengemas kini profil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="profile-page" className="max-w-3xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight mb-2">
          Profil Pelajar
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
          Maklumat akaun dan statistik pencapaian peribadi anda di platform study.dermaa.
        </p>
      </div>

      {/* Admin Panel Quick Access Banner if Admin */}
      {isAdmin && (
        <div className="p-5 rounded-3xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/80 dark:bg-purple-950/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-purple-900 dark:text-purple-100">
                Akaun Pentadbir Sistem (Admin)
              </h3>
              <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
                Anda mempunyai kebenaran penuh untuk mengurus Subjek, Nota, Kuiz, dan Pengguna.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Buka Panel Pentadbir</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Success/Error alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-3 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs text-center">
        <div>
          <span className="text-[10px] text-stone-400 block uppercase font-bold">Mata Pengalaman</span>
          <span className="text-base sm:text-xl font-black text-theme-primary">
            {userProfile.xp || 0} XP
          </span>
          <span className="text-[11px] text-stone-400 block font-medium">
            Tahap {levelInfo.level} ({levelInfo.title})
          </span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block uppercase font-bold">Streak Semasa</span>
          <span className="text-base sm:text-xl font-black text-orange-600 dark:text-orange-400">
            {userProfile.streak || 0} Hari
          </span>
          <span className="text-[11px] text-stone-400 block font-medium">
            Rekod: {userProfile.longestStreak || 0} Hari
          </span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block uppercase font-bold">Peranan Akaun</span>
          <span className="text-base sm:text-xl font-black text-stone-900 dark:text-stone-100 capitalize">
            {userProfile.role}
          </span>
          <span className="text-[11px] text-stone-400 block font-medium">
            Sertai: {new Date(userProfile.createdAt).toLocaleDateString('ms-MY')}
          </span>
        </div>
      </div>

      {/* Editable Form */}
      <form
        onSubmit={handleSave}
        className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-4"
      >
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
          Kemaskini Maklumat
        </h2>

        {/* Username (Read Only) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
            Username (Kekal / Tidak Boleh Diubah)
          </label>
          <input
            type="text"
            value={`@${userProfile.username}`}
            disabled
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-800/80 text-stone-500 text-sm cursor-not-allowed font-mono"
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
            Nama Penuh
          </label>
          <input
            id="profile-fullname-input"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all"
            required
          />
        </div>

        {/* Tingkatan & School */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Tingkatan
            </label>
            <select
              id="profile-tingkatan-select"
              value={tingkatan}
              onChange={(e) => setTingkatan(e.target.value as TingkatanType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all"
            >
              {TINGKATAN_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Sekolah
            </label>
            <input
              id="profile-school-input"
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="cth: SMK Derma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            id="profile-save-btn"
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs btn-theme-primary shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
