import { useMemo, useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { VideoJobDialog } from '@/components/VideoJobDialog';
import { useVideoJobs } from '@/hooks/useVideoJobs';
import { useStores } from '@/hooks/useStores';
import { useUsers } from '@/hooks/useUsers';

export default function VideoJobs() {
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    query: '',
  });
  const [open, setOpen] = useState(false);

  const { data } = useVideoJobs(filters);
  const { data: storesResp } = useStores();
  const { data: usersResp } = useUsers();

  const storeIdToName = useMemo(() => {
    const stores = (storesResp?.data || []).map((s: any) => ({ id: s.store_id, name: s.store_name }));
    const m = new Map<string, string>();
    for (const s of stores) m.set(s.id, s.name);
    return m;
  }, [storesResp]);

  const userIdToName = useMemo(() => {
    const users = (usersResp?.data || []).map((u: any) => ({ id: u.user_id, name: u.full_name }));
    const m = new Map<string, string>();
    for (const u of users) m.set(u.id, u.name);
    return m;
  }, [usersResp]);

  const rows = useMemo(() => {
    const list = data?.data || [];
    return list.map((v: any) => ({
      ...v,
      store_name: storeIdToName.get(v.store_id) || v.store_id,
      uploaded_by: userIdToName.get(v.uploaded_by) || v.uploaded_by,
    }));
  }, [data?.data, storeIdToName, userIdToName]);
  const total = data?.meta?.total || 0;

  const columns: Column<any>[] = [
    {
      key: 'job_date',
      label: '📅 Date',
      sortable: true,
      render: (row: any) => {
        const d = row.job_date ? new Date(row.job_date) : null;
        return d ? d.toLocaleDateString() : '-';
      },
    },
    {
      key: 'video_job_id',
      label: '🎬 Job ID',
      sortable: true,
      render: (row: any) => String(row.video_job_id || '-'),
    },
    {
      key: 'store_name',
      label: '🏪 Store',
      sortable: true,
      render: (row: any) => String(row.store_name || '-'),
    },
    {
      key: 'uploaded_by',
      label: '👤 Uploaded By',
      render: (row: any) => String(row.uploaded_by || '-'),
    },
    {
      key: 'video_type',
      label: '🎞️ Type',
      render: (row: any) => String(row.video_type || '-'),
    },
    {
      key: 'duration_sec',
      label: '⏱ Duration (s)',
      sortable: true,
      render: (row: any) => (row.duration_sec !== undefined && row.duration_sec !== null ? String(row.duration_sec) : '-'),
    },
    {
      key: 'upload_provider',
      label: '☁️ Provider',
      render: (row: any) => String(row.upload_provider || '-'),
    },
    {
      key: 'credits_per_job',
      label: '💳 Credits/Job',
      sortable: true,
      render: (row: any) =>
        row.credits_per_job !== undefined && row.credits_per_job !== null
          ? Number(row.credits_per_job).toFixed(2)
          : '-',
    },
    {
      key: 'my_cost_egp',
      label: '💰 Cost (EGP)',
      sortable: true,
      render: (row: any) =>
        row.my_cost_egp !== undefined && row.my_cost_egp !== null
          ? Number(row.my_cost_egp).toFixed(2)
          : '-',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-400 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Video Jobs</h1>
            <p className="text-sm text-white/80 mt-1">
              Manage and review all video processing jobs with detailed tracking.
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="bg-white text-purple-600 hover:bg-purple-100 font-semibold shadow-md transition-all hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Video Job
          </Button>
        </div>
      </div>

      {/* DATA CARD */}
      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-purple-700 text-xl font-semibold">All Video Jobs</CardTitle>
          <CardDescription className="text-purple-400 font-medium">
            Below is a list of recent and active video job records.
          </CardDescription>
        </CardHeader>

        <Separator className="bg-gradient-to-r from-purple-400 to-pink-400 h-[2px] my-1 rounded" />

        <CardContent>
          <div className="rounded-xl overflow-hidden border border-purple-100 shadow-sm bg-white/70 backdrop-blur-sm">
            <DataTable
              columns={columns}
              data={rows}
              currentPage={filters.page}
              totalPages={Math.ceil(total / filters.page_size)}
              onPageChange={(page) => setFilters({ ...filters, page })}
              searchable={true}
              onSearch={(q) => setFilters({ ...filters, page: 1, query: q })}
            />
          </div>
        </CardContent>
      </Card>
      <VideoJobDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
