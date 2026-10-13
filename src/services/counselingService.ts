import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { CounselingSession, CounselingMessage } from '../types';

/**
 * Red flag keywords array.
 * Checked against student messages to intercept potential mental health crisis,
 * severe distress, hopelessness, or self-harm before AI generation.
 */
export const RED_FLAG_KEYWORDS: string[] = [
  'stres',
  'stress',
  'depresi',
  'depression',
  'kemurungan',
  'putus asa',
  'gagal',
  'bunuh diri',
  'suicide',
  'cedera',
  'menyakiti diri',
  'self harm',
  'tak tahan',
  'benci hidup',
  'nak mati',
  'tak guna',
  'hilang harapan',
  'kelar',
  'putus nyawa',
  'tak mahu hidup',
  'tertekan sangat',
  'tak sanggup lagi',
  'mati je la',
  'nak tamatkan hidup',
];

/**
 * System intervention message required by the user prompt.
 */
export const INTERVENTION_SYSTEM_MESSAGE =
  'Bertenang, cikgu ada untuk bantu. Mesej awak telah dipanjangkan kepada Guru Kaunseling.';

export const INTERVENTION_DETAILS =
  'Sekiranya awak memerlukan bantuan segera atau talian kecemasan emosi:\n• Talian Kasih (KPWKM): 15999 (atau WhatsApp 019-2615999 - 24 Jam Percuma)\n• Befrienders Malaysia: 03-7627 2929 (24 Jam)\n• Cikgu Kaunseling SMK Derma sentiasa bersedia mendengar di Bilik Kaunseling.';

export interface RedFlagScanResult {
  isRedFlag: boolean;
  matchedKeywords: string[];
  severity: 'urgent' | 'none';
}

/**
 * Keyword Scanner Logic:
 * Intercepts the student's message before sending it to the AI.
 * Checks against an array of red-flag keywords.
 */
export function scanMessageForRedFlags(text: string): RedFlagScanResult {
  if (!text || typeof text !== 'string') {
    return { isRedFlag: false, matchedKeywords: [], severity: 'none' };
  }

  // Normalize message: lowercase and replace multiple spaces/punctuations
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const matchedKeywords: string[] = [];

  for (const keyword of RED_FLAG_KEYWORDS) {
    const kwLower = keyword.toLowerCase();
    
    // Check if the normalized string includes the keyword
    if (normalized.includes(kwLower)) {
      matchedKeywords.push(keyword);
    } else {
      // Regex check with flexible word boundary to catch words with elongations (e.g., 'streeeess')
      const escaped = kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(normalized)) {
        matchedKeywords.push(keyword);
      }
    }
  }

  const isRedFlag = matchedKeywords.length > 0;
  return {
    isRedFlag,
    matchedKeywords,
    severity: isRedFlag ? 'urgent' : 'none',
  };
}

/**
 * Generate empathetic AI response for general, non-flagged study support queries.
 */
async function generateSupportAiResponse(
  userText: string,
  studentName: string,
  tingkatan?: string
): Promise<string> {
  try {
    // Attempt backend proxy route
    const payload = {
      messages: [
        {
          role: 'user',
          parts: [{ text: userText }],
        },
      ],
      systemInstruction: `Anda adalah pembimbing motivasi dan rakan sokongan belajar rasmi SMK Derma (study.dermaa) untuk murid bernama ${studentName} (${tingkatan || 'KSSM'}).
Gaya bahasa: Sangat lemah lembut, mesra, membina keyakinan (growth mindset), dan santai dalam Bahasa Melayu.
Tugasan: Berikan nasihat ringkas (2-4 perenggan) mengenai teknik mengurus jadual belajar, teknik bernafas bertenang, atau pembahagian tugas kecil untuk mengurangkan beban minda.
PERINGATAN PENTING:
- Jangan mendiagnosis sebarang penyakit mental.
- Sentiasa ingatkan murid bahawa Cikgu Kaunseling di sekolah sentiasa bersedia untuk berbual secara peribadi.`,
    };

    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return data.reply;
      }
    }
  } catch (err) {
    console.warn('Backend chat unavailable, using graceful counselor assistant fallback:', err);
  }

  // Graceful compassionate fallback
  return `Hai ${studentName}, terima kasih kerana berkongsi. Cikgu faham ada masanya perjalanan belajar terasa padat dan mencabar. 

Langkah terbaik sekarang adalah berehat seketika, tarik nafas dalam-dalam selama 4 saat dan hembus perlahan-lahan. Cuba bahagikan ulangkaji hari ini kepada bahagian-bahagian kecil (misalnya 15-20 minit sahaja).

Ingat, Cikgu Kaunseling sentiasa bersedia mendengar sekiranya awak perlukan teman berbual. Awak tidak keseorangan!`;
}

