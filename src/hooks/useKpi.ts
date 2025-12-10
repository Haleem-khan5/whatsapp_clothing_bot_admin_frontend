import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type PresetRange = 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';

export interface KpiFilters {
  range?: PresetRange;
  from?: string; // ISO yyyy-mm-dd
  to?: string;   // ISO yyyy-mm-dd
}

export interface KpiResponse {
  // ==== Date Range ====
  range: string;
  from: string;
  to: string;

  // ==== Stores ====
  stores_total: number;       // total registered
  stores_new: number;         // active or new in range

  // ==== Financials (existing) ====
  transactions_egp: number;      // revenue
  refunds_egp: number;           // refunds
  image_jobs_count: number;
  image_jobs_cost_egp: number;
  video_jobs_count: number;
  video_jobs_cost_egp: number;
  net_cashflow_egp: number;      // (existing from API)

  // ==== NEW — User Tier Distribution ====
  stores_tier_basic_pct?: number;   // e.g. 50
  stores_tier_pro_pct?: number;     // e.g. 25
  stores_tier_elite_pct?: number;   // e.g. 15
  stores_tier_trial_pct?: number;   // e.g. 10

  // ==== NEW — User Activity Status ====
  active_pct?: number;        // last 7 days
  less_active_pct?: number;   // last 30 days
  inactive_pct?: number;      // since registration

  // ==== NEW — Top Ups Overview ====
  stores_topped_up?: number;  // 420 stores topped up
  avg_topup_egp?: number;     // 345.23

  // ==== NEW — Avg Processing Time by Package ====
  basic_avg_proc_secs?: number;  // 40 seconds
  pro_avg_proc_secs?: number;    // 60 seconds
  elite_avg_proc_secs?: number;  // 120 seconds

  // ==== NEW — Error Rates ====
  error_rate_pct?: number;       // e.g. 1.2%
  errors_total?: number;         // 574
  jobs_total?: number;           // 57,350

  // ==== Optional — Backend can send this directly ====
  net_profit_egp?: number;  // optional computed field
}


function mapRangeToBackend(range?: PresetRange): string | undefined {
  if (!range) return undefined;
  const map: Record<PresetRange, string> = {
    'today': 'TODAY',
    'yesterday': 'YESTERDAY',
    'this-week': 'THIS_WEEK',
    'last-week': 'LAST_WEEK',
    'this-month': 'THIS_MONTH',
    'last-month': 'LAST_MONTH',
    'custom': 'CUSTOM',
  };
  return map[range];
}

export function useKpi(filters?: KpiFilters) {
  return useQuery({
    queryKey: ['kpi', filters],
    queryFn: async () => {
      const params = {
        ...filters,
        range: mapRangeToBackend(filters?.range),
      };
      const response = await api.get('/kpi', { params });
      return response.data as { ok: boolean; data: KpiResponse };
    },
  });
}


