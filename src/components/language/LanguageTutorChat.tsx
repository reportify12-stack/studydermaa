import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import {
  LanguageModuleConfig,
  LanguageTutorMessage,
  LanguageLessonData,
} from '../../types/languageHub';
import {
  sendLanguageTutorMessage,
  speakNativeLanguageWord,
} from '../../services/languageHubService';

interface LanguageTutorChatProps {
  module: LanguageModuleConfig;
  currentLesson?: LanguageLessonData | null;
}

export const LanguageTutorChat: React.FC<LanguageTutorChatProps> = ({
  module,
  currentLesson,
}) => {
  const [messages, setMessages] = useState<LanguageTutorMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial greeting message when module changes
  useEffect(() => {
    let initialGreeting = '';
    if (module.id === 'thai') {
      initialGreeting = `Sawadee khrap/kha! 🙏 Saya ialah AI Language Tutor untuk **Sawadee Thai** anda. Sila ajukan apa jua soalan mengenai sebutan nada (5 Thai tones), sebutan sopan (-khrap/-kha), atau frasa perbualan harian di Thailand!`;
    } else if (module.id === 'korean') {
      initialGreeting = `Annyeonghaseyo! ✨ Saya ialah AI Language Tutor **Annyeonghaseyo Korea** anda. Tanya saya tentang peraturan sebutan Hangeul (Batchim), perbezaan sopan santun (Jondaenmal vs Banmal), atau frasa K-Culture!`;
    } else {
      initialGreeting = `Konnichiwa! 🌸 Saya ialah AI Language Tutor **Konnichiwa Japan** anda. Bersedia membantu anda menguasai vokal Hiragana, aksen nada (pitch accent), dan adab kesopanan bercakap di Jepun!`;
    }

    setMessages([
      {
        id: 'welcome-msg',
        role: 'model',
        content: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [module.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputQuery).trim();
    if (!query || isLoading) return;

    const userMessage: LanguageTutorMessage = {
      id: `user-${Date.now()}`,
      role: 'student',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const reply = await sendLanguageTutorMessage(
        module.id,
        module.name,
        updatedMessages,
        currentLesson?.lessonTitle
      );

      const tutorReplyMessage: LanguageTutorMessage = {
        id: `tutor-${Date.now()}`,
        role: 'model',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, tutorReplyMessage]);
    } catch (err) {
      console.error('Error getting tutor reply:', err);
      const errorMsg: LanguageTutorMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: 'Maaf, sambungan AI terganggu seketika. Sila cuba ajukan soalan anda sekali lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleSpeakText = (text: string) => {
    // Extract first foreign phrase in quotes or bold if present
    const match = text.match(/["“]([^"”]+)["”]/) || text.match(/\*\*([^*]+)\*\*/);
    const wordToPronounce = match ? match[1] : text.slice(0, 50);
    speakNativeLanguageWord(wordToPronounce, module.id);
  };

  // Quick prompt chips tailored to the language
  const suggestedPrompts = [
    module.id === 'thai'
      ? 'Bagaimana sebut "terima kasih" dengan 5 nada suara yang betul?'
      : module.id === 'korean'
      ? 'Apakah peraturan sebutan Batchim untuk perkataan 감사합니다?'
      : 'Bagaimana cara menyebut perkataan "arigatou gozaimasu" dengan sebutan asli?',
    'Boleh berikan contoh perbualan ringkas 2 orang?',
    'Apakah perbezaan penggunaan bahasa formal dan santai?',
    'Berikan petua mudah menghafal sistem tulisan ini.',
  ];

  return (
    <section
      id="language-tutor-chat-container"
      aria-labelledby="heading-tutor-chat"
      className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4 bg-stone-50/50 dark:bg-stone-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-theme-primary to-purple-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="heading-tutor-chat" className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                AI Language Tutor ({module.name})
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-theme-surface text-theme-primary border border-theme-primary/20">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Tanya tentang sebutan tepat, nada suara, etika kesopanan, atau tatabahasa.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMessages(messages.slice(0, 1))}
          title="Kosongkan perbualan"
          className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-5 sm:px-6 py-3 bg-stone-50/80 dark:bg-stone-800/40 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          Cadangan:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            id={`btn-tutor-prompt-${idx}`}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700 hover:border-theme-primary hover:text-theme-primary transition-all whitespace-nowrap shrink-0 shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Stream Container */}
      <div className="p-5 sm:p-6 min-h-[280px] max-h-[460px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'student';
          return (
            <div
              key={msg.id}
              id={`tutor-msg-${msg.id}`}
              className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-theme-primary text-white'
                    : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-theme-primary text-white font-medium rounded-tr-xs'
                    : 'bg-stone-100/90 dark:bg-stone-800 text-stone-800 dark:text-stone-100 rounded-tl-xs border border-stone-200/50 dark:border-stone-700/50'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Message Footer: Timestamp & Actions */}
                <div
                  className={`mt-2.5 pt-2 flex items-center justify-between text-[10px] border-t ${
                    isUser
                      ? 'border-white/20 text-white/70'
                      : 'border-stone-200 dark:border-stone-700 text-stone-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSpeakText(msg.content)}
                        title="Dengar sebutan audio"
                        className="hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-0.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.content, msg.id)}
                        title="Salin penjelasan"
                        className="hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-0.5"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-500 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-theme-primary animate-ping" />
              <span>AI Tutor sedang merangka penjelasan dan panduan sebutan...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            id="input-language-tutor"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={`Tanya apa sahaja kepada AI Tutor ${module.name} (cth: "Bagaimanakah sebutan nada...")`}
            className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-theme-primary shadow-2xs"
          />

          <button
            type="submit"
            id="btn-send-tutor-message"
            disabled={!inputQuery.trim() || isLoading}
            className={`p-3 rounded-2xl transition-all font-bold flex items-center justify-center shrink-0 ${
              inputQuery.trim() && !isLoading
                ? 'bg-theme-primary text-white shadow-sm hover:opacity-95'
                : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </section>
  );
};
