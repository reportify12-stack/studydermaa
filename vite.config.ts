import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}
// LINT.ThenChange(//depot/google3/java/com/google/alkali/boq/makersuite/applet_dev_service/templates/initializers/react_theme/vite.config.ts:aistudio_media_plugin)

/**
 * Calls Gemini models with automatic failover and resilience against 503 (high demand spikes)
 * or 429 rate limit errors.
 * Sequence: Primary (gemini-3.8-flash) -> Secondary (gemini-3.6-flash) -> Tertiary (gemini-3.1-flash-lite) -> Quaternary (gemini-flash-latest).
 */
async function callGeminiWithFailover(
  ai: any,
  params: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
): Promise<{ response: any; modelUsed: string }> {
  const primary = params.primaryModel || 'gemini-3.8-flash';
  const models = [
    primary,
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  let lastError: any = null;

  for (let i = 0; i < models.length; i++) {
    const currentModel = models[i];
    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: params.contents,
        config: params.config,
      });

      if (response && (response.text || response.candidates?.length)) {
        return { response, modelUsed: currentModel };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code || err?.error?.code;
      const msg = String(err?.message || err?.error?.message || '');
      const isDemandOrRateSpike =
        status === 503 ||
        status === 'UNAVAILABLE' ||
        status === 429 ||
        status === 'RESOURCE_EXHAUSTED' ||
        msg.includes('503') ||
        msg.includes('high demand') ||
        msg.includes('Spikes in demand') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('quota') ||
        msg.includes('overloaded');

      console.warn(
        `[Gemini Failover] Model "${currentModel}" unavailable or busy (${status || 'error'}: ${msg.slice(0, 90)}...). ${
          i < models.length - 1 ? `Failing over to "${models[i + 1]}"...` : 'All Gemini models exhausted.'
        }`
      );

      if (i < models.length - 1 && isDemandOrRateSpike) {
        // Short pause before attempting backup model
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }

  throw lastError;
}

function geminiChatPlugin(): Plugin {
  return {
    name: 'vite-plugin-gemini-chat',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 1. Language Lesson Generator endpoint (/api/gemini/language-lesson)
        if (req.url && req.url.startsWith('/api/gemini/language-lesson') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const { languageId = 'thai', languageName = 'Sawadee Thai', topic = 'Asas Perbualan & Ucapan Harian' } = payload;
              const apiKey = process.env.GEMINI_API_KEY;

              if (apiKey) {
                const { GoogleGenAI } = await import('@google/genai');
                const ai = new GoogleGenAI({
                  apiKey,
                  httpOptions: {
                    headers: {
                      'User-Agent': 'aistudio-build',
                    },
                  },
                });

                const systemInstruction = `You are an expert multilingual language educator specializing in beginner language lessons for Malaysian students on study.dermaa.
You will generate an authentic, culturally rich beginner lesson and quiz for the selected language: "${languageName}" (${languageId}).
The lesson topic is: "${topic}".

STRICT REQUIREMENT: You MUST return a single, valid JSON object with NO markdown enclosing, NO backticks (\`\`\`json), conforming EXACTLY to this schema:
{
  "languageId": "${languageId}",
  "languageName": "${languageName}",
  "lessonTitle": "Creative and engaging title in Bahasa Melayu / English",
  "culturalIntro": "Brief engaging cultural and conversational context (2-3 sentences) in Bahasa Melayu",
  "pronunciationGuide": "Clear guide on tone, phonetics, and romanization rules for Malaysian learners",
  "vocabularies": [
    {
      "word": "Native script word (e.g. สวัสดี / 안녕하세요 / こんにちは)",
      "romanization": "Accurate romanization / phonetic guide",
      "meaning": "Meaning in Bahasa Melayu & English",
      "context": "Contextual usage or grammar part of speech (e.g. Kata Sapaan Sopan, Kata Nama)"
    }
  ],
  "phrases": [
    {
      "phrase": "Native script phrase",
      "romanization": "Accurate romanization / phonetics",
      "meaning": "Meaning in Bahasa Melayu & English",
      "situation": "Practical real-world situation when to use this phrase"
    }
  ],
  "quiz": [
    {
      "id": 1,
      "question": "Question testing vocabulary or phrase taught above",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of why this answer is correct and pronunciation insight"
    }
  ]
}

CRITICAL CONSTRAINTS:
1. vocabularies MUST have EXACTLY 5 distinct beginner items.
2. phrases MUST have EXACTLY 3 practical high-frequency phrases.
3. quiz MUST have EXACTLY 3 multiple-choice questions testing ONLY the 5 vocabularies and 3 phrases taught in this exact lesson.
4. correctIndex must be an integer from 0 to 3 corresponding to the correct option in the options array.
5. Provide accurate native scripts (Thai script for Thai, Hangul for Korean, Kanji/Hiragana/Katakana for Japanese) and accurate Romanization.`;

                let parsedData: any = null;
                let modelUsed = 'gemini-3.8-flash';

                try {
                  const result = await callGeminiWithFailover(ai, {
                    contents: `Generate a beginner language lesson and 3-question quiz for ${languageName}. Topic: ${topic}. Make it fun, highly practical, and engaging for Malaysian high school students.`,
                    config: {
                      systemInstruction,
                      responseMimeType: 'application/json',
                      temperature: 0.7,
                    },
                    primaryModel: 'gemini-3.8-flash',
                  });

                  modelUsed = result.modelUsed;
                  const rawText = (result.response.text || '').trim();
                  // Strip code blocks if any slipped in
                  const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
                  parsedData = JSON.parse(cleanJson);
                } catch (geminiErr: any) {
                  console.warn(
                    `[Language Lesson] Gemini API unavailable or high demand (${geminiErr?.message || '503'}). Seamlessly serving dynamic lesson fallback.`
                  );
                }

                if (parsedData && Array.isArray(parsedData.vocabularies) && Array.isArray(parsedData.quiz)) {
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(
                    JSON.stringify({
                      success: true,
                      source: 'gemini',
                      model: modelUsed,
                      data: parsedData,
                    })
                  );
                  return;
                }
              }

              // Fallback response if GEMINI_API_KEY is not set or parse failed
              const fallbackLesson = getLanguageLessonFallback(languageId, languageName, topic);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  source: 'fallback',
                  model: 'dynamic-curriculum-engine',
                  data: fallbackLesson,
                  message: apiKey ? 'Generated via validated dynamic template' : 'Demo mode (API key not configured)',
                })
              );
            } catch (err: any) {
              console.error('Language lesson error:', err);
              const fallbackLesson = getLanguageLessonFallback('thai', 'Sawadee Thai', 'Asas Perbualan');
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, source: 'fallback', data: fallbackLesson }));
            }
          });
          return;
        }

        // 2. Language Tutor Chat endpoint (/api/gemini/language-tutor)
        if (req.url && req.url.startsWith('/api/gemini/language-tutor') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const { languageId = 'thai', languageName = 'Sawadee Thai', messages = [], currentLessonTitle = '' } = payload;
              const apiKey = process.env.GEMINI_API_KEY;

              const contents = normalizeGeminiContents(messages);

              if (apiKey && contents.length > 0) {
                try {
                  const { GoogleGenAI } = await import('@google/genai');
                  const ai = new GoogleGenAI({
                    apiKey,
                    httpOptions: {
                      headers: {
                        'User-Agent': 'aistudio-build',
                      },
                    },
                  });

                  const systemInstruction = `You are Sensei/Kru/Seonsaengnim AI, the dedicated Language Tutor for "${languageName}" (${languageId}) on the study.dermaa platform for Malaysian students.
Your mission is to guide students with:
1. Exact pronunciation tips, tones (for Thai: mid, low, falling, high, rising), pitch accent (for Japanese), and batchim/liaison rules (for Korean).
2. Romanization (RTGS for Thai, Revised Romanization for Korean, Romaji/Hepburn for Japanese).
3. Cultural nuances, polite particles (khrap/kha for Thai, -yo/-nida for Korean, desu/masu for Japanese).
4. Practical dialogue examples in both Bahasa Melayu and English.
Current lesson context: "${currentLessonTitle}".
CRITICAL CONVERSATION GUIDELINES:
- Provide a direct, fresh, and engaging answer to the student's latest question.
- Do NOT repeat or echo the student's prompt.
- Use context from previous turns to stay coherent without repeating previous replies.
- Use clean Markdown with bold text and bullet points.`;

                  const { response, modelUsed } = await callGeminiWithFailover(ai, {
                    contents,
                    config: {
                      systemInstruction,
                      temperature: 0.7,
                    },
                    primaryModel: 'gemini-3.8-flash',
                  });

                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(
                    JSON.stringify({
                      reply: response.text,
                      source: 'gemini',
                      model: modelUsed,
                    })
                  );
                  return;
                } catch (geminiErr: any) {
                  console.warn(
                    `[Language Tutor] Gemini models temporarily high demand (${geminiErr?.message || '503'}). Seamlessly serving pedagogical fallback response.`
                  );
                  // Proceed to fallback seamlessly without throwing 500!
                }
              }

              // Fallback response for Language Tutor chat (always returns 200)
              const lastUserTurn = contents[contents.length - 1]?.parts[0]?.text || '';
              const fallbackReply = getLanguageTutorFallback(languageId, languageName, lastUserTurn.toLowerCase());
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  reply: fallbackReply,
                  source: 'fallback',
                  model: 'language-tutor-engine',
                })
              );
            } catch (err: any) {
              console.error('Language tutor fallback recovery:', err);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  reply: `Sawadee / Annyeong / Konnichiwa! Guru bahasa AI sedia membantu anda. Sila ajukan sebarang soalan mengenai sebutan, tatabahasa atau kosa kata!`,
                  source: 'fallback',
                })
              );
            }
          });
          return;
        }

        // 3. General KSSM AI Tutor chat endpoint (/api/gemini/chat)
        if (req.url && req.url.startsWith('/api/gemini/chat') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const { messages, systemInstruction, model = 'gemini-3.8-flash' } = payload;

              const apiKey = process.env.GEMINI_API_KEY;
              const contents = normalizeGeminiContents(messages);

              if (apiKey && contents.length > 0) {
                try {
                  const { GoogleGenAI } = await import('@google/genai');
                  const ai = new GoogleGenAI({
                    apiKey,
                    httpOptions: {
                      headers: {
                        'User-Agent': 'aistudio-build',
                      },
                    },
                  });

                  const defaultInstruction =
                    "You are CikguDermarians, an encouraging, brilliant AI Tutor for the study.dermaa platform. You specialize in the Malaysian KSSM syllabus. Explain concepts clearly, step-by-step, and in a friendly tone using either standard Malay or English depending on the student's language.";

                  const antiEchoInstruction =
                    "\n\nCRITICAL CONVERSATION GUIDELINES:\n1. Always provide a fresh, direct, and insightful answer to the student's latest question.\n2. Maintain full awareness of the conversation history for context, but NEVER echo, repeat, or quote back the user's prompt verbatim.\n3. Do not output repetitive boilerplate or canned phrases.";

                  const { response, modelUsed } = await callGeminiWithFailover(ai, {
                    contents,
                    config: {
                      systemInstruction: `${systemInstruction || defaultInstruction}${antiEchoInstruction}`,
                      temperature: 0.7,
                    },
                    primaryModel: model || 'gemini-3.8-flash',
                  });

                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(
                    JSON.stringify({
                      reply: response.text,
                      model: modelUsed,
                      source: 'gemini',
                    })
                  );
                  return;
                } catch (geminiErr: any) {
                  console.warn(
                    `[KSSM Chat] Gemini models temporarily high demand (${geminiErr?.message || '503'}). Serving curriculum fallback.`
                  );
                }
              }

              const lastUserTurn = contents[contents.length - 1]?.parts[0]?.text || '';
              const fallbackReply = getKssmChatFallback(lastUserTurn);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  reply: fallbackReply,
                  source: 'fallback',
                  message: apiKey ? 'Tutor responding via KSSM Knowledge Engine' : 'No GEMINI_API_KEY configured in server environment.',
                })
              );
            } catch (err: any) {
              console.error('Gemini chat recovery error:', err);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ reply: 'Hai! Sila kemukakan semula soalan subjek KSSM anda.', source: 'fallback' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

/**
 * Normalizes chat message history into strictly alternating 'user' and 'model' turns for Google Gemini API.
 * Rules applied:
 * 1. Strips any leading 'model' turns (e.g., initial UI welcome message) so conversation begins with 'user'.
 * 2. Merges consecutive turns of the same role into a single message with combined parts.
 * 3. Filters out errors or empty turns.
 */
function normalizeGeminiContents(rawMessages: any[]): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return [];
  }

  // Map to unified shape
  const parsed = rawMessages
    .map((m) => {
      const role: 'user' | 'model' = m.role === 'user' || m.role === 'student' ? 'user' : 'model';
      let text = '';
      if (Array.isArray(m.parts)) {
        text = m.parts
          .map((p: any) => (typeof p === 'string' ? p : p?.text || ''))
          .join('\n')
          .trim();
      } else if (typeof m.content === 'string') {
        text = m.content.trim();
      } else if (typeof m.text === 'string') {
        text = m.text.trim();
      }
      return { role, text, isError: Boolean(m.isError) };
    })
    .filter((m) => !m.isError && m.text.length > 0);

  // Gemini API requires the first turn to be 'user'
  let firstUserIndex = 0;
  while (firstUserIndex < parsed.length && parsed[firstUserIndex].role !== 'user') {
    firstUserIndex++;
  }
  const startingFromUser = parsed.slice(firstUserIndex);
  if (startingFromUser.length === 0) {
    return [];
  }

  // Strictly enforce alternating 'user' and 'model' turns
  const alternating: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  for (const item of startingFromUser) {
    const previous = alternating[alternating.length - 1];
    if (previous && previous.role === item.role) {
      previous.parts[0].text += `\n\n${item.text}`;
    } else {
      alternating.push({
        role: item.role,
        parts: [{ text: item.text }],
      });
    }
  }

  return alternating;
}

