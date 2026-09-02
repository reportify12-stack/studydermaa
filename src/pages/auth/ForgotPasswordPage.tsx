import React, { useState } from 'react';
import { resetUserPassword, formatFirebaseError } from '../../firebase/authService';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ForgotPasswordPageProps {
  navigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigate }) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccess(false);

    if (!identifier.trim()) {
      setErrorMessage('Sila masukkan username atau emel akaun anda.');
      return;
    }

    setLoading(true);
    try {
      await resetUserPassword(identifier);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      const msg = err.code ? formatFirebaseError(err.code) : err.message || 'Gagal menghantar pautan tetapan semula.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="forgot-password-page" className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-xl">
        <button
          id="back-to-login-btn"
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Log Masuk</span>
        </button>

        <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display mb-1">
          Lupa Kata Laluan?
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          Masukkan emel atau username anda. Kami akan menghantar pautan selamat untuk menetapkan semula kata laluan anda.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Pautan Berjaya Dihantar!</span>
            </div>
            <p>
              Sila semak peti masuk emel anda (termasuk folder Spam) untuk arahan seterusnya.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 rounded-xl font-bold btn-theme-primary text-xs mt-2"
            >
              Kembali ke Log Masuk
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Emel atau Username
              </label>
              <div className="relative">
                <input
                  id="forgot-identifier-input"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="cth: ahmad@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              id="forgot-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm btn-theme-primary shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hantar Pautan Reset'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
