import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DownloadRecord {
  download_id: string;
  store_id: string;
  store_name_cache?: string;
  most_recent_job?: string | null;
  last_download_at?: string | null;
  method: 'since_last_download_onward' | 'download_all' | 'custom_range';
  from_ts?: string | null;
  to_ts?: string | null;
  triggered_by?: string;
  created_at: string;
}

export interface DownloadFileDescriptor {
  url: string;
  filename: string;
}

export interface ListDownloadsParams {
  page?: number;
  page_size?: number;
  store_id?: string;
}

export interface CreateDownloadInput {
  store_id: string;
  store_name_cache?: string;
  method: 'since_last_download_onward' | 'download_all' | 'custom_range';
  from_ts?: string | null;
  to_ts?: string | null;
}

export function useDownloads(params?: ListDownloadsParams) {
  return useQuery({
    queryKey: ['downloads', params],
    queryFn: async () => {
      const response = await api.get('/downloads', { params });
      return response.data as { ok: boolean; data: DownloadRecord[]; meta: any };
    },
  });
}

export function useCreateDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDownloadInput) => {
      const response = await api.post('/downloads', payload);
      return response.data as {
        ok: boolean;
        data: { download_id: string; files?: DownloadFileDescriptor[]; urls?: string[] };
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    },
  });
}


