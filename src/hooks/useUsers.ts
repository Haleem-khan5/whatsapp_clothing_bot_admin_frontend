import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AppUser {
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff';
  is_active: boolean;
}

export function useUsers(role?: 'admin' | 'staff') {
  return useQuery({
    queryKey: ['users', role],
    queryFn: async () => {
      const response = await api.get('/users', { params: { role } });
      return response.data;
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; full_name: string; role: 'admin' | 'staff'; password: string }) => {
      const response = await api.post('/users', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ email: string; full_name: string; role: 'admin' | 'staff'; is_active: boolean; password: string }> }) => {
      const response = await api.patch(`/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}


