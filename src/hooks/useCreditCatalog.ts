import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CreditCatalogItem {
  credit_id: string;
  job_type: string;
  job_name: string;
  credits_per_job: number;
}

export function useCreditCatalog() {
  return useQuery({
    queryKey: ['credit_catalog'],
    queryFn: async () => {
      const response = await api.get('/credit-catalog');
      return response.data;
    },
  });
}

export function useCreateCreditItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<CreditCatalogItem>) => {
      const response = await api.post('/credit-catalog', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit_catalog'] });
    },
  });
}

export function useUpdateCreditItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreditCatalogItem> }) => {
      const response = await api.patch(`/credit-catalog/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit_catalog'] });
    },
  });
}

export function useDeleteCreditItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/credit-catalog/${id}`);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit_catalog'] });
    },
  });
}


