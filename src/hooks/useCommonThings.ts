import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CommonThings {
  id: number;
  exchange_usd_egp: number;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
  updated_by_name?: string;
  updated_by_email?: string;
}

export function useCommonThings() {
  return useQuery({
    queryKey: ['common-things'],
    queryFn: async () => {
      const response = await api.get('/common-things');
      return response.data as { ok: boolean; data: CommonThings; meta?: any };
    },
  });
}

export function useUpdateExchangeRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (exchange_usd_egp: number) => {
      const response = await api.patch('/common-things/exchange-rate', { exchange_usd_egp });
      return response.data as { ok: boolean; data: CommonThings; meta?: any };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['common-things'] });
    },
  });
}


