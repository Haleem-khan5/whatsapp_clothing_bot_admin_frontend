import { useMemo, useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { useImageJobs } from '@/hooks/useImageJobs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useStores } from '@/hooks/useStores';

export default function ImageJobs() {
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
  });

  const { data, isLoading } = useImageJobs(filters);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const { data: storesResp } = useStores();
  const storeIdToName = useMemo(() => {
    const stores = (storesResp?.data || []).map((s: any) => ({ id: s.store_id, name: s.store_name }));
    const m = new Map<string, string>();
    for (const s of stores) m.set(s.id, s.name);
    return m;
  }, [storesResp]);

  const rows = useMemo(() => {
    const list = data?.data || [];
    return list.map((j: any) => ({
      ...j,
      store_name: storeIdToName.get(j.store_id) || j.store_id,
    }));
  }, [data?.data, storeIdToName]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const arr = [...rows];
    arr.sort((a: any, b: any) => {
      const va = a[sortKey as any];
      const vb = b[sortKey as any];
      const dir = sortDir === 'asc' ? 1 : -1;
      // Numeric sort (numbers or numeric-like strings)
      const numA = typeof va === 'number' ? va : (typeof va === 'string' && va.trim() !== '' && !isNaN(Number(va)) ? Number(va) : NaN);
      const numB = typeof vb === 'number' ? vb : (typeof vb === 'string' && vb.trim() !== '' && !isNaN(Number(vb)) ? Number(vb) : NaN);
      if (Number.isFinite(numA) && Number.isFinite(numB)) {
        return (numA - numB) * dir;
      }
      // Date strings
      const da = typeof va === 'string' ? Date.parse(va) : NaN;
      const db = typeof vb === 'string' ? Date.parse(vb) : NaN;
      if (Number.isFinite(da) && Number.isFinite(db)) {
        return (da - db) * dir;
      }
      // Alphabetical
      const sa = String(va ?? '').toLowerCase();
      const sb = String(vb ?? '').toLowerCase();
      return sa.localeCompare(sb) * dir;
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  const columns: Column<any>[] = [
    { key: 'job_id', label: '🆔 Job ID', sortable: true },
    { key: 'store_name', label: '🏪 Store', sortable: true },
    {
      key: 'timestamp',
      label: '⏱ Timestamp (EG)',
      sortable: true,
      render: (row) =>
        row.timestamp
          ? new Date(row.timestamp).toLocaleString('en-EG', {
              timeZone: 'Africa/Cairo',
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          : '-',
    },
    {
      key: 'original_file_url',
      label: '📷 Original',
      render: (row) =>
        row.original_file_url ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all"
            asChild
          >
            <a href={row.original_file_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ) : (
          '-'
        ),
    },
    {
      key: 'front_pose_url',
      label: '💠 Front Pose',
      render: (row) =>
        row.front_pose_url ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all"
            asChild
          >
            <a href={row.front_pose_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ) : (
          '-'
        ),
    },
    {
      key: 'diff_pose_url',
      label: '🔁 Different Pose',
      render: (row) =>
        row.diff_pose_url ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all"
            asChild
          >
            <a href={row.diff_pose_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ) : (
          '-'
        ),
    },
    { key: 'processing_time_sec', label: '⚙️ Processing Time (s)', sortable: true },
    { key: 'tokens_used', label: '🔢 Tokens Used', sortable: true },
    { key: 'cost_per_token_usd', label: '💵 Cost/Token (USD)', sortable: true },
    { key: 'usd_to_egp', label: '💱 USD/EGP', sortable: true },
    { key: 'my_cost_egp', label: '💰 My Cost (EGP)', sortable: true },
    {
      key: 'status_front',
      label: '📦 Front Status',
      render: (row) => (
        <Badge
          variant={row.status_front === 'success' ? 'default' : row.status_front === 'failure' ? 'destructive' : 'secondary'}
          className={
            row.status_front === 'success'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : row.status_front === 'failure'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gray-300 text-gray-700'
          }
        >
          {row.status_front || 'pending'}
        </Badge>
      ),
    },
    {
      key: 'status_diff',
      label: '📦 Diff Status',
      render: (row) => (
        <Badge
          variant={row.status_diff === 'success' ? 'default' : row.status_diff === 'failure' ? 'destructive' : 'secondary'}
          className={
            row.status_diff === 'success'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : row.status_diff === 'failure'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gray-300 text-gray-700'
          }
        >
          {row.status_diff || 'pending'}
        </Badge>
      ),
    },
    { key: 'error_code', label: '⚠️ Error Code', sortable: true },
    {
      key: 'ready_for_publish',
      label: '🚀 Ready',
      render: (row) => (
        <Badge
          variant={row.ready_for_publish ? 'default' : 'secondary'}
          className={
            row.ready_for_publish
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-700'
          }
        >
          {row.ready_for_publish ? 'Yes' : 'No'}
        </Badge>
      ),
    },
  ];

  const handleExport = () => {
    console.log('Export data');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-400 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Image Jobs</h1>
            <p className="text-sm text-white/80 mt-1">
              View and manage all image processing jobs in one place.
            </p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-white text-purple-600 hover:bg-purple-100 font-semibold shadow-md transition-all hover:scale-105"
          >
            Export Data
          </Button>
        </div>
      </div>

      {/* TABLE CARD */}
      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-purple-700 text-xl font-semibold">Job Records</CardTitle>
          <CardDescription className="text-purple-400 font-medium">
            Below is the list of image jobs processed by the system.
          </CardDescription>
        </CardHeader>

        <Separator className="bg-gradient-to-r from-purple-400 to-pink-400 h-[2px] my-1 rounded" />

        <CardContent>
          <div className="rounded-xl overflow-hidden border border-purple-100 shadow-sm bg-white/70 backdrop-blur-sm">
            <DataTable
              columns={columns}
              data={sortedRows}
              currentPage={filters.page}
              totalPages={Math.ceil((data?.meta?.total || 0) / filters.page_size)}
              onPageChange={(page) => setFilters({ ...filters, page })}
              onExport={handleExport}
              onSort={(key, direction) => { setSortKey(key); setSortDir(direction); }}
              searchable={false}
              rowClassName="hover:bg-purple-50/80 transition-colors"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
