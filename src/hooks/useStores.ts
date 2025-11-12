import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Store {
  id: string;
  store_name: string;
  address?: string;
  prompt_1?: string;
  prompt2_id?: string;
  prompt3_id?: string;
  package_id?: string;
  background_image_url?: string;
  store_kind: 'Market' | 'Mall' | 'Personal';
  registration_date?: string;
  max_images_per_hour: number;
  max_images_per_msg: number;
  is_paused?: boolean;
  credit_remaining_egp?: number;
  remaining_quota_images?: number;
  shopify_collection_handle?: string;
  shopify_collection_id?: string;
  shopify_storefront_url?: string;
  shopify_auto_publish?: boolean;
  shopify_default_vendor?: string;
  shopify_default_product_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StoresFilters {
  query?: string;
  type?: string;
  paused?: boolean;
  page?: number;
  page_size?: number;
}

export function useStores(filters?: StoresFilters) {
  return useQuery({
    queryKey: ['stores', filters],
    queryFn: async () => {
      const response = await api.get('/stores', { params: filters });
      return response.data;
    },
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: ['store', id],
    queryFn: async () => {
      const response = await api.get(`/stores/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Store>) => {
      const response = await api.post('/stores', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Store> }) => {
      const response = await api.patch(`/stores/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/stores/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}
