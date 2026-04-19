<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

<h1 align="center">🦅 RavenStack Analytics</h1>

<p align="center">
  <strong>AI-Integrated Web-Based Data Analytics Dashboard</strong><br/>
  <em>Final Project — Mata Kuliah Data Visualisasi 2026</em>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-academic-assets">Academic Assets</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-ai-orchestration">AI Engine</a> •
  <a href="#-database-schema">Database</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-team">Team</a>
</p>

---

## 📚 Academic Assets

Dokumen pendukung :

- [📄 **DESKRIPSI PROYEK** (file:///d:/Minipdavis/DESKRIPSI_PROYEK.md)](DESKRIPSI_PROYEK.md)
- [🔗 **Live Demo (Vercel)**](https://ravenstack-ai-dashboard.vercel.app) — Tautan ke situs yang sudah berjalan secara online.

---

## 📖 About

**RavenStack Analytics** adalah purwarupa *SaaS Business Intelligence Dashboard* yang dibangun untuk memenuhi instruksi tugas akhir mata kuliah **Data Visualisasi**. Aplikasi ini mengolah dataset publik dari Kaggle ([SaaS Subscription & Churn Analytics](https://www.kaggle.com/datasets/rivalytics/saas-subscription-and-churn-analytics-dataset)) yang terdiri dari **10.000+ baris data** pelanggan ke dalam visualisasi interaktif yang dilengkapi **AI Chat Assistant** berbasis arsitektur RAG (*Retrieval-Augmented Generation*).

> **Nilai Jual Utama:** AI tidak menjawab secara umum — ia membaca data *real-time* dari database dan grafik yang sedang aktif di layar, sehingga seluruh jawaban berbasis fakta 100% tanpa halusinasi.

---

## ✨ Features

### 📊 Visualisasi Data (Sesuai Instruksi Tugas)
| Komponen | Jenis | Deskripsi |
|----------|-------|-----------|
| **KPI Scorecard** | 4 Kartu Metrik | Total MRR, Active Subscriptions, Churn Rate, Avg Satisfaction |
| **MRR Trend** | Line Chart | Tren pendapatan bulanan dari waktu ke waktu |
| **Revenue by Industry** | Bar Chart | Perbandingan pendapatan per sektor industri |
| **Plan Distribution** | Donut/Pie Chart | Proporsi paket langganan (Basic, Pro, Enterprise) |
| **Geographic Distribution** | Bar Chart | Top 10 negara berdasarkan jumlah pelanggan |
| **Referral Sources** | Donut Chart | Sumber akuisisi pelanggan (Organic, Ads, dll.) |
| **Feature Usage Depth** | Horizontal Bar | Top 10 fitur berdasarkan frekuensi penggunaan |
| **Feature Performance** | Data Table | Tabel performa fitur: Usage, Errors, Error Rate |
| **Subscription Growth** | Grouped Bar | Perbandingan pelanggan baru vs churn per bulan |
| **Churn Watchlist** | Data Table | Daftar pelanggan yang berhenti beserta alasan |
| **Support Metrics** | Metric Cards | Total Tickets, Resolution Time, Escalation Rate |

### 🔍 Filter Interaktif
- **Filter Tanggal** — Rentang waktu kustom (date range picker)
- **Filter Industri** — Multi-select: FinTech, DevTools, EdTech, HealthTech, Cybersecurity
- **Filter Paket** — Multi-select: Basic, Pro, Enterprise
- **Reset Button** — Mengembalikan semua filter ke default

### 🤖 AI Chat Assistant
- Menjawab pertanyaan analitis berdasarkan data yang sedang ditampilkan
- **Page-Aware**: Mengenali halaman mana yang sedang aktif
- **Filter-Aware**: Menyebutkan filter yang sedang aktif di setiap jawaban
- **Quick Questions**: Template pertanyaan otomatis per halaman (termasuk tombol 🔥)
- **Multi-turn Chat**: Mendukung percakapan berkelanjutan (konteks 10 pesan)
- **Zero Hallucination**: Hanya menyebutkan angka yang benar-benar ada di data

### 🎨 UI/UX Premium
- **Dark Mode / Light Mode** toggle
- **Draggable AI Chat Panel** — Bisa digeser ke mana saja
- **Responsive Design** — Optimal di desktop dan tablet
- **Smooth Animations** — Transisi halus saat berpindah halaman
- **Fullscreen Chart Modal** — Klik grafik untuk memperbesar

---

## 🛠 Tech Stack

### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **React** | 19.2 | UI Component Library |
| **Vite** | 8.0 | Build Tool & Dev Server |
| **TypeScript** | 5.9 | Type-Safe Development |
| **Recharts** | 3.8 | Chart Rendering Engine |
| **Lucide React** | 1.7 | Icon Library |
| **Framer Motion** | 12.38 | Animation Engine |
| **React Draggable** | 4.5 | Draggable Chat Panel |

### Backend & Database
| Teknologi | Fungsi |
|-----------|--------|
| **Supabase** | PostgreSQL Cloud Database (BaaS) |
| **Supabase REST API** | Data fetching via `@supabase/supabase-js` |
| **Turbo Parallel Fetch** | Auto-pagination untuk dataset >1000 baris |

### Deployment
| Platform | Fungsi |
|----------|--------|
| **Vercel** | CI/CD Production Deployment |
| **GitHub** | Version Control & Source Code |

---

## 🧠 AI Orchestration

Sistem AI menggunakan arsitektur **Fallback Chain** dengan 3 provider untuk menjamin ketersediaan 99.9%:

```
┌─────────────────────────────────────────────────┐
│              USER QUESTION                      │
│         "Jelaskan bar chart ini"                │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         CONTEXT INJECTION (RAG)                 │
│  dataLoader.ts → generateDataSummary()          │
│  [GRAFIK DI HALAMAN INI] + [FILTER AKTIF]       │
│  + System Prompt (10 Aturan Mutlak)             │
└──────────────────┬──────────────────────────────┘
                   │
          ┌────────▼────────┐
          │  🟢 GROQ        │  ← Primary (5-Key Rotation)
          │  LLaMA 3.3 70B  │     Model: llama-3.3-70b-versatile
          └────────┬────────┘
                   │ (Jika gagal / rate limit)
          ┌────────▼────────┐
          │  🟡 GEMINI      │  ← Fallback 1
          │  Gemini 2.0     │     Model: gemini-2.0-flash
          └────────┬────────┘
                   │ (Jika gagal)
          ┌────────▼────────┐
          │  🔵 CEREBRAS    │  ← Fallback 2
          │  LLaMA 3.3 70B  │     Model: llama-3.3-70b
          └────────┬────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│              AI RESPONSE                        │
│  "Filter aktif: Tanggal 2023-01-09 s/d..."     │
│  "Grafik Feature Usage Depth menunjukkan..."    │
└─────────────────────────────────────────────────┘
```

### Anti-Hallucination System Prompt (10 Aturan Mutlak)
1. **ZERO HALLUCINATION** — Hanya menyebutkan angka yang persis ada di data
2. **NO FABRICATION** — Dilarang mengarang, estimasi, atau membulatkan
3. **TYPO TOLERANCE** — Mengenali "cart"/"kart" sebagai "chart"
4. **PAGE AWARENESS** — Hanya membaca grafik bertag `[GRAFIK DI HALAMAN INI]`
5. **PROFESSIONAL TONE** — Menjawab seperti konsultan bisnis
6. **BOLD FORMATTING** — Semua angka/mata uang/persentase di-bold
7. **NO INTERNAL JARGON** — Tidak menyebut "data yang diberikan" dll.
8. **FILTER REPORTING** — Menyebutkan filter aktif di awal jawaban
9. **LANGUAGE MATCH** — Menjawab dalam bahasa yang sama dengan user
10. **NO DEFINITIONS** — Langsung analisis, tidak menjelaskan teori MRR/churn

---

## 🗄 Database Schema

Dataset bersumber dari [Kaggle: SaaS Subscription & Churn Analytics](https://www.kaggle.com/datasets/rivalytics/saas-subscription-and-churn-analytics-dataset) dan disimpan di **Supabase PostgreSQL** dalam 5 tabel relasional:

```
┌──────────────────┐     ┌────────────────────┐     ┌──────────────────┐
│    accounts      │     │   subscriptions    │     │  feature_usage   │
├──────────────────┤     ├────────────────────┤     ├──────────────────┤
│ account_id  (PK) │◄───►│ subscription_id(PK)│     │ usage_id    (PK) │
│ company_name     │     │ account_id    (FK) │◄───►│ subscription_(FK)│
│ industry         │     │ plan_tier          │     │ feature_name     │
│ country          │     │ mrr_amount         │     │ usage_count      │
│ referral_source  │     │ start_date         │     │ usage_date       │
│ signup_date      │     │ end_date           │     │ error_count      │
└──────────────────┘     │ status             │     │ usage_time_sec   │
                         └────────────────────┘     │ is_beta          │
                                                    └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│  churn_events    │     │ support_tickets  │
├──────────────────┤     ├──────────────────┤
│ churn_id    (PK) │     │ ticket_id   (PK) │
│ account_id  (FK) │     │ account_id  (FK) │
│ churn_date       │     │ priority         │
│ reason_code      │     │ resolution_hours │
│ feedback_text    │     │ first_response   │
└──────────────────┘     │ satisfaction     │
                         │ is_escalated     │
                         └──────────────────┘
```

---

## 📄 Halaman Dashboard

### 1️⃣ Dashboard Overview
> Ringkasan eksekutif: KPI cards, MRR Trend (Line Chart), Revenue by Industry (Bar Chart), Plan Distribution (Donut Chart).

### 2️⃣ Market & Geography
> Analisis pemasaran: Geographic Distribution (Bar Chart — Top 10 negara), Referral Sources (Donut Chart).

### 3️⃣ Product Analytics
> Kesehatan produk: Feature Usage Depth (Horizontal Bar), Feature Performance & Errors (Data Table — diurutkan berdasarkan Error Rate tertinggi).

### 4️⃣ Customer Success
> Retensi pelanggan: Subscription Growth Analysis (Grouped Bar — New vs Churned), Churn Watchlist (Data Table), Support Metrics (Metric Cards + Priority Distribution Bar).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# 1. Clone repository
git clone git remote add origin https://github.com/IrmandoKoyo/ravenstack-ai-dashboard.git .


# 2. Install dependencies
npm install

# 3. Setup environment variables
#    Buat file .env di root project:
```

```env
# Groq API Keys (Rotasi Otomatis)
VITE_GROQ_API_KEY=gsk_key1,gsk_key2,gsk_key3

# Cerebras API Key
VITE_CEREBRAS_API_KEY=csk-your-key-here

# Google Gemini API Key
VITE_GEMINI_API_KEY=AIzaSy-your-key-here

# Supabase Credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

```bash
# 4. Run development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### Deployment (Vercel)

1. Push repository ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan semua **Environment Variables** dari `.env` ke Vercel Dashboard
4. Deploy otomatis setiap kali push ke branch `main`

> ⚠️ **Penting:** Tidak perlu menjalankan `npm run build` secara manual. Vercel akan menjalankan build secara otomatis melalui CI/CD pipeline.

---

## 📁 Project Structure

```
Minipdavis/
├── public/                    # Static assets
├── src/
│   ├── App.tsx                # Main application (824 lines)
│   ├── App.css                # Design system & styling
│   ├── index.css              # Global styles & CSS variables
│   ├── main.tsx               # React entry point
│   ├── data/
│   │   ├── dataLoader.ts      # Supabase fetcher + RAG context generator
│   │   └── dataTypes.ts       # TypeScript interfaces & types
│   ├── lib/
│   │   └── supabaseClient.ts  # Supabase connection config
│   ├── pages/
│   │   ├── Line.tsx           # MRR Trend (Line Chart)
│   │   ├── Bar.tsx            # Revenue by Industry (Bar Chart)
│   │   ├── Pie.tsx            # Plan Distribution (Donut Chart)
│   │   ├── CountryBar.tsx     # Geographic Distribution
│   │   ├── ReferralPie.tsx    # Referral Sources (Donut)
│   │   ├── FeatureBar.tsx     # Feature Usage Depth
│   │   ├── FeatureTable.tsx   # Feature Performance Table
│   │   └── GrowthBar.tsx      # Subscription Growth
│   └── services/
│       └── aiService.ts       # AI Orchestration (Groq/Gemini/Cerebras)
├── .env                       # Environment variables (gitignored)
├── index.html                 # HTML entry point
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
└── README.md                  # This file
```

---

## 🔑 Environment Variables

| Variable | Deskripsi | Wajib |
|----------|-----------|-------|
| `VITE_SUPABASE_URL` | URL project Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Anon/public key Supabase | ✅ |
| `VITE_GROQ_API_KEY` | API key Groq (bisa multiple, pisah koma) | ✅ |
| `VITE_GEMINI_API_KEY` | API key Google Gemini | ⚡ Fallback |
| `VITE_CEREBRAS_API_KEY` | API key Cerebras | ⚡ Fallback |

---

## 👥 Team

<table>
  <tr>
    <td align="center"><strong>Julio Korengkeng</strong></td>
    <td align="center"><strong>Aulia Ollo</strong></td>
    <td align="center"><strong>Zeavani Patuli</strong></td>
    <td align="center"><strong>Irmando Koyo</strong></td>
    <td align="center"><strong>Clifford Noya</strong></td>
  </tr>
</table>

> **Kelompok JAZIC** — Data Visualisasi 2026

---

## 📜 License

Proyek ini menggunakan **MIT License**, yang artinya 100% **gratis dan terbuka (Open Source)**. 
Siapa pun bebas menggunakan, menyalin, memodifikasi, dan mendistribusikan kode ini untuk tujuan pembelajaran maupun proyek lainnya. 

Dataset publik yang digunakan bersumber dari [Kaggle](https://www.kaggle.com/datasets/rivalytics/saas-subscription-and-churn-analytics-dataset) dan ditujukan untuk keperluan akademik mata kuliah **Data Visualisasi**.

---

<p align="center">
  <strong>Built with ❤️ by JAZIC Team</strong><br/>
  <em>React • Supabase • Groq • Gemini • Cerebras • Vercel</em>
</p>