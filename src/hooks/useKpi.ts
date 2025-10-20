import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type PresetRange = 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';

export interface KpiFilters {
  range?: PresetRange;
  from?: string; // ISO yyyy-mm-dd
  to?: string;   // ISO yyyy-mm-dd
}

export interface KpiResponse {
  range: string;
  from: string;
  to: string;
  stores_total: number;
  stores_new: number;
  transactions_egp: number;
  refunds_egp: number;
  image_jobs_count: number;
  image_jobs_cost_egp: number;
  video_jobs_count: number;
  video_jobs_cost_egp: number;
  net_cashflow_egp: number;
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


