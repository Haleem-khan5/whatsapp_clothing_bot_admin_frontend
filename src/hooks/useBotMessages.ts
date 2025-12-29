import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface BotMessage {
  log_id: string;
  store_id?: string;
  store_name?: string;
  phone_e164?: string;
  message_type: 'TOP_UP' | 'DAILY_SUMMARY' | 'MANUAL' | string;
  message_body: string;
  created_at: string;
}

export interface BotMessageFilters {
  store_id?: string;
  type?: string;
  from?: string;
  to?: string;
}

export function useBotMessages(filters?: BotMessageFilters) {
  return useQuery({
    queryKey: ['bot-messages', filters],
    queryFn: async () => {
      const response = await api.get('/bot-messages', { params: filters });
      return response.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
}

export function useSendManualBotMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { store_id: string; message: string }) => {
      const response = await api.post('/bot-messages/manual', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-messages'] });
    },
  });
}

export function useRunDailySummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/bot-messages/run-daily-summary');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-messages'] });
    },
  });
}



















