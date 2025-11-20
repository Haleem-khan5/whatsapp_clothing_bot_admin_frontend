import { useMemo, useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useErrors } from '@/hooks/useErrors';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ErrorLogs() {
  const [filters] = useState<{ kind?: string }>({});
  const [logKind, setLogKind] = useState<'all' | 'error' | 'store_deletion'>('all');
  const effectiveFilters = useMemo(
    () =>
      logKind === 'all'
        ? filters
        : { ...filters, kind: logKind === 'error' ? 'error' : 'store_deletion' },
    [filters, logKind],
  );
  const { data, isLoading, isFetching, refetch } = useErrors(effectiveFilters);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const rows = useMemo(() => data?.data || [], [data?.data]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const arr = [...rows];
    arr.sort((a: any, b: any) => {
      const va = a[sortKey as any];
      const vb = b[sortKey as any];
      const dir = sortDir === 'asc' ? 1 : -1;
      const numA = typeof va === 'number' ? va : (typeof va === 'string' && va.trim() !== '' && !isNaN(Number(va)) ? Number(va) : NaN);
      const numB = typeof vb === 'number' ? vb : (typeof vb === 'string' && vb.trim() !== '' && !isNaN(Number(vb)) ? Number(vb) : NaN);
      if (Number.isFinite(numA) && Number.isFinite(numB)) return (numA - numB) * dir;
      const da = typeof va === 'string' ? Date.parse(va) : NaN;
      const db = typeof vb === 'string' ? Date.parse(vb) : NaN;
      if (Number.isFinite(da) && Number.isFinite(db)) return (da - db) * dir;
      return String(va ?? '').toLowerCase().localeCompare(String(vb ?? '').toLowerCase()) * dir;
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  const columns: Column<any>[] = [
    { key: 'error_id', label: '🆔 Error ID', sortable: true },
    { key: 'kind', label: '📂 Type', sortable: true },
    { key: 'store_name', label: '🏪 Store Name', sortable: true },
    { key: 'job_id', label: '🧩 Job ID', sortable: true },
    { key: 'media_type', label: '🖼️ Media Type', sortable: true },
    { key: 'stage', label: '🛠️ Stage', sortable: true },
    { key: 'provider', label: '🔌 Provider', sortable: true },
    {
      key: 'timestamp',
      label: '⏱ Timestamp (EG)',
      sortable: true,
      render: (row) =>
        row.timestamp
          ? new Date(row.timestamp).toLocaleString('en-EG', { timeZone: 'Africa/Cairo', year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : '-',
    },
    { key: 'error_message', label: '⚠️ Error Message' },
    { key: 'shopify_endpoint', label: '🛍️ Shopify Endpoint' },
    { key: 'http_status', label: '🌐 HTTP', sortable: true },
    { key: 'error_code', label: '🧾 Error Code', sortable: true },
    {
      key: 'retryable',
      label: '🔁 Retryable',
      sortable: true,
      render: (row) => (row.retryable === 'Y' ? 'Y' : 'N'),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Error Logs</h1>
            <p className="text-sm text-white/80 mt-1">Monitor processing and integration errors in real time.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full bg-white/20 p-1 text-xs font-medium">
              <button
                className={`px-3 py-1 rounded-full transition-colors ${
                  logKind === 'all' ? 'bg-white text-rose-600' : 'text-white/80'
                }`}
                onClick={() => setLogKind('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 rounded-full transition-colors ${
                  logKind === 'error' ? 'bg-white text-rose-600' : 'text-white/80'
                }`}
                onClick={() => setLogKind('error')}
              >
                Errors
              </button>
              <button
                className={`px-3 py-1 rounded-full transition-colors ${
                  logKind === 'store_deletion' ? 'bg-white text-rose-600' : 'text-white/80'
                }`}
                onClick={() => setLogKind('store_deletion')}
              >
                Store deletions
              </button>
            </div>
            <Button
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-white text-rose-600 hover:bg-rose-100 font-semibold shadow-md transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </div>
      </div>

      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-rose-50 to-amber-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-rose-700 text-xl font-semibold">Recent Errors</CardTitle>
          <CardDescription className="text-rose-400 font-medium">Newest entries first. Use column sorting to explore.</CardDescription>
        </CardHeader>
        <Separator className="bg-gradient-to-r from-rose-400 to-amber-400 h-[2px] my-1 rounded" />
        <CardContent>
          <div className="relative rounded-xl overflow-hidden border border-rose-100 shadow-sm bg-white/70 backdrop-blur-sm min-h-[260px]">
            {(isLoading || isFetching) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] z-10">
                <div className="flex items-center gap-2 text-rose-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isLoading ? 'Loading...' : 'Refreshing...'}</span>
                </div>
              </div>
            )}
            <DataTable
              columns={columns}
              data={sortedRows}
              onSort={(key, direction) => { setSortKey(key); setSortDir(direction); }}
              searchable={false}
              rowClassName="hover:bg-rose-50/80 transition-colors"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