/**
 * Dynamic fallback lesson generator for Sawadee Thai, Annyeonghaseyo Korea, Konnichiwa Japan
 */
function getLanguageLessonFallback(languageId: string, languageName: string, topic: string) {
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
          context: 'Kata sapaan universal paling penting dalam Bahasa Thai'
        },
        {
          word: 'ขอบคุณ',
          romanization: 'khop-khun',
          meaning: 'Terima kasih (Thank you)',
          context: 'Diucapkan bersama "khrap" atau "kha" sebagai tanda penghargaan'
        },
        {
          word: 'ขอโทษ',
          romanization: 'khor-thot',
          meaning: 'Maaf / Tumpang lalu (Sorry / Excuse me)',
          context: 'Meminta maaf atau memulakan pertanyaan dengan sopan'
        },
        {
          word: 'อร่อย',
          romanization: 'a-roy',
          meaning: 'Sedap / Enak (Delicious)',
          context: 'Sangat berguna ketika memesan Tom Yum atau Pad Thai'
        },
        {
          word: 'ใช่',
          romanization: 'chai',
          meaning: 'Ya / Betul (Yes / Correct)',
          context: 'Kata persetujuan (Gunakan "mai chai" untuk Tidak)'
        }
      ],
      phrases: [
        {
          phrase: 'สบายดีไหม',
          romanization: 'sa-bai-dee mai?',
          meaning: 'Apa khabar? (How are you?)',
          situation: 'Bertanya khabar rakan atau kenalan baharu'
        },
        {
          phrase: 'ยินดีที่ได้รู้จัก',
          romanization: 'yin-dee thee dai roo-jak',
          meaning: 'Gembira berkenalan dengan anda (Nice to meet you)',
          situation: 'Digunakan semasa sesi perkenalan rasmi atau santai'
        },
        {
          phrase: 'เท่าไหร่ครับ/ค่ะ',
          romanization: 'thao-rai khrap / kha?',
          meaning: 'Berapa harganya? (How much is this?)',
          situation: 'Sangat berguna semasa membeli-belah di pasar Chatuchak atau kedai runcit'
        }
      ],
      quiz: [
        {
          id: 1,
          question: 'Apakah maksud perkataan "ขอบคุณ" (khop-khun) dalam Bahasa Thai?',
          options: ['Selamat Tinggal', 'Terima Kasih', 'Maafkan Saya', 'Berapa Harga'],
          correctIndex: 1,
          explanation: '"ขอบคุณ" (khop-khun) bermaksud "Terima kasih". Lelaki menyebut "khop-khun khrap" dan wanita menyebut "khop-khun kha".'
        },
        {
          id: 2,
          question: 'Bagaimanakah anda bertanya "Apa khabar?" dalam Bahasa Thai?',
          options: ['sa-wat-dee khrap', 'a-roy mak mak', 'sa-bai-dee mai?', 'khor-thot na'],
          correctIndex: 2,
          explanation: '"sa-bai-dee mai?" (สบายดีไหม) ialah soalan lazim untuk bertanya khabar dalam Bahasa Thai.'
        },
        {
          id: 3,
          question: 'Apakah perkataan Thai yang sesuai diucapkan selepas menikmati hidangan Tom Yum yang enak?',
          options: ['อร่อย (a-roy)', 'ใช่ (chai)', 'ขอโทษ (khor-thot)', 'สวัสดี (sa-wat-dee)'],
          correctIndex: 0,
          explanation: '"อร่อย" (a-roy) bermaksud sedap atau lazat!'
        }
      ]
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
          context: 'Ucapan paling asas dan sopan untuk sebarang masa sepanjang hari'
        },
        {
          word: '감사합니다',
          romanization: 'gam-sa-ham-ni-da',
          meaning: 'Terima kasih (Thank you very much)',
          context: 'Bentuk formal sopan yang paling meluas digunakan'
        },
        {
          word: '죄송합니다',
          romanization: 'joe-song-ham-ni-da',
          meaning: 'Minta maaf (I am sorry)',
          context: 'Ungkapan sopan apabila melakukan kesilapan atau terlanggar seseorang'
        },
        {
          word: '친구',
          romanization: 'chin-gu',
          meaning: 'Kawan / Rakan (Friend)',
          context: 'Kata nama untuk rakan sebaya'
        },
        {
          word: '선생님',
          romanization: 'seon-saeng-nim',
          meaning: 'Guru / Cikgu (Teacher)',
          context: 'Panggilan hormat kepada guru atau tenaga pengajar'
        }
      ],
      phrases: [
        {
          phrase: '만나서 반갑습니다',
          romanization: 'man-na-seo ban-gap-seum-ni-da',
          meaning: 'Gembira dapat berjumpa anda (Pleased to meet you)',
          situation: 'Digunakan semasa mula-mula berkenalan dengan orang baharu'
        },
        {
          phrase: '잘 부탁드립니다',
          romanization: 'jal bu-tak-deu-rim-ni-da',
          meaning: 'Mohon tunjuk ajar / Kerjasama baik (Please look after me / treat me well)',
          situation: 'Ungkapan budaya Korea semasa menyertai kelas atau pasukan baharu'
        },
        {
          phrase: '얼마예요?',
          romanization: 'eol-ma-ye-yo?',
          meaning: 'Berapakah harganya? (How much is this?)',
          situation: 'Digunakan semasa berbelanja di pasar malam Myeongdong atau kedai'
        }
      ],
      quiz: [
        {
          id: 1,
          question: 'Apakah maksud perkataan "감사합니다" (gam-sa-ham-ni-da)?',
          options: ['Selamat Tinggal', 'Terima Kasih', 'Sama-sama', 'Selamat Pagi'],
          correctIndex: 1,
          explanation: '"감사합니다" (gam-sa-ham-ni-da) ialah ucapan formal standard bermaksud "Terima kasih".'
        },
        {
          id: 2,
          question: 'Bagaimanakah anda memanggil "Guru" atau "Cikgu" dengan penuh hormat dalam Bahasa Korea?',
          options: ['chin-gu (친구)', 'seon-saeng-nim (선생님)', 'oppa (오빠)', 'daebak (대박)'],
          correctIndex: 1,
          explanation: '"선생님" (seon-saeng-nim) ialah gelaran hormat yang bermaksud guru.'
        },
        {
          id: 3,
          question: 'Apakah frasa yang sesuai diucapkan semasa pertama kali berkenalan dengan seseorang?',
          options: ['얼마예요? (eol-ma-ye-yo?)', '만나서 반갑습니다 (man-na-seo ban-gap-seum-ni-da)', '배고파요 (bae-go-pa-yo)', '안녕히 가세요 (an-nyeong-hi ga-se-yo)'],
          correctIndex: 1,
          explanation: '"만나서 반갑습니다" bermaksud "Gembira dapat berjumpa anda" (Nice to meet you).'
        }
      ]
    };
  }

  // Japanese
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
        context: 'Sapaan siang universal yang paling dikenali di seluruh dunia'
      },
      {
        word: 'ありがとう',
        romanization: 'arigatou',
        meaning: 'Terima kasih (Thank you)',
        context: 'Tambah "gozaimasu" (arigatou gozaimasu) untuk menjadikannya sangat sopan'
      },
      {
        word: 'すみません',
        romanization: 'sumimasen',
        meaning: 'Maaf / Tumpang lalu / Terima kasih santai (Excuse me / Sorry)',
        context: 'Perkataan emas serba guna untuk memanggil pelayan atau meminta laluan'
      },
      {
        word: 'はい',
        romanization: 'hai',
        meaning: 'Ya / Baiklah (Yes / Understood)',
        context: 'Jawapan persetujuan dan tanda perhatian yang aktif'
      },
      {
        word: '友達',
        romanization: 'tomodachi',
        meaning: 'Kawan / Sahabat (Friend)',
        context: 'Kata nama yang bermakna persahabatan'
      }
    ],
    phrases: [
      {
        phrase: 'はじめまして',
        romanization: 'hajimemashite',
        meaning: 'Salam perkenalan (Nice to meet you for the first time)',
        situation: 'Diucapkan hanya sekali ketika pertama kali bertentang mata'
      },
      {
        phrase: 'よろしくお願いします',
        romanization: 'yoroshiku onegaishimasu',
        meaning: 'Mohon tunjuk ajar / Kerjasama baik (Please treat me favorably)',
        situation: 'Frasa keemasan budaya Jepun sebelum memulakan aktiviti atau projek bersama'
      },
      {
        phrase: 'これ、いくらですか',
        romanization: 'kore, ikura desu ka?',
        meaning: 'Berapakah harga barang ini? (How much is this?)',
        situation: 'Sangat berguna ketika membeli cenderahati di Tokyo atau Kyoto'
      }
    ],
    quiz: [
      {
        id: 1,
        question: 'Apakah perkataan emas Jepun yang bermaksud "Maaf" atau "Tumpang lalu" (Excuse me)?',
        options: ['arigatou', 'sumimasen', 'sayonara', 'konbanwa'],
        correctIndex: 1,
        explanation: '"すみません" (sumimasen) ialah perkataan serba guna untuk memohon maaf atau menarik perhatian seseorang secara sopan.'
      },
      {
        id: 2,
        question: 'Apakah perkataan bahasa Jepun untuk "Kawan / Sahabat"?',
        options: ['sensei', 'tomodachi', 'nihon', 'kawaii'],
        correctIndex: 1,
        explanation: '"友達" (tomodachi) bermaksud kawan atau sahabat karib.'
      },
      {
        id: 3,
        question: 'Bilakah anda menggunakan frasa "はじめまして" (hajimemashite)?',
        options: ['Sebelum tidur', 'Ketika pertama kali berkenalan', 'Selepas makan', 'Ketika meninggalkan bilik darjah'],
        correctIndex: 1,
        explanation: '"hajimemashite" berakar dari perkataan "hajimeru" (bermula), khas untuk pertemuan kali pertama.'
      }
    ]
  };
}

