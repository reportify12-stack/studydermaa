import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  HeartHandshake,
  ShieldAlert,
  Send,
  Loader2,
  Clock,
  Sparkles,
  PhoneCall,
  Info,
  CheckCircle2,
  AlertTriangle,
  User,
  GraduationCap,
  Bot,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import {
  CounselingSession,
  CounselingMessage,
} from '../../types';
import {
  getOrCreateStudentSession,
  sendStudentSupportMessage,
  subscribeToStudentSession,
  INTERVENTION_SYSTEM_MESSAGE,
} from '../../services/counselingService';

interface StudentSupportPageProps {
  navigate: (route: string) => void;
}

export const StudentSupportPage: React.FC<StudentSupportPageProps> = ({ navigate }) => {
  const { userProfile } = useAuth();
  const [session, setSession] = useState<CounselingSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [consentAcknowledged, setConsentAcknowledged] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize or subscribe to student session in Firestore
  useEffect(() => {
    if (!userProfile?.uid) return;

    let isMounted = true;
    const init = async () => {
      try {
        const initial = await getOrCreateStudentSession(
          userProfile.uid,
          userProfile.fullName || 'Pelajar',
          userProfile.username || 'pelajar',
          userProfile.tingkatan
        );
        if (isMounted) {
          setSession(initial);
        }
      } catch (err) {
        console.error('Failed to init student counseling session:', err);
      }
    };

    init();

    // Real-time subscription to receive counselor and system updates
    const unsubscribe = subscribeToStudentSession(userProfile.uid, (updated) => {
      if (isMounted && updated) {
        setSession(updated);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [userProfile]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || sending || !userProfile?.uid || !session) return;

    setInputText('');
    setSending(true);

    try {
      await sendStudentSupportMessage(session.id, userProfile.uid, trimmed, {
        fullName: userProfile.fullName || 'Pelajar',
        username: userProfile.username || 'pelajar',
        tingkatan: userProfile.tingkatan,
      });
    } catch (err) {
      console.error('Failed to send student message:', err);
    } finally {
      setSending(false);
    }
  };

  const hasUrgentIntervention = session?.requires_urgent_attention === true;

  return (
    <div id="student-support-container" className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Header & Triage Info */}
      <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shadow-xs">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-display text-stone-900 dark:text-stone-100">
                  Sokongan Pelajar & Bimbingan Emosi
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Sistem Triage Selamat
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Ruang selamat dan mesra untuk murid SMK Derma berkongsi kebimbangan pembelajaran dan kesihatan minda.
              </p>
            </div>
          </div>

          {hasUrgentIntervention && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Mesej Dipanjangkan Kepada Cikgu Kaunseling</span>
            </div>
          )}
        </div>

        {/* EXPLICIT CONSENT & MONITORING BANNER */}
        <div className="p-4 rounded-2xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200 flex items-start gap-3 text-xs leading-relaxed">
          <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sky-950 dark:text-sky-100">
              Notis Keselamatan & Privasi:
            </p>
            <p>
              <strong>Perbualan ini dipantau oleh Cikgu Kaunseling untuk keselamatan awak.</strong> Sistem kami menyaring sebarang tanda tekanan tinggi dan akan segera memaklumkan Guru Kaunseling bertauliah untuk memberi bantuan tepat pada masanya.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl overflow-hidden flex flex-col h-[560px]">
        {/* Chat Status Sub-bar */}
        <div className="px-6 py-3 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-stone-700 dark:text-stone-300">
              Guru Kaunseling Bertugas: <strong>Unit Bimbingan & Kaunseling SMK Derma</strong>
            </span>
          </div>
          <span className="text-[11px] text-stone-400 hidden sm:inline">
            Status: {session?.status === 'urgent' ? 'Perhatian Kaunselor' : 'Aktif & Dipantau'}
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/30 dark:bg-stone-950/20">
          {session?.messages.map((msg) => {
            const isStudent = msg.sender === 'student';
            const isSystem = msg.sender === 'system';
            const isCounselor = msg.sender === 'counselor';
            const isAi = msg.sender === 'ai';

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto shadow-xs ${
                    msg.isIntervention
                      ? 'border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1.5">
                    {msg.isIntervention ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        <span className="uppercase tracking-wider text-[11px] text-rose-700 dark:text-rose-300">
                          Intervensi Keselamatan Automatik
                        </span>
                      </>
                    ) : (
                      <>
                        <Info className="w-4 h-4 text-stone-500" />
                        <span className="uppercase tracking-wider text-[11px] text-stone-500">
                          Sistem study.dermaa
                        </span>
                      </>
                    )}
                  </div>
                  <p className="whitespace-pre-line font-medium">{msg.text}</p>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  isStudent ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                    isStudent
                      ? 'bg-theme-primary text-white'
                      : isCounselor
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  {isStudent ? (
                    <User className="w-4 h-4" />
                  ) : isCounselor ? (
                    <GraduationCap className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-stone-400">
                      {isStudent
                        ? 'Anda'
                        : isCounselor
                        ? msg.senderName || 'Cikgu Kaunseling'
                        : 'Pembimbing AI'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isStudent
                        ? 'bg-theme-primary text-white rounded-tr-none'
                        : isCounselor
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 rounded-tl-none font-medium'
                        : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            placeholder="Tulis mesej anda di sini... (cth: 'Saya rasa keliru dengan jadual belajar')"
            className="flex-1 px-4 py-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-theme-primary transition-all placeholder:text-stone-400"
          />

          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="p-3 sm:px-5 sm:py-3 rounded-2xl font-bold text-xs btn-theme-primary shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Hantar</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Emergency Helpline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
              Talian Kasih KPWKM (24 Jam)
            </span>
            <p className="text-sm font-black text-stone-900 dark:text-stone-100">
              15999 / WhatsApp 019-261 5999
            </p>
            <span className="text-[11px] text-stone-400">Khidmat bimbingan krisis percuma seluruh Malaysia</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block">
              Befrienders Malaysia (24 Jam)
            </span>
            <p className="text-sm font-black text-stone-900 dark:text-stone-100">
              03-7627 2929
            </p>
            <span className="text-[11px] text-stone-400">Teman pendengar tanpa sebarang penghakiman</span>
          </div>
        </div>
      </div>
    </div>
  );
};
