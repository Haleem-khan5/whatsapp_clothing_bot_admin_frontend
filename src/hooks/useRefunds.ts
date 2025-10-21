import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface RefundRecord {
  refund_id: string;
  refund_date: string;
  store_id: string;
  job_type: string;
  job_name: string;
  num_of_jobs: number;
  credit_per_job: number;
  amount_egp: number;
  reason?: string;
  payment_reference_url?: string;
  received_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RefundsFilters {
  page?: number;
  page_size?: number;
  store_id?: string;
  from?: string;
  to?: string;
  type?: string;
  name?: string;
}

export function useRefunds(filters?: RefundsFilters) {
  return useQuery({
    queryKey: ['refunds', filters],
    queryFn: async () => {
      const response = await api.get('/refunds', { params: filters });
      return response.data;
    },
  });
}

export function useCreateRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<RefundRecord> & { refund_date: string; store_id: string; job_type: string; job_name: string; num_of_jobs: number }) => {
      const response = await api.post('/refunds', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
    },
  });
}






