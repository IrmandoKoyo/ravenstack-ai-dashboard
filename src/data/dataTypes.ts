// ============================================================
// RavenStack SaaS Dataset — TypeScript Type Definitions
// ============================================================

export interface Account {
  account_id: string;
  account_name: string;
  industry: string;
  country: string;
  signup_date: string;
  referral_source: string;
  plan_tier: string;
  seats: number;
  is_trial: boolean;
  churn_flag: boolean;
}

export interface Subscription {
  subscription_id: string;
  account_id: string;
  start_date: string;
  end_date: string;
  plan_tier: string;
  seats: number;
  mrr_amount: number;
  arr_amount: number;
  is_trial: boolean;
  upgrade_flag: boolean;
  downgrade_flag: boolean;
  churn_flag: boolean;
  billing_frequency: string;
  auto_renew_flag: boolean;
}

export interface ChurnEvent {
  churn_event_id: string;
  account_id: string;
  churn_date: string;
  reason_code: string;
  refund_amount_usd: number;
  preceding_upgrade_flag: boolean;
  preceding_downgrade_flag: boolean;
  is_reactivation: boolean;
  feedback_text: string;
}

export interface SupportTicket {
  ticket_id: string;
  account_id: string;
  submitted_at: string;
  closed_at: string;
  resolution_time_hours: number;
  priority: string;
  first_response_time_minutes: number;
  satisfaction_score: number | null;
  escalation_flag: boolean;
}

// Joined/aggregated types
export interface AccountWithDetails extends Account {
  total_mrr: number;
  subscription_count: number;
  churn_events: ChurnEvent[];
}

export interface MonthlyMRR {
  month: string;       // "2023-01", "2023-02", etc.
  label: string;       // "Jan 23", "Feb 23", etc.
  total_mrr: number;
  new_subscriptions: number;
  churned_subscriptions: number;
}

export interface IndustryRevenue {
  industry: string;
  total_mrr: number;
  account_count: number;
  avg_mrr: number;
}

export interface PlanDistribution {
  plan_tier: string;
  count: number;
  percentage: number;
}

export interface ChurnWatchlistItem {
  account_name: string;
  industry: string;
  churn_date: string;
  reason_code: string;
  feedback_text: string;
  refund_amount_usd: number;
  plan_tier: string;
}

export interface DashboardFilters {
  dateFrom: string;
  dateTo: string;
  industries: string[];
  planTiers: string[];
}

export interface KPIData {
  totalMRR: number;
  activeSubscriptions: number;
  churnRate: number;
  avgSatisfaction: number;
}

// ---- Feature Usage (25K rows) ----
export interface FeatureUsage {
  usage_id: string;
  subscription_id: string;
  usage_date: string;
  feature_name: string;
  usage_count: number;
  usage_duration_secs: number;
  error_count: number;
  is_beta_feature: boolean;
}

export interface FeatureUsageSummary {
  feature_name: string;
  total_usage_count: number;
  total_duration_hours: number;
  total_errors: number;
  unique_subscriptions: number;
  is_beta: boolean;
  avg_usage_per_session: number;
}

export interface SupportSummary {
  total_tickets: number;
  avg_resolution_hours: number;
  avg_first_response_minutes: number;
  escalation_rate: number;
  priority_breakdown: Record<string, number>;
}
