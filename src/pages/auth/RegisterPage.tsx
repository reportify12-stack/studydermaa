import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { registerStudent, validateUsername, formatFirebaseError } from '../../firebase/authService';
import { TingkatanType, TINGKATAN_OPTIONS } from '../../types';
import { ArrowRight, AlertCircle, CheckCircle2, Loader2, User, Lock, Mail, School } from 'lucide-react';

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
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

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

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Sila masukkan alamat emel yang sah untuk pengesahan akaun.');
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
      // registerStudent creates user in Firebase Auth and immediately sends verification email
      await registerStudent({
        fullName,
        username,
        email: email.trim(),
        password,
        ...(selectedRole === 'student' ? { tingkatan, isDLP } : {}),
        school: school.trim() || undefined,
        role: selectedRole,
      });

      // Sign out immediately so user cannot access until email is verified
      await signOut(auth);
      setRegisteredEmail(email.trim());
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

        {/* Email Verification Pending Alert after Registration */}
        {registeredEmail ? (
          <div
            id="register-verification-alert"
            className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-stone-800 dark:text-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-lg font-black text-emerald-900 dark:text-emerald-200 font-display">
                Pendaftaran Berjaya! Sila Sahkan Emel Anda
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Pautan pengesahan telah dihantar ke alamat emel:
                <br />
                <span className="font-extrabold text-theme-primary">{registeredEmail}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-stone-900/60 border border-emerald-200/80 dark:border-emerald-800/80 text-xs text-stone-600 dark:text-stone-400 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Langkah Pengesahan:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
                <li>Buka aplikasi emel atau peti masuk (inbox) anda.</li>
                <li>Semak juga folder <strong>Spam / Junk</strong> sekiranya tiada di inbox utama.</li>
                <li>Klik pautan pengesahan akaun yang diterima daripada Firebase.</li>
                <li>Setelah disahkan, kembali ke laman ini dan log masuk.</li>
              </ol>
            </div>

            <button
              id="verification-goto-login-btn"
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 rounded-xl font-black text-xs btn-theme-primary shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Pergi ke Laman Log Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
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
              {/* Account Role Selector */}
              <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Pilih Peranan / Select Role <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-stone-400">
                    {selectedRole === 'teacher' ? 'Akaun Pendidik (Teacher)' : 'Akaun Murid (Student)'}
                  </span>
                </div>

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

              {/* Email (Required for email verification) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                    Emel <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-theme-primary font-semibold">Perlu untuk Pengesahan</span>
                </div>
                <div className="relative">
                  <input
                    id="register-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cth: ahmad@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
                    required
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
                    <div className="relative">
                      <input
                        id="register-school-input"
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="cth: SMK Derma"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
                      />
                      <School className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                      Sekolah / Institusi Bertugas
                    </label>
                    <span className="text-[11px] text-stone-400">Pilihan</span>
                  </div>
                  <div className="relative">
                    <input
                      id="register-teacher-school-input"
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

              {/* DLP Checkbox (Only for student role) */}
              {selectedRole === 'student' && (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                      Program Dwibahasa (DLP)
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                      Pilihan subjek Matematik & Sains dalam Bahasa Inggeris
                    </span>
                  </div>
                  <input
                    id="register-is-dlp-checkbox"
                    type="checkbox"
                    checked={isDLP}
                    onChange={(e) => setIsDLP(e.target.checked)}
                    className="w-4 h-4 text-theme-primary rounded border-stone-300 focus:ring-theme-primary/20 cursor-pointer"
                  />
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
                    <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                    Sahkan Kata Laluan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirmpassword-input"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulang kata laluan"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:border-theme-primary transition-all placeholder:text-stone-400"
                      required
                      autoComplete="new-password"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm btn-theme-primary shadow-xs flex items-center justify-center gap-2 mt-2 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftar & Menghantar Emel Pengesahan...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Akaun Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center pt-6 border-t border-stone-100 dark:border-stone-800">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Sudah mempunyai akaun?{' '}
            <button
              id="register-to-login-link"
              onClick={() => navigate('/login')}
              className="font-bold text-theme-primary hover:underline cursor-pointer"
            >
              Log Masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
