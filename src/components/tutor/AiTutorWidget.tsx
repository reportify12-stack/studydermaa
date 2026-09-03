import React, { useState } from 'react';
import { Sparkles, MessageCircle, X } from 'lucide-react';
import { ChatUI } from './ChatUI';

interface AiTutorWidgetProps {
  navigate?: (route: string) => void;
  currentRoute?: string;
}

export const AiTutorWidget: React.FC<AiTutorWidgetProps> = ({ navigate, currentRoute }) => {
  const [isOpen, setIsOpen] = useState(false);

  // If the user is already on the dedicated AI Tutor page, hide the floating widget to avoid redundancy
  if (currentRoute === '/ai-tutor' || currentRoute === '/tutor') {
    return null;
  }

  const handleExpandToDedicatedPage = () => {
    setIsOpen(false);
    if (navigate) {
      navigate('/ai-tutor');
    }
  };

  return (
    <div id="ai-tutor-floating-widget" className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div
          id="ai-tutor-popup-card"
          className="mb-3 w-[92vw] sm:w-[390px] md:w-[420px] max-w-[420px] shadow-2xl rounded-3xl animate-in fade-in slide-in-from-bottom-5 duration-200 transition-all ring-1 ring-black/5 dark:ring-white/10"
        >
          <ChatUI
            compact={true}
            title="CikguDermarians"
            onExpand={handleExpandToDedicatedPage}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        id="ai-tutor-widget-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Tutup CikguDermarians' : 'Buka CikguDermarians'}
        className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-full shadow-lg transition-all duration-200 active:scale-95 ${
          isOpen
            ? 'bg-stone-900 dark:bg-stone-800 text-white hover:bg-stone-800'
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-105 ring-4 ring-emerald-500/20'
        }`}
      >
        {isOpen ? (
          <>
            <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span className="text-xs font-bold font-display tracking-wide">Tutup</span>
          </>
        ) : (
          <>
            <div className="relative">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 ring-2 ring-emerald-500" />
            </div>
            <span className="text-xs font-extrabold font-display tracking-wide flex items-center gap-1.5">
              <span>Tanya CikguDermarians</span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-full bg-white/20">
                KSSM
              </span>
            </span>
          </>
        )}
      </button>
    </div>
  );
};
