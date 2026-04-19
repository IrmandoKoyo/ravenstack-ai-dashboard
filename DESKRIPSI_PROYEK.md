# RAVENSTACK AI DASHBOARD
**Dokumentasi Komprehensif untuk Project Final Mata Kuliah Data Visualisasi**

---

## BAB 1: LATAR BELAKANG & TUJUAN PROYEK

### 1.1 Konteks Tugas Akhir
Proyek ini merupakan implementasi tugas akhir mata kuliah **Data Visualisasi** dengan topik: *"AI-Integrated Web-Based Data Analytics Dashboard"*. Sesuai instruksi dosen, mahasiswa ditugaskan untuk membuat website dashboard interaktif yang mampu:
*   Menampilkan visualisasi data dalam bentuk dashboard interaktif (KPI, Line Chart, Bar Chart, Pie Chart, Table).
*   Mengolah dan menyajikan data dari dataset nyata bersumber dari **Kaggle**.
*   Menyediakan fitur **AI Chat Assistant** yang memungkinkan pengguna melakukan analisis data menggunakan bahasa natural.

### 1.2 Dataset yang Digunakan
Kami memilih dataset yang valid dan bervolume besar, bukan data dummy/karangan.
*   **Sumber:** Kaggle - *SaaS Subscription and Churn Analytics Dataset* oleh Rivalytics.
*   **URL:** [kaggle.com/datasets/rivalytics/saas-subscription-and-churn-analytics-dataset](https://www.kaggle.com/datasets/rivalytics/saas-subscription-and-churn-analytics-dataset)
*   **Volume Data:** Lebih dari **10.000+ baris** data transaksi.
*   **Signifikansi Akademik:** Memenuhi ketentuan tugas yaitu minimal 100 baris data dari platform publik.

---

## BAB 2: INFRASTRUKTUR CLOUD & DEPLOYMENT

Aplikasi ini beroperasi 100% di Cloud, memisahkan lapisan tampilan (*Frontend*) dengan lapisan data (*Backend*).

### 2.1 Hosting & CI/CD (Vercel)
Aplikasi di-*deploy* ke internet menggunakan **Vercel**, platform hosting terkemuka untuk aplikasi React/Vite.
*   **Global Edge Network:** Vercel mendistribusikan aplikasi ke *server* di seluruh dunia (*Edge CDN*), memastikan aplikasi dimuat dalam hitungan milidetik di negara mana pun.
*   **CI/CD (Continuous Integration / Continuous Deployment):** Setiap kali ada perubahan kode (*commit*) yang diunggah ke GitHub, Vercel akan secara otomatis membangun ulang (*rebuild*) aplikasi tanpa intervensi manual.
*   **Serverless Functions:** AI API requests diarahkan melalui infrastruktur Vercel untuk menghindari kendala lambatnya *client-side processing*.

### 2.2 Backend & Database (Supabase)
Sistem ini telah **meninggalkan penggunaan file CSV lokal**, beralih ke Database level korporat.
*   **Infrastruktur:** PostgreSQL (Cloud) via **Supabase**.
*   **Teknologi Akses:** Supabase JavaScript Client (`@supabase/supabase-js`).
*   **Keunggulan:** Mendukung *Live-Query*, aman, dan dirancang khusus untuk memproses puluhan ribu baris analitik secara paralel.

### 2.3 Keamanan & Environment Variables (`.env`)
Menyimpan *API Key* di dalam kode (*hardcode*) adalah kejahatan siber (*cybersecurity flaw*). Sistem ini menggunakan proteksi `.env`:
*   Di lokal, *keys* disimpan di file `.env`.
*   Di Production (Vercel), *keys* disuntikkan langsung melalui menu **Environment Variables Vercel Settings**.
*   *Key* yang diamankan meliputi: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GROQ_API_KEY`, `VITE_GEMINI_API_KEY`, `VITE_CEREBRAS_API_KEY`.

---

## BAB 3: ARSITEKTUR KODE (TECH STACK & PIPELINE)

### 3.1 Struktur Teknologi
*   **Framework Utama:** React 18 + Vite (Sangat cepat dan *Hot-Module Replacement* instan).
*   **Bahasa:** TypeScript (Memastikan keamanan tipe data /*Type-Safety* agar aplikasi tidak mudah *crash*).
*   **Visualisasi Data:** Recharts (SVG based, sangat responsif).

### 3.2 Optimasi Performa Data (Turbo Fetch & useMemo)
*   **Turbo Parallel Fetching:** Aplikasi tidak menarik data secara berurutan. Ia menggunakan `Promise.all()` di `dataLoader.ts` untuk menarik 4 tabel raksasa dari Supabase secara **bersamaan**, memangkas waktu muat hingga 75%.
*   **Client-Side Memory (`useMemo`):** Filter tanggal dan industri dijalankan di memori *browser* (React State), bukan menembak *query* ke database berkali-kali. Ini menghemat biaya *bandwidth* Supabase secara ekstrem.

---

## BAB 4: KECERDASAN BUATAN (AI INTELLIGENCE LAYER)

Ini adalah fitur utama yang wajib diimplementasikan sesuai instruksi tugas: *"Mahasiswa wajib mengimplementasikan fitur chat berbasis AI."*

### 4.1 Arsitektur RAG (Retrieval-Augmented Generation)
AI tidak memiliki *query access* langsung ke DB (untuk keamanan). Prosesnya:
1.  **Agregasi:** Frontend menghitung data sesuai filter aktif.
2.  **Context Building:** `dataLoader.ts` menerjemahkan grafik visual menjadi teks terstruktur (Tabel, Angka, Tren).
3.  **Prompt Injection:** Teks tersebut digabung dengan pertanyaan *user* dan *System Prompt*, kemudian dikirim ke server AI.

### 4.2 AI Orchestration (Sistem Fallback 3 Lapis)
Jika satu AI mati (*down/rate limit*), sistem otomatis melompat ke AI lain secara *real-time*:
1.  **Prioritas 1: Groq (LLaMA-3)** - Mesin utama yang paling cerdas dan ahli mematuhi instruksi bisnis.
2.  **Prioritas 2: Google Gemini Pro** - Sistem cadangan pertama buatan Google.
3.  **Prioritas 3: Cerebras** - Lapis pertahanan terakhir yang memiliki arsitektur *chip* tercepat di dunia.

### 4.3 Prompt Engineering (Anti-Hallucination)
File `aiService.ts` berisi "Aturan Mutlak" (System Prompt):
*   AI bertindak sebagai Konsultan Bisnis Profesional.
*   AI **dilarang keras** menebak/membulatkan angka (Zero Hallucination).
*   AI harus selalu sadar di halaman mana *user* berada (*Page Awareness*).

---

## BAB 5: ANATOMI DASHBOARD, DATA, & UI/UX

Bab ini membedah setiap elemen visual yang ada di layar, sumber datanya, dan maknanya secara bisnis beserta contoh angka aktual saat aplikasi dimuat tanpa filter (Semua Waktu).

### 5.1 Indikator Kinerja Utama (Global KPI Cards)
KPI Card selalu tampil di atas pada semua halaman.
*   **Total MRR (Monthly Recurring Revenue):** Pendapatan bulanan berulang. Diambil dari penjumlahan kolom `mrr_amount` di tabel `subscriptions`. 
    *   *(Angka Aktual Default: **$10,159,608**)*
*   **Active Subscriptions:** Total pelanggan berbayar saat ini.
    *   *(Angka Aktual Default: **3,814** pelanggan)*
*   **Churn Rate (%):** Persentase pelanggan yang berhenti. Dihitung dari: `(Total Churned / (Total Active + Total Churned)) * 100`.
    *   *(Angka Aktual Default: **9.7%**)*
*   **Avg Satisfaction:** Skor CSAT (Customer Satisfaction) dari 1-5.
    *   *(Angka Aktual Default: **4.0/5**)*

---

### 5.2 Halaman 1: OVERVIEW (Ringkasan Eksekutif)
Halaman pertama ini menyajikan ringkasan umum performa keseluruhan dari dataset yang divisualisasikan.
1.  **MRR Trend (Line Chart):**
    *   **Data:** Pendapatan bulanan berdasarkan tanggal `start_date` pelanggan.
    *   **Angka Aktual:** Memperlihatkan kenaikan pesat dari angka hampir $0 di Jan 23 hingga menembus **~$2.400.000 (2,4 Juta Dollar)** pada Dec 24. Puncak tertingginya ada di akhir tahun 2024.
    *   **Penjelasan:** *"Grafik garis ini secara komprehensif merepresentasikan tren pertumbuhan pendapatan bulanan (Monthly Recurring Revenue) perusahaan secara historis. Dengan memetakan metrik pendapatan dari waktu ke waktu, grafik ini menjadi indikator utama kesehatan finansial bisnis. Kurva yang menunjukkan tren positif atau eskalasi secara konstan menandakan keberhasilan strategi bisnis di mana tingkat akuisisi pelanggan baru dan up-selling berhasil secara signifikan melampaui tingkat pembatalan (churn) yang terjadi."*
2.  **Revenue by Industry (Bar Chart):**
    *   **Data:** Agregasi `mrr_amount` dikelompokkan berdasarkan kolom `industry`.
    *   **Angka Aktual:** 5 Industri teratas secara berurutan adalah: **FinTech** (tertinggi, mendekati $2,4 Juta), disusul **DevTools**, **Cybersecurity**, **EdTech**, dan **HealthTech**.
    *   **Penjelasan:** *"Grafik batang ini mengelompokkan total pendapatan (MRR) berdasarkan klasifikasi sektor industri dari setiap klien. Visualisasi ini krusial untuk mengidentifikasi 'Product-Market Fit' serta menentukan segmen pasar mana yang memberikan Return on Investment (ROI) tertinggi. Dari distribusi data ini, kita dapat menyimpulkan bahwa sektor FinTech secara konsisten mendominasi pendapatan, yang mengindikasikan bahwa produk SaaS kita sangat relevan dengan kebutuhan sistem komputasi di sektor keuangan, sehingga anggaran pemasaran ke depannya dapat difokuskan secara presisi pada sektor tersebut."*
3.  **Plan Distribution (Donut Chart):**
    *   **Data:** Proporsi kolom `plan_tier`.
    *   **Angka Aktual:** Proporsi sangat seimbang, dipimpin oleh **Enterprise (34%)** dan **Pro (34%)**, disusul **Basic (32%)**. Ini menandakan performa penjualan paket mahal sangat sukses.
    *   **Penjelasan:** *"Grafik donat ini mengilustrasikan komposisi demografi pelanggan berdasarkan tingkatan paket berlangganan (tier). Secara analitis, distribusi yang seimbang dengan persentase besar pada paket premium seperti 'Enterprise' menunjukkan tingginya nilai jual (Perceived Value) dari produk kita di mata korporasi. Hal ini membuktikan bahwa klien skala besar mempercayai stabilitas ekosistem aplikasi kita, yang pada akhirnya memberikan kepastian proyeksi pendapatan jangka panjang dibandingkan jika sistem hanya bergantung pada penjualan paket 'Basic'."*

---

### 5.3 Halaman 2: MARKET & GEOGRAPHY (Demografi & Pemasaran)
Halaman kedua ini memvisualisasikan distribusi geografis pelanggan dan sumber akuisisi mereka.
1.  **Geographic Distribution (Bar Chart):**
    *   **Data:** Menghitung jumlah akun berdasarkan kolom `country` (Top 10 negara).
    *   **Angka Aktual Default:** **US** sangat mendominasi dengan **2.961 pelanggan**. Peringkat selanjutnya secara berurutan adalah: **UK (590)**, **IN/India (498)**, **AU (312)**, **CA (217)**, **FR (211)**, dan **DE (211)**.
    *   **Penjelasan:** *"Grafik batang ini memetakan penetrasi demografis dan jangkauan pasar global aplikasi secara komprehensif. Dominasi absolut pengguna dari Amerika Serikat (US) mengonfirmasi tingginya adopsi produk di pasar Amerika Utara. Dari sudut pandang tata kelola strategis, data ini tidak hanya memvalidasi keberhasilan operasional regional, tetapi juga memberikan wawasan kepada manajemen bahwa alokasi server cloud, lokalisasi bahasa, dan penyesuaian zona waktu untuk Customer Service harus difokuskan untuk melayani pasar sentral tersebut, sekaligus memantau potensi pertumbuhan sekunder di Eropa dan Asia."*
2.  **Referral Sources (Donut Chart):**
    *   **Data:** Persentase dari kolom `referral_source`.
    *   **Angka Aktual Default:** Sumber akuisisi terbesar adalah **organic (114 akun / 23%)**, disusul **other (103 akun / 21%)**, **ads (98 akun / 20%)**, **event (96 akun / 19%)**, dan **partner (89 akun / 18%)**.
    *   **Penjelasan:** *"Grafik donat ini secara spesifik mengukur atribusi dan tingkat efisiensi dari berbagai saluran pemasaran (marketing channels). Tingginya metrik pada segmen 'Organic' merupakan sinyal positif yang sangat kuat bagi perusahaan. Hal ini mensertifikasi bahwa strategi Search Engine Optimization (SEO) dan kehadiran merek (brand awareness) perusahaan di pasar berjalan secara optimal. Kesuksesan metrik ini menunjukkan kemampuan sistem dalam mengakuisisi pelanggan tanpa bergantung secara eksklusif pada pengeluaran iklan (Ads), yang pada akhirnya akan mereduksi metrik Customer Acquisition Cost (CAC) secara drastis."*

---

### 5.4 Halaman 3: PRODUCT ANALYTICS (Analisis Performa Produk)
Halaman ketiga ini menganalisis penggunaan fitur-fitur dalam dataset serta tingkat kesalahan (*error*) yang terjadi.
1.  **Feature Usage Depth (Bar Chart):**
    *   **Data:** Akumulasi penggunaan berdasarkan `feature_name`.
    *   **Angka Aktual Default:** Fitur yang paling sering diakses adalah **feature_32 (6.658 kali)**, disusul oleh **feature_15 (6.605)**. Menariknya, fitur eksperimental **feature_6 [BETA]** berada di urutan ketiga tertinggi (6.484 pemakaian).
    *   **Penjelasan:** *"Grafik batang horizontal ini mengkuantifikasi tingkat kedalaman adopsi (usage depth) dari masing-masing modul fitur di dalam ekosistem aplikasi. Dengan mengukur frekuensi interaksi pengguna, grafik ini mendeliver wawasan objektif berbasis data (data-driven) kepada tim Product Management. Fitur dengan volume penggunaan tertinggi mengindikasikan 'Core Value' dari produk di mata pengguna. Metrik ini sangat esensial sebagai acuan empiris dalam menyusun Product Roadmap, menentukan prioritas alokasi sumber daya developer, serta mengidentifikasi kelayakan fitur eksperimental (BETA) yang mendapatkan traksi tinggi."*
2.  **Feature Performance & Errors (Data Table):**
    *   **Data Utama:** Feature Name, Total Usage, Error Rate (%).
    *   **Angka Aktual Default:** Tabel ini secara cerdas mengurutkan fitur bermasalah (*highest error rate*). Peringkat pertama ditempati oleh **feature_4** (6.6% error dari 6.204 pemakaian) dan **feature_9** (6.6% error). Perhatikan juga **feature_26 [BETA]** yang cukup tinggi tingkat kesalahannya (6.4%).
    *   **Penjelasan:** *"Tabel data ini beroperasi sebagai sistem peringatan dini (early warning system) terpusat untuk memantau integritas dan stabilitas teknis aplikasi. Pengurutan tabel yang secara otomatis didasarkan pada persentase 'Error Rate' tertinggi sengaja dirancang untuk menyoroti titik-titik kerentanan sistem. Dalam operasional aplikasi bisnis, frekuensi bug berkorelasi langsung dengan frustrasi dan churn pelanggan. Oleh karena itu, elemen di baris teratas merepresentasikan area kritis yang menuntut tindakan perbaikan segera (hotfix) dari tim Engineering guna memitigasi dampak negatif terhadap User Experience."*

---

### 5.5 Halaman 4: CUSTOMER SUCCESS (Dukungan & Retensi)
Halaman terakhir ini menampilkan data pertumbuhan pelanggan, alasan pembatalan, dan metrik layanan dukungan.
1.  **Subscription Growth (Bar Chart):**
    *   **Data:** Perbandingan pelanggan baru (Oranye) vs pelanggan keluar (Abu-abu).
    *   **Angka Aktual Default:** Tren pertumbuhan sangat positif. Total pelanggan baru mencapai **5.000 pelanggan**, berbanding jauh dengan total pelanggan yang berhenti (**486 pelanggan**). Bulan tertinggi akuisisi jatuh di **Desember 2024** (953 pelanggan baru vs 103 berhenti).
    *   **Penjelasan:** *"Grafik komparatif ini merupakan visualisasi analitis yang membandingkan volume pertumbuhan pelanggan baru secara proporsional terhadap volume pelanggan yang membatalkan layanan (churn) setiap bulannya. Visualisasi ini secara fundamental memonitor stabilitas rasio Net Revenue Retention (NRR). Selama kurva akuisisi (pertumbuhan) secara konsisten menjulang lebih tinggi melampaui kurva atrisi (pembatalan), hal tersebut mensertifikasi bahwa perusahaan tidak hanya mampu mempertahankan pasar, tetapi juga mengekspansi skala bisnisnya secara berkelanjutan."*
2.  **Churn Watchlist (Data Table):**
    *   **Data:** 15 pelanggan terakhir yang berhenti (`status: canceled`).
    *   **Angka Aktual Default:** Alasan terbanyak (*Top Reasons*) pelanggan lari adalah **competitor / pindah ke pesaing** (4 kasus), disusul oleh masalah **support** (3 kasus), dan kurangnya **features** (3 kasus). Feedback langsung dari pelanggan umumnya mengeluhkan harga (*"too expensive"*) dan fitur yang kurang (*"missing features"*).
    *   **Penjelasan:** *"Tabel analitik ini menyajikan rekam jejak kualitatif dan kuantitatif dari entitas pelanggan yang memutuskan untuk berhenti menggunakan layanan. Dengan mengkorelasikan variabel 'Reason Code' secara langsung dengan 'Feedback Text' dari pengguna nyata, tabel ini secara efektif mengeliminasi asumsi-asumsi tak berdasar terkait pemicu churn. Laporan historis ini menjadi instrumen analitik yang sangat krusial bagi manajemen level eksekutif untuk melakukan penyesuaian harga strategis (price adjustment), meninjau diferensiasi fitur terhadap kompetitor, dan merumuskan strategi retensi untuk menekan laju churn."*
3.  **Support Metrics (Analytic Cards & Progress Bar):**
    *   **Total Tickets:** Terdapat **2.000** tiket keluhan yang masuk.
    *   **Priority Distribution:** Distribusi sangat merata di empat kategori: **Low (24%)**, **Medium (25%)**, **High (26%)**, dan **Urgent (26%)**.
    *   **First Response & Resolution:** Tim *support* membalas pesan pertama rata-rata dalam **88 menit** dan menyelesaikan masalah dalam rata-rata **35,9 jam** dengan tingkat eskalasi (*Escalation Rate*) ke level yang lebih tinggi sebesar **5%**.
    *   **Penjelasan:** *"Kumpulan metrik komprehensif ini didesain khusus untuk mengevaluasi efektivitas, responsivitas, dan pemenuhan Key Performance Indicator (KPI) dari departemen layanan pelanggan (Customer Success). Parameter waktu penyelesaian pertama (First Response Time) dan durasi resolusi akhir diukur secara presisi untuk memastikan kepatuhan tim terhadap standar Service Level Agreement (SLA). Di saat yang bersamaan, distribusi metrik prioritas (Priority Distribution) memfasilitasi transparansi pembagian beban kerja, sementara tingkat eskalasi memvalidasi kapabilitas penyelesaian masalah di lini pertahanan pertama sistem."*

---

### 5.6 Design System & Tema
*   **Gaya Desain:** *Neo-Brutalist* dipadukan dengan *Luxury Light/Dark Theme* ala Notion. Memiliki garis tegas (*borders*) dan palet warna bumi (*Earth Tones* seperti Charcoal, Stone Grey, dan Bronze Accent).
*   **Eksekusi:** Vanilla CSS murni dengan CSS Variables (`--bg-primary`, `--accent`). Ini menjamin efisiensi eksekusi di *browser* tanpa dependensi *library styling* eksternal yang berat.


---

## BAB 6: SKEMA DATABASE & STRUKTUR DATA (KAGGLE DATASET)

Aplikasi ini memproses 5 tabel relasional utama yang bersumber dari dataset Kaggle. Berikut adalah kamus data (*Data Dictionary*) mentahnya:

### 1. Tabel `accounts` (Data Perusahaan Klien)
Menyimpan profil perusahaan yang menggunakan layanan SaaS.
*   `account_id` (String/UUID): ID unik perusahaan.
*   `account_name` (String): Nama perusahaan.
*   `industry` (String): Sektor industri (EdTech, FinTech, dll).
*   `country` (String): Negara asal.
*   `referral_source` (String): Jalur akuisisi (Ads, Organic, dll).

### 2. Tabel `subscriptions` (Data Langganan)
Menyimpan data finansial dan paket langganan.
*   `subscription_id` (String): ID langganan.
*   `start_date` & `end_date` (Date): Masa aktif.
*   `plan_tier` (String): Paket yang dipilih (Basic, Pro, Enterprise).
*   `mrr_amount` (Number): *Monthly Recurring Revenue* (Pendapatan per bulan dalam USD).
*   `churn_flag` (Boolean): Status apakah langganan ini sudah dibatalkan (True/False).

### 3. Tabel `feature_usage` (Data Telemetri - Terbesar, 25K+ baris)
Menyimpan rekam jejak (*log*) seberapa sering pengguna mengklik fitur aplikasi.
*   `feature_name` (String): Nama modul/fitur dalam aplikasi.
*   `usage_count` (Number): Berapa kali fitur diklik.
*   `error_count` (Number): Jumlah *error/bug* yang dialami pengguna saat memakai fitur.
*   `is_beta_feature` (Boolean): Penanda apakah fitur masih dalam tahap pengujian.

### 4. Tabel `support_tickets` (Data Layanan Pelanggan)
Menyimpan keluhan yang masuk ke tim *Customer Service*.
*   `submitted_at` & `closed_at` (Date): Waktu tiket dibuat dan diselesaikan.
*   `priority` (String): Tingkat urgensi (Low, Medium, High, Urgent).
*   `first_response_time_minutes` (Number): Kecepatan CS membalas pertama kali.
*   `satisfaction_score` (Number): Rating kepuasan pelanggan (1-5).
*   `escalation_flag` (Boolean): Apakah masalah ini rumit dan harus dilempar ke tim IT.

### 5. Tabel `churn_events` (Data Pembatalan)
Tabel khusus untuk mencatat alasan berhentinya pelanggan.
*   `churn_date` (Date): Tanggal berhenti.
*   `reason_code` (String): Kategori alasan (Misal: *Pricing, Bugs, Missing Feature*).
*   `feedback_text` (String): Komentar asli dari pelanggan (teks bebas).

---

## BAB 7: PANDUAN PRESENTASI DI KELAS

Gunakan strategi ini saat mempresentasikan dashboard di depan dosen dan kawan-kawan:

1.  **Jelaskan Konteks Tugas:**
    *   *"Sesuai instruksi tugas akhir, kami membuat website dashboard interaktif yang mengolah dataset Kaggle berisi 10.000+ baris data, lengkap dengan fitur AI Chat Assistant."*
2.  **Tunjukkan Pemenuhan Semua Syarat:**
    *   KPI (Scorecard) ✅ — 4 kartu metrik di atas halaman.
    *   Line Chart ✅ — MRR Trend.
    *   Bar Chart ✅ — Revenue by Industry, Geographic Distribution, Feature Usage, Subscription Growth.
    *   Pie Chart ✅ — Plan Distribution, Referral Sources.
    *   Table ✅ — Feature Performance, Churn Watchlist.
    *   Filter Tanggal ✅ — Date range picker di toolbar.
    *   Filter Kategori ✅ — Multi-select Industry & Plan.
3.  **Demonstrasi AI Chat (Fitur Utama Instruksi):**
    *   Contoh interaksi sesuai instruksi dosen:
        *   *"Jelaskan tren pada line chart tersebut"* — AI akan langsung menganalisis grafik MRR Trend.
        *   *"Apa insight utama dari data ini?"* — AI memberikan ringkasan analitis.
        *   *"Kapan nilai tertinggi dan terendah terjadi?"* — AI menyebutkan bulan/angka yang tepat.
    *   Buktikan AI menjawab berdasarkan data yang ditampilkan, **bukan jawaban umum** (sesuai syarat instruksi).
4.  **Demonstrasi Filter Dinamis (Bonus Impresi):**
    *   Tanyakan MRR ke AI ➔ Ubah filter Industri ke "EdTech" ➔ Tanyakan MRR lagi.
    *   Buktikan AI menjawab secara *real-time* menyesuaikan filter, bukan menghafal *template*.
5.  **Demonstrasi Quick Questions (Tombol 🔥):**
    *   Klik tombol ikon "Panah Atas" (ChevronUp) di sudut chat.
    *   Klik pertanyaan dengan ikon 🔥 untuk menunjukkan bahwa AI mampu memberikan **insight dan rekomendasi analitis** — lebih dari sekadar menyebutkan angka.