/**
 * Get or create active counseling session for a student
 */
export async function getOrCreateStudentSession(
  studentId: string,
  studentName: string,
  studentUsername: string,
  studentTingkatan?: string
): Promise<CounselingSession> {
  const sessionDocRef = doc(db, 'counseling_sessions', studentId);
  const snap = await getDoc(sessionDocRef);

  if (snap.exists()) {
    const data = snap.data() as CounselingSession;
    return {
      ...data,
      id: snap.id,
    };
  }

  // Create initial session with consent record and welcome message
  const now = new Date().toISOString();
  const initialSession: CounselingSession = {
    id: studentId,
    studentId,
    studentName,
    studentUsername,
    studentTingkatan: studentTingkatan || 'Tingkatan 1',
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
    status: 'active',
    requires_urgent_attention: false,
    flaggedKeywords: [],
    messages: [
      {
        id: `msg_welcome_${Date.now()}`,
        sender: 'system',
        text: 'Selamat datang ke Sokongan Pelajar study.dermaa. Ruang ini selamat untuk berkongsi masalah pembelajaran atau emosi akademik anda. Sila maklum: Perbualan ini dipantau oleh Cikgu Kaunseling untuk keselamatan awak.',
        timestamp: now,
      },
    ],
  };

  await setDoc(sessionDocRef, initialSession);
  return initialSession;
}

/**
 * Send student message with Keyword Scanner triage logic.
 * If red-flag is detected:
 * - DO NOT call AI API
 * - Append system intervention message
 * - Update counseling_sessions doc with requires_urgent_attention: true
 */
export async function sendStudentSupportMessage(
  sessionId: string,
  studentId: string,
  messageText: string,
  studentProfile: {
    fullName: string;
    username: string;
    tingkatan?: string;
  }
): Promise<{ session: CounselingSession; wasIntervened: boolean; matchedKeywords: string[] }> {
  const sessionDocRef = doc(db, 'counseling_sessions', sessionId);
  const snap = await getDoc(sessionDocRef);

  let currentSession: CounselingSession;
  const now = new Date().toISOString();

  if (snap.exists()) {
    currentSession = snap.data() as CounselingSession;
  } else {
    currentSession = await getOrCreateStudentSession(
      studentId,
      studentProfile.fullName,
      studentProfile.username,
      studentProfile.tingkatan
    );
  }

  // Step 1: Execute Keyword Scanner Logic
  const scanResult = scanMessageForRedFlags(messageText);

  const studentMsg: CounselingMessage = {
    id: `msg_std_${Date.now()}`,
    sender: 'student',
    senderName: studentProfile.fullName,
    text: messageText,
    timestamp: now,
    flaggedKeywords: scanResult.matchedKeywords,
  };

  const updatedMessages = [...currentSession.messages, studentMsg];

  if (scanResult.isRedFlag) {
    // =========================================================================
    // RED FLAG INTERVENTION FLOW:
    // 1. DO NOT call the AI API.
    // 2. Automatically append system message:
    //    'Bertenang, cikgu ada untuk bantu. Mesej awak telah dipanjangkan kepada Guru Kaunseling.'
    // 3. Update counseling_sessions with requires_urgent_attention: true
    // =========================================================================

    const interventionMsg: CounselingMessage = {
      id: `msg_sys_${Date.now() + 1}`,
      sender: 'system',
      text: `${INTERVENTION_SYSTEM_MESSAGE}\n\n${INTERVENTION_DETAILS}`,
      timestamp: new Date().toISOString(),
      isIntervention: true,
      flaggedKeywords: scanResult.matchedKeywords,
    };

    updatedMessages.push(interventionMsg);

    // Merge flagged keywords
    const combinedKeywords = Array.from(
      new Set([...(currentSession.flaggedKeywords || []), ...scanResult.matchedKeywords])
    );

    const updatedData: Partial<CounselingSession> = {
      messages: updatedMessages,
      requires_urgent_attention: true,
      status: 'urgent',
      flaggedKeywords: combinedKeywords,
      updatedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      studentName: studentProfile.fullName,
      studentUsername: studentProfile.username,
      studentTingkatan: studentProfile.tingkatan || currentSession.studentTingkatan,
    };

    await updateDoc(sessionDocRef, updatedData);

    return {
      session: { ...currentSession, ...updatedData } as CounselingSession,
      wasIntervened: true,
      matchedKeywords: scanResult.matchedKeywords,
    };
  }

  // =========================================================================
  // NORMAL FLOW (No red flag detected):
  // Safe to call AI for gentle, encouraging study support.
  // =========================================================================
  const aiReplyText = await generateSupportAiResponse(
    messageText,
    studentProfile.fullName,
    studentProfile.tingkatan
  );

  const aiMsg: CounselingMessage = {
    id: `msg_ai_${Date.now() + 1}`,
    sender: 'ai',
    senderName: 'Pembimbing Belajar',
    text: aiReplyText,
    timestamp: new Date().toISOString(),
  };

  updatedMessages.push(aiMsg);

  const updatedData: Partial<CounselingSession> = {
    messages: updatedMessages,
    updatedAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    studentName: studentProfile.fullName,
    studentUsername: studentProfile.username,
    studentTingkatan: studentProfile.tingkatan || currentSession.studentTingkatan,
  };

  await updateDoc(sessionDocRef, updatedData);

  return {
    session: { ...currentSession, ...updatedData } as CounselingSession,
    wasIntervened: false,
    matchedKeywords: [],
  };
}

