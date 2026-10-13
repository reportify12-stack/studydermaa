import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  HeartHandshake,
  ShieldAlert,
  AlertTriangle,
  Clock,
  User,
  CheckCircle2,
  MessageSquare,
  Search,
  Send,
  Loader2,
  Calendar,
  X,
  FileText,
  Phone,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { CounselingSession } from '../../types';
import {
  subscribeToCounselorDashboard,
  sendCounselorDirectMessage,
  resolveCounselingSession,
} from '../../services/counselingService';

interface CounselorDashboardPageProps {
  navigate: (route: string) => void;
}

export const CounselorDashboardPage: React.FC<CounselorDashboardPageProps> = ({ navigate }) => {
  const { userProfile } = useAuth();
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'urgent' | 'active' | 'resolved'>('all');

  // Selected session for reading transcript in modal / side pane
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [counselorReply, setCounselorReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [counselorNotes, setCounselorNotes] = useState('');
  const [savingResolution, setSavingResolution] = useState(false);

  // Subscribe to counseling sessions
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToCounselorDashboard((items) => {
      setSessions(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const activeSelectedSession = sessions.find((s) => s.id === selectedSessionId) || null;

  // Filter & Search logic
  const filteredSessions = sessions.filter((s) => {
    // Tab filter
    if (filterTab === 'urgent' && !s.requires_urgent_attention) return false;
    if (filterTab === 'active' && s.status === 'resolved') return false;
    if (filterTab === 'resolved' && s.status !== 'resolved') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (s.studentName || '').toLowerCase().includes(q);
      const matchUsername = (s.studentUsername || '').toLowerCase().includes(q);
      const matchKeywords = (s.flaggedKeywords || []).some((kw) => kw.toLowerCase().includes(q));
      return matchName || matchUsername || matchKeywords;
    }

    return true;
  });

  const urgentCount = sessions.filter((s) => s.requires_urgent_attention).length;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !counselorReply.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      await sendCounselorDirectMessage(
        selectedSessionId,
        userProfile?.fullName || 'Guru Kaunseling SMK Derma',
        counselorReply.trim()
      );
      setCounselorReply('');
    } catch (err) {
      console.error('Failed to send counselor direct message:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleResolveSession = async () => {
    if (!selectedSessionId || savingResolution) return;

    setSavingResolution(true);
    try {
      await resolveCounselingSession(
        selectedSessionId,
        userProfile?.fullName || 'Guru Kaunseling',
        counselorNotes.trim()
      );
      setCounselorNotes('');
    } catch (err) {
      console.error('Failed to resolve counseling session:', err);
    } finally {
      setSavingResolution(false);
    }
  };

  return (
    <div id="counselor-dashboard" className="space-y-8 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shadow-xs">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900 dark:text-stone-100">
                  Papan Pemuka Kaunselor (Triage Talian Hayat)
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                Sistem pemantauan keselamatan automatik: Mengutamakan kes murid yang dikesan mengalami stres atau tekanan akademik tinggi.
              </p>
            </div>
          </div>

          {/* Urgent Cases Alert Counter */}
          <div
            className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 text-xs font-bold ${
              urgentCount > 0
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {urgentCount > 0 ? (
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
            <span>
              {urgentCount > 0
                ? `${urgentCount} Kes Memerlukan Perhatian Segera!`
                : 'Tiada Kes Kecemasan Tertunggak'}
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100 dark:border-stone-800">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 self-stretch sm:self-auto overflow-x-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'all'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Semua ({sessions.length})
            </button>
            <button
              onClick={() => setFilterTab('urgent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterTab === 'urgent'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Perhatian Segera ({urgentCount})</span>
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'active'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setFilterTab('resolved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'resolved'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Selesai
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari murid atau kata kunci..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary placeholder:text-stone-400"
            />
          </div>
        </div>
      </div>

      {/* Main Sessions List & Transcript Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sessions Triage List (Col 7 or Full) */}
        <div className={`space-y-4 ${activeSelectedSession ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          {loading ? (
            <div className="p-12 text-center text-stone-400 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
              <p className="text-xs">Memuatkan sesi kaunseling pelajar...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-white/50 dark:bg-stone-900/40 space-y-2">
              <HeartHandshake className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
              <h3 className="font-bold text-stone-700 dark:text-stone-300 text-sm">
                Tiada rekod kaunseling dijumpai
              </h3>
              <p className="text-xs text-stone-400">
                Sesi sokongan murid akan muncul di sini secara automatik apabila murid memulakan perbualan.
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isUrgent = session.requires_urgent_attention === true;
              const isSelected = selectedSessionId === session.id;
              const lastMsg = session.messages[session.messages.length - 1];

              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                    isUrgent
                      ? 'border-rose-400 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 hover:shadow-lg ring-1 ring-rose-400/40'
                      : isSelected
                      ? 'border-theme-primary ring-2 ring-theme-primary/30 bg-white dark:bg-stone-900 shadow-md'
                      : 'border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                          isUrgent
                            ? 'bg-rose-600 text-white'
                            : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                        }`}
                      >
                        {session.studentName ? session.studentName.charAt(0) : 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 font-display">
                            {session.studentName}
                          </h3>
                          <span className="text-[10px] font-semibold text-stone-400">
                            @{session.studentUsername}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {session.studentTingkatan || 'Tingkatan 1'} • SMK Derma
                        </p>
                      </div>
                    </div>

                    {/* Prominent Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      {isUrgent && (
                        <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Perhatian Segera (Urgent)</span>
                        </span>
                      )}

                      {session.status === 'resolved' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-[10px] font-bold">
                          ✓ Selesai
                        </span>
                      )}

                      <span className="text-[10px] text-stone-400">
                        {new Date(session.lastMessageAt || session.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        •{' '}
                        {new Date(session.lastMessageAt || session.updatedAt).toLocaleDateString('ms-MY')}
                      </span>
                    </div>
                  </div>

                  {/* Flagged Red-flag Keywords Tags */}
                  {session.flaggedKeywords && session.flaggedKeywords.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                        Kata Kunci Merah:
                      </span>
                      {session.flaggedKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] font-black uppercase"
                        >
                          ⚠ {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Last message preview */}
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                    <span className="font-bold text-stone-700 dark:text-stone-200">
                      {lastMsg?.sender === 'student'
                        ? 'Murid: '
                        : lastMsg?.sender === 'system'
                        ? 'Sistem: '
                        : 'Kaunselor: '}
                    </span>
                    {lastMsg?.text || 'Tiada mesej.'}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-stone-400">
                      {session.messages.length} Mesej dalam transkrip
                    </span>
                    <button
                      type="button"
                      className="text-theme-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Buka Transkrip Penuh</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Transcript Reader & Action Panel (Col 6) */}
        {activeSelectedSession && (
          <div className="lg:col-span-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl overflow-hidden flex flex-col h-[750px] sticky top-24 animate-scale-up">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-black text-sm flex items-center justify-center">
                  {activeSelectedSession.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-stone-900 dark:text-stone-100 text-sm sm:text-base font-display">
                    {activeSelectedSession.studentName}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    @{activeSelectedSession.studentUsername} • {activeSelectedSession.studentTingkatan || 'Tingkatan 1'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeSelectedSession.requires_urgent_attention && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase animate-pulse">
                    Urgent
                  </span>
                )}
                <button
                  onClick={() => setSelectedSessionId(null)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Red Flag Alert Bar if applicable */}
            {activeSelectedSession.flaggedKeywords && activeSelectedSession.flaggedKeywords.length > 0 && (
              <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Kata Kunci Dikesan:{' '}
                    <strong>{activeSelectedSession.flaggedKeywords.join(', ')}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Triage Aktif
                </span>
              </div>
            )}

            {/* Transcript Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-stone-50/40 dark:bg-stone-950/20">
              {activeSelectedSession.messages.map((msg) => {
                const isStudent = msg.sender === 'student';
                const isSystem = msg.sender === 'system';
                const isCounselor = msg.sender === 'counselor';

                if (isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 max-w-xl mx-auto shadow-2xs"
                    >
                      <span className="font-bold block text-[10px] uppercase text-amber-700 mb-1">
                        Mesej Intervensi Sistem:
                      </span>
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      isCounselor ? 'ml-auto items-end' : isStudent ? 'mr-auto items-start' : 'mx-auto'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-stone-400 mb-1 px-1">
                      {isStudent
                        ? `${activeSelectedSession.studentName} (Murid)`
                        : isCounselor
                        ? msg.senderName || 'Cikgu Kaunseling'
                        : 'AI Assistant'}
                      {' • '}
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isCounselor
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : isStudent
                          ? msg.flaggedKeywords && msg.flaggedKeywords.length > 0
                            ? 'bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-400 text-rose-950 dark:text-rose-100 rounded-tl-none font-medium'
                            : 'bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-tl-none'
                          : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct Counselor Reply & Action Controls */}
            <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
              {/* Send Direct Reply */}
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  value={counselorReply}
                  onChange={(e) => setCounselorReply(e.target.value)}
                  placeholder="Hantar mesej sokongan kepada murid ini..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !counselorReply.trim()}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Balas</span>
                </button>
              </form>

              {/* Resolve / Action button */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResolveSession}
                    disabled={savingResolution || activeSelectedSession.status === 'resolved'}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {activeSelectedSession.status === 'resolved'
                        ? 'Telah Ditandakan Selesai'
                        : 'Tandakan Sebagai Selesai / Terurus'}
                    </span>
                  </button>
                </div>

                <span className="text-[11px] text-stone-400">
                  ID Sesi: {activeSelectedSession.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
