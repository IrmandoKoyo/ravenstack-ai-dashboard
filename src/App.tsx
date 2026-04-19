// ============================================================
// RavenStack SaaS Analytics Dashboard — Main App
// ============================================================
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  DollarSign, BarChart3, AlertTriangle, Star,
  Sun, Moon, MessageCircle, Send, X, Calendar,
  Filter, Loader2, Bot, ChevronDown, ChevronUp, Minimize2,
  TrendingUp, PieChart, AlertCircle, Activity,
  Globe, Users, Zap, LayoutDashboard
} from 'lucide-react';

// Charts
import LineChartComponent from './pages/Line';
import BarChartComponent from './pages/Bar';
import PieChartComponent from './pages/Pie';
import FeatureBar from './pages/FeatureBar';
import { FeatureTable } from './pages/FeatureTable';
import GrowthBar from './pages/GrowthBar';
import CountryBar from './pages/CountryBar';
import ReferralPie from './pages/ReferralPie';

// Data
import {
  getKPIs, getMonthlyMRR, getIndustryRevenue,
  getPlanDistribution, getChurnWatchlist,
  getUniqueIndustries, getUniquePlanTiers,
  generateDataSummary, getDateRange,
  getFeatureUsageSummary, getReferralDistribution, getCountryDistribution,
  getSupportSummary, initializeData
} from './data/dataLoader';
import type { DashboardFilters, ChurnWatchlistItem } from './data/dataTypes';

// AI
import { askAI } from './services/aiService';
import type { ChatMessage } from './services/aiService';
import Draggable from 'react-draggable';
import { useMediaQuery } from './hooks/useMediaQuery';

const PRIORITY_SEGMENT_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};