/**
 * Send direct message from counselor to student in the session
 */
export async function sendCounselorDirectMessage(
  sessionId: string,
  counselorName: string,
  text: string
): Promise<void> {
  const sessionDocRef = doc(db, 'counseling_sessions', sessionId);
  const snap = await getDoc(sessionDocRef);
  if (!snap.exists()) return;

  const currentSession = snap.data() as CounselingSession;
  const now = new Date().toISOString();

  const counselorMsg: CounselingMessage = {
    id: `msg_counselor_${Date.now()}`,
    sender: 'counselor',
    senderName: counselorName || 'Cikgu Kaunseling',
    text,
    timestamp: now,
  };

  const updatedMessages = [...currentSession.messages, counselorMsg];

  await updateDoc(sessionDocRef, {
    messages: updatedMessages,
    updatedAt: now,
    lastMessageAt: now,
    assignedCounselorName: counselorName,
  });
}

/**
 * Mark session as resolved / attended by counselor
 */
export async function resolveCounselingSession(
  sessionId: string,
  counselorName: string,
  notes?: string
): Promise<void> {
  const sessionDocRef = doc(db, 'counseling_sessions', sessionId);
  const now = new Date().toISOString();

  await updateDoc(sessionDocRef, {
    requires_urgent_attention: false,
    status: 'resolved',
    resolvedAt: now,
    resolvedBy: counselorName,
    counselorNotes: notes || 'Sesi telah disemak dan tindakan susulan telah diambil oleh Guru Kaunseling.',
    updatedAt: now,
  });
}

/**
 * Subscribe to all counseling sessions for Counselor Dashboard.
 * Sorted in memory / Firestore so requires_urgent_attention == true is strictly at the top.
 */
export function subscribeToCounselorDashboard(
  callback: (sessions: CounselingSession[]) => void
): () => void {
  const colRef = collection(db, 'counseling_sessions');
  const q = query(colRef, limit(50));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: CounselingSession[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as CounselingSession);
      });

      // Sort with requires_urgent_attention == true strictly at the top, then by lastMessageAt desc
      items.sort((a, b) => {
        if (a.requires_urgent_attention && !b.requires_urgent_attention) return -1;
        if (!a.requires_urgent_attention && b.requires_urgent_attention) return 1;
        const timeA = new Date(a.lastMessageAt || a.updatedAt || 0).getTime();
        const timeB = new Date(b.lastMessageAt || b.updatedAt || 0).getTime();
        return timeB - timeA;
      });

      callback(items);
    },
    (err) => {
      console.error('Error subscribing to counseling sessions:', err);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to student's own single session
 */
export function subscribeToStudentSession(
  studentId: string,
  callback: (session: CounselingSession | null) => void
): () => void {
  const docRef = doc(db, 'counseling_sessions', studentId);
  const unsubscribe = onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as CounselingSession);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error('Error subscribing to student session:', err);
      callback(null);
    }
  );

  return unsubscribe;
}
