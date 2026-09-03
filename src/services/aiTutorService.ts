import { ChatMessage } from '../types';
import { DEFAULT_AI_TUTOR_SYSTEM_INSTRUCTION, AI_TUTOR_MODEL, buildTutorSystemInstruction } from '../config/aiTutorConfig';

const STORAGE_KEY = 'study_dermaa_ai_tutor_chat_history';

/**
 * Interface representing a chat message payload for the Gemini API
 */
export interface GeminiContentPart {
  text: string;
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
}

export interface GeminiChatPayload {
  messages: GeminiContent[];
  systemInstruction?: string;
  model?: string;
  studentName?: string;
  tingkatan?: string;
  subject?: string;
}

export interface GeminiChatResponse {
  reply: string;
  model?: string;
  source?: 'gemini' | 'fallback';
  error?: string;
}

/**
 * Loads saved chat history from local storage
 */
export function getStoredChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load chat history from storage:', err);
    return [];
  }
}

/**
 * Saves chat history to local storage
 */
export function storeChatHistory(messages: ChatMessage[]): void {
  try {
    // Retain only the last 30 messages to avoid local storage overflow
    const trimmed = messages.slice(-30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save chat history to storage:', err);
  }
}

/**
 * Clears stored chat history
 */
export function clearStoredChatHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear chat history:', err);
  }
}

/**
 * Converts internal ChatMessage objects to the Google Gemini API `contents` format
 */
export function formatMessagesForGemini(messages: ChatMessage[]): GeminiContent[] {
  return messages.map((msg) => ({
    role: msg.role === 'student' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));
}

/**
 * Functional skeleton to call an AI API specifically structured for the Google Gemini API.
 * Calls the server-side proxy route (/api/gemini/chat) to protect API keys.
 * If server route is unreachable or lacks an API key, falls back gracefully to
 * high-quality educational KSSM reasoning.
 */
export async function sendGeminiChatRequest(
  chatHistory: ChatMessage[],
  studentName?: string,
  tingkatan?: string,
  subject?: string
): Promise<GeminiChatResponse> {
  const systemInstruction = buildTutorSystemInstruction(studentName, tingkatan, subject);
  const formattedContents = formatMessagesForGemini(chatHistory);

  const payload: GeminiChatPayload = {
    messages: formattedContents,
    systemInstruction,
    model: AI_TUTOR_MODEL,
    studentName,
    tingkatan,
    subject,
  };

  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.reply) {
        return {
          reply: data.reply,
          model: data.model || AI_TUTOR_MODEL,
          source: data.source || 'gemini',
        };
      }
    }
  } catch (networkError) {
    console.warn('Backend /api/gemini/chat unreachable, activating KSSM Tutor fallback engine:', networkError);
  }

  // Graceful fallback educational responder if Gemini API server is offline or key unconfigured
  const lastUserMessage = chatHistory[chatHistory.length - 1]?.content || '';
  const fallbackReply = generateFallbackKssmAnswer(lastUserMessage, studentName, tingkatan, subject);

  return {
    reply: fallbackReply,
    model: AI_TUTOR_MODEL,
    source: 'fallback',
  };
}

/**
 * Intelligent KSSM Fallback Engine
 * Generates structured, step-by-step, encouraging answers tailored to Malaysian students
 */
