import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CreateNumberPayload {
  store_id: string;
  phone_e164: string;
  wapp_owner_name?: string;
  is_primary?: boolean;
}

export function useCreateNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateNumberPayload) => {
      const { store_id, ...body } = payload;
      const response = await api.post(`/stores/${store_id}/numbers`, body);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate any queries that might list numbers, if added later
      queryClient.invalidateQueries({ queryKey: ['numbers'] });
    },
  });
}

export function useNumbers(storeId?: string, storeNameQuery?: string, q?: string) {
  return useQuery({
    queryKey: ['numbers', storeId, storeNameQuery, q],
    queryFn: async () => {
      if (storeId) {
        const response = await api.get(`/stores/${storeId}/numbers`, { params: { q: q || undefined } });
        return response.data;
      }
      const response = await api.get(`/numbers`, { params: { store_name: storeNameQuery || undefined, q: q || undefined } });
      return response.data;
    },
    enabled: true,
  });
}


