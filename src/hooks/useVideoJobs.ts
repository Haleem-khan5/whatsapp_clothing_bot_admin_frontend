import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface VideoJob {
  video_job_id: string;
  job_date: string; // date (YYYY-MM-DD)
  store_id: string;
  uploaded_by: string;
  video_type?: string;
  duration_sec: number;
  upload_provider?: string;
  credits_per_job: number;
  my_cost_egp: number;
  source_url?: string;
  processed_url?: string;
  created_at?: string;
}

export interface VideoJobsFilters {
  store_id?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  page?: number;
  page_size?: number;
}

export function useVideoJobs(filters?: VideoJobsFilters) {
  return useQuery({
    queryKey: ['video-jobs', filters],
    queryFn: async () => {
      const response = await api.get('/video-jobs', { params: filters });
      return response.data;
    },
  });
}

export function useCreateVideoJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<VideoJob>) => {
      const response = await api.post('/video-jobs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
    },
  });
}




