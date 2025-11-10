import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface PackageDef {
  package_id: string;
  name: string;
  price_per_dress: number;
  currency: string;
  images_per_dress: number;
  use_consistent_background: boolean;
  prompts_order: string[];
  created_at?: string;
  updated_at?: string;
}

export function usePackages(q?: string) {
  return useQuery({
    queryKey: ['packages', q],
    queryFn: async () => {
      const response = await api.get('/packages', { params: { q } });
      return response.data;
    },
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<PackageDef>) => {
      const response = await api.post('/packages', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PackageDef> }) => {
      const response = await api.patch(`/packages/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
}



