import React, { useState, useEffect } from 'react';
import {
  getAdminSubjects,
  saveSubject,
  deleteSubject,
  seedStandardKSSMSubjects,
} from '../../services/adminService';
import { Subject, TingkatanType, TINGKATAN_OPTIONS } from '../../types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle,
  X,
  Layers,
  Check,
} from 'lucide-react';

interface AdminSubjectsPageProps {
  navigate: (route: string) => void;
}

export const AdminSubjectsPage: React.FC<AdminSubjectsPageProps> = ({ navigate }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<'Teras' | 'Elektif' | 'Bahasa' | 'Wajib'>('Teras');
  const [description, setDescription] = useState('');
  const [tingkatanList, setTingkatanList] = useState<TingkatanType[]>([
    'Tingkatan 1',
    'Tingkatan 2',
    'Tingkatan 3',
    'Tingkatan 4',
    'Tingkatan 5',
  ]);
  const [published, setPublished] = useState(true);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const list = await getAdminSubjects();
      setSubjects(list);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setName('');
    setCode('');
    setCategory('Teras');
    setDescription('');
    setTingkatanList(['Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5']);
    setPublished(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setEditId(s.id);
    setName(s.name);
    setCode(s.code);
    setCategory(s.category);
    setDescription(s.description || '');
    setTingkatanList(s.tingkatanList || []);
    setPublished(s.published);
    setModalOpen(true);
  };

  const handleToggleTingkatan = (t: TingkatanType) => {
    setTingkatanList((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setSaving(true);
    try {
      await saveSubject({
        id: editId || undefined,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        category,
        description: description.trim(),
        tingkatanList,
        published,
        order: editId ? undefined : subjects.length + 1,
      });
      setModalOpen(false);
      await fetchSubjects();
    } catch (err) {
      console.error('Error saving subject:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, sName: string) => {
    if (!window.confirm(`Adakah anda pasti mahu memadam subjek "${sName}"?`)) return;
    try {
      await deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting subject:', err);
    }
  };

  const handleSeedKSSM = async () => {
    if (
      !window.confirm(
        'Suntik 12 kurikulum standard KSSM rasmi (Bahasa Melayu, Bahasa Inggeris, Matematik, Sains, Sejarah, Geografi, dll.) ke dalam pangkalan data?'
      )
    )
      return;
    setSeeding(true);
    try {
      await seedStandardKSSMSubjects();
      await fetchSubjects();
    } catch (err) {
      console.error('Error seeding subjects:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div id="admin-subjects-page" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
            Pengurusan Subjek KSSM
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Daftar, sunting, dan susun mata pelajaran KSSM bagi Tingkatan 1 hingga 5.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subjects.length === 0 && (
            <button
              onClick={handleSeedKSSM}
              disabled={seeding}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-emerald-300 dark:border-emerald-800 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{seeding ? 'Menyuntik...' : 'Suntik Subjek Standard KSSM'}</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold btn-theme-primary shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Subjek</span>
          </button>
        </div>
      </div>

      {/* Subjects Grid / Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="Belum ada subjek didaftarkan."
          description="Klik butang di bawah untuk menambah subjek atau suntik senarai standard KSSM secara automatik."
          icon={BookOpen}
          actionText="Suntik 12 Subjek Standard KSSM"
          onAction={handleSeedKSSM}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-theme-surface text-theme-primary flex items-center justify-center font-black text-sm border border-theme-primary/30">
                    {sub.code}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {sub.category}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        sub.published ? 'bg-emerald-500' : 'bg-stone-300'
                      }`}
                      title={sub.published ? 'Diterbitkan' : 'Draf'}
                    />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">
                  {sub.name}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                  {sub.description || 'Tiada deskripsi.'}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {sub.tingkatanList?.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-50 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700"
                    >
                      {t.replace('Tingkatan ', 'T')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(sub)}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 text-xs font-semibold"
                  title="Sunting Subjek"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(sub.id, sub.name)}
                  className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                  title="Padam Subjek"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {editId ? 'Sunting Mata Pelajaran' : 'Tambah Mata Pelajaran Baharu'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                    Nama Subjek <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="cth: Matematik Tambahan"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                    Kod <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="cth: MT"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                >
                  <option value="Teras">Teras</option>
                  <option value="Elektif">Elektif</option>
                  <option value="Bahasa">Bahasa</option>
                  <option value="Wajib">Wajib</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Peringkat Tingkatan Ditawarkan
                </label>
                <div className="flex flex-wrap gap-2">
                  {TINGKATAN_OPTIONS.map((t) => {
                    const isSelected = tingkatanList.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleToggleTingkatan(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'btn-theme-primary shadow-xs'
                            : 'border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Penerangan Ringkas
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ringkasan sukatan subjek ini..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sub-published-check"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded text-theme-primary focus:ring-theme-primary"
                />
                <label
                  htmlFor="sub-published-check"
                  className="text-xs font-semibold text-stone-700 dark:text-stone-300"
                >
                  Terbitkan terus kepada pelajar (Published)
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold btn-theme-primary shadow-xs"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Subjek'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
