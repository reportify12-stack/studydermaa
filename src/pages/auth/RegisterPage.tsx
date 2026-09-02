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
  const [school, setSchool] = useState('');

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
      await registerStudent({
        fullName,
        username,
        email: email.trim() || undefined,
        password,
        tingkatan,
        school: school.trim() || undefined,
      });

      // Successful registration -> Navigate to dashboard
      navigate('/dashboard');
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
            Pendaftaran Pelajar
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Cipta akaun percuma untuk memulakan pembelajaran KSSM
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

          {/* Tingkatan & School (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                Tingkatan <span className="text-rose-500">*</span>
              </label>
              <select
                id="register-tingkatan-select"
                value={tingkatan}
                onChange={(e) => setTingkatan(e.target.value as TingkatanType)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all"
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
          </div>

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

          {/* Submit Button */}
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
                <span>DAFTAR AKAUN PELAJAR</span>
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
