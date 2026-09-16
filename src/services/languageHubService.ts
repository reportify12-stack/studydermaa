import {
  LanguageModuleConfig,
  LanguageModuleId,
  LanguageLessonData,
  LanguageTutorMessage,
} from '../types/languageHub';

export const LANGUAGE_MODULES: LanguageModuleConfig[] = [
  {
    id: 'thai',
    name: 'Sawadee Thai',
    greeting: 'Sawadee',
    nativeGreeting: 'สวัสดี',
    scriptName: 'Aksara Thai (อักษรไทย)',
    country: 'Thailand',
    flag: '🇹🇭',
    tagline: 'Pelajari ucapan sopan, nada suara, dan budaya Land of Smiles.',
    themeColor: 'amber',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    gradientClass: 'from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/30 dark:via-orange-950/20',
    borderClass: 'border-amber-200/80 hover:border-amber-400 dark:border-amber-800/80 dark:hover:border-amber-600',
    iconBgClass: 'bg-amber-500 text-white shadow-amber-500/20',
    accentTextClass: 'text-amber-600 dark:text-amber-400',
    popularTopics: ['Sapaan & Kesopanan (Wai)', 'Memesan Makanan Halal & Tom Yum', 'Membeli-belah & Tawar Menawar'],
  },
  {
    id: 'korean',
    name: 'Annyeonghaseyo Korea',
    greeting: 'Annyeonghaseyo',
    nativeGreeting: '안녕하세요',
    scriptName: 'Hangeul (한글)',
    country: 'Korea',
    flag: '🇰🇷',
    tagline: 'Kuasai abjad Hangeul, tahap kesopanan Jondaenmal, dan perbualan harian K-Drama.',
    themeColor: 'indigo',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    gradientClass: 'from-indigo-500/10 via-rose-500/5 to-transparent dark:from-indigo-950/30 dark:via-rose-950/20',
    borderClass: 'border-indigo-200/80 hover:border-indigo-400 dark:border-indigo-800/80 dark:hover:border-indigo-600',
    iconBgClass: 'bg-indigo-600 text-white shadow-indigo-600/20',
    accentTextClass: 'text-indigo-600 dark:text-indigo-400',
    popularTopics: ['Asas Sapaan & Hangeul', 'Perbualan Sekolah & Rakan', 'Frasa K-Pop & Makanan Lazat'],
  },
  {
    id: 'japanese',
    name: 'Konnichiwa Japan',
    greeting: 'Konnichiwa',
    nativeGreeting: 'こんにちは',
    scriptName: 'Kana & Kanji (日本語)',
    country: 'Jepun',
    flag: '🇯🇵',
    tagline: 'Terokai Hiragana, etika tunduk hormat (Aisatsu), dan ekspresi praktikal di Jepun.',
    themeColor: 'rose',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    gradientClass: 'from-rose-500/10 via-red-500/5 to-transparent dark:from-rose-950/30 dark:via-red-950/20',
    borderClass: 'border-rose-200/80 hover:border-rose-400 dark:border-rose-800/80 dark:hover:border-rose-600',
    iconBgClass: 'bg-rose-600 text-white shadow-rose-600/20',
    accentTextClass: 'text-rose-600 dark:text-rose-400',
    popularTopics: ['Aisatsu (Sapaan Asas)', 'Membeli Cenderahati & Konbini', 'Ungkapan Terima Kasih & Maaf'],
  },
];

const LESSON_CACHE_PREFIX = 'study_dermaa_lang_lesson_';

/**
 * Fetch dynamic AI-generated beginner lesson and 3-question quiz via Google Gemini API
 */
