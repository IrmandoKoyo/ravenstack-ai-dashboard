// ============================================================
// RavenStack Data Loader — Supabase Integration (V6: FINAL PRO VERSION)
// ============================================================
import { supabase } from '../lib/supabaseClient';
import type {
  Account, Subscription, ChurnEvent, SupportTicket,
  MonthlyMRR, IndustryRevenue, PlanDistribution,
  ChurnWatchlistItem, KPIData, DashboardFilters,
  FeatureUsage, FeatureUsageSummary, SupportSummary
} from './dataTypes';

// ---- Parsed data (singleton) ----
let _accounts: Account[] | null = null;
let _subscriptions: Subscription[] | null = null;
let _churnEvents: ChurnEvent[] | null = null;
let _supportTickets: SupportTicket[] | null = null;
let _featureUsage: FeatureUsage[] | null = null;

/**
 * Optimized Turbo Fetch: Fetches all chunks in parallel for maximum speed.
 */
async function fetchAllRows(tableName: string) {
  const { count, error: countError } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (countError || count === null) return [];
  if (count === 0) return [];

  const chunkSize = 1000;
  const numChunks = Math.ceil(count / chunkSize);
  const promises = [];

  for (let i = 0; i < numChunks; i++) {
    promises.push(supabase.from(tableName).select('*').range(i * chunkSize, (i * chunkSize) + chunkSize - 1));
  }

  const results = await Promise.all(promises);
  return results.flatMap(r => r.data || []);
}

// ---- Initialization Function ----
export async function initializeData(): Promise<boolean> {
  const start = performance.now();
  try {
    const [accounts, subscriptions, churn, support, features] = await Promise.all([
      fetchAllRows('accounts'),
      fetchAllRows('subscriptions'),
      fetchAllRows('churn_events'),
      fetchAllRows('support_tickets'),
      fetchAllRows('feature_usage')
    ]);

    // Data cleaning & mapping with strict casting
    _accounts = accounts.map(r => ({
      ...r,
      seats: Number(r.seats) || 0,
      is_trial: r.is_trial === true || String(r.is_trial).toLowerCase() === 'true',
      churn_flag: r.churn_flag === true || String(r.churn_flag).toLowerCase() === 'true',
    })) as Account[];

    _subscriptions = subscriptions.map(r => ({
      ...r,
      seats: Number(r.seats) || 0,
      mrr_amount: Number(r.mrr_amount) || 0,
      arr_amount: Number(r.arr_amount) || 0,
      is_trial: r.is_trial === true || String(r.is_trial).toLowerCase() === 'true',
      upgrade_flag: r.upgrade_flag === true || String(r.upgrade_flag).toLowerCase() === 'true',
      downgrade_flag: r.downgrade_flag === true || String(r.downgrade_flag).toLowerCase() === 'true',
      churn_flag: r.churn_flag === true || String(r.churn_flag).toLowerCase() === 'true',
      auto_renew_flag: r.auto_renew_flag === true || String(r.auto_renew_flag).toLowerCase() === 'true',
    })) as Subscription[];

    _churnEvents = churn.map(r => ({
      ...r,
      refund_amount_usd: Number(r.refund_amount_usd) || 0,
      preceding_upgrade_flag: r.preceding_upgrade_flag === true || String(r.preceding_upgrade_flag).toLowerCase() === 'true',
      preceding_downgrade_flag: r.preceding_downgrade_flag === true || String(r.preceding_downgrade_flag).toLowerCase() === 'true',
      is_reactivation: r.is_reactivation === true || String(r.is_reactivation).toLowerCase() === 'true',
    })) as ChurnEvent[];

    _supportTickets = support.map(r => ({
      ...r,
      resolution_time_hours: Number(r.resolution_time_hours) || 0,
      first_response_time_minutes: Number(r.first_response_time_minutes) || 0,
      satisfaction_score: r.satisfaction_score ? Number(r.satisfaction_score) : null,
      escalation_flag: r.escalation_flag === true || String(r.escalation_flag).toLowerCase() === 'true',
    })) as SupportTicket[];

    _featureUsage = features.map(r => ({
      ...r,
      usage_count: Number(r.usage_count) || 0,
      usage_duration_secs: Number(r.usage_duration_secs) || 0,
      error_count: Number(r.error_count) || 0,
      is_beta_feature: r.is_beta_feature === true || String(r.is_beta_feature).toLowerCase() === 'true',
    })) as FeatureUsage[];

    const end = performance.now();
    console.log(`✅ TURBO LOAD SUCCESS (${((end - start)/1000).toFixed(2)}s): ${_subscriptions.length} records processed.`);
    return true;
  } catch (err) {
    console.error('💥 Fatal error during initialization:', err);
    return false;
  }
}

