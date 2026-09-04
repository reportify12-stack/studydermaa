import React, { useState } from 'react';
import { loginUser, formatFirebaseError } from '../../firebase/authService';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface LoginPageProps {
  navigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMessage('Sila masukkan emel atau username anda.');
      return;
    }
    if (!password) {
      setErrorMessage('Sila masukkan kata laluan.');
      return;
    }

    setLoading(true);
    try {
      const profile = await loginUser(cleanIdentifier, password);
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.code ? formatFirebaseError(err.code) : err.message || 'Log masuk gagal. Sila cuba lagi.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-page-container" className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl btn-theme-primary mx-auto flex items-center justify-center font-black text-xl mb-3 shadow-xs">
            d
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight">
            Selamat Kembali
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Log masuk ke akaun <span className="font-semibold text-theme-primary">study.dermaa</span> anda
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            id="login-error-alert"
            className="mb-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email-input"
              className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5"
            >
              Emel atau Username
            </label>
            <div className="relative">
              <input
                id="login-email-input"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="cth: pelajar@email.com atau username"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-all placeholder:text-stone-400 disabled:opacity-50"
                required
                autoComplete="username"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password-input"
                className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300"
              >
                Kata Laluan
              </label>
              <button
                id="login-forgot-password-link"
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-theme-primary hover:underline font-medium cursor-pointer"
              >
                Lupa kata laluan?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-all placeholder:text-stone-400 disabled:opacity-50"
                required
                autoComplete="current-password"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <button
                id="toggle-password-visibility-btn"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Sembunyi kata laluan' : 'Tunjuk kata laluan'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm btn-theme-primary shadow-xs flex items-center justify-center gap-2 mt-3 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyemak Log Masuk...</span>
              </>
            ) : (
              <>
                <span>Log Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center pt-6 border-t border-stone-100 dark:border-stone-800">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Belum mempunyai akaun?{' '}
            <button
              id="login-to-register-link"
              onClick={() => navigate('/register')}
              className="font-bold text-theme-primary hover:underline cursor-pointer"
            >
              Daftar Sekarang
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