export async function fetchDynamicLanguageLesson(
  languageId: LanguageModuleId,
  languageName: 'Sawadee Thai' | 'Annyeonghaseyo Korea' | 'Konnichiwa Japan',
  topic?: string,
  bypassCache: boolean = false
): Promise<{ data: LanguageLessonData; source: 'gemini' | 'fallback' }> {
  const cacheKey = `${LESSON_CACHE_PREFIX}${languageId}_${topic || 'default'}`;

  // Check cache if not explicitly bypassing
  if (!bypassCache) {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.vocabularies?.length === 5 && parsed.quiz?.length === 3) {
          return { data: parsed, source: 'gemini' };
        }
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }
  }

  try {
    const response = await fetch('/api/gemini/language-lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        languageId,
        languageName,
        topic: topic || 'Asas Perbualan & Sapaan Sopan Harian',
      }),
    });

    if (response.ok) {
      const resJson = await response.json();
      if (resJson && resJson.data && resJson.data.vocabularies) {
        // Cache this dynamic lesson for smooth navigation
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(resJson.data));
        } catch (e) {
          // ignore quota error
        }
        return {
          data: resJson.data,
          source: resJson.source || 'gemini',
        };
      }
    }
  } catch (err) {
    console.error('Network error calling /api/gemini/language-lesson:', err);
  }

  // If server is unreachable, generate dynamic fallback
  const fallback = generateClientDynamicFallback(languageId, languageName, topic);
  return {
    data: fallback,
    source: 'fallback',
  };
}

/**
 * Send query to dedicated Gemini AI Language Tutor
 */
export async function sendLanguageTutorMessage(
  languageId: LanguageModuleId,
  languageName: 'Sawadee Thai' | 'Annyeonghaseyo Korea' | 'Konnichiwa Japan',
  messages: LanguageTutorMessage[],
  currentLessonTitle?: string
): Promise<string> {
  try {
    const response = await fetch('/api/gemini/language-tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        languageId,
        languageName,
        messages,
        currentLessonTitle: currentLessonTitle || 'Beginner Conversation',
      }),
    });

    if (response.ok) {
      const resJson = await response.json();
      if (resJson && resJson.reply) {
        return resJson.reply;
      }
    }
  } catch (err) {
    console.error('Error in sendLanguageTutorMessage:', err);
  }

  // Fallback answer
  return generateClientTutorFallback(languageId, languageName);
}

/**
 * Native text-to-speech speaker using browser Web Speech API
 */
export function speakNativeLanguageWord(text: string, languageId: LanguageModuleId): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // stop current utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate locale
    if (languageId === 'thai') {
      utterance.lang = 'th-TH';
      utterance.rate = 0.85;
    } else if (languageId === 'korean') {
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;
    } else if (languageId === 'japanese') {
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
    return false;
  }
}

/**
 * Client dynamic fallback generator
 */