// ---- Sync Getters ----
export function getAccounts(): Account[] { return _accounts || []; }
export function getSubscriptions(): Subscription[] { return _subscriptions || []; }
export function getChurnEvents(): ChurnEvent[] { return _churnEvents || []; }
export function getSupportTickets(): SupportTicket[] { return _supportTickets || []; }
export function getFeatureUsage(): FeatureUsage[] { return _featureUsage || []; }

// ---- Aggregation logic (Matches Your Pro Version) ----
export function getUniqueIndustries(): string[] {
  const set = new Set(getAccounts().map(a => a.industry));
  return Array.from(set).sort();
}

export function getUniquePlanTiers(): string[] {
  return ['Basic', 'Pro', 'Enterprise'];
}

export function getDateRange(): { minDate: string, maxDate: string } {
  const subs = getSubscriptions();
  if (subs.length === 0) return { minDate: '2023-01-01', maxDate: '2024-12-31' };
  let min = subs[0].start_date; let max = subs[0].start_date;
  for (const s of subs) {
    if (s.start_date && s.start_date < min) min = s.start_date;
    if (s.start_date && s.start_date > max) max = s.start_date;
  }
  return { minDate: min, maxDate: max };
}

function getAccountMap(): Map<string, Account> {
  const map = new Map<string, Account>();
  for (const a of getAccounts()) map.set(a.account_id, a);
  return map;
}

function filterSubscriptions(filters: DashboardFilters): Subscription[] {
  const accountMap = getAccountMap();
  return getSubscriptions().filter(s => {
    if (filters.dateFrom && s.start_date < filters.dateFrom) return false;
    if (filters.dateTo && s.start_date > filters.dateTo) return false;
    const account = accountMap.get(s.account_id);
    if (!account) return false;
    if (filters.industries.length > 0 && !filters.industries.includes(account.industry)) return false;
    if (filters.planTiers.length > 0 && !filters.planTiers.includes(s.plan_tier)) return false;
    return true;
  });
}

export function getKPIs(filters: DashboardFilters): KPIData {
  const subs = filterSubscriptions(filters);
  const accountMap = getAccountMap();
  const activeSubs = subs.filter(s => !s.end_date && !s.is_trial);
  const totalMRR = activeSubs.reduce((sum, s) => sum + s.mrr_amount, 0);
  const activeCount = activeSubs.length;
  const churnedCount = subs.filter(s => s.churn_flag).length;
  const churnRate = subs.length > 0 ? (churnedCount / subs.length) * 100 : 0;
  const filteredAccountIds = new Set(subs.map(s => s.account_id));
  const tickets = getSupportTickets().filter(t => {
    if (!filteredAccountIds.has(t.account_id)) return false;
    const account = accountMap.get(t.account_id);
    if (!account) return false;
    if (filters.industries.length > 0 && !filters.industries.includes(account.industry)) return false;
    return true;
  });
  const scoredTickets = tickets.filter(t => t.satisfaction_score !== null);
  const avgSatisfaction = scoredTickets.length > 0 ? scoredTickets.reduce((sum, t) => sum + (t.satisfaction_score ?? 0), 0) / scoredTickets.length : 0;
  return { totalMRR, activeSubscriptions: activeCount, churnRate, avgSatisfaction };
}

export function getMonthlyMRR(filters: DashboardFilters): MonthlyMRR[] {
  const subs = filterSubscriptions(filters);
  const monthMap = new Map<string, { mrr: number; newSubs: number; churned: number }>();
  for (const s of subs) {
    if (!s.start_date) continue;
    const monthKey = s.start_date.substring(0, 7);
    const existing = monthMap.get(monthKey) || { mrr: 0, newSubs: 0, churned: 0 };
    existing.mrr += s.mrr_amount; existing.newSubs += 1;
    if (s.churn_flag) existing.churned += 1;
    monthMap.set(monthKey, existing);
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => {
    const [year, month] = key.split('-');
    const monthIdx = parseInt(month) - 1;
    return { month: key, label: `${months[monthIdx]} ${year.slice(2)}`, total_mrr: Math.round(val.mrr), new_subscriptions: val.newSubs, churned_subscriptions: val.churned };
  });
}

