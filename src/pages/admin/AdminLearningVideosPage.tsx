import React, { useState, useEffect } from 'react';
import {
  getAllLearningVideos,
  deleteLearningVideo,
  seedInitialVideosIfEmpty,
} from '../../services/videoService';
import { LearningVideo, KSSM_DEFAULT_SUBJECTS } from '../../types';
import { AdminVideoForm } from '../../components/video/AdminVideoForm';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { extractYouTubeVideoId, getYoutubeThumbnailUrl } from '../../utils/youtube';
import {
  Film,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Play,
  PlayCircle,
  ExternalLink,
  BookOpen,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AdminLearningVideosPageProps {
  navigate: (route: string) => void;
}

export const AdminLearningVideosPage: React.FC<AdminLearningVideosPageProps> = ({ navigate }) => {
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<LearningVideo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<LearningVideo | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      let data = await getAllLearningVideos();
      if (data.length === 0) {
        data = await seedInitialVideosIfEmpty();
      }
      setVideos(data);
    } catch (err) {
      console.error('Error fetching admin videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleOpenAdd = () => {
    setEditingVideo(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (video: LearningVideo) => {
    setEditingVideo(video);
    setFormModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteLearningVideo(deleteId);
      setVideos((prev) => prev.filter((v) => v.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting video:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Filtered videos
  const filteredVideos = videos.filter((v) => {
    const matchSubject = subjectFilter === 'all' || v.subject === subjectFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      v.subject.toLowerCase().includes(q) ||
      v.chapter.toLowerCase().includes(q) ||
      (v.title && v.title.toLowerCase().includes(q)) ||
      (v.description && v.description.toLowerCase().includes(q));

    return matchSubject && matchQuery;
  });

  const uniqueSubjects = Array.from(new Set(videos.map((v) => v.subject)));

  return (
    <div id="admin-learning-videos-page" className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
              Kandungan Digital
            </span>
            <span className="text-xs text-stone-400">learning_videos</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
            Pengurusan Video Pembelajaran
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Tambah dan urus video pembelajaran YouTube untuk ditonton oleh pelajar secara native tanpa iklan atau redirect.
          </p>
        </div>

        <button
          id="admin-add-video-btn"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Video Baharu</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Jumlah Video</span>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
            {videos.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Subjek Terlibat</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {uniqueSubjects.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Video Matematik</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {videos.filter((v) => v.subject === 'Matematik').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Video Sains & Lain</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {videos.filter((v) => v.subject !== 'Matematik').length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari mengikut subjek, bab, atau tajuk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
        >
          <option value="all">Semua Subjek ({videos.length})</option>
          {uniqueSubjects.map((s) => (
            <option key={s} value={s}>
              {s} ({videos.filter((v) => v.subject === s).length})
            </option>
          ))}
        </select>
      </div>

      {/* Videos List / Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredVideos.length === 0 ? (
        <EmptyState
          icon={Film}
          title="Tiada Video Dijumpai"
          description={
            searchQuery || subjectFilter !== 'all'
              ? 'Tiada rekod video yang sepadan dengan carian anda. Cuba set semula penapis.'
              : 'Belum ada video pembelajaran yang ditambah ke dalam pangkalan data.'
          }
          actionLabel="Tambah Video Sekarang"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Video</th>
                  <th className="py-3.5 px-4">Subjek & Bab</th>
                  <th className="py-3.5 px-4">Tahap / Tingkatan</th>
                  <th className="py-3.5 px-4">Pautan YouTube</th>
                  <th className="py-3.5 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredVideos.map((video) => {
                  const videoId = video.youtubeVideoId || extractYouTubeVideoId(video.youtubeLink);
                  const thumb = videoId ? getYoutubeThumbnailUrl(videoId, 'mqdefault') : null;

                  return (
                    <tr
                      key={video.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      {/* Thumbnail & Preview */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setPreviewVideo(video)}
                          className="relative w-24 h-14 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 cursor-pointer group border border-stone-200 dark:border-stone-700 shadow-2xs"
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={video.chapter}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Film className="w-5 h-5" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white drop-shadow" />
                          </div>
                          {video.duration && (
                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                              {video.duration}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Subject & Chapter */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          {video.chapter}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1.5 mt-0.5">
                          <BookOpen className="w-3 h-3" />
                          <span>{video.subject}</span>
                        </div>
                        {video.title && (
                          <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                            {video.title}
                          </div>
                        )}
                      </td>

                      {/* Tingkatan */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold">
                          {video.tingkatan || 'Semua Tingkatan'}
                        </span>
                      </td>

                      {/* YouTube Link */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-stone-600 dark:text-stone-300 max-w-[180px] truncate">
                            {video.youtubeVideoId || videoId || video.youtubeLink}
                          </span>
                          <a
                            href={video.youtubeLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            title="Buka pautan asal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewVideo(video)}
                            className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 transition-colors"
                            title="Tonton pratonton"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(video)}
                            className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 transition-colors"
                            title="Kemaskini"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(video.id)}
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Padam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {editingVideo ? 'Kemaskini Video Pembelajaran' : 'Tambah Video Pembelajaran Baharu'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Koleksi Firestore: <code className="font-mono text-purple-600">learning_videos</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFormModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <AdminVideoForm
                initialData={editingVideo}
                onSuccess={() => {
                  setFormModalOpen(false);
                  fetchVideos();
                }}
                onCancel={() => setFormModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Watch Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-3xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                  {previewVideo.subject} • {previewVideo.chapter}
                </span>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  {previewVideo.title || previewVideo.chapter}
                </h3>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${
                  previewVideo.youtubeVideoId || extractYouTubeVideoId(previewVideo.youtubeLink)
                }?autoplay=1&rel=0`}
                title={previewVideo.chapter}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-950 flex items-center justify-between text-xs text-stone-500">
              <span>Embedded native tanpa pautan keluar ke YouTube</span>
              <button
                onClick={() => setPreviewVideo(null)}
                className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold hover:bg-stone-300 dark:hover:bg-stone-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-6 space-y-4 border border-stone-200 dark:border-stone-800 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Padam Video Pembelajaran?
              </h3>
              <p className="text-xs text-stone-500">
                Tindakan ini tidak boleh diundur. Video ini tidak lagi dapat ditonton oleh pelajar.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                {deleting ? 'Memadam...' : 'Ya, Padam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
