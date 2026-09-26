import React from 'react';
import { StudentVideoPlayer } from '../../components/video/StudentVideoPlayer';
import { Film, Sparkles, ChevronRight, Home, Video } from 'lucide-react';

interface VideoPembelajaranPageProps {
  navigate: (route: string) => void;
}

export const VideoPembelajaranPage: React.FC<VideoPembelajaranPageProps> = ({ navigate }) => {
  return (
    <div id="video-pembelajaran-page" className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Utama</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" />
        <span className="font-bold text-stone-800 dark:text-stone-200">Video Pembelajaran</span>
      </nav>

      {/* Main Student Video Player Component */}
      <StudentVideoPlayer navigate={navigate} />
    </div>
  );
};
