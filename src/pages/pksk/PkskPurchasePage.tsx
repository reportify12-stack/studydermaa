import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Crown,
  CheckCircle2,
  Clock,
  Brain,
  ChevronLeft,
  Zap,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface PkskPurchasePageProps {
  navigate: (route: string) => void;
}

export const PkskPurchasePage: React.FC<PkskPurchasePageProps> = ({ navigate }) => {
  const { user, userProfile } = useAuth();

  const userEmail = user?.email || userProfile?.email || 'emel_anda@gmail.com';
  const whatsappNumber = '60195677349';
  const prefilledMessage = `Salam admin study.dermaa, saya berminat nak join Simulasi PKSK untuk akaun emel: ${userEmail}. Boleh kongsikan QR kod untuk bayaran?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(prefilledMessage)}`;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950">
      {/* Top Bar */}
      <div className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            id="pksk-back-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Laman Pelajar</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Akses Khas Kemasukan 2026
            </span>
          </div>
        </div>
      </div>

      {/* Main Pitch Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full flex-1">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Crown className="w-4 h-4" />
            <span>Portal Khas Calon Tahun 6 & Tingkatan 3</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Simulasi PKSK Perdana
          </h1>
          <p className="text-base sm:text-lg text-stone-400 max-w-2xl mx-auto">
            Persediaan intensif peperiksaan Pentaksiran Kemasukan Sekolah Khusus (MRSM, SBP, SMKA, MTD, KV) dengan soalan AI pintar, analisis EQ & IQ, dan pemasa langsung.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Kecerdasan Insaniah (EQ)</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Ujian pertimbangan situasi (SJT), kepimpinan bilik darjah & asrama, empati rakan, dan integriti moral standard KPM.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Kecerdasan Intelek (IQ)</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Penaakulan logik, pola urutan nombor, aplikasi sains harian STEM, dan kenegaraan/sejarah Malaysia.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Penjejak Sasaran & Masa</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Kiraan detik dinamik ke tarikh peperiksaan sebenar dan pemantauan penanda aras sekolah pilihan idaman.
            </p>
          </div>
        </div>

        {/* Pricing & WhatsApp Action Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-stone-800">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-stone-950">
                Pakej Penuh VIP
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Pas Simulasi PKSK 2026
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Akses tanpa had ke bank soalan simulasi AI dan penjejak kemasukan sekolah khusus.
              </p>
            </div>
            <div className="text-center md:text-right shrink-0">
              <div className="text-xs text-stone-500 line-through">RM 50.00</div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400">
                RM 36.00
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                Sekali Bayar • Akses Sepanjang Musim
              </span>
            </div>
          </div>

          <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Simulasi 5 Soalan Adaptif PKSK tanpa had',
              'Kecerdasan Insaniah (EQ 20%) & Intelek (IQ 70%)',
              'Ulasan & skema pedagogi lengkap serta-merta',
              'Pemasa undur ke tarikh peperiksaan sebenar',
              'Pilihan sekolah sasaran (MRSM / SBP / SMKA / MTD)',
              'Rekod sejarah prestasi & markah disimpan ke Firestore',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* User Account Context Banner */}
          <div className="p-3.5 mb-6 rounded-xl bg-stone-950/70 border border-stone-800/90 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-stone-400">Akaun emel yang akan diaktifkan:</span>
            <span className="font-mono font-bold text-amber-300">{userEmail}</span>
          </div>

          {/* Main WhatsApp Action */}
          <div className="pt-2 flex flex-col items-center text-center gap-3">
            <a
              id="pksk-whatsapp-inquiry-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Dapatkan Akses melalui WhatsApp (RM36.00)</span>
              <ExternalLink className="w-4 h-4 text-stone-900" />
            </a>

            <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Klik butang di atas untuk mesej admin di WhatsApp (019-567 7349). Admin akan kongsikan kod QR DuitNow dan mengaktifkan akaun anda serta-merta.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 border-t border-stone-800 text-center text-xs text-stone-500">
        study.dermaa • Program Simulasi PKSK Bersepadu
      </div>
    </div>
  );
};

