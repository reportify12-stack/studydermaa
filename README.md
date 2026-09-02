# study.dermaa — Platform Pembelajaran KSSM Malaysia

**study.dermaa** ialah platform pembelajaran digital berasaskan kurikulum KSSM (Kurikulum Standard Sekolah Menengah) Kementerian Pendidikan Malaysia untuk pelajar Tingkatan 1 hingga Tingkatan 5.

---

## 🔒 Prinsip Keselamatan & Seni Bina Pengeluaran (Zero-Trust)

Aplikasi ini dibina mengikut standard pengeluaran sebenar tanpa sebarang data palsu (No Mock Data). Pangkalan data bermula dalam keadaan bersih dan selamat:

1. **Authentication**: Pengesahan berasaskan Emel/Kata Laluan rasmi Firebase Auth.
2. **Sistem Peranan RBAC**: Hanya dua peranan sah: `student` (lalai) dan `admin`.
3. **Custom Claims Enforced**: Hak akses pentadbir dilindungi oleh Firebase Auth Custom Claims (`admin: true`) dan disahkan secara langsung dalam `firestore.rules`.
4. **Username Registry**: Pemetaan nama pengguna unik disimpan dalam koleksi `usernameRegistry` untuk mengelakkan pendaftaran berganda dan melindungi privasi pelajar.
5. **Aturan Keselamatan Firestore & Storage**: Tiada akses tanpa kebenaran, manipulasi markah XP dicegah, dan aset bahan pembelajaran hanya boleh diubah oleh pentadbir.

---

## 📋 Panduan Persediaan Firebase Console (Langkah demi Langkah)

Ikuti 14 langkah di bawah untuk menyediakan projek Firebase rasmi:

### Langkah 1: Cipta Projek Firebase
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Klik **Add project** / **Create a project**.
3. Masukkan nama projek (contoh: `study-dermaa-prod`).
4. Matikan atau hidupkan Google Analytics mengikut keperluan anda, kemudian klik **Create project**.

### Langkah 2: Daftarkan Aplikasi Web
1. Di halaman Project Overview, klik ikon Web (`</>`) untuk menambah aplikasi web.
2. Masukkan App nickname: `study-dermaa-web`.
3. Tandakan pilihan **Also set up Firebase Hosting** jika mahu menggunakan Firebase Hosting.
4. Salin kunci konfigurasi Firebase (`firebaseConfig`).

### Langkah 3: Konfigurasi Pembolehubah Persekitaran (`.env`)
Cipta fail `.env` (atau isi dalam panel rahsia AI Studio) berpandukan `.env.example`:
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="study-dermaa-prod.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="study-dermaa-prod"
VITE_FIREBASE_STORAGE_BUCKET="study-dermaa-prod.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"
```

### Langkah 4: Aktifkan Firebase Authentication
1. Di menu sebelah kiri Firebase Console, navigasi ke **Build** > **Authentication**.
2. Klik **Get started**.
3. Di tab **Sign-in method**, pilih penyedia **Email/Password**.
4. Aktifkan **Email/Password** (pilihan 'Email link' boleh dimatikan).
5. Klik **Save**.
*(Nota: Pilihan Google/Facebook/Apple dimatikan kerana aplikasi menggunakan pendaftaran nama pengguna & kata laluan tempatan).*

### Langkah 5: Aktifkan Cloud Firestore
1. Navigasi ke **Build** > **Firestore Database**.
2. Klik **Create database**.
3. Pilih lokasi pangkalan data yang berdekatan dengan Malaysia (contoh: `asia-southeast1` - Singapura).
4. Pilih mod keselamatan **Production mode** (Start in production mode) dan klik **Next** > **Enable**.

### Langkah 6: Pasang Firestore Security Rules
Aturan keselamatan yang lengkap telah disediakan dalam fail `firestore.rules`.
Anda boleh menggunakannya secara automatik menggunakan arahan:
```bash
firebase deploy --only firestore:rules
```
Atau salin kandungan fail `firestore.rules` terus ke tab **Rules** di Firestore Database Console dan klik **Publish**.

### Langkah 7: Pasang Firestore Indexes
Indeks kompaun yang diperlukan telah disediakan dalam `firestore.indexes.json`.
Deploy menggunakan arahan:
```bash
firebase deploy --only firestore:indexes
```

### Langkah 8: Aktifkan Cloud Storage
1. Navigasi ke **Build** > **Storage**.
2. Klik **Get started**.
3. Pilih mod keselamatan **Production mode** dan pilih lokasi baldi yang sama (`asia-southeast1`).
4. Klik **Done**.

### Langkah 9: Pasang Storage Security Rules
Deploy aturan keselamatan storan fail `storage.rules`:
```bash
firebase deploy --only storage
```
Atau salin kandungan fail `storage.rules` ke tab **Rules** di Firebase Storage Console.

---

## 👑 Cara Menetapkan Pentadbir Pertama (First Admin Initialization)

Untuk mengekalkan integriti pengeluaran, akaun pentadbir **TIDAK** dicipta secara automatik. Pemilik sistem perlu mempromosikan akaun pertama secara manual menggunakan skrip selamat `scripts/setAdminClaim.ts`.

### Kaedah A: Melalui Skrip CLI Rasmi (Disyorkan)

1. **Daftar Akaun Pelajar Terlebih Dahulu**:
   - Buka aplikasi `study.dermaa` di pelayar web.
   - Pergi ke halaman **Daftar Akaun** (`/register`).
   - Daftar akaun dengan username yang anda inginkan (contoh: `cikgu_admin` atau `admin_dermaa`) beserta kata laluan yang kukuh.

2. **Dapatkan Kunci Firebase Admin (Service Account Key)**:
   - Di Firebase Console, klik ikon gear (Project Settings) > tab **Service accounts**.
   - Klik **Generate new private key** dan muat turun fail JSON tersebut ke komputer anda.

3. **Jalankan Skrip Penetapan Pentadbir**:
   Tetapkan laluan fail kunci dan jalankan skrip CLI:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"
   npx tsx scripts/setAdminClaim.ts <USERNAME_ATAU_EMEL_ATAU_UID>
   ```
   Contoh:
   ```bash
   npx tsx scripts/setAdminClaim.ts cikgu_admin
   ```

