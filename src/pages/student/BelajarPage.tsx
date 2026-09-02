import React, { useState, useEffect } from 'react';
import { getPublishedSubjects } from '../../services/contentService';
import { Subject, TingkatanType, TINGKATAN_OPTIONS } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { BookOpen, ArrowRight, Layers, Sparkles } from 'lucide-react';

interface BelajarPageProps {
  navigate: (route: string) => void;
}

export const BelajarPage: React.FC<BelajarPageProps> = ({ navigate }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTingkatan, setSelectedTingkatan] = useState<TingkatanType>('Tingkatan 1');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const list = await getPublishedSubjects();
        setSubjects(list);
      } catch (err) {
        console.error('Error fetching subjects in BelajarPage:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const categories = ['Semua', 'Teras', 'Elektif', 'Bahasa', 'Wajib'];

  const filteredSubjects = subjects.filter((s) => {
    const matchesTingkatan = !s.tingkatanList || s.tingkatanList.includes(selectedTingkatan);
    const matchesCategory = selectedCategory === 'Semua' || s.category === selectedCategory;
    return matchesTingkatan && matchesCategory;
  });

  return (
    <div id="belajar-page-container" className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 font-display tracking-tight mb-2">
          Kurikulum Standard Sekolah Menengah (KSSM)
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
          Pilih tingkatan dan mata pelajaran untuk mengakses modul nota padat, topik pembelajaran, serta latihan interaktif.
        </p>

        {/* Tingkatan Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          {TINGKATAN_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTingkatan(t)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedTingkatan === t
                  ? 'btn-theme-primary shadow-xs scale-102'
                  : 'border border-stone-200 dark:border-stone-700 bg-white/60 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3 overflow-x-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mr-2 shrink-0">
          Kategori:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-theme-surface text-theme-primary border border-theme-primary/30'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Subject Grid */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : filteredSubjects.length === 0 ? (
        <EmptyState
          title="Belum ada subjek tersedia."
          description={`Tiada mata pelajaran dalam kategori "${selectedCategory}" untuk ${selectedTingkatan}.`}
          icon={BookOpen}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs hover:border-theme-primary/60 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-theme-surface text-theme-primary flex items-center justify-center font-black text-sm border border-theme-primary/30">
                    {sub.code || sub.name.substring(0, 2)}
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    {sub.category || 'KSSM'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-theme-primary transition-colors mb-1">
                  {sub.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {sub.description || `Modul kurikulum standard ${sub.name} KSSM.`}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/nota?subjectId=${sub.id}&tingkatan=${encodeURIComponent(selectedTingkatan)}`)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold btn-theme-primary shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Nota</span>
                </button>
                <button
                  onClick={() => navigate(`/kuiz?subjectId=${sub.id}&tingkatan=${encodeURIComponent(selectedTingkatan)}`)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Kuiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