function SupportPriorityBar({ breakdown }: { breakdown: Record<string, number> }) {
  const isNarrow = useMediaQuery('(max-width: 768px)');
  const total = Object.values(breakdown).reduce((s, v) => s + v, 0);
  const entries = Object.entries(breakdown).filter(([, c]) => c > 0);

  return (
    <div className="support-priority-wrap">
      <p className="support-priority-label">Priority Distribution</p>
      <div className={`support-priority-bar ${isNarrow ? 'support-priority-bar--compact' : ''}`}>
        {entries.map(([priority]) => {
          const pct = total > 0 ? (breakdown[priority] / total) * 100 : 0;
          return (
            <div
              key={priority}
              className="support-priority-segment"
              style={{
                width: `${pct}%`,
                background: PRIORITY_SEGMENT_COLORS[priority] || '#888',
              }}
            >
              {!isNarrow && pct > 8 ? `${priority} ${Math.round(pct)}%` : null}
            </div>
          );
        })}
      </div>
      {isNarrow && (
        <ul className="support-priority-legend">
          {entries.map(([priority]) => {
            const pct = total > 0 ? (breakdown[priority] / total) * 100 : 0;
            return (
              <li key={priority}>
                <span
                  className="support-priority-dot"
                  style={{ background: PRIORITY_SEGMENT_COLORS[priority] || '#888' }}
                />
                <span className="support-priority-name">{priority}</span>
                <span className="support-priority-pct">{Math.round(pct)}%</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ============================================================
// KPI Card Component
// ============================================================
function KPICard({ icon: Icon, label, value, subtext }: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
        <Icon size={20} />
      </div>
      <div className="kpi-content">
        <span className="kpi-label">{label}</span>
        <span className="kpi-value">{value}</span>
        <span className="kpi-subtext">{subtext}</span>
      </div>
    </div>
  );
}

// ============================================================
// Churn Table Component
// ============================================================
function ChurnTable({ data }: { data: ChurnWatchlistItem[] }) {
  if (data.length === 0) {
    return <div className="chart-empty"><p>No churn events for selected filters</p></div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Account</th>
            <th>Industry</th>
            <th>Reason</th>
            <th>Date</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td className="td-bold">{item.account_name}</td>
              <td><span className="badge badge-industry">{item.industry}</span></td>
              <td><span className={`badge badge-reason badge-${item.reason_code}`}>{item.reason_code}</span></td>
              <td className="td-muted">{item.churn_date}</td>
              <td className="td-feedback">{item.feedback_text || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Dropdown Multi-Select Component
// ============================================================
function MultiSelect({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (val: string) => {
    onChange(
      selected.includes(val)
        ? selected.filter(v => v !== val)
        : [...selected, val]
    );
  };

  return (
    <div className="multi-select" ref={ref}>
      <button className="multi-select-trigger" onClick={() => setOpen(!open)}>
        <Filter size={14} />
        <span>{selected.length > 0 ? `${label} (${selected.length})` : label}</span>
        <ChevronDown size={14} className={open ? 'rotate-180' : ''} />
      </button>
      {open && (
        <div className="multi-select-dropdown">
          <button className="ms-clear" onClick={() => onChange([])}>Clear all</button>
          {options.map(opt => (
            <label key={opt} className="ms-option">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// AI Chat Panel Component
// ============================================================
const QUICK_QUESTIONS: Record<number, string[]> = {
  1: [
    'Jelaskan tren pada line chart MRR',
    'Kapan nilai tertinggi dan terendah terjadi?',
    'Jelaskan donut chart distribusi paket',
    'Apa insight utama dari data ini?',
    '🔥 Berikan rekomendasi strategis berdasarkan semua data',
    '🔥 Ringkas performa keseluruhan dalam 3 poin',
  ],
  2: [
    'Jelaskan bar chart distribusi geografis',
    'Dari mana mayoritas pelanggan kita?',
    'Jelaskan donut chart referral sources',
    'Channel marketing mana yang paling efektif?',
    '🔥 Strategi apa yang paling efektif untuk market saat ini?',
  ],
  3: [
    'Fitur mana yang paling banyak digunakan?',
    'Fitur mana yang punya error rate tertinggi?',
    'Apakah ada fitur Beta? Bagaimana performanya?',
    'Jelaskan tabel Feature Performance',
    '🔥 Apa prioritas utama perbaikan untuk tim produk?',
  ],
  4: [
    'Jelaskan grafik pertumbuhan pelanggan',
    'Apa alasan utama pelanggan berhenti?',
    'Berapa rata-rata waktu resolusi tiket?',
    'Bagaimana distribusi prioritas tiket?',
    '🔥 Jika saya ingin mengurangi churn, apa langkah utamanya?',
  ],
};

function AIChatPanel({ isOpen, onClose, dataContext, activePage }: {
  isOpen: boolean;
  onClose: () => void;
  dataContext: string;
  activePage: number;
}) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Halo! 👋 Saya AI Analytics Assistant untuk dashboard RavenStack. Tanyakan apa saja tentang data yang sedang ditampilkan — MRR, churn, industri, atau tren langganan.',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragDisabled, setDragDisabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setDragDisabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowSuggestions(false);
    setLoading(true);

    try {
      const response = await askAI(userMsg.content, dataContext, messages);
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, dataContext, messages]);

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const questions = QUICK_QUESTIONS[activePage] || QUICK_QUESTIONS[1];

  if (!isOpen) return null;

  return (
    <div className="chat-overlay pointer-events-none">
      <Draggable nodeRef={nodeRef} handle=".chat-header" disabled={dragDisabled}>
        <div ref={nodeRef} className="chat-panel pointer-events-auto">
          <div className="chat-header">
            <div className="chat-header-left">
              <Bot size={20} />
              <span>AI Analytics Assistant</span>
            </div>
            <button className="chat-close" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble chat-${msg.role}`}>
                <div 
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ 
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/^\s*[-•]\s+(.*)/gm, '<li style="margin-left: 20px; margin-bottom: 4px;">$1</li>')
                      .replace(/\n/g, '<br />')
                  }} 
                />
              </div>
            ))}
          {loading && (
            <div className="chat-bubble chat-assistant">
              <Loader2 size={16} className="spin" />
              <span>Analyzing data...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {showSuggestions && !loading && (
          <div className="chat-suggestions">
            <div className="chat-suggestions-list">
              {questions.map((q, i) => (
                <button key={i} className="chat-suggestion-chip" onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="chat-input-area">
          <button
            className="chat-suggest-toggle"
            onClick={() => setShowSuggestions(!showSuggestions)}
            title={showSuggestions ? 'Tutup pertanyaan' : 'Buka pertanyaan'}
          >
            {showSuggestions ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <input
            type="text"
            placeholder="Tanyakan tentang data dashboard..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button className="chat-send" onClick={handleSend} disabled={loading || !input.trim()}>
            <Send size={16} />
          </button>
        </div>
        </div>
      </Draggable>
    </div>
  );
}

// ============================================================
// Main App
// ============================================================
type ModalContent = 'line' | 'bar' | 'pie' | 'table' | 'docs' | 'support' | 'team' | null;

export default function App() {
  // Theme & Navigation
  const [isDark, setIsDark] = useState(false);
  const [activePage, setActivePage] = useState(1);

  // Data Loading State
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const success = await initializeData();
      if (success) setDataLoaded(true);
    }
    load();
  }, []);

  // Filters
  const dateRange = useMemo(() => getDateRange(), [dataLoaded]);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateFrom: '',
    dateTo: '',
    industries: [],
    planTiers: [],
  });

  // Sync filters once data is loaded
  useEffect(() => {
    if (dataLoaded && !filters.dateFrom) {
      setFilters(prev => ({
        ...prev,
        dateFrom: dateRange.minDate,
        dateTo: dateRange.maxDate
      }));
    }
  }, [dataLoaded, dateRange]);

  // UI state
  const [chatOpen, setChatOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState<ModalContent>(null);
  const [animKey, setAnimKey] = useState(0);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Unique filter options
  const industries = useMemo(() => getUniqueIndustries(), [dataLoaded]);
  const planTiers = useMemo(() => getUniquePlanTiers(), [dataLoaded]);

  // Computed data (re-runs when filters change or data loads)
  const kpis = useMemo(() => getKPIs(filters), [filters, dataLoaded]);
  const mrrTrend = useMemo(() => getMonthlyMRR(filters), [filters, dataLoaded]);
  const industryRevenue = useMemo(() => getIndustryRevenue(filters), [filters, dataLoaded]);
  const planDistribution = useMemo(() => getPlanDistribution(filters), [filters, dataLoaded]);
  const churnWatchlist = useMemo(() => getChurnWatchlist(filters), [filters, dataLoaded]);
  const featureUsage = useMemo(() => getFeatureUsageSummary(filters), [filters, dataLoaded]);
  const referralData = useMemo(() => getReferralDistribution(filters), [filters, dataLoaded]);
  const countryData = useMemo(() => getCountryDistribution(filters), [filters, dataLoaded]);
  const supportData = useMemo(() => getSupportSummary(filters), [filters, dataLoaded]);
  const dataContext = useMemo(() => generateDataSummary(filters, activePage), [filters, activePage, dataLoaded]);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#0c0a09' : '#f2f2f0');
  }, [isDark]);

  // Re-animate charts when filters change
  useEffect(() => {
    setAnimKey(prev => prev + 1);
  }, [filters]);

  // Reset filters
  const resetFilters = () => {
    setFilters({ dateFrom: dateRange.minDate, dateTo: dateRange.maxDate, industries: [], planTiers: [] });
  };

  const hasFilters = filters.dateFrom || filters.dateTo || filters.industries.length > 0 || filters.planTiers.length > 0;

  if (!dataLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <Loader2 size={48} className="spin" />
          <h2>Booting RavenStack Intelligence...</h2>
          <p>Connecting to Supabase Real-time Database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* ---- HEADER ---- */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <BarChart3 size={24} className="logo-icon" />
            <h1>RavenStack <span className="logo-sub">Analytics</span></h1>
          </div>
        </div>

        <nav className="header-nav">
          <button className={`nav-link ${activePage === 1 ? 'active' : ''}`} onClick={() => setActivePage(1)}>
            <LayoutDashboard size={16} /> Overview
          </button>
          <button className={`nav-link ${activePage === 2 ? 'active' : ''}`} onClick={() => setActivePage(2)}>
            <Globe size={16} /> Market
          </button>
          <button className={`nav-link ${activePage === 3 ? 'active' : ''}`} onClick={() => setActivePage(3)}>
            <Zap size={16} /> Product
          </button>
          <button className={`nav-link ${activePage === 4 ? 'active' : ''}`} onClick={() => setActivePage(4)}>
            <Users size={16} /> Success
          </button>
        </nav>

        <div className="header-right">
          <button className="theme-toggle" onClick={() => setIsDark(!isDark)} title="Toggle theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* ---- PAGE TOOLBAR ---- */}
      <div className="page-toolbar">
        <div className="page-title">
          <h2>
            {activePage === 1 && "Dashboard Overview"}
            {activePage === 2 && "Market & Geography"}
            {activePage === 3 && "Product Analytics"}
            {activePage === 4 && "Customer Success"}
          </h2>
          <p>
            {activePage === 1 && "Analyze recurring revenue, subscriptions, and churn metrics."}
            {activePage === 2 && "Global reach and marketing referral channel analysis."}
            {activePage === 3 && "Deep dive into feature adoption and technical health."}
            {activePage === 4 && "Monitor churn patterns and customer satisfaction."}
          </p>
        </div>
        <div className="filter-group">
          <div className="date-filter">
            <Calendar size={14} />
            <input
              type="date"
              value={filters.dateFrom}
              min={dateRange.minDate}
              max={dateRange.maxDate}
              onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
              placeholder="From"
            />
            <span className="date-sep">—</span>
            <input
              type="date"
              value={filters.dateTo}
              min={dateRange.minDate}
              max={dateRange.maxDate}
              onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
              placeholder="To"
            />
          </div>
          <MultiSelect
            label="Industry"
            options={industries}
            selected={filters.industries}
            onChange={val => setFilters({ ...filters, industries: val })}
          />
          <MultiSelect
            label="Plan"
            options={planTiers}
            selected={filters.planTiers}
            onChange={val => setFilters({ ...filters, planTiers: val })}
          />
          {hasFilters && (
            <button className="btn-reset" onClick={resetFilters}>Reset</button>
          )}
        </div>
      </div>

      {/* ---- KPI CARDS ---- */}
      <div className="kpi-grid" key={`kpi-${animKey}`}>
        <KPICard
          icon={DollarSign}
          label="Total MRR"
          value={`$${kpis.totalMRR.toLocaleString()}`}
          subtext="Monthly Recurring Revenue"
        />
        <KPICard
          icon={BarChart3}
          label="Active Subscriptions"
          value={kpis.activeSubscriptions.toLocaleString()}
          subtext="Non-trial, active plans"
        />
        <KPICard
          icon={AlertTriangle}
          label="Churn Rate"
          value={`${kpis.churnRate.toFixed(1)}%`}
          subtext="Of filtered subscriptions"
        />
        <KPICard
          icon={Star}
          label="Avg Satisfaction"
          value={kpis.avgSatisfaction > 0 ? `${kpis.avgSatisfaction.toFixed(1)}/5` : 'N/A'}
          subtext="From support tickets"
        />
      </div>

      {/* ---- CHARTS GRID ---- */}
      <div className="charts-grid">
        {activePage === 1 && (
          <>
            <div className="chart-card chart-col-3">
              <div className="chart-card-header">
                <h3><TrendingUp size={18} style={{ color: 'var(--accent)' }} /> MRR Trend</h3>
              </div>
              <div key={`line-${animKey}`}>
                <LineChartComponent data={mrrTrend} />
              </div>
            </div>
            <div className="chart-card chart-col-2">
              <div className="chart-card-header">
                <h3><BarChart3 size={18} style={{ color: 'var(--accent)' }} /> Revenue by Industry</h3>
              </div>
              <div key={`bar-${animKey}`}>
                <BarChartComponent data={industryRevenue} />
              </div>
            </div>
            <div className="chart-card chart-col-1">
              <div className="chart-card-header">
                <h3><PieChart size={18} style={{ color: 'var(--accent)' }} /> Plan Distribution</h3>
              </div>
              <div key={`pie-${animKey}`}>
                <PieChartComponent data={planDistribution} />
              </div>
            </div>
          </>
        )}

        {activePage === 2 && (
          <>
            <div className="chart-card chart-col-2">
              <div className="chart-card-header">
                <h3><Globe size={18} style={{ color: 'var(--accent)' }} /> Geographic Distribution</h3>
                <p className="chart-card-subtitle">Top 10 countries by active subscriptions</p>
              </div>
              <div key={`geo-${animKey}`}>
                <CountryBar data={countryData} />
              </div>
            </div>
            <div className="chart-card chart-col-1">
              <div className="chart-card-header">
                <h3><Star size={18} style={{ color: 'var(--accent)' }} /> Referral Sources</h3>
              </div>
              <div key={`ref-${animKey}`}>
                <ReferralPie data={referralData} />
              </div>
            </div>
          </>
        )}

        {activePage === 3 && (
          <>
            <div className="chart-card chart-col-3">
              <div className="chart-card-header">
                <h3><Activity size={18} style={{ color: 'var(--accent)' }} /> Feature Usage Depth</h3>
                <p className="chart-card-subtitle">Top 10 features by usage frequency</p>
              </div>
              <div key={`feat-${animKey}`}>
                <FeatureBar data={featureUsage} />
              </div>
            </div>
            <div className="chart-card chart-col-3" style={{ marginTop: '20px' }}>
              <div className="chart-card-header">
                <h3><Zap size={18} style={{ color: 'var(--accent)' }} /> Feature Performance & Errors</h3>
              </div>
              <FeatureTable data={featureUsage} />
            </div>
          </>
        )}

        {activePage === 4 && (
          <>
            <div className="chart-card chart-col-3">
              <div className="chart-card-header">
                <h3><TrendingUp size={18} style={{ color: 'var(--accent)' }} /> Subscription Growth Analysis</h3>
                <p className="chart-card-subtitle">Monthly new vs churned subscriptions</p>
              </div>
              <div key={`growth-${animKey}`}>
                <GrowthBar data={mrrTrend} />
              </div>
            </div>
            
            <div className="chart-card chart-col-3" style={{ marginTop: '20px' }}>
              <div className="chart-card-header">
                <h3><AlertCircle size={18} style={{ color: 'var(--accent)' }} /> Churn Watchlist</h3>
              </div>
              <ChurnTable data={churnWatchlist} />
            </div>

            {/* Support Metrics Card */}
            <div className="chart-card chart-col-3" style={{ marginTop: '20px' }}>
              <div className="chart-card-header">
                <h3><Activity size={18} style={{ color: 'var(--accent)' }} /> Support Metrics</h3>
                <p className="chart-card-subtitle">Customer support performance overview</p>
              </div>
              <div className="support-metrics-kpis">
                <div className="support-metric-cell">
                  <p className="support-metric-label">Total Tickets</p>
                  <p className="support-metric-value">{supportData.total_tickets.toLocaleString()}</p>
                </div>
                <div className="support-metric-cell">
                  <p className="support-metric-label">Avg Resolution</p>
                  <p className="support-metric-value">
                    {supportData.avg_resolution_hours}
                    <span className="support-metric-unit"> hrs</span>
                  </p>
                </div>
                <div className="support-metric-cell">
                  <p className="support-metric-label">First Response</p>
                  <p className="support-metric-value">
                    {supportData.avg_first_response_minutes}
                    <span className="support-metric-unit"> min</span>
                  </p>
                </div>
                <div className="support-metric-cell">
                  <p className="support-metric-label">Escalation Rate</p>
                  <p
                    className="support-metric-value"
                    style={{ color: supportData.escalation_rate > 10 ? '#ef4444' : 'var(--accent)' }}
                  >
                    {supportData.escalation_rate}%
                  </p>
                </div>
              </div>
              <SupportPriorityBar breakdown={supportData.priority_breakdown} />
            </div>
          </>
        )}
      </div>

      {/* ---- FULLSCREEN MODAL ---- */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(null)}>
          <div className={`modal-content ${['team', 'support'].includes(modalOpen as string) ? 'modal-sm sharp' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="flex items-center gap-2">
                {modalOpen === 'line' && <><TrendingUp size={22} style={{ color: 'var(--accent)' }}/> MRR Trend</>}
                {modalOpen === 'bar' && <><BarChart3 size={22} style={{ color: 'var(--accent)' }}/> Revenue by Industry</>}
                {modalOpen === 'pie' && <><PieChart size={22} style={{ color: 'var(--accent)' }}/> Plan Distribution</>}
                {modalOpen === 'table' && <><AlertCircle size={22} style={{ color: 'var(--accent)' }}/> Churn Watchlist</>}
              </h2>
              <button className="modal-close" onClick={() => setModalOpen(null)}>
                <Minimize2 size={18} />
              </button>
            </div>
            <div className="modal-body">
              {modalOpen === 'line' && <LineChartComponent data={mrrTrend} />}
              {modalOpen === 'bar' && <BarChartComponent data={industryRevenue} />}
              {modalOpen === 'pie' && <PieChartComponent data={planDistribution} />}
              {modalOpen === 'table' && <ChurnTable data={churnWatchlist} />}
              {modalOpen === 'docs' && (
                <div style={{ padding: '20px', color: 'var(--text-primary)' }}>
                  <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}><LayoutDashboard size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> System Documentation</h3>
                  
                  <div className="modal-docs-grid">
                    <div>
                      <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={16} color="var(--accent)"/> Technology Stack</h4>
                      <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8', fontSize: '13px' }}>
                        <li><strong>Frontend:</strong> React 18 + Vite</li>
                        <li><strong>Backend/DB:</strong> Supabase PostgreSQL</li>
                        <li><strong>Language:</strong> TypeScript (Type-Safe)</li>
                        <li><strong>Visuals:</strong> Recharts Engine</li>
                        <li><strong>Deployment:</strong> Vercel (CI/CD)</li>
                        <li><strong>Version:</strong> v2.5.0-stable</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Bot size={16} color="var(--accent)"/> AI Orchestration</h4>
                      <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8', fontSize: '13px' }}>
                        <li><strong>Primary:</strong> Groq (5-Key Rotation)</li>
                        <li><strong>Fallback 1:</strong> Google Gemini Pro</li>
                        <li><strong>Fallback 2:</strong> Cerebras (High-Speed)</li>
                        <li><strong>Architecture:</strong> RAG (Context-Aware)</li>
                      </ul>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ marginBottom: '8px' }}>Metrics Dictionary</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      <strong>MRR:</strong> Monthly Recurring Revenue from active paid subs.<br/>
                      <strong>Adoption:</strong> Unique subscription usage per feature.<br/>
                      <strong>Churn:</strong> Percentage of revenue loss in selected period.
                    </p>
                  </div>
                </div>
              )}
              {modalOpen === 'support' && (
                <div style={{ padding: '20px', color: 'var(--text-primary)' }}>
                  <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}><Users size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Technical Support</h3>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>If you experience any issues with the dashboard, data syncing, or AI responses, please check the system status or contact our team.</p>
                  
                  <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="status-dot"></div>
                      <strong style={{ color: 'var(--text-primary)' }}>System is 100% Operational</strong>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      <div>Data Sync: Real-time (Active)</div>
                      <div>AI Latency: ~120ms (Cerebras Llama)</div>
                      <div>Backend: Live</div>
                    </div>
                  </div>
                  
                  <button className="chat-send" style={{ width: '100%', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 600 }} onClick={() => setModalOpen(null)}>Acknowledge</button>
                </div>
              )}
              {modalOpen === 'team' && (
                <div style={{ padding: '32px 40px', color: 'var(--text-primary)' }}>
                  <div style={{ borderBottom: '2px solid var(--accent)', display: 'inline-block', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px', marginBottom: '4px' }}>OUR GROUP</h2>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '32px' }}>Project Contributors • Data Viz 2026</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {[
                      'Julio Korengkeng',
                      'Aulia Ollo',
                      'Zeavani Patuli',
                      'Irmando Koyo',
                      'Cliford Noya'
                    ].map((name, i) => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '14px 0',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '0.5px' }}>{name.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    style={{ 
                      marginTop: '40px', 
                      width: '100%', 
                      padding: '12px', 
                      background: 'none', 
                      border: '1px solid var(--text-primary)', 
                      color: 'var(--text-primary)', 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      borderRadius: 0 
                    }} 
                    onClick={() => setModalOpen(null)}
                  >
                    CLOSE
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---- AI CHAT BUTTON ---- */}
      <button
        ref={fabRef}
        className={`chat-fab ${chatOpen ? 'hidden' : ''}`}
        onClick={() => setChatOpen(true)}
        title="Ask AI about your data"
      >
        <MessageCircle size={22} />
      </button>

      {/* ---- AI CHAT PANEL ---- */}
      <AIChatPanel 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
        dataContext={dataContext}
        activePage={activePage}
      />

      {/* ---- FOOTER ---- */}
      <footer className="app-footer">
        <div className="footer-left">
          <p>© 2026 <a href="https://www.kaggle.com/datasets/rivalytics/saas-subscription-and-churn-analytics-dataset?select=ravenstack_accounts.csv" target="_blank" rel="noopener noreferrer" className="footer-brand-link"><strong>RavenStack</strong></a> Analytics. All rights reserved.</p>
        </div>
        <div className="footer-center">
          <div className="footer-links">
            <a href="#team" onClick={(e) => { e.preventDefault(); setModalOpen('team'); }}>JAZIC • TEAM</a>
          </div>
        </div>
        <div className="footer-right">
          <div className="footer-links">
            <a href="#docs" onClick={(e) => { e.preventDefault(); setModalOpen('docs'); }}>Documentation</a>
            <span className="footer-sep">|</span>
            <a href="#support" onClick={(e) => { e.preventDefault(); setModalOpen('support'); }}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