export function getIndustryRevenue(filters: DashboardFilters): IndustryRevenue[] {
  const subs = filterSubscriptions(filters).filter(s => !s.is_trial && !s.end_date);
  const accountMap = getAccountMap();
  const industryMap = new Map<string, { mrr: number; accounts: Set<string> }>();
  for (const s of subs) {
    const account = accountMap.get(s.account_id);
    if (!account) continue;
    const existing = industryMap.get(account.industry) || { mrr: 0, accounts: new Set<string>() };
    existing.mrr += s.mrr_amount; existing.accounts.add(s.account_id);
    industryMap.set(account.industry, existing);
  }
  return Array.from(industryMap.entries()).map(([industry, val]) => ({ industry, total_mrr: Math.round(val.mrr), account_count: val.accounts.size, avg_mrr: val.accounts.size > 0 ? Math.round(val.mrr / val.accounts.size) : 0 })).sort((a, b) => b.total_mrr - a.total_mrr);
}

export function getPlanDistribution(filters: DashboardFilters): PlanDistribution[] {
  const subs = filterSubscriptions(filters).filter(s => !s.is_trial && !s.end_date);
  const tierMap = new Map<string, number>();
  for (const s of subs) tierMap.set(s.plan_tier, (tierMap.get(s.plan_tier) || 0) + 1);
  const total = subs.length;
  return Array.from(tierMap.entries()).map(([tier, count]) => ({ plan_tier: tier, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 })).sort((a, b) => b.count - a.count);
}

export function getReferralDistribution(filters: DashboardFilters): { source: string, count: number, percentage: number }[] {
  const accountMap = getAccountMap();
  const subs = filterSubscriptions(filters);
  const sourceMap = new Map<string, number>();
  for (const s of subs) {
    const account = accountMap.get(s.account_id);
    if (account) sourceMap.set(account.referral_source, (sourceMap.get(account.referral_source) || 0) + 1);
  }
  const total = Array.from(sourceMap.values()).reduce((a, b) => a + b, 0);
  return Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 })).sort((a, b) => b.count - a.count);
}

export function getCountryDistribution(filters: DashboardFilters): { country: string, count: number }[] {
  const accountMap = getAccountMap();
  const subs = filterSubscriptions(filters);
  const countryMap = new Map<string, number>();
  for (const s of subs) {
    const account = accountMap.get(s.account_id);
    if (account) countryMap.set(account.country, (countryMap.get(account.country) || 0) + 1);
  }
  return Array.from(countryMap.entries()).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 30);
}

export function getSupportSummary(filters: DashboardFilters): SupportSummary {
  const subs = filterSubscriptions(filters);
  const validAccountIds = new Set(subs.map(s => s.account_id));
  const tickets = getSupportTickets().filter(t => validAccountIds.has(t.account_id));
  const priorityMap: Record<string, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
  let totalResTime = 0; let totalFirstResp = 0; let escalatedCount = 0;
  tickets.forEach(t => {
    const p = t.priority?.toLowerCase() || 'low';
    priorityMap[p] = (priorityMap[p] || 0) + 1;
    totalResTime += t.resolution_time_hours || 0;
    totalFirstResp += t.first_response_time_minutes || 0;
    if (t.escalation_flag) escalatedCount++;
  });
  return { total_tickets: tickets.length, avg_resolution_hours: tickets.length > 0 ? Math.round((totalResTime / tickets.length) * 10) / 10 : 0, avg_first_response_minutes: tickets.length > 0 ? Math.round(totalFirstResp / tickets.length) : 0, escalation_rate: tickets.length > 0 ? Math.round((escalatedCount / tickets.length) * 100) : 0, priority_breakdown: priorityMap };
}

