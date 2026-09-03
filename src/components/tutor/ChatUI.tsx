import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Maximize2,
  X,
  ChevronRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  sendGeminiChatRequest,
  getStoredChatHistory,
  storeChatHistory,
  clearStoredChatHistory,
} from '../../services/aiTutorService';
import { KSSM_TUTOR_SUBJECTS, AI_TUTOR_MODEL } from '../../config/aiTutorConfig';

interface ChatUIProps {
  compact?: boolean;
  initialSubject?: string;
  onExpand?: () => void;
  onClose?: () => void;
  title?: string;
}

export const ChatUI: React.FC<ChatUIProps> = ({
  compact = false,
  initialSubject = 'all',
  onExpand,
  onClose,
  title = 'CikguDermarians',
}) => {
  const { userProfile } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate a friendly default welcome message tailored to the student
  const getInitialWelcomeMessage = (): ChatMessage => {
    const studentName = userProfile?.fullName || userProfile?.username || 'Pelajar';
    const tingkatan = userProfile?.tingkatan || 'KSSM';

    return {
      id: 'welcome-message',
      role: 'model',
      content: `Salam sejahtera dan hai **${studentName}**! 🌟\n\nSaya ialah **CikguDermarians**, tutor AI KSSM anda di platform **study.dermaa**. Saya sedia membimbing anda untuk sukatan **${tingkatan}** dalam pelbagai subjek seperti Matematik, Sains, Sejarah, Bahasa Melayu, dan banyak lagi.\n\nAnda boleh tanya soalan konsep, kaedah pengiraan langkah demi langkah, teknik menjawab KBAT, atau minta contoh soalan peperiksaan. Apa yang ingin kita pelajari hari ini?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Chat message array state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = getStoredChatHistory();
    if (stored && stored.length > 0) {
      return stored;
    }
    return [getInitialWelcomeMessage()];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persist messages whenever updated
  useEffect(() => {
    if (messages.length > 0) {
      storeChatHistory(messages);
    }
  }, [messages]);

  // Find active subject suggestions
  const currentSubjectObj =
    KSSM_TUTOR_SUBJECTS.find((s) => s.id === selectedSubject) || KSSM_TUTOR_SUBJECTS[0];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      role: 'student',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subject: selectedSubject !== 'all' ? currentSubjectObj.name : undefined,
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendGeminiChatRequest(
        updatedHistory,
        userProfile?.fullName || userProfile?.username,
        userProfile?.tingkatan,
        selectedSubject !== 'all' ? currentSubjectObj.name : undefined
      );

      const tutorMessage: ChatMessage = {
        id: `tutor-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        role: 'model',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: selectedSubject !== 'all' ? currentSubjectObj.name : undefined,
      };

      setMessages((prev) => [...prev, tutorMessage]);
    } catch (err) {
      console.error('Error in tutor response:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content:
          'Maaf, terdapat sedikit gangguan teknikal semasa memproses pertanyaan anda. Sila cuba hantar semula sebentar lagi!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Refocus input
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Adakah anda pasti mahu memadamkan sejarah perbualan AI Tutor ini?')) {
      clearStoredChatHistory();
      setMessages([getInitialWelcomeMessage()]);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Formatter for rich text / markdown-like formatting in messages
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed select-text">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // Headers: ###, ##, #
          if (trimmed.startsWith('### ')) {
            return (
              <h4
                key={idx}
                className="text-xs font-black uppercase tracking-wider text-theme-primary pt-1.5"
              >
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3
                key={idx}
                className="text-sm font-bold text-stone-900 dark:text-stone-100 pt-1"
              >
                {trimmed.replace('## ', '')}
              </h3>
            );
          }

          // Bullet points
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const bulletText = trimmed.replace(/^[\*\-]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-theme-primary mt-1.5 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(bulletText) }} />
              </div>
            );
          }

          // Numbered lists
          const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numberedMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-xs font-black text-theme-primary shrink-0 min-w-[16px]">
                  {numberedMatch[1]}.
                </span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(numberedMatch[2]) }} />
              </div>
            );
          }

          // Math or highlighted formula block
          if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
            const formula = trimmed.replace(/\$\$/g, '');
            return (
              <div
                key={idx}
                className="my-2 p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-700 font-mono text-xs text-theme-primary font-bold overflow-x-auto text-center"
              >
                {formula}
              </div>
            );
          }

          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
            />
          );
        })}
      </div>
    );
  };

  // Helper for inline markdown bolding, code, and emphasis
  const formatInlineMarkdown = (raw: string): string => {
    let escaped = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold: **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    escaped = escaped.replace(/(^|[^\*])\*(?!\*)(.*?)\*/g, '$1<em>$2</em>');
    // Inline code or formula: `code` or $formula$
    escaped = escaped.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-stone-700 font-mono text-[12px] text-theme-primary font-semibold">$1</code>');
    escaped = escaped.replace(/\$([^\$]+)\$/g, '<code class="px-1 py-0.5 rounded bg-stone-100 dark:bg-stone-700/60 font-mono text-[12px] font-semibold text-stone-800 dark:text-stone-200">$1</code>');

    return escaped;
  };

  return (
    <div
      id="ai-tutor-container"
      className={`flex flex-col bg-stone-50 dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm overflow-hidden ${
        compact ? 'h-[520px] max-h-[85vh] w-full' : 'h-[calc(100vh-140px)] min-h-[600px] w-full'
      }`}
    >
      {/* Chat Header */}
      <div className="px-4 py-3.5 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 dark:from-emerald-600 dark:to-teal-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate font-display">
                {title}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Aktif
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate flex items-center gap-1.5">
              <span>Bimbingan KSSM • Didukung Gemini</span>
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id="tutor-clear-chat-btn"
            onClick={handleClearHistory}
            title="Padam sejarah perbualan"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {compact && onExpand && (
            <button
              id="tutor-expand-btn"
              onClick={onExpand}
              title="Buka paparan penuh"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          {compact && onClose && (
            <button
              id="tutor-close-btn"
              onClick={onClose}
              title="Tutup CikguDermarians"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="px-3 py-2 bg-stone-100/70 dark:bg-stone-900/60 border-b border-stone-200/60 dark:border-stone-800 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider pl-1 pr-1 shrink-0">
          Fokus:
        </span>
        {KSSM_TUTOR_SUBJECTS.map((sub) => {
          const isSelected = selectedSubject === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-theme-primary text-white shadow-2xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/60'
              }`}
            >
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Message History Area */}
      <div
        id="tutor-chat-messages"
        className="flex-1 overflow-y-auto p-4 space-y-4 text-stone-900 dark:text-stone-100"
      >
        {messages.map((msg) => {
          const isStudent = msg.role === 'student';

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isStudent ? 'justify-end' : 'justify-start'}`}
            >
              {/* Tutor Avatar */}
              {!isStudent && (
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 mb-1 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-3xl p-4 transition-all shadow-2xs relative group ${
                  isStudent
                    ? 'bg-theme-primary text-white rounded-br-xs'
                    : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700/80 rounded-bl-xs'
                } ${msg.isError ? 'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200' : ''}`}
              >
                {/* Header info for Tutor message */}
                {!isStudent && (
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-stone-100 dark:border-stone-700/50">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black text-theme-primary tracking-wide">
                        CikguDermarians
                      </span>
                      {msg.subject && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300">
                          {msg.subject}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopyText(msg.content, msg.id)}
                      title="Salin jawapan"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-md hover:bg-stone-100 dark:hover:bg-stone-700/80"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Message Body */}
                {isStudent ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.content}
                  </p>
                ) : (
                  renderMessageContent(msg.content)
                )}

                {/* Footer Timestamp */}
                <div
                  className={`mt-1.5 flex items-center justify-end text-[10px] ${
                    isStudent ? 'text-white/80' : 'text-stone-400 dark:text-stone-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {/* Student Avatar */}
              {isStudent && (
                <div className="w-8 h-8 rounded-2xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center shrink-0 mb-1 font-bold text-xs">
                  {userProfile?.fullName?.[0]?.toUpperCase() ||
                    userProfile?.username?.[0]?.toUpperCase() || (
                      <User className="w-4 h-4" />
                    )}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading / Typing Indicator */}
        {isLoading && (
          <div className="flex items-end gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 mb-1 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>

            <div className="bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 rounded-3xl rounded-bl-xs p-4 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-theme-primary animate-spin" />
                <span>CikguDermarians sedang merangka penjelasan KSSM...</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1 pl-1">
                <span className="w-2 h-2 rounded-full bg-theme-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-theme-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-theme-primary animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips (Quick Questions) */}
      <div className="px-3.5 py-2 bg-stone-100/60 dark:bg-stone-900/60 border-t border-stone-200/60 dark:border-stone-800 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            Cadangan:
          </span>
          {currentSubjectObj.promptSuggestions.map((promptText, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(promptText)}
              disabled={isLoading}
              className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 hover:border-theme-primary hover:text-theme-primary hover:bg-theme-surface transition-all shrink-0 truncate max-w-[260px] text-left disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200/80 dark:border-stone-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              id="tutor-chat-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedSubject !== 'all'
                  ? `Tanya CikguDermarians sebarang soalan ${currentSubjectObj.name} KSSM...`
                  : 'Tanya soalan KSSM anda kepada CikguDermarians (cth: Teorem Pythagoras, Format Karangan BM, Hukum Newton)...'
              }
              className="w-full resize-none py-2.5 pl-3.5 pr-10 rounded-2xl bg-stone-100/80 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:bg-white dark:focus:bg-stone-850 transition-all max-h-32"
            />
          </div>

          <button
            type="submit"
            id="tutor-send-btn"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-2xl bg-theme-primary hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center transition-all shadow-xs shrink-0"
            title="Hantar pertanyaan"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1.5 px-1">
          <span>Tekan <strong>Enter</strong> untuk hantar • <strong>Shift+Enter</strong> untuk baris baru</span>
          <span className="hidden sm:inline">Model: {AI_TUTOR_MODEL}</span>
        </div>
      </div>
    </div>
  );
};
