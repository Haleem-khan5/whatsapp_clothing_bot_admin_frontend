import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ImageJob {
  job_id: string;
  store_id: string;
  phone_id: string;
  timestamp: string;
  original_file_url?: string;
  front_pose_url?: string;
  diff_pose_url?: string;
  third_pose_url?: string;
  raw_pose1_url?: string;
  time_received?: string;
  time_finished?: string;
  processing_time_sec?: number;
  tokens_used?: number;
  cost_per_token?: number;
  usd_to_egp_rate?: number;
  my_cost_egp?: number;
  status_front?: string;
  status_diff?: string;
  error_code?: string;
  ready_for_publish?: boolean;
  publish_status?: string;
  publish_time?: string;
}

export interface ImageJobsFilters {
  store_id?: string;
  phone_id?: string;
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  page_size?: number;
}

export function useImageJobs(filters?: ImageJobsFilters) {
  return useQuery({
    queryKey: ['image-jobs', filters],
    queryFn: async () => {
      const response = await api.get('/image-jobs', { params: filters });
      return response.data;
    },
  });
}

export function useImageJob(jobId: string) {
  return useQuery({
    queryKey: ['image-job', jobId],
    queryFn: async () => {
      const response = await api.get(`/image-jobs/${jobId}`);
      return response.data;
    },
    enabled: !!jobId,
  });
}