export function getChurnWatchlist(filters: DashboardFilters): ChurnWatchlistItem[] {
  const accountMap = getAccountMap();
  const events = getChurnEvents();
  return events.filter(e => {
    const account = accountMap.get(e.account_id);
    if (!account) return false;
    if (filters.dateFrom && e.churn_date < filters.dateFrom) return false;
    if (filters.dateTo && e.churn_date > filters.dateTo) return false;
    if (filters.industries.length > 0 && !filters.industries.includes(account.industry)) return false;
    return true;
  }).map(e => {
    const account = accountMap.get(e.account_id)!;
    return { account_name: account.account_name, industry: account.industry, churn_date: e.churn_date, reason_code: e.reason_code, feedback_text: e.feedback_text, refund_amount_usd: e.refund_amount_usd, plan_tier: account.plan_tier };
  }).sort((a, b) => b.churn_date.localeCompare(a.churn_date)).slice(0, 15);
}

export function getFeatureUsageSummary(filters: DashboardFilters): FeatureUsageSummary[] {
  const usage = getFeatureUsage();
  const validSubIds = new Set(filterSubscriptions(filters).map(s => s.subscription_id));
  const featureMap = new Map<string, { count: number; duration: number; errors: number; subs: Set<string>; isBeta: boolean; }>();
  for (const u of usage) {
    if (!validSubIds.has(u.subscription_id)) continue;
    if (filters.dateFrom && u.usage_date < filters.dateFrom) continue;
    if (filters.dateTo && u.usage_date > filters.dateTo) continue;
    const existing = featureMap.get(u.feature_name) || { count: 0, duration: 0, errors: 0, subs: new Set<string>(), isBeta: u.is_beta_feature };
    existing.count += u.usage_count; existing.duration += u.usage_duration_secs; existing.errors += u.error_count; existing.subs.add(u.subscription_id);
    featureMap.set(u.feature_name, existing);
  }
  return Array.from(featureMap.entries()).map(([name, val]) => ({ feature_name: name, total_usage_count: val.count, total_duration_hours: Math.round((val.duration / 3600) * 10) / 10, total_errors: val.errors, unique_subscriptions: val.subs.size, is_beta: val.isBeta, avg_usage_per_session: val.count > 0 ? Math.round((val.duration / val.count) * 10) / 10 : 0 })).sort((a, b) => b.total_usage_count - a.total_usage_count);
}