4. **Selesai**:
   Skrip akan:
   - Mengesahkan pengguna dalam pangkalan data.
   - Menetapkan Firebase Auth Custom User Claim `{ admin: true }`.
   - Mengemas kini dokumen profil di `users/{uid}` kepada `role: 'admin'`.
   - Log keluar dan log masuk semula di pelayar web untuk memuatkan token pentadbir yang baru.
   - Buka `/admin` untuk mengakses **Panel Pentadbir**.

---

## 📁 Struktur Koleksi Firestore

* `users/{uid}` — Profil pengguna pelajar dan pentadbir (XP, rekod streak, tingkatan, peranan).
* `usernameRegistry/{usernameLowercase}` — Rekod keunikan nama pengguna bagi mengelakkan pertindihan dan mengurus log masuk.
* `subjects/{subjectId}` — Subjek kurikulum KSSM (contoh: Sains, Matematik, Sejarah).
* `chapters/{chapterId}` — Bab mengikut tingkatan bagi setiap subjek.
* `topics/{topicId}` — Topik pembelajaran dalam setiap bab.
* `notes/{noteId}` — Nota ringkas, isi penting, dan ringkasan pembelajaran interaktif.
* `quizzes/{quizId}` — Set kuiz latihan mengikut subjek dan bab.
* `questions/{questionId}` — Bank soalan kuiz (Objektif, Subjektif, KBAT).
* `quizAttempts/{attemptId}` — Rekod percubaan kuiz pelajar berserta markah dan masa serahan.
* `userProgress/{uid}/notes/{noteId}` — Status pembacaan nota pelajar.
* `bookmarks/{bookmarkId}` — Penanda buku nota kegemaran pelajar.
* `announcements/{announcementId}` — Pengumuman rasmi daripada pihak sekolah atau pentadbir.
* `settings/{docId}` — Konfigurasi am sistem dan platform.

---

## 🛠️ Pembangunan & Pengujian Tempatan

```bash
# Pasang kebergantungan
npm install

# Jalankan pelayan pembangunan tempatan (Port 3000)
npm run dev

# Semak jenis TypeScript
npm run lint

# Bina fail pengeluaran
npm run build
```

---

## 🛡️ Senarai Semak Keselamatan Sebelum Pelancaran Awam

- [x] Semua pembolehubah sulit disimpan dalam `.env` dan tidak didedahkan ke GitHub.
- [x] `firestore.rules` menyekat sebarang cubaan ubah suai peranan (`role != 'admin'`) daripada pelanggan.
- [x] `storage.rules` mengehadkan saiz muat naik gambar profil (2MB) dan bahan rujukan (10MB).
- [x] Tiada data palsu (mock data) dalam kod sumber aplikasi.
- [x] Sedia untuk pengaktifan **Firebase App Check** (reCAPTCHA Enterprise) apabila dipasang domain tersuai.