function generateFallbackKssmAnswer(
  prompt: string,
  studentName: string = 'pelajar',
  tingkatan: string = 'KSSM',
  subject?: string
): string {
  const lower = prompt.toLowerCase();
  const greeting = `Hai ${studentName}! Bagus sekali soalan ini. Mari kita teliti langkah demi langkah mengikut sukatan ${tingkatan}:`;

  // Matematik - Teorem Pythagoras
  if (lower.includes('pythagoras') || lower.includes('teorem')) {
    return `${greeting}

**Teorem Pythagoras (Matematik KSSM)**
Digunakan untuk mencari panjang sisi segitiga bersudut tegak (90°):

### 1. Formula Asas
$$c^2 = a^2 + b^2$$
* Di mana **$c$** adalah **hipotenus** (sisi paling panjang bertentangan dengan sudut 90°).
* **$a$** dan **$b$** adalah dua sisi yang membentuk sudut tegak.

### 2. Contoh Soalan
Diberi segitiga bersudut tegak dengan sisi $a = 3\\text{ cm}$ dan $b = 4\\text{ cm}$. Cari panjang hipotenus $c$:
1. $c^2 = 3^2 + 4^2$
2. $c^2 = 9 + 16 = 25$
3. $c = \\sqrt{25} = \\mathbf{5\\text{ cm}}$

### 3. Tip Peperiksaan SPM
* Ingat set "Tripel Pythagoras" popular untuk jimat masa: (3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25).
* Sentiasa semak kedudukan hipotenus dahulu sebelum membuat pengiraan!`;
  }

  // Matematik - Kuadratik / Faktorisasi
  if (lower.includes('kuadratik') || lower.includes('faktorkan') || lower.includes('persamaan')) {
    return `${greeting}

**Penyelesaian Persamaan Kuadratik $ax^2 + bx + c = 0$**

Terdapat tiga kaedah utama dalam Matematik KSSM:

1. **Kaedah Pemfaktoran (Paling Pantas):**
   * Contoh: $x^2 - 5x + 6 = 0$
   * Cari dua nombor yang hasil darabnya $+6$ dan hasil tambahnya $-5$.
   * Nombor itu ialah $-2$ dan $-3$.
   * Bentuk faktor: $(x - 2)(x - 3) = 0$
   * Maka penyelesaian: $x = 2$ atau $x = 3$.

2. **Rumus Kuadratik (Formula Kuadratik):**
   $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
   * Sangat berguna jika nombor tidak boleh difaktorkan dengan mudah.

3. **Kaedah Penyempurnaan Kuasa Dua:**
   * Penting untuk mencari titik pegun (minimum/maksimum) dalam Matematik Tambahan.

Adakah anda ingin saya tunjukkan contoh soalan spesifik?`;
  }

  // Sains / Fizik - Hukum Newton
  if (lower.includes('newton') || lower.includes('daya') || lower.includes('fizik')) {
    return `${greeting}

**Hukum Gerakan Newton (Fizik KSSM)**

* **Hukum Newton Pertama (Inersia):**
  Objek akan kekal pegun atau bergerak dengan halaju malar melainkan terdapat daya luar bersih bertindak ke atasnya.
  * *Contoh harian:* Penumpang terhumban ke hadapan apabila bas membrek secara tiba-tiba.

* **Hukum Newton Kedua ($F = ma$):**
  Kadar perubahan momentum berkadar terus dengan daya paduan dan bertindak pada arah daya tersebut.
  * Formula: **$F = ma$** (Daya = Jisim $\\times$ Pecutan).

* **Hukum Newton Ketiga (Tindakan & Tindak Balas):**
  Untuk setiap daya tindakan, terdapat daya tindak balas yang sama magnitud tetapi bertentangan arah.
  * *Contoh harian:* Enjin roket menolak gas panas ke bawah, gas menolak roket ke atas.

Bagus soalan Fizik ini! Ingin cuba soalan pengiraan $F = ma$?`;
  }

  // Sains / Biologi - Fotosintesis
  if (lower.includes('fotosintesis') || lower.includes('sel') || lower.includes('tumbuhan')) {
    return `${greeting}

**Proses Fotosintesis (Sains & Biologi KSSM)**

Fotosintesis ialah proses tumbuhan hijau membuat makanan (glukosa) menggunakan tenaga cahaya matahari, air, dan karbon dioksida.

### Persamaan Kimia:
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{Cahaya} + \\text{Klorofil}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$
*(Karbon Dioksida + Air $\\rightarrow$ Glukosa + Oksigen)*

### 2 Peringkat Utama:
1. **Tindak Balas Bersandarkan Cahaya (di Grana/Tilakoid):**
   * Molekul air dipecahkan melalui fotolisis air menghasilkan gas oksigen ($O_2$) dan tenaga ATP/NADPH.
2. **Tindak Balas Tidak Bersandarkan Cahaya (di Stroma):**
   * Menggunakan tenaga daripada peringkat pertama untuk mengikat gas karbon dioksida menjadi glukosa.

Ingat kata kunci markah KSSM: **Klorofil menyerap foton cahaya**!`;
  }

  // Sejarah - Pembentukan Malaysia 1963
  if (lower.includes('sejarah') || lower.includes('malaysia') || lower.includes('1963')) {
    return `${greeting}

**Faktor Pembentukan Malaysia 16 September 1963 (Sejarah KSSM)**

Gagasan pembentukan Malaysia dicadangkan oleh Tunku Abdul Rahman pada 27 Mei 1961 di Hotel Adelphi, Singapura.

### Faktor-faktor Utama (Format Markah Sejarah):
1. **Keselamatan & Membendung Komunis:**
   * Ancaman komunis di Singapura (Barisan Sosialis) dan Sarawak (Pasukan Gerila Rakyat Sarawak - PGRS).
2. **Keseimbangan Kaum (Demografi):**
   * Mengimbangi nisbah penduduk Melayu dan bumiputera apabila Sabah, Sarawak, dan Brunei digabungkan dengan Singapura.
3. **Mempercepat Kemerdekaan:**
   * Memberikan kemerdekaan segera kepada Sabah, Sarawak, dan Singapura daripada penjajahan British melalui proses dekolonisasi.
4. **Pembangunan Ekonomi Bersama:**
   * Mewujudkan pasaran yang lebih luas dan merancakkan pelaburan industri antara wilayah.

*Iktibar:* Kebijaksanaan pemimpin berunding secara diplomasi melalui Suruhanjaya Cobbold dan MAPHILINDO menjamin kedaulatan negara kita!`;
  }

  // Bahasa Melayu - Karangan SPM / Peribahasa
  if (lower.includes('karangan') || lower.includes('bahasa melayu') || lower.includes('bm') || lower.includes('peribahasa')) {
    return `${greeting}

**Teknik Penulisan Karangan Cemerlang SPM (Bahasa Melayu KSSM)**

Untuk mendapatkan markah **Cemerlang (A+)**, gunakan formula perenggan **THeKOP**:

1. **T (Tema/Ayat Topik):** Nyatakan isi utama perenggan dengan jelas.
2. **He (Huraian/Mengapa):** Huraikan sebab atau punca kepada isu tersebut.
3. **K (Kesan/Impak):** Jelaskan impak positif atau negatif kepada individu, masyarakat, atau negara.
4. **O (Organisasi/Contoh):** Berikan contoh realiti atau statistik sahih semasa.
5. **P (Penegas + Peribahasa):** Tegaskan isi dengan peribahasa menarik.

### Koleksi Peribahasa Menarik:
* *Perpaduan:* "Bulat air kerana pembetung, bulat manusia kerana muafakat."
* *Kerjasama:* "Berat sama dipikul, ringan sama dijinjing."
* *Usaha berterusan:* "Di mana ada kemahuan, di situ ada jalan" / "Genggam bara api biar sampai jadi arang."

Ada tema spesifik yang ingin anda latih bersama saya hari ini?`;
  }

  // General encouraging reply
  return `${greeting}

Terima kasih atas pertanyaan anda tentang: **"${prompt}"**.

Sebagai CikguDermarians (AI Tutor KSSM anda), berikut adalah panduan asas untuk topik ini:

1. **Fahami Konsep Dasar:**
   Mulakan dengan memahami definisi utama topik ini dalam buku teks KSSM anda. Jangan sekadar menghafal, tetapi cuba visualisasikan bagaimana konsep ini diaplikasikan.

2. **Kenal Pasti Format Soalan Peperiksaan:**
   * Soalan Objektif (Kertas 1): Uji kefahaman pantas dan fakta tepat.
   * Soalan Struktur & Esei (Kertas 2): Memerlukan penerangan berfakta, kata kunci teknikal, dan perenggan tersusun.
   * Soalan KBAT: Berikan cadangan logik berserta huraian dan contoh relevan dalam konteks Malaysia.

3. **Langkah Lanjutan:**
   Boleh kongsikan bahagian manakah yang paling mencabar untuk anda dalam topik ini? Saya sedia membantu dengan jalan kerja lengkap dan contoh latihan!`;
}
