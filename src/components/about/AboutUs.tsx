import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Users,
  Compass,
  Heart,
  TrendingUp,
  Award,
  ShieldCheck,
  Flame,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Lightbulb,
  CheckCircle2,
  Share2,
  Tv,
  Video,
  GraduationCap,
  Star,
  Check,
} from 'lucide-react';

interface AboutUsProps {
  navigate?: (route: string) => void;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleCategory: string;
  avatarInitials: string;
  avatarGradient: string;
  bio: string;
  expertise: string[];
}

export const AboutUs: React.FC<AboutUsProps> = ({ navigate }) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Organizational Chart Team Members
  const teamMembers: TeamMember[] = [
    {
      id: 'member-1',
      name: 'Hadieff Zhafran',
      role: 'Pengasas study.dermaa',
      roleCategory: 'Administration / Pentadbiran',
      avatarInitials: 'HZ',
      avatarGradient: 'from-emerald-500 to-teal-600 text-white',
      bio: 'Pendidik berjiwa inovatif yang memulakan study.dermaa untuk mentransformasi pengalaman pembelajaran murid SMK Derma ke peringkat digital bermakna.',
      expertise: ['Pedagogi Digital', 'KSSM Sains & Matematik', 'Minda Berkembang'],
    },
    {
      id: 'member-2',
      name: 'Hasniyah Ibrahim',
      role: 'Ketua Penyelaras Kurikulum & KSSM',
      roleCategory: 'Akademik & DSKP',
      avatarInitials: 'HI',
      avatarGradient: 'from-amber-500 to-orange-600 text-white',
      bio: 'Memastikan setiap nota, kuiz, dan modul pembelajaran mematuhi standard DSKP KPM dengan penekanan pada aplikasi soalan aras tinggi (KBAT).',
      expertise: ['Penyelarasan DSKP', 'Teknik Menjawab SPM', 'Penilaian Formatif'],
    },
    {
      id: 'member-3',
      name: 'Zara Aisyah',
      role: 'Ketua Arkitek Teknologi & Pembangun Web',
      roleCategory: 'Teknologi & Kejuruteraan',
      avatarInitials: 'ZA',
      avatarGradient: 'from-sky-500 to-indigo-600 text-white',
      bio: 'Merekabentuk seni bina aplikasi pantas, sistem gamifikasi XP, dan integrasi AI Tutor untuk memastikan platform sentiasa intuitif dan mudah diakses.',
      expertise: ['Fullstack Web', 'Kecerdasan Buatan (AI)', 'Seni Bina Awan'],
    },
    {
      id: 'member-4',
      name: 'Siti Faridah' ,
      role: 'Pakar Pembelajaran STEM & Program DLP',
      roleCategory: 'Kandungan Dwibahasa',
      avatarInitials: 'SF',
      avatarGradient: 'from-purple-500 to-pink-600 text-white',
      bio: 'Menerajui modul dwibahasa (Dual Language Programme) dalam Matematik dan Sains bagi membina keyakinan penguasaan istilah saintifik antarabangsa.',
      expertise: ['Silibus DLP', 'Modul Interaktif', 'Visualisasi Sains'],
    },
    {
      id: 'member-5',
      name: 'Adrian Eusuf',
      role: 'Ketua Penggerak Komuniti Murid',
      roleCategory: 'Suara Pelajar & Komuniti',
      avatarInitials: 'AE',
      avatarGradient: 'from-rose-500 to-red-600 text-white',
      bio: 'Menghubungkan maklum balas harian murid dengan pembangun platform, menganjurkan cabaran belajar mingguan dan menyemarakkan budaya saling bantu.',
      expertise: ['Penglibatan Murid', 'Gamifikasi Belajar', 'Sokongan Rakan Sebaya'],
    },
    {
      id: 'member-6',
      name: 'Hilman Nulhakim',
      role: 'Pereka Pengalaman Pembelajaran & Media',
      roleCategory: 'Reka Bentuk & Visual',
      avatarInitials: 'HN',
      avatarGradient: 'from-teal-500 to-emerald-600 text-white',
      bio: 'Menggubah bahan pembelajaran yang padat menjadi infografik estetik, memastikan setiap reka letak mesra mata dan mencetuskan kegembiraan belajar.',
      expertise: ['UI/UX Pendidikan', 'Infografik KSSM', 'Media Interaktif'],
    },
  ];

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/about-us');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleOpenSocial = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="about-us-page-root" className="space-y-16 sm:space-y-24 pb-20 animate-fade-in text-stone-900 dark:text-stone-100">
      {/* 1. HERO SECTION: Vision & Identity */}
      <section className="text-center pt-4 sm:pt-10 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-theme-surface text-theme-primary text-xs font-bold border border-theme-primary/30 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mengenai Platform study.dermaa</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 dark:text-stone-50 font-display tracking-tight leading-tight">
          Bukan Sekadar Platform Belajar, <br className="hidden sm:inline" />
          Tetapi Sebuah <span className="text-theme-primary">Khabar Baik Budaya Pembelajaran</span>.
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto">
          Dilahirkan daripada aspirasi komuniti <strong>SMK Derma, Kangar</strong> dan diperluaskan untuk seluruh murid Malaysia. Kami membina ekosistem di mana belajar bukan lagi tentang tekanan dan hafalan sempit, tetapi pengembaraan ilmu yang memberdayakan dan menggembirakan.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {navigate && (
            <button
              onClick={() => navigate('/belajar')}
              className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm btn-theme-primary shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <span>Mula Belajar Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleCopyShare}
            className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-stone-400" />}
            <span>{copiedLink ? 'Pautan Disalin!' : 'Kongsi Halaman'}</span>
          </button>
        </div>
      </section>

      {/* 2. CULTURE & IMPACT: Replacing Traditional History */}
      <section id="culture-and-impact" className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-theme-primary">
            <Compass className="w-4 h-4" />
            <span>Khabar Baik Budaya Pembelajaran</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-stone-900 dark:text-stone-100">
            Mengapa Kami Meninggalkan Paradigma Lama
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            Sejarah bukan sekadar tarikh penubuhan di atas kertas. Sejarah sebenar kami adalah perubahan hidup murid apabila mereka menemukan kembali cinta terhadap ilmu.
          </p>
        </div>

        {/* Culture Comparison Matrix Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* The Old Exhausting Way */}
          <div className="p-6 sm:p-8 rounded-3xl border border-rose-200/80 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                Budaya Tradisional Lapuk
              </span>
              <span className="text-xs font-semibold text-rose-500">Masa Lalu</span>
            </div>

            <h3 className="text-xl font-black text-rose-950 dark:text-rose-200 font-display">
              Belajar dalam Ketakutan, Tekanan & Kesunyian
            </h3>

            <ul className="space-y-3.5 text-xs sm:text-sm text-rose-900/80 dark:text-rose-300/80 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>Hafalan Buta:</strong> Terpaksa menghafal formula dan fakta tanpa memahami kenapa konsep tersebut wujud atau bagaimana ia berfungsi di dunia nyata.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>Malu Bertanya:</strong> Murid berdiam diri di dalam kelas kerana takut dianggap lemah, membiarkan jurang pemahaman berlanjutan hingga ke dewan peperiksaan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span><strong>Beban & Tekanan:</strong> Kejayaan diukur semata-mata dengan gred peperiksaan akhir, mengabaikan proses ketabahan dan disiplin harian.</span>
              </li>
            </ul>
          </div>

          {/* The study.dermaa Cultural Breakthrough */}
          <div className="p-6 sm:p-8 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                Khabar Baik study.dermaa
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Budaya Baharu</span>
              </span>
            </div>

            <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-200 font-display">
              Kefahaman Hakiki, Rasa Selamat & Pertumbuhan Minda
            </h3>

            <ul className="space-y-3.5 text-xs sm:text-sm text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-1 shrink-0" />
                <span><strong>Kefahaman Berperingkat:</strong> Nota visual padat, pemecahan langkah demi langkah, dan latihan berasaskan KBAT yang melatih kemahiran berfikir kritis.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-1 shrink-0" />
                <span><strong>Ruang Selamat Bertanya 24/7:</strong> Dengan AI Tutor pintar dan rakan sebaya, tiada soalan yang dianggap janggal. Murid boleh bertanya sehingga benar-benar faham.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-1 shrink-0" />
                <span><strong>Disiplin Mikro & Ganjaran XP:</strong> Setiap 25 minit Pomodoro dan setiap kuiz selesai diraikan dengan mata XP dan streak berterusan, memupuk tabiat belajar konsisten.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Impact Numbers Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-stone-900 text-white shadow-xl">
          <div className="text-center space-y-1">
            <span className="text-2xl sm:text-4xl font-black font-display text-emerald-400">100%</span>
            <span className="block text-[11px] sm:text-xs font-bold text-stone-300 uppercase tracking-wider">
              DSKP KSSM Terkini
            </span>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl sm:text-4xl font-black font-display text-sky-400">4,500+</span>
            <span className="block text-[11px] sm:text-xs font-bold text-stone-300 uppercase tracking-wider">
              Soalan Kuiz Topikal
            </span>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl sm:text-4xl font-black font-display text-amber-400">24/7</span>
            <span className="block text-[11px] sm:text-xs font-bold text-stone-300 uppercase tracking-wider">
              Bimbingan AI Tutor
            </span>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl sm:text-4xl font-black font-display text-purple-400">T1 - SPM</span>
            <span className="block text-[11px] sm:text-xs font-bold text-stone-300 uppercase tracking-wider">
              Liputan Menengah Lengkap
            </span>
          </div>
        </div>

        {/* 3 Core Philosophical Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-theme-surface text-theme-primary flex items-center justify-center">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display text-stone-900 dark:text-stone-100">
              1. Rasa Ingin Tahu Mendalam
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Kami menyusun bahan pembelajaran untuk mencetuskan persoalan 'kenapa' dan 'bagaimana', bukan sekadar menyuruh murid mengingat jawapan akhir.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display text-stone-900 dark:text-stone-100">
              2. Digniti & Kesejahteraan Emosi
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Setiap murid mempunyai kadar pemahaman tersendiri. Platform ini menghormati tempo peribadi setiap individu tanpa sebarang bentuk penghakiman.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display text-stone-900 dark:text-stone-100">
              3. Kebersamaan Komuniti
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Membina semangat persaudaraan akademik di mana murid saling berkongsi nota, menyemak kefahaman, dan meraikan kejayaan kawan-kawan.
            </p>
          </div>
        </div>
      </section>

      {/* 3. ORGANIZATIONAL CHART: Responsive Grid (grid-cols-1 md:grid-cols-3) */}
      <section id="organizational-chart" className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-theme-primary">
            <Users className="w-4 h-4" />
            <span>Kepimpinan & Pasukan Pendidik</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-stone-900 dark:text-stone-100">
            Carta Organisasi
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
            Didorong oleh gabungan guru berpengalaman, jurutera teknologi, dan pemimpin pelajar yang berdedikasi membina masa depan pendidikan digital.
          </p>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-theme-primary/50 dark:hover:border-theme-primary/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Circular Avatar Placeholder with Aesthetic Ring */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${member.avatarGradient} flex items-center justify-center font-black text-xl shadow-md ring-4 ring-stone-100 dark:ring-stone-800 group-hover:ring-theme-primary/30 transition-all`}
                    >
                      {member.avatarInitials}
                    </div>
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" title="Aktif Berkhidmat" />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-theme-primary block">
                      {member.roleCategory}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display leading-snug group-hover:text-theme-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-800/80 pt-3">
                  {member.bio}
                </p>
              </div>

              {/* Tags / Expertise */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                {member.expertise.map((exp, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. COMMUNITY CONNECTIONS: Official Channels Block (TikTok, Instagram, YouTube) */}
      <section id="community-connections" className="p-8 sm:p-10 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-theme-primary">
            <Tv className="w-4 h-4" />
            <span>Sambungan Komuniti & Media Rasmi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-stone-900 dark:text-stone-100">
            Sertai Komuniti Pembelajaran Digital Kami
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            Dapatkan tip ulangkaji pantas, jadual kelas dalam talian, dan sokongan harian menerusi saluran media sosial rasmi study.dermaa.
          </p>
        </div>

        {/* 3 Distinct Channel Buttons / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TikTok Channel Card */}
          <div className="p-6 rounded-3xl border border-stone-800 bg-stone-900 text-white flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {/* TikTok Badge */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-black border border-stone-700 flex items-center justify-center">
                    {/* SVG TikTok Icon */}
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.87-4.49V8.87a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.87-.3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight text-white group-hover:text-cyan-300 transition-colors">TikTok</h3>
                    <span className="text-[11px] text-stone-400">@study.dermaa</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Tip Pantas
                </span>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Video 60-saat cara mudah mengingati fakta sejarah, formula matematik pantas, dan cabaran belajar harian.
              </p>
            </div>

            <button
              onClick={() => handleOpenSocial('https://www.tiktok.com/@study.dermaa')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-stone-950 hover:bg-stone-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
            >
              <span>Ikuti di TikTok</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Instagram Channel Card */}
          <div className="p-6 rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-purple-600/10 dark:from-amber-950/20 dark:via-rose-950/20 dark:to-purple-950/20 text-stone-900 dark:text-stone-100 flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {/* Instagram Badge */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Instagram</h3>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">@study.dermaa</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Infografik
                </span>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Peta minda estetik, mutiara kata harian penyuntik semangat, dan jadual sesi latihan soalan SPM.
              </p>
            </div>

            <button
              onClick={() => handleOpenSocial('https://www.instagram.com/study.dermaa')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-98"
            >
              <span>Ikuti di Instagram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* YouTube Channel Card */}
          <div className="p-6 rounded-3xl border border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20 text-stone-900 dark:text-stone-100 flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {/* YouTube Badge */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">YouTube</h3>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">study.dermaa Official</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                  Video Penuh
                </span>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Rakaman bengkel teknik menjawab peperiksaan SPM, kupasan soalan percubaan negeri, dan siri tutorial bab.
              </p>
            </div>

            <button
              onClick={() => handleOpenSocial('https://www.youtube.com/@study.dermaa')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-98"
            >
              <span>Langgan di YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. FOOTER CALLOUT: Invitation to join */}
      <section className="p-8 sm:p-12 rounded-3xl bg-theme-surface text-center space-y-4 border border-theme-primary/30">
        <h3 className="text-xl sm:text-2xl font-black font-display text-theme-primary">
          Bersama Menjayakan Masa Depan Pendidikan Digital
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
          Adakah anda pendidik, murid, atau alumni yang ingin menyumbang modul nota atau idea inovatif? Pintu kami sentiasa terbuka untuk kerjasama murni.
        </p>
        <div className="pt-2">
          {navigate && (
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs btn-theme-primary shadow-xs cursor-pointer"
            >
              Daftar Akaun Percuma Hari Ini
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
