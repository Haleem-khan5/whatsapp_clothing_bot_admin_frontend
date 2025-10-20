import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePaymentFor() {
  return useQuery({
    queryKey: ['payment_for'],
    queryFn: async () => {
      const response = await api.get('/payment-for');
      return response.data;
    },
  });
}

export function usePaymentMethod() {
  return useQuery({
    queryKey: ['payment_method'],
    queryFn: async () => {
      const response = await api.get('/payment-method');
      return response.data;
    },
  });
}

export function useCreatePaymentFor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { payment_for_name?: string; name?: string }) => {
      const response = await api.post('/payment-for', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment_for'] });
    },
  });
}

export function useUpdatePaymentFor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { payment_for_name?: string; name?: string } }) => {
      const response = await api.patch(`/payment-for/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment_for'] });
    },
  });
}

export function useDeletePaymentFor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/payment-for/${id}`);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment_for'] });
    },
  });
}

export function useCreatePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { payment_method_name?: string; name?: string }) => {
      const response = await api.post('/payment-method', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment_method'] });
    },
  });
}

export function useUpdatePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { payment_method_name?: string; name?: string } }) => {
      const response = await api.patch(`/payment-method/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment_method'] });
    },
  });
}

export function useDeletePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/payment-method/${id}`);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment_method'] });
    },
  });
}