function getLanguageTutorFallback(languageId: string, languageName: string, query: string) {
  const q = (query || '').toLowerCase();

  if (languageId === 'thai') {
    if (q.includes('terima kasih') || q.includes('thank') || q.includes('khop') || q.includes('khob')) {
      return `Sawadee khrap/kha! 🙏 **Terima Kasih dalam Bahasa Thai:**

1. **ขอบคุณ (khop-khun):** Terima kasih (Bentuk lazim/sopan).
   - Lelaki: *Khop-khun khrap* (ขอบคุณครับ)
   - Wanita: *Khop-khun kha* (ขอบคุณค่ะ)
2. **ขอบใจ (khop-jai):** Terima kasih (Bentuk santai sesama kawan sebaya atau orang lebih muda).
3. **ขอบคุณมาก (khop-khun maak):** Terima kasih banyak-banyak!

**Cara membalas "Sama-sama":**
- **ไม่เป็นไร (mai pen rai):** Tidak mengapa / Sama-sama (Frasa emas santun rakyat Thai!).`;
    }

    if (q.includes('sapa') || q.includes('greeting') || q.includes('apa khabar') || q.includes('hello') || q.includes('hai') || q.includes('khabar')) {
      return `Sawadee khrap/kha! 🙏 **Sapaan Utama Bahasa Thai:**

1. **สวัสดี (sa-wat-dee):** Hai / Selamat sejahtera.
   - Sentiasa sertakan partikel sopan: *Sa-wat-dee khrap* (lelaki) / *Sa-wat-dee kha* (wanita).
2. **สบายดีไหม (sa-bai-dee mai?):** Apa khabar?
   - Jawapan: **สบายดี (sa-bai-dee khrap/kha)** = Khabar baik!
3. **ไปไหนมา (bpai nai maa?):** Dari mana? (Sapaan mesra orang tempatan).
4. **ยินดีที่ได้รู้จัก (yin-dee thee dai roo-jak):** Gembira berkenalan dengan anda.`;
    }

    if (q.includes('nombor') || q.includes('kira') || q.includes('number') || q.includes('angka')) {
      return `Sawadee khrap/kha! 🔢 **Nombor 1 hingga 10 dalam Bahasa Thai:**

- 1: **neung** (หนึ่ง)
- 2: **song** (สอง)
- 3: **saam** (สาม)
- 4: **see** (สี่)
- 5: **haa** (ห้า - *itulah sebabnya '555' ditaip untuk bunyi ketawa 'hahaha'!*)
- 6: **hok** (หก)
- 7: **jet** (เจ็ด)
- 8: **bpaet** (แปด)
- 9: **gao** (เก้า)
- 10: **sip** (สิบ)`;
    }

    return `Sawadee khrap/kha! 🙏 Terima kasih atas soalan anda tentang **Sawadee Thai**.

### Petua Sebutan & Nada Suara (Thai Tones):
Bahasa Thai mempunyai 5 nada utama yang menentukan maksud perkataan:
1. **Nada Biasa (Mid tone):** Nada suara santai mendatar seperti bercakap biasa. Contoh: *Maa* (Datang).
2. **Nada Rendah (Low tone):** Suara lebih dalam dan berat dari kerongkong.
3. **Nada Jatuh (Falling tone):** Mula tinggi kemudian turun mendadak (seperti berkata "Oh!"). Contoh: *Maa* (Kuda).
4. **Nada Tinggi (High tone):** Suara melengking tinggi dan terhenti kemas.
5. **Nada Naik (Rising tone):** Mula rendah kemudian naik tinggi seperti bertanya soalan (*"Hah?"*). Contoh: *Maa* (Anjing).

**Tip Santun:** Sentiasa ingat untuk meletakkan **"khrap"** (lelaki) atau **"kha"** (wanita) di hujung ayat untuk menunjukkan kemesraan dan rasa hormat!

Adakah anda mahu saya tunjukkan contoh dialog pendek atau sebutan perkataan lain?`;
  }

  if (languageId === 'korean') {
    if (q.includes('terima kasih') || q.includes('thank') || q.includes('kamsa') || q.includes('gamsa') || q.includes('koma')) {
      return `Annyeonghaseyo! ✨ **Terima Kasih dalam Bahasa Korea:**

1. **감사합니다 (gam-sa-ham-ni-da):** Terima kasih formal/paling sopan, sesuai untuk guru, orang lebih tua, dan urusan rasmi.
2. **고마워요 (go-ma-wo-yo):** Terima kasih separa formal, sesuai untuk rakan sekerja atau kenalan mesra.
3. **고마워 (go-ma-wo):** Terima kasih santai (Banmal), HANYA untuk kawan karib atau orang yang lebih muda.

**Cara Membalas "Sama-sama":**
- **아니에요 (a-ni-e-yo):** "Bukan apa-apa / Sama-sama" (Paling kerap digunakan dalam perbualan harian!).
- **천만에요 (cheon-man-e-yo):** Sama-sama (Buku teks/agak formal).`;
    }

    if (q.includes('sapa') || q.includes('greeting') || q.includes('apa khabar') || q.includes('hello') || q.includes('hai') || q.includes('annyeong')) {
      return `Annyeonghaseyo! ✨ **Sapaan Asas Bahasa Korea:**

1. **안녕하세요 (an-nyeong-ha-se-yo):** Hello / Selamat sejahtera (Sopan & selamat digunakan pada bila-bila masa).
2. **안녕하십니까 (an-nyeong-ha-sim-ni-kka):** Hello (Sangat formal, sering didengar dalam berita atau ucapan rasmi).
3. **잘 지냈어요? (jal ji-naess-eo-yo?):** Awak sihat? / Lama tak jumpa!
4. **안녕히 계세요 (an-nyeong-hi gye-se-yo):** Selamat tinggal (Diucapkan jika anda yang beredar, orang itu tinggal).
5. **안녕히 가세요 (an-nyeong-hi ga-se-yo):** Selamat jalan (Diucapkan jika orang itu yang beredar).`;
    }

    return `Annyeonghaseyo! ✨ Terima kasih atas pertanyaan anda tentang **Annyeonghaseyo Korea**.

### Panduan Sebutan Hangeul & Batchim (Korean Phonetics):
1. **Penghubungan Bunyi (Liaison):** Apabila konsonan akhir (*batchim*) bertemu dengan vokal di suku kata seterusnya, bunyi konsonan akan bersambung ke vokal tersebut.
   * Contoh: 한국어 (*han-guk-eo*) disebut secara lancar sebagai **[han-gu-geo]**.
2. **Perbezaan Bunyi Konsonan:**
   * **Biasa (ㄱ, ㄷ, ㅂ):** Lembut, di antara 'g/k', 'd/t', 'b/p'.
   * **Aspirasi (ㅋ, ㅌ, ㅍ):** Dihembuskan nafas kuat.
   * **Tegang (ㄲ, ㄸ, ㅃ):** Nada tinggi dan tegang tanpa hembusan nafas.

**Tip Etika Budaya:**
Gunakan akhiran sopan seperti **"-yo" (요)** untuk rakan yang lebih tua, dan **"-nida" (니다)** dalam suasana formal atau pembelajaran sekolah.

Ada perkataan yang ingin anda pelajari sebutannya sekarang?`;
  }

  // Japanese
  if (q.includes('terima kasih') || q.includes('thank') || q.includes('arigatou')) {
    return `Konnichiwa! 🌸 **Terima Kasih dalam Bahasa Jepun:**

1. **ありがとうございます (arigatou gozaimasu):** Terima kasih banyak-banyak (Sopan & standard untuk orang luar, guru atau pelanggan).
2. **どうもありがとうございます (doumo arigatou gozaimasu):** Ucapan terima kasih paling mendalam dan formal.
3. **ありがとう (arigatou):** Terima kasih santai (Hanya untuk rakan sebaya dan keluarga).

**Cara Membalas "Sama-sama":**
- **どういたしまして (dou itashimashite):** Sama-sama.
- **いえいえ (ie ie):** "Bukan apa-apa / Tak mengapa" (Sangat lazim dalam pertuturan santai Jepun!).`;
  }

  if (q.includes('sapa') || q.includes('greeting') || q.includes('apa khabar') || q.includes('hello') || q.includes('hai') || q.includes('ohayou') || q.includes('konnichiwa')) {
    return `Konnichiwa! 🌸 **Ucapan & Salam Waktu Bahasa Jepun (Aisatsu):**

1. **おはようございます (ohayou gozaimasu):** Selamat pagi! (Singkatkan kepada *Ohayou* sesama rakan).
2. **こんにちは (konnichiwa):** Selamat tengah hari / Hai (Digunakan dari sekitar 10 pagi hingga petang).
3. **こんばんは (konbanwa):** Selamat malam (Digunakan selepas waktu senja).
4. **おやすみなさい (oyasuminasai):** Selamat tidur / Selamat malam sebelum tidur.
5. **はじめまして (hajimemashite):** Salam perkenalan (Pertama kali bersua muka).`;
  }

  return `Konnichiwa! 🌸 Selamat datang ke bimbingan AI Tutor untuk **Konnichiwa Japan**.

### Petua Sebutan & Aksen Bahasa Jepun:
1. **5 Vokal Murni:**
   * **あ (a):** Sebut seperti "ah" dalam "ayam".
   * **い (i):** Sebut seperti "ee" dalam "ikan".
   * **う (u):** Bibir tidak terlalu memuncung, sebut lembut seperti "udang".
   * **え (e):** Sebut seperti "eh" dalam "ekor".
   * **お (o):** Sebut bulat seperti "otak".
2. **Aksen Pitch (Pitch Accent):** Bahasa Jepun menggunakan pic nada tinggi dan rendah (contoh: *ha-SHI* = jambatan, *HA-shi* = penyepit makanan).
3. **Vokal Panjang (Chouon):** Vokal yang dipanjangkan 1 ketukan boleh mengubah maksud sepenuhnya (contoh: *obasan* = mak cik, *obaasan* = nenek).

Sila ajukan sebarang soalan tentang tatabahasa, Hiragana/Katakana, atau tips perbualan harian di Jepun!`;
}