function generateClientDynamicFallback(
  languageId: LanguageModuleId,
  languageName: 'Sawadee Thai' | 'Annyeonghaseyo Korea' | 'Konnichiwa Japan',
  topic?: string
): LanguageLessonData {
  if (languageId === 'thai') {
    return {
      languageId: 'thai',
      languageName: 'Sawadee Thai',
      lessonTitle: 'Asas Ucapan & Sapaan Sopan Bahasa Thai (Wai & Greetings)',
      culturalIntro: 'Di Thailand ("Land of Smiles"), ucapan sentiasa disertai dengan gerak badan "Wai" (merapatkan kedua tapak tangan di hadapan dada). Kaum lelaki menamatkan ayat dengan "khrap", manakala wanita menggunakan "kha" untuk kesopanan.',
      pronunciationGuide: 'Bahasa Thai mempunyai 5 nada suara (Biasa, Rendah, Jatuh, Tinggi, Naik). Jangan risau pada peringkat permulaan, fokus pada kejelasan sebutan vokal dan partikel sopan!',
      vocabularies: [
        {
          word: 'สวัสดี',
          romanization: 'sa-wat-dee',
          meaning: 'Hai / Selamat Pagi / Petang (Hello / Greetings)',
          context: 'Kata sapaan universal paling penting dalam Bahasa Thai',
        },
        {
          word: 'ขอบคุณ',
          romanization: 'khop-khun',
          meaning: 'Terima kasih (Thank you)',
          context: 'Diucapkan bersama "khrap" atau "kha" sebagai tanda penghargaan',
        },
        {
          word: 'ขอโทษ',
          romanization: 'khor-thot',
          meaning: 'Maaf / Tumpang lalu (Sorry / Excuse me)',
          context: 'Meminta maaf atau memulakan pertanyaan dengan sopan',
        },
        {
          word: 'อร่อย',
          romanization: 'a-roy',
          meaning: 'Sedap / Enak (Delicious)',
          context: 'Sangat berguna ketika memesan Tom Yum atau Pad Thai',
        },
        {
          word: 'ใช่',
          romanization: 'chai',
          meaning: 'Ya / Betul (Yes / Correct)',
          context: 'Kata persetujuan (Gunakan "mai chai" untuk Tidak)',
        },
      ],
      phrases: [
        {
          phrase: 'สบายดีไหม',
          romanization: 'sa-bai-dee mai?',
          meaning: 'Apa khabar? (How are you?)',
          situation: 'Bertanya khabar rakan atau kenalan baharu',
        },
        {
          phrase: 'ยินดีที่ได้รู้จัก',
          romanization: 'yin-dee thee dai roo-jak',
          meaning: 'Gembira berkenalan dengan anda (Nice to meet you)',
          situation: 'Digunakan semasa sesi perkenalan rasmi atau santai',
        },
        {
          phrase: 'เท่าไหร่ครับ/ค่ะ',
          romanization: 'thao-rai khrap / kha?',
          meaning: 'Berapa harganya? (How much is this?)',
          situation: 'Sangat berguna semasa membeli-belah di pasar Chatuchak atau kedai runcit',
        },
      ],
      quiz: [
        {
          id: 1,
          question: 'Apakah maksud perkataan "ขอบคุณ" (khop-khun) dalam Bahasa Thai?',
          options: ['Selamat Tinggal', 'Terima Kasih', 'Maafkan Saya', 'Berapa Harga'],
          correctIndex: 1,
          explanation: '"ขอบคุณ" (khop-khun) bermaksud "Terima kasih". Lelaki menyebut "khop-khun khrap" dan wanita menyebut "khop-khun kha".',
        },
        {
          id: 2,
          question: 'Bagaimanakah anda bertanya "Apa khabar?" dalam Bahasa Thai?',
          options: ['sa-wat-dee khrap', 'a-roy mak mak', 'sa-bai-dee mai?', 'khor-thot na'],
          correctIndex: 2,
          explanation: '"sa-bai-dee mai?" (สบายดีไหม) ialah soalan lazim untuk bertanya khabar dalam Bahasa Thai.',
        },
        {
          id: 3,
          question: 'Apakah perkataan Thai yang sesuai diucapkan selepas menikmati hidangan Tom Yum yang enak?',
          options: ['อร่อย (a-roy)', 'ใช่ (chai)', 'ขอโทษ (khor-thot)', 'สวัสดี (sa-wat-dee)'],
          correctIndex: 0,
          explanation: '"อร่อย" (a-roy) bermaksud sedap atau lazat!',
        },
      ],
    };
  }

  if (languageId === 'korean') {
    return {
      languageId: 'korean',
      languageName: 'Annyeonghaseyo Korea',
      lessonTitle: 'Asas Hangeul & Ungkapan Harian Bahasa Korea (K-Culture & Daily Talk)',
      culturalIntro: 'Bahasa Korea menggunakan sistem abjad Hangeul yang direka secara saintifik oleh Raja Sejong pada tahun 1443. Tahap kesopanan (Jondaenmal) ditunjukkan dengan akhiran "-yo" (요) atau "-nida" (니다).',
      pronunciationGuide: 'Hangeul dibaca secara suku kata blok (konsonan + vokal + konsonan akhir/batchim). Pastikan sebutan lembut dan perhatikan penghubungan bunyi vokal!',
      vocabularies: [
        {
          word: '안녕하세요',
          romanization: 'an-nyeong-ha-se-yo',
          meaning: 'Hai / Selamat Sejahtera (Hello / Peace be with you)',
          context: 'Ucapan paling asas dan sopan untuk sebarang masa sepanjang hari',
        },
        {
          word: '감사합니다',
          romanization: 'gam-sa-ham-ni-da',
          meaning: 'Terima kasih (Thank you very much)',
          context: 'Bentuk formal sopan yang paling meluas digunakan',
        },
        {
          word: '죄송합니다',
          romanization: 'joe-song-ham-ni-da',
          meaning: 'Minta maaf (I am sorry)',
          context: 'Ungkapan sopan apabila melakukan kesilapan atau terlanggar seseorang',
        },
        {
          word: '친구',
          romanization: 'chin-gu',
          meaning: 'Kawan / Rakan (Friend)',
          context: 'Kata nama untuk rakan sebaya',
        },
        {
          word: '선생님',
          romanization: 'seon-saeng-nim',
          meaning: 'Guru / Cikgu (Teacher)',
          context: 'Panggilan hormat kepada guru atau tenaga pengajar',
        },
      ],
      phrases: [
        {
          phrase: '만나서 반갑습니다',
          romanization: 'man-na-seo ban-gap-seum-ni-da',
          meaning: 'Gembira dapat berjumpa anda (Pleased to meet you)',
          situation: 'Digunakan semasa mula-mula berkenalan dengan orang baharu',
        },
        {
          phrase: '잘 부탁드립니다',
          romanization: 'jal bu-tak-deu-rim-ni-da',
          meaning: 'Mohon tunjuk ajar / Kerjasama baik (Please look after me / treat me well)',
          situation: 'Ungkapan budaya Korea semasa menyertai kelas atau pasukan baharu',
        },
        {
          phrase: '얼마예요?',
          romanization: 'eol-ma-ye-yo?',
          meaning: 'Berapakah harganya? (How much is this?)',
          situation: 'Digunakan semasa berbelanja di pasar malam Myeongdong atau kedai',
        },
      ],
      quiz: [
        {
          id: 1,
          question: 'Apakah maksud perkataan "감사합니다" (gam-sa-ham-ni-da)?',
          options: ['Selamat Tinggal', 'Terima Kasih', 'Sama-sama', 'Selamat Pagi'],
          correctIndex: 1,
          explanation: '"감사합니다" (gam-sa-ham-ni-da) ialah ucapan formal standard bermaksud "Terima kasih".',
        },
        {
          id: 2,
          question: 'Bagaimanakah anda memanggil "Guru" atau "Cikgu" dengan penuh hormat dalam Bahasa Korea?',
          options: ['chin-gu (친구)', 'seon-saeng-nim (선생님)', 'oppa (오빠)', 'daebak (대박)'],
          correctIndex: 1,
          explanation: '"선생님" (seon-saeng-nim) ialah gelaran hormat yang bermaksud guru.',
        },
        {
          id: 3,
          question: 'Apakah frasa yang sesuai diucapkan semasa pertama kali berkenalan dengan seseorang?',
          options: ['얼마예요? (eol-ma-ye-yo?)', '만나서 반갑습니다 (man-na-seo ban-gap-seum-ni-da)', '배고파요 (bae-go-pa-yo)', '안녕히 가세요 (an-nyeong-hi ga-se-yo)'],
          correctIndex: 1,
          explanation: '"만나서 반갑습니다" bermaksud "Gembira dapat berjumpa anda" (Nice to meet you).',
        },
      ],
    };
  }

  // Japanese fallback
  return {
    languageId: 'japanese',
    languageName: 'Konnichiwa Japan',
    lessonTitle: 'Asas Hiragana & Tatatertib Budaya Jepun (Aisatsu & Respect)',
    culturalIntro: 'Di Jepun, ucapan "Aisatsu" (挨拶) bukan sekadar kata-kata, tetapi mencerminkan rasa hormat yang mendalam, sering kali diiringi dengan tunduk hormat (Ojigi).',
    pronunciationGuide: 'Sebutan bahasa Jepun sangat konsisten berdasarkan 5 vokal asas: a (ah), i (ee), u (oo), e (eh), o (oh). Pastikan sebutan jelas tanpa tekanan suku kata berlebihan.',
    vocabularies: [
      {
        word: 'こんにちは',
        romanization: 'konnichiwa',
        meaning: 'Selamat tengah hari / Hai (Hello / Good afternoon)',
        context: 'Sapaan siang universal yang paling dikenali di seluruh dunia',
      },
      {
        word: 'ありがとう',
        romanization: 'arigatou',
        meaning: 'Terima kasih (Thank you)',
        context: 'Tambah "gozaimasu" (arigatou gozaimasu) untuk menjadikannya sangat sopan',
      },
      {
        word: 'すみません',
        romanization: 'sumimasen',
        meaning: 'Maaf / Tumpang lalu / Terima kasih santai (Excuse me / Sorry)',
        context: 'Perkataan emas serba guna untuk memanggil pelayan atau meminta laluan',
      },
      {
        word: 'はい',
        romanization: 'hai',
        meaning: 'Ya / Baiklah (Yes / Understood)',
        context: 'Jawapan persetujuan dan tanda perhatian yang aktif',
      },
      {
        word: '友達',
        romanization: 'tomodachi',
        meaning: 'Kawan / Sahabat (Friend)',
        context: 'Kata nama yang bermakna persahabatan',
      },
    ],
    phrases: [
      {
        phrase: 'はじめまして',
        romanization: 'hajimemashite',
        meaning: 'Salam perkenalan (Nice to meet you for the first time)',
        situation: 'Diucapkan hanya sekali ketika pertama kali bertentang mata',
      },
      {
        phrase: 'よろしくお願いします',
        romanization: 'yoroshiku onegaishimasu',
        meaning: 'Mohon tunjuk ajar / Kerjasama baik (Please treat me favorably)',
        situation: 'Frasa keemasan budaya Jepun sebelum memulakan aktiviti atau projek bersama',
      },
      {
        phrase: 'これ、いくらですか',
        romanization: 'kore, ikura desu ka?',
        meaning: 'Berapakah harga barang ini? (How much is this?)',
        situation: 'Sangat berguna ketika membeli cenderahati di Tokyo atau Kyoto',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'Apakah perkataan emas Jepun yang bermaksud "Maaf" atau "Tumpang lalu" (Excuse me)?',
        options: ['arigatou', 'sumimasen', 'sayonara', 'konbanwa'],
        correctIndex: 1,
        explanation: '"すみません" (sumimasen) ialah perkataan serba guna untuk memohon maaf atau menarik perhatian seseorang secara sopan.',
      },
      {
        id: 2,
        question: 'Apakah perkataan bahasa Jepun untuk "Kawan / Sahabat"?',
        options: ['sensei', 'tomodachi', 'nihon', 'kawaii'],
        correctIndex: 1,
        explanation: '"友達" (tomodachi) bermaksud kawan atau sahabat karib.',
      },
      {
        id: 3,
        question: 'Bilakah anda menggunakan frasa "はじめまして" (hajimemashite)?',
        options: ['Sebelum tidur', 'Ketika pertama kali berkenalan', 'Selepas makan', 'Ketika meninggalkan bilik darjah'],
        correctIndex: 1,
        explanation: '"hajimemashite" berakar dari perkataan "hajimeru" (bermula), khas untuk pertemuan kali pertama.',
      },
    ],
  };
}

function generateClientTutorFallback(languageId: LanguageModuleId, languageName: string): string {
  if (languageId === 'thai') {
    return `Sawadee khrap/kha! 🙏 Sebagai AI Tutor **Sawadee Thai**, saya sedia membantu anda memahami sebutan 5 nada bahasa Thai, partikel kesopanan (khrap/kha), dan perbualan harian. Sila ajukan sebarang soalan!`;
  }
  if (languageId === 'korean') {
    return `Annyeonghaseyo! ✨ Sebagai AI Tutor **Annyeonghaseyo Korea**, saya boleh bantu anda dengan pembacaan suku kata Hangeul, intonasi, dan etika kesopanan (Jondaenmal). Ada perkataan yang ingin anda pelajari?`;
  }
  return `Konnichiwa! 🌸 Selamat datang ke bimbingan AI Tutor untuk **Konnichiwa Japan**. Tanyakan apa sahaja mengenai sebutan vokal Hiragana, aksen nada (pitch accent), atau frasa perbualan harian!`;
}
