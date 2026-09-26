import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { loginUser, formatFirebaseError } from '../../firebase/authService';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  KeyRound,
} from 'lucide-react';

interface LoginPageProps {
  navigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

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
      // loginUser executes signInWithEmailAndPassword, verifies emailVerified,
      // and logs out immediately via signOut(auth) if !userCredential.user.emailVerified
      const profile = await loginUser(cleanIdentifier, password);
      if (profile.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (profile.role === 'student') {
        navigate('/student-dashboard');
      } else if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.code ? formatFirebaseError(err.code) : err.message || 'Log masuk gagal. Sila cuba lagi.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(false);

    const email = forgotEmail.trim();
    if (!email) {
      setForgotError('Sila masukkan emel anda.');
      return;
    }

    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setForgotSuccess(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      const msg = err.code ? formatFirebaseError(err.code) : err.message || 'Gagal menghantar pautan penetapan semula kata laluan.';
      setForgotError(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotSuccess(false);
    setForgotError(null);
  };

  return (
    <div id="login-page-container" className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 relative">
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

        {/* Error Alert (e.g. Email Not Verified or Invalid Credentials) */}
        {errorMessage && (
          <div
            id="login-error-alert"
            className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3 animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="space-y-1">
              <span className="font-bold block">Perhatian:</span>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
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
                onClick={() => {
                  setForgotError(null);
                  setForgotSuccess(false);
                  if (identifier.includes('@')) {
                    setForgotEmail(identifier.trim());
                  }
                  setShowForgotModal(true);
                }}
                className="text-xs text-theme-primary hover:underline font-medium cursor-pointer"
              >
                Lupa Kata Laluan?
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

      {/* Forgot Password Modal (Tailwind Dialog) */}
      {showForgotModal && (
        <div
          id="forgot-password-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div
            id="forgot-password-modal"
            className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-theme-surface text-theme-primary flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
                    Lupa Kata Laluan?
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Tetapkan semula kata laluan anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Alert */}
            {forgotSuccess ? (
              <div
                id="forgot-password-success-alert"
                className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-3"
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Pautan Berjaya Dihantar!</span>
                </div>
                <p className="leading-relaxed">
                  Pautan untuk menetapkan semula kata laluan telah berjaya dihantar ke emel anda. Sila semak peti masuk anda (termasuk folder Spam/Junk) dan ikuti arahan yang diberikan.
                </p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-2.5 px-4 rounded-xl font-bold btn-theme-primary text-xs mt-1"
                >
                  Kembali ke Log Masuk
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendPasswordReset} className="space-y-4">
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Sila masukkan alamat emel yang berdaftar dengan akaun anda. Kami akan menghantar pautan selamat untuk menetapkan semula kata laluan.
                </p>

                {forgotError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                    Alamat Emel Berdaftar
                  </label>
                  <div className="relative">
                    <input
                      id="forgot-email-input"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="cth: nama@email.com"
                      disabled={forgotLoading}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
                      required
                      autoComplete="email"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    id="forgot-submit-btn"
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs btn-theme-primary shadow-xs flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menghantar...</span>
                      </>
                    ) : (
                      <span>Hantar Pautan</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