/**
 * Intelligent KSSM Fallback responder for Malaysian secondary school syllabus
 */
function getKssmChatFallback(userQuery: string): string {
  const queryLower = (userQuery || '').toLowerCase();

  if (queryLower.includes('pythagoras') || queryLower.includes('hipotenus') || queryLower.includes('segi tiga')) {
    return `### 📐 Teorem Pythagoras (Matematik Tingkatan 1–3)
Dalam segi tiga bersudut tegak, kuasa dua bagi sisi terpanjang (hipotenus, $c$) bersamaan dengan hasil tambah kuasa dua bagi dua sisi yang lain ($a$ dan $b$):
$$c^2 = a^2 + b^2$$

**Contoh Pantas:**
Jika sisi pendek ialah $3\\text{ cm}$ dan $4\\text{ cm}$:
1. $c^2 = 3^2 + 4^2 = 9 + 16 = 25$
2. $c = \\sqrt{25} = 5\\text{ cm}$

*Tip Peperiksaan SPM:* Ingat trirangkap Pythagoras popular: (3, 4, 5), (5, 12, 13), (7, 24, 25), (8, 15, 17)! Ada soalan latihan yang ingin disemak?`;
  }

  if (queryLower.includes('fotosintesis') || queryLower.includes('tumbuhan') || queryLower.includes('klorofil')) {
    return `### 🌿 Fotosintesis (Sains Tingkatan 1–5 / Biologi KSSM)
Fotosintesis ialah proses tumbuhan hijau membuat makanan (glukosa) menggunakan tenaga cahaya matahari:

**Persamaan Perkataan:**
$$\\text{Karbon Dioksida} + \\text{Air} \\xrightarrow{\\text{Cahaya Matahari + Klorofil}} \\text{Glukosa} + \\text{Oksigen}$$

*Faktor penghad fotosintesis yang sering ditanya dalam Kertas 2:*
- Keamatan cahaya
- Kepekatan karbon dioksida
- Suhu optimum (25°C – 35°C)`;
  }

  if (queryLower.includes('daya') || queryLower.includes('newton') || queryLower.includes('f=ma') || queryLower.includes('fizik')) {
    return `### ⚡ Hukum Gerakan Newton Kedua ($F = ma$) - Fizik KSSM
Kadar perubahan momentum berkadar terus dengan daya paduan dan bertindak pada arah tindakan daya tersebut:
$$F = ma$$
- **$F$**: Daya Paduan (Newton, N)
- **$m$**: Jisim (kg)
- **$a$**: Pecutan ($\\text{m/s}^2$)

*Peringatan Unit SI:* Sentiasa tukar jisim gram (g) kepada kilogram (kg) sebelum memasukkan nilai ke dalam rumus!`;
  }

  return `Hai pelajar hebat! 👋 CikguDermarians di sini untuk membimbing anda mengikut silibus **KSSM**.

Saya boleh membantu anda untuk:
- **Matematik & Matematik Tambahan:** Algebra, Kalkulus, Statistik, Geometri, Teorem Pythagoras.
- **Sains & Fizik / Kimia / Biologi:** Hukum Newton, Ikatan Kimia, Sel Haiwan & Tumbuhan, Fotosintesis.
- **Sejarah & Bahasa Melayu:** Rumusan, Karangan Berformat, Kronologi Peristiwa KSSM.

Sila ajukan soalan khusus atau topik bab yang ingin kita pelajari sekarang!`;
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aistudioMediaPlugin(), geminiChatPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
