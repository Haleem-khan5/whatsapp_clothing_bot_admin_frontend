import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Prompt {
  prompt_id: string;
  name: string;
  prompt_text: string;
  scope: 'global' | 'store';
  store_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function usePrompts(scope?: 'global' | 'store', q?: string) {
  return useQuery({
    queryKey: ['prompts', scope, q],
    queryFn: async () => {
      const response = await api.get('/prompts', { params: { scope, q } });
      return response.data;
    },
  });
}

export function useCreatePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Prompt>) => {
      const response = await api.post('/prompts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Prompt> }) => {
      const response = await api.patch(`/prompts/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useDeletePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/prompts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}


