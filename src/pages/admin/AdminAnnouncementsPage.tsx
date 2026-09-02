import React, { useState, useEffect } from 'react';
import {
  getAdminAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
} from '../../services/adminService';
import { Announcement } from '../../types';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Tag,
  Eye,
} from 'lucide-react';

interface AdminAnnouncementsPageProps {
  navigate: (route: string) => void;
}

export const AdminAnnouncementsPage: React.FC<AdminAnnouncementsPageProps> = ({ navigate }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [badge, setBadge] = useState('PENTING');
  const [published, setPublished] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const list = await getAdminAnnouncements();
      setAnnouncements(list);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setTitle('');
    setContent('');
    setBadge('PENTING');
    setPublished(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setBadge(a.badge || 'PENTING');
    setPublished(a.published);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      await saveAnnouncement({
        id: editId || undefined,
        title: title.trim(),
        content: content.trim(),
        badge: badge.trim().toUpperCase(),
        published,
      });

      setModalOpen(false);
      await fetchAnnouncements();
    } catch (err) {
      console.error('Error saving announcement:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, aTitle: string) => {
    if (!window.confirm(`Adakah anda pasti mahu memadam pengumuman "${aTitle}"?`)) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  return (
    <div id="admin-announcements-page" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
            Pengurusan Hebahan & Pengumuman
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Siarkan makluman terkini, tip peperiksaan SPM/PT3, atau notis sistem kepada semua pelajar.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl text-xs font-bold btn-theme-primary shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cipta Pengumuman</span>
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : announcements.length === 0 ? (
        <EmptyState
          title="Belum ada pengumuman disiarkan."
          description="Cipta hebahan pertama untuk memberi panduan atau maklumat terkini kepada pelajar."
          icon={Megaphone}
          actionText="Cipta Pengumuman"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-theme-surface text-theme-primary border border-theme-primary/30">
                    {a.badge || 'INFO'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      a.published
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {a.published ? 'Diterbitkan' : 'Draf'}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(a.createdAt).toLocaleDateString('ms-MY', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(a)}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                    title="Sunting Pengumuman"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id, a.title)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                    title="Padam Pengumuman"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {a.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                {a.content}
              </p>
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
                {editId ? 'Sunting Hebahan' : 'Cipta Pengumuman Baharu'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Tajuk Pengumuman <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="cth: Modul Latihan Percubaan SPM 2026 Kini Tersedia!"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Label / Badge Hebahan
                </label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                >
                  <option value="PENTING">PENTING</option>
                  <option value="TERKINI">TERKINI</option>
                  <option value="INFO KSSM">INFO KSSM</option>
                  <option value="TIPS BELAJAR">TIPS BELAJAR</option>
                  <option value="PENYELENGGARAAN">PENYELENGGARAAN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 dark:text-stone-300 mb-1">
                  Kandungan Hebahan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Taipkan mesej makluman lengkap kepada para pelajar..."
                  rows={5}
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:border-theme-primary"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ann-published-check"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded text-theme-primary focus:ring-theme-primary"
                />
                <label
                  htmlFor="ann-published-check"
                  className="text-xs font-semibold text-stone-700 dark:text-stone-300"
                >
                  Siarkan terus di papan pemuka pelajar (Published)
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
                  {saving ? 'Menyimpan...' : 'Siarkan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
