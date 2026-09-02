import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { loginUser, formatFirebaseError } from '../../firebase/authService';
import { LogIn, ArrowRight, AlertCircle, Loader2, Sparkles, User, Lock } from 'lucide-react';

interface LoginPageProps {
  navigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Sila masukkan username atau emel anda.');
      return;
    }
    if (!password) {
      setErrorMessage('Sila masukkan kata laluan.');
      return;
    }

    setLoading(true);
    try {
      const profile = await loginUser(identifier, password);
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.code ? formatFirebaseError(err.code) : err.message || 'Log masuk gagal.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-page-container" className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
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
            className="mb-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
              Username atau Emel
            </label>
            <div className="relative">
              <input
                id="login-identifier-input"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="cth: ahmad_arif atau ahmad@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-all placeholder:text-stone-400"
                required
                autoComplete="username"
              />
              <User className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                Kata Laluan
              </label>
              <button
                id="login-forgot-password-link"
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-theme-primary hover:underline font-medium"
              >
                Lupa kata laluan?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-all placeholder:text-stone-400"
                required
                autoComplete="current-password"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm btn-theme-primary shadow-xs flex items-center justify-center gap-2 mt-2 disabled:opacity-50 transition-all cursor-pointer"
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
              className="font-bold text-theme-primary hover:underline"
            >
              Daftar Sekarang
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
