import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ErrorLog {
  error_id: string;
  store_id?: string;
  store_name?: string;
  job_id?: string;
  media_type?: string;
  stage?: string;
  provider?: string;
  kind?: string;
  timestamp: string;
  error_message?: string;
  shopify_endpoint?: string;
  http_status?: number;
  error_code?: string;
  retryable?: 'Y' | 'N';
}

export interface ErrorFilters {
  store_id?: string;
  job_id?: string;
  from?: string;
  to?: string;
  kind?: string;
}

export function useErrors(filters?: ErrorFilters) {
  return useQuery({
    queryKey: ['errors', filters],
    queryFn: async () => {
      const response = await api.get('/errors', { params: filters });
      return response.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
}


