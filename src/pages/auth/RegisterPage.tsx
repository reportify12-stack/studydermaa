import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { registerStudent, validateUsername, formatFirebaseError } from '../../firebase/authService';
import { TingkatanType, TINGKATAN_OPTIONS } from '../../types';
import { UserPlus, ArrowRight, AlertCircle, CheckCircle2, Loader2, Sparkles, User, Lock, Mail, School, BookOpen } from 'lucide-react';

interface RegisterPageProps {
  navigate: (route: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tingkatan, setTingkatan] = useState<TingkatanType>('Tingkatan 1');
  const [isDLP, setIsDLP] = useState(false);
  const [school, setSchool] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (fullName.trim().length < 2) {
      setErrorMessage('Sila masukkan nama penuh anda yang sah.');
      return;
    }

    const usernameVal = validateUsername(username);
    if (!usernameVal.isValid) {
      setErrorMessage(usernameVal.error || 'Username tidak sah.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Kata laluan mestilah sekurang-kurangnya 8 aksara.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Kata laluan dan pengesahan kata laluan tidak sepadan.');
      return;
    }

    setLoading(true);
    try {
      const profile = await registerStudent({
        fullName,
        username,
        email: email.trim() || undefined,
        password,
        ...(selectedRole === 'student' ? { tingkatan, isDLP } : {}),
        school: school.trim() || undefined,
        role: selectedRole,
      });

      // Strict role-based redirection
      if (profile.role === 'teacher' || selectedRole === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (profile.role === 'student' || selectedRole === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const msg = err.code ? formatFirebaseError(err.code) : err.message || 'Pendaftaran gagal.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="register-page-container" className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 py-10">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl btn-theme-primary mx-auto flex items-center justify-center font-black text-xl mb-3 shadow-xs">
            d
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight">
            {selectedRole === 'teacher' ? 'Pendaftaran Guru' : 'Pendaftaran Pelajar'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {selectedRole === 'teacher'
              ? 'Daftar sebagai tenaga pengajar untuk mengurus bilik darjah SMK Derma dan tugasan KSSM.'
              : 'Cipta akaun percuma untuk memulakan pembelajaran KSSM study.dermaa.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            id="register-error-alert"
            className="mb-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Role Selector (Toggle Buttons only, redundant dropdown removed) */}
          <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Pilih Peranan / Select Role <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-stone-400">
                {selectedRole === 'teacher' ? 'Akaun Pendidik (Teacher)' : 'Akaun Murid (Student)'}
              </span>
            </div>

            {/* Visual Button Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-stone-200/60 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <button
                id="select-role-student-btn"
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'student'
                    ? 'bg-white dark:bg-stone-900 text-theme-primary shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student / Pelajar</span>
              </button>
              <button
                id="select-role-teacher-btn"
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'teacher'
                    ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Teacher / Guru</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Nama Penuh <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="register-fullname-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="cth: Ahmad Arif bin Razali"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="register-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="cth: ahmad_arif"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
                required
                autoComplete="username"
              />
              <User className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Hanya huruf kecil, nombor, dan garis bawah (_). Digunakan untuk log masuk.
            </p>
          </div>

          {/* Email (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                Emel
              </label>
              <span className="text-[11px] text-stone-400">Pilihan (Optional)</span>
            </div>
            <div className="relative">
              <input
                id="register-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cth: ahmad@gmail.com"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
                autoComplete="email"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Tingkatan & School: Conditional rendering based on role */}
          {selectedRole === 'student' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                  Tingkatan <span className="text-rose-500">*</span>
                </label>
                <select
                  id="register-tingkatan-select"
                  value={tingkatan}
                  onChange={(e) => setTingkatan(e.target.value as TingkatanType)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all cursor-pointer"
                  required
                >
                  {TINGKATAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                    Sekolah
                  </label>
                  <span className="text-[11px] text-stone-400">Pilihan</span>
                </div>
                <input
                  id="register-school-input"
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="cth: SMK Derma"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
                />
              </div>

              {/* Dual Language Programme (DLP) Toggle */}
              <div className="sm:col-span-2 p-3.5 rounded-2xl border border-sky-200/90 dark:border-sky-800/70 bg-sky-50/60 dark:bg-sky-950/30">
                <label htmlFor="register-dlp-toggle" className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="register-dlp-toggle"
                    checked={isDLP}
                    onChange={(e) => setIsDLP(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-stone-300 dark:border-stone-600 accent-sky-600 cursor-pointer"
                  />
                  <div className="text-xs">
                    <div className="flex items-center gap-2 font-bold text-sky-950 dark:text-sky-100">
                      <span>Program DwiBahasa (Dual Language Programme - DLP)</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-100 dark:bg-sky-900/80 text-sky-700 dark:text-sky-300 font-black">
                        English
                      </span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-400 text-[11px] mt-0.5 leading-relaxed">
                      Tandakan jika anda mengikuti kelas DLP bagi subjek <strong>Matematik</strong> dan <strong>Sains</strong> (pembelajaran & latihan dalam Bahasa Inggeris).
                    </p>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  Sekolah / Institusi Pendidik
                </label>
                <span className="text-[11px] text-stone-400">Pilihan</span>
              </div>
              <div className="relative">
                <input
                  id="register-school-input"
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="cth: SMK Derma, Kangar"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
                />
                <School className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
              </div>
            </div>
          )}

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Kata Laluan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="register-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 aksara"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Sahkan Kata Laluan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulang kata laluan"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          {/* Submit Button with Dynamic Text */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm btn-theme-primary shadow-xs flex items-center justify-center gap-2 mt-4 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mendaftar Akaun...</span>
              </>
            ) : (
              <>
                <span>{selectedRole === 'teacher' ? 'DAFTAR AKAUN GURU' : 'DAFTAR AKAUN PELAJAR'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center pt-5 border-t border-stone-100 dark:border-stone-800">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Sudah mempunyai akaun?{' '}
            <button
              id="register-to-login-link"
              onClick={() => navigate('/login')}
              className="font-bold text-theme-primary hover:underline"
            >
              Log Masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
