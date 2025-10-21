import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable, Column } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';
import { useStores } from '@/hooks/useStores';
import { useUsers } from '@/hooks/useUsers';
import { useDownloads, useCreateDownload } from '@/hooks/useDownloads';
import { useToast } from '@/components/ui/use-toast';

export default function Downloads() {
  const [storeId, setStoreId] = useState<string>('');
  const [method, setMethod] = useState<'since_last_download_onward' | 'download_all' | 'custom_range'>('since_last_download_onward');
  const [fromTs, setFromTs] = useState<string>('');
  const [toTs, setToTs] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;
  const { toast } = useToast();

  const { data: storesResp } = useStores();
  const { data: usersResp } = useUsers();
  const { data: downloadsResp, refetch, isFetching } = useDownloads({ page, page_size: pageSize });
  const createMutation = useCreateDownload();

  const stores = (storesResp?.data || []).map((s: any) => ({ id: s.store_id, name: s.store_name }));
  const userIdToName = useMemo(() => {
    const list = (usersResp?.data || []).map((u: any) => ({ id: u.user_id, name: u.full_name }));
    const m = new Map<string, string>();
    for (const it of list) m.set(it.id, it.name);
    return m;
  }, [usersResp]);
  const storeIdToName = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of stores) m.set(s.id, s.name);
    return m;
  }, [stores]);

  const rows = (downloadsResp?.data || []).map((d: any) => ({
    id: d.download_id,
    store_id: storeIdToName.get(d.store_id) || d.store_name_cache || d.store_id,
    most_recent_job: d.most_recent_job || '-',
    last_download_at: d.last_download_at || '-',
    method: d.method,
    triggered_by: userIdToName.get(d.triggered_by) || d.triggered_by || '-',
    created_at: d.created_at,
  }));

  const total = downloadsResp?.meta?.total || rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns: Column<any>[] = [
    { key: 'store_id', label: '🏪 Store', sortable: true },
    { key: 'most_recent_job', label: '🕓 Most Recent Job' },
    { key: 'last_download_at', label: '⬇️ Last Download' },
    { key: 'method', label: '⚙️ Method' },
    { key: 'triggered_by', label: '👤 Triggered By' },
    { key: 'created_at', label: '📅 Created At', sortable: true },
  ];

  const handleDownload = async () => {
    if (!storeId) {
      toast({ title: 'Select a store', description: 'Please choose a store to generate a download.' });
      return;
    }
    if (method === 'custom_range' && (!fromTs || !toTs)) {
      toast({ title: 'Provide date range', description: 'Please select From and To timestamps.' });
      return;
    }
    try {
      const resp = await createMutation.mutateAsync({
        store_id: storeId,
        store_name_cache: storeIdToName.get(storeId),
        method,
        from_ts: method === 'custom_range' ? new Date(fromTs).toISOString() : undefined,
        to_ts: method === 'custom_range' ? new Date(toTs).toISOString() : undefined,
      });
      const files = (resp?.data as any)?.files as { url: string; filename: string }[] | undefined;
      const urls = resp?.data?.urls || [];
      const hasFiles = Array.isArray(files) && files.length > 0;
      const total = hasFiles ? files!.length : urls.length;
      if (total === 0) {
        toast({ title: 'No images to download', description: 'No images matched the selected method.' });
      } else {
        // Prefer using files (with filenames). Fallback to plain URLs.
        if (hasFiles) {
          for (const f of files!) {
            try {
              const res = await fetch(f.url, { credentials: 'include' });
              const blob = await res.blob();
              const objectUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = objectUrl;
              a.download = f.filename || '';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(objectUrl);
            } catch {}
          }
        } else {
          for (let i = 0; i < urls.length; i++) {
            const a = document.createElement('a');
            a.href = urls[i];
            a.download = '';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        }
        toast({ title: 'Downloads started', description: `${total} files are downloading.` });
      }
      refetch();
    } catch (e: any) {
      toast({ title: 'Failed to generate', description: e?.message || 'Please try again.' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-400 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Downloads</h1>
            <p className="text-sm text-white/80 mt-1">
              Generate and manage downloadable image or video job batches.
            </p>
          </div>
        </div>
      </div>

      {/* CREATE DOWNLOAD CARD */}
      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-purple-700 text-xl font-semibold">Create Download</CardTitle>
          <CardDescription className="text-purple-400 font-medium">
            Choose a store and download method to generate export data.
          </CardDescription>
        </CardHeader>

        <Separator className="bg-gradient-to-r from-purple-400 to-pink-400 h-[2px] my-1 rounded" />

        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Store</Label>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger className="bg-white shadow-sm">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Download Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as any)}>
                <SelectTrigger className="bg-white shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="since_last_download_onward">Since Last Download</SelectItem>
                  <SelectItem value="download_all">Download All</SelectItem>
                  <SelectItem value="custom_range">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {method === 'custom_range' && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">From</Label>
                <Input type="datetime-local" className="bg-white shadow-sm" value={fromTs} onChange={(e) => setFromTs(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">To</Label>
                <Input type="datetime-local" className="bg-white shadow-sm" value={toTs} onChange={(e) => setToTs(e.target.value)} />
              </div>
            </div>
          )}

          <Button
            onClick={handleDownload}
            disabled={createMutation.isPending || !storeId}
            className="w-full bg-purple-600 hover:bg-pink-500 text-white font-semibold shadow-md hover:scale-[1.03] transition-all disabled:opacity-60"
          >
            <Download className="mr-2 h-4 w-4" />
            {createMutation.isPending ? 'Generating…' : 'Generate Download'}
          </Button>
        </CardContent>
      </Card>

      {/* DOWNLOAD HISTORY */}
      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-purple-700 text-xl font-semibold">Download History</CardTitle>
          <CardDescription className="text-purple-400 font-medium">View the history of generated downloads for each store.</CardDescription>
        </CardHeader>

        <Separator className="bg-gradient-to-r from-purple-400 to-pink-400 h-[2px] my-1 rounded" />

        <CardContent>
          <div className="rounded-xl overflow-hidden border border-purple-100 shadow-sm bg-white/70 backdrop-blur-sm">
            <DataTable
              columns={columns}
              data={rows}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(Math.max(1, Math.min(totalPages, p)))}
              searchable={false}
              rowClassName="hover:bg-purple-50/80 transition-colors"
            />
          </div>
          {isFetching && <p className="text-sm text-muted-foreground mt-2">Loading…</p>}
        </CardContent>
      </Card>
    </div>
  );
}