export function generateDataSummary(filters: DashboardFilters, activePage: number): string {
  const kpis = getKPIs(filters);
  const mrrTrend = getMonthlyMRR(filters);
  const industryRev = getIndustryRevenue(filters);
  const planDist = getPlanDistribution(filters);
  const churnList = getChurnWatchlist(filters);
  const featureSummary = getFeatureUsageSummary(filters);
  const referralDist = getReferralDistribution(filters);
  const countryDist = getCountryDistribution(filters);
  const supportSummary = getSupportSummary(filters);
  const accountMap = getAccountMap();
  const filteredSubs = filterSubscriptions(filters);

  // ---- Computed Totals ----
  const totalNewSubs = mrrTrend.reduce((s, m) => s + m.new_subscriptions, 0);
  const totalChurned = mrrTrend.reduce((s, m) => s + m.churned_subscriptions, 0);
  const highMonth = mrrTrend.length > 0 ? mrrTrend.reduce((a, b) => a.total_mrr > b.total_mrr ? a : b) : null;
  const lowMonth = mrrTrend.length > 0 ? mrrTrend.reduce((a, b) => a.total_mrr < b.total_mrr ? a : b) : null;

  // ---- Churn reason breakdown ----
  const reasonCounts = new Map<string, number>();
  churnList.forEach(c => reasonCounts.set(c.reason_code, (reasonCounts.get(c.reason_code) || 0) + 1));
  const topReasons = Array.from(reasonCounts.entries()).sort((a, b) => b[1] - a[1]);

  // ---- Cross-channel insights ----
  const accountMRR = new Map<string, number>();
  filteredSubs.forEach(s => accountMRR.set(s.account_id, (accountMRR.get(s.account_id) || 0) + s.mrr_amount));
  const uniqueAccountIds = Array.from(new Set(filteredSubs.map(s => s?.account_id).filter(Boolean)));
  const channelCountryMap = new Map<string, Map<string, { count: number, mrr: number }>>();
  uniqueAccountIds.forEach(accId => {
    const acc = accountMap.get(accId);
    if (acc && acc.referral_source) {
      const channel = String(acc.referral_source);
      if (!channelCountryMap.has(channel)) channelCountryMap.set(channel, new Map());
      const countryMap = channelCountryMap.get(channel)!;
      const country = acc.country || 'Unknown';
      const mrrValue = accountMRR.get(accId) || 0;
      const existing = countryMap.get(country) || { count: 0, mrr: 0 };
      countryMap.set(country, { count: existing.count + 1, mrr: existing.mrr + mrrValue });
    }
  });
  const channelInsights = Array.from(channelCountryMap.entries()).map(([channel, countries]) => {
    const sorted = Array.from(countries.entries()).sort((a, b) => b[1].mrr - a[1].mrr);
    const topList = sorted.slice(0, 5).map(c => `${c[0]}(${c[1].count} user, $${Math.round(c[1].mrr).toLocaleString()} MRR)`).join(', ');
    return `  - Channel ${channel}: ${topList}`;
  }).join('\n');

  // ---- Priority percentage ----
  const priorityTotal = Object.values(supportSummary.priority_breakdown).reduce((s, v) => s + v, 0);
  const priorityPct = (key: string) => priorityTotal > 0 ? Math.round(((supportSummary.priority_breakdown[key] || 0) / priorityTotal) * 100) : 0;

  // ---- Page descriptions matching App.tsx exactly ----
  const pageNames: Record<number, string> = {
    1: 'Dashboard Overview — Grafik: (1) "MRR Trend" line chart, (2) "Revenue by Industry" bar chart, (3) "Plan Distribution" donut chart',
    2: 'Market & Geography — Grafik: (1) "Geographic Distribution" bar chart (top 10 negara), (2) "Referral Sources" donut chart',
    3: 'Product Analytics — Grafik: (1) "Feature Usage Depth" horizontal bar chart (top 10 fitur), (2) "Feature Performance & Errors" tabel dengan kolom: Feature Name, Total Usage, Adoption(Subs), Total Errors, Error Rate, Avg Time/Session',
    4: 'Customer Success — Grafik: (1) "Subscription Growth Analysis" bar chart (new vs churned per bulan), (2) "Churn Watchlist" tabel, (3) "Support Metrics" cards (Total Tickets, Avg Resolution, First Response, Escalation Rate) + Priority Distribution bar'
  };

  const prefix = (page: number) => activePage === page ? '[GRAFIK DI HALAMAN INI]' : '[GRAFIK DI HALAMAN LAIN]';

  const filterStrings = [];
  if (filters.dateFrom) filterStrings.push(`Tanggal: ${filters.dateFrom} s/d ${filters.dateTo}`);
  if (filters.industries && filters.industries.length > 0) filterStrings.push(`Industri: ${filters.industries.join(', ')}`);
  if (filters.planTiers && filters.planTiers.length > 0) filterStrings.push(`Paket: ${filters.planTiers.join(', ')}`);
  const filterContext = filterStrings.length > 0 ? filterStrings.join(' | ') : 'Semua Waktu (Tanpa Filter)';

  return `
Halaman aktif: ${pageNames[activePage] || 'Unknown'}
Filter: ${filterContext}

ANGKA UTAMA (KPI Cards — tampil di semua halaman):
- Total MRR: $${kpis.totalMRR.toLocaleString()} (Monthly Recurring Revenue)
- Pelanggan Aktif: ${kpis.activeSubscriptions.toLocaleString()} (non-trial, active plans)
- Churn Rate: ${kpis.churnRate.toFixed(1)}% (dari total filtered subscriptions)
- Avg Satisfaction: ${kpis.avgSatisfaction.toFixed(1)}/5 (dari support tickets)

${prefix(1)} GRAFIK "MRR Trend" (Line Chart — halaman Overview):
Menampilkan pertumbuhan pendapatan bulanan dari ${mrrTrend.length > 0 ? mrrTrend[0].label : '?'} hingga ${mrrTrend.length > 0 ? mrrTrend[mrrTrend.length-1].label : '?'}.
${mrrTrend.map(m => `  ${m.label}: $${m.total_mrr.toLocaleString()}`).join('\n')}
${highMonth ? `Puncak tertinggi: ${highMonth.label} ($${highMonth.total_mrr.toLocaleString()})` : ''}
${lowMonth ? `Titik terendah: ${lowMonth.label} ($${lowMonth.total_mrr.toLocaleString()})` : ''}

${prefix(1)} GRAFIK "Revenue by Industry" (Bar Chart — halaman Overview):
Menampilkan 5 industri berdasarkan MRR tertinggi.
${industryRev.map(i => `  ${i.industry}: $${i.total_mrr.toLocaleString()} MRR, ${i.account_count} akun, rata-rata $${i.avg_mrr.toLocaleString()}/akun`).join('\n')}

${prefix(1)} GRAFIK "Plan Distribution" (Donut Chart — halaman Overview):
Menampilkan proporsi paket langganan aktif.
${planDist.map(p => `  ${p.plan_tier}: ${p.count} user (${p.percentage}%)`).join('\n')}
Total pelanggan aktif non-trial: ${planDist.reduce((sum, p) => sum + p.count, 0)}

${prefix(2)} GRAFIK "Geographic Distribution" (Bar Chart — halaman Market):
Top 10 negara berdasarkan jumlah langganan aktif.
${countryDist.slice(0, 10).map(c => `  ${c.country}: ${c.count} langganan`).join('\n')}

${prefix(2)} GRAFIK "Referral Sources" (Donut Chart — halaman Market):
Sumber referral pelanggan (persentase).
${referralDist.map(r => `  ${r.source}: ${r.count} pelanggan (${r.percentage}%)`).join('\n')}

${prefix(2)} ANALISIS CROSS-CHANNEL (Halaman Market):
${channelInsights}

${prefix(3)} GRAFIK "Feature Usage Depth" (Bar Chart — halaman Product):
Top 10 fitur berdasarkan frekuensi penggunaan.
${featureSummary.slice(0, 10).map(f => `  ${f.feature_name}${f.is_beta ? ' [BETA]' : ''}: ${f.total_usage_count.toLocaleString()} penggunaan`).join('\n')}

${prefix(3)} TABEL "Feature Performance & Errors" (Tabel — halaman Product):
${featureSummary.slice(0, 10).map(f => `  ${f.feature_name}${f.is_beta ? ' [BETA]' : ''}: Total Usage=${f.total_usage_count.toLocaleString()}, Adoption=${f.unique_subscriptions} subs, Errors=${f.total_errors}, Error Rate=${f.total_usage_count > 0 ? ((f.total_errors/f.total_usage_count)*100).toFixed(1) : 0}%, Avg Time/Session=${f.avg_usage_per_session}s`).join('\n')}

${prefix(4)} GRAFIK "Subscription Growth Analysis" (Bar Chart — halaman Success):
Membandingkan pelanggan baru (oranye) vs pelanggan berhenti (abu-abu) setiap bulan.
${mrrTrend.map(m => `  ${m.label}: Baru=${m.new_subscriptions}, Berhenti=${m.churned_subscriptions}`).join('\n')}
Total periode: ${totalNewSubs} pelanggan baru, ${totalChurned} pelanggan berhenti.

${prefix(4)} TABEL "Churn Watchlist" (Tabel — halaman Success):
Daftar ${churnList.length} pelanggan terbaru yang berhenti berlangganan.
${churnList.map(c => `  ${c.account_name} | Industri: ${c.industry} | Paket: ${c.plan_tier} | Tanggal: ${c.churn_date} | Alasan: ${c.reason_code} | Feedback: "${c.feedback_text || '—'}"`).join('\n')}
Alasan churn terbanyak: ${topReasons.map(([r, c]) => `${r}(${c})`).join(', ')}

${prefix(4)} KARTU "Support Metrics" (Cards — halaman Success):
- Total Tickets: ${supportSummary.total_tickets}
- Avg Resolution: ${supportSummary.avg_resolution_hours} jam
- First Response: ${supportSummary.avg_first_response_minutes} menit
- Escalation Rate: ${supportSummary.escalation_rate}%
- Priority Distribution: Low ${priorityPct('low')}%, Medium ${priorityPct('medium')}%, High ${priorityPct('high')}%, Urgent ${priorityPct('urgent')}%
`.trim();
}
