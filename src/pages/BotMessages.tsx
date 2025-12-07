import { useMemo, useState } from 'react';
import { DataTable, type Column } from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBotMessages, useRunDailySummary, useSendManualBotMessage } from '@/hooks/useBotMessages';
import { useStores } from '@/hooks/useStores';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageCircle, Send, Sparkles } from 'lucide-react';

export default function BotMessages() {
  const [filters, setFilters] = useState<{ store_id?: string; type?: string }>({});
  const { data, isLoading, isFetching, refetch } = useBotMessages(filters);
  const { data: storesData } = useStores();
  const { toast } = useToast();

  const [manualStoreId, setManualStoreId] = useState('');
  const [manualStoreSearch, setManualStoreSearch] = useState('');
  const [manualMessage, setManualMessage] = useState('');
  const [filterStoreSearch, setFilterStoreSearch] = useState('');

  const sendManualMutation = useSendManualBotMessage();
  const runDailyMutation = useRunDailySummary();

  const stores = useMemo(
    () =>
      ((storesData?.data || []) as any[]).map((s: any) => ({
        id: s.store_id,
        store_name: s.store_name,
      })),
    [storesData?.data],
  );

  const filteredManualStores = useMemo(() => {
    const q = manualStoreSearch.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter((s) => String(s.store_name || '').toLowerCase().includes(q));
  }, [manualStoreSearch, stores]);

  const filteredFilterStores = useMemo(() => {
    const q = filterStoreSearch.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter((s) => String(s.store_name || '').toLowerCase().includes(q));
  }, [filterStoreSearch, stores]);

  const selectedManualStoreName =
    stores.find((s) => s.id === manualStoreId)?.store_name || 'No store selected';

  const manualMessageLength = manualMessage.length;

  const rows = (data?.data || []).map((b: any) => ({
    ...b,
    created_at: b.created_at,
  }));

  const [sortKey, setSortKey] = useState<string | null>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const arr = [...rows];
    arr.sort((a: any, b: any) => {
      const va = a[sortKey as any];
      const vb = b[sortKey as any];
      const dir = sortDir === 'asc' ? 1 : -1;
      const da = typeof va === 'string' ? Date.parse(va) : NaN;
      const db = typeof vb === 'string' ? Date.parse(vb) : NaN;
      if (Number.isFinite(da) && Number.isFinite(db)) return (da - db) * dir;
      return String(va ?? '').toLowerCase().localeCompare(String(vb ?? '').toLowerCase()) * dir;
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  const columns: Column<any>[] = useMemo(
    () => [
      {
        key: 'created_at',
        label: '⏱ Sent At (EG)',
        sortable: true,
        render: (row) =>
          row.created_at
            ? new Date(row.created_at).toLocaleString('en-EG', {
                timeZone: 'Africa/Cairo',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-',
      },
      { key: 'store_name', label: '🏪 Store', sortable: true },
      { key: 'phone_e164', label: '📱 Phone', sortable: true },
      {
        key: 'message_type',
        label: '🧩 Type',
        sortable: true,
        render: (row) => {
          const t = String(row.message_type || '').toUpperCase();
          const label =
            t === 'TOP_UP' ? 'Top-Up' : t === 'DAILY_SUMMARY' ? 'Daily Summary' : t === 'MANUAL' ? 'Manual' : t;
          return <span>{label}</span>;
        },
      },
      {
        key: 'message_body',
        label: '💬 Message',
        sortable: false,
        render: (row) => (
          <div className="whitespace-pre-wrap text-sm leading-snug max-h-40 overflow-y-auto">
            {row.message_body}
          </div>
        ),
      },
    ],
    [],
  );

  const defaultVisibleColumns = useMemo(
    () => ['created_at', 'store_name', 'phone_e164', 'message_type', 'message_body'],
    [],
  );

  const handleSendManual = async () => {
    if (!manualStoreId) {
      toast({
        title: 'Select a store',
        description: 'Please choose a target store before sending a message.',
        variant: 'destructive',
      });
      return;
    }
    if (!manualMessage.trim()) {
      toast({
        title: 'Write a message',
        description: 'Message cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await sendManualMutation.mutateAsync({
        store_id: manualStoreId,
        message: manualMessage.trim(),
      });
      toast({
        title: 'Message queued',
        description: 'Bot will send your message to the store primary WhatsApp number.',
      });
      setManualMessage('');
    } catch (err: any) {
      const apiError = err?.response?.data?.error;
      toast({
        title: 'Failed to send',
        description: apiError?.message || 'Bot could not send this message. Please check logs or try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRunDailySummary = async () => {
    try {
      const res = await runDailyMutation.mutateAsync();
      const count = res?.data?.stores_messaged?.length ?? 0;
      toast({
        title: 'Daily summary executed',
        description: `Bot attempted summaries for ${count} store(s).`,
      });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Failed to run daily summary',
        description: err?.response?.data?.error?.message || 'Please check server logs.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Bot Messages</h1>
              <p className="text-sm text-white/80 mt-1">
                View all automated bot messages and manually notify stores via WhatsApp.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRunDailySummary}
              disabled={runDailyMutation.isLoading}
              className="bg-white text-purple-700 hover:bg-purple-100 font-semibold shadow-md transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {runDailyMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run Daily Summary Now
                </>
              )}
            </Button>
            <Button
              onClick={() => refetch()}
              disabled={isFetching}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
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

      {/* SEND MANUAL MESSAGE CARD */}
      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-indigo-50 to-pink-50 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-indigo-700 text-xl font-semibold">
            <Send className="h-5 w-5" />
            Send Manual Message
          </CardTitle>
          <CardDescription className="flex items-center gap-2 text-indigo-400 font-medium">
            <Badge variant="outline" className="border-indigo-300 text-indigo-600 bg-white/70">
              Goes to store primary WhatsApp number
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] items-start">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Target Store</label>
              <Select value={manualStoreId} onValueChange={setManualStoreId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <div className="px-2 pb-2 sticky top-0 bg-white z-10">
                    <Input
                      placeholder="Search stores..."
                      value={manualStoreSearch}
                      onChange={(e) => setManualStoreSearch(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  {filteredManualStores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.store_name}
                    </SelectItem>
                  ))}
                  {filteredManualStores.length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-500">No stores match your search.</div>
                  )}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500">
                Selected:{' '}
                <span className="font-semibold text-gray-700">
                  {selectedManualStoreName}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Message</span>
                <span className="text-xs text-gray-500">
                  {manualMessageLength} / 1000
                </span>
              </div>
              <Textarea
                value={manualMessage}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) setManualMessage(e.target.value);
                }}
                placeholder="Write a message that will be sent via the bot to the store’s primary WhatsApp number..."
                className="min-h-[120px] resize-vertical bg-white"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setManualStoreId('');
                    setManualMessage('');
                    setManualStoreSearch('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  onClick={handleSendManual}
                  disabled={sendManualMutation.isLoading}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-md flex items-center gap-2"
                >
                  {sendManualMutation.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send via Bot
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FILTERS + LOG TABLE */}
      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-slate-800 text-xl font-semibold">Message Logs</CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            All bot messages – Top-Ups, Daily Summaries, and Manual messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium text-slate-600">Store</label>
              <Select
                value={filters.store_id || ''}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    store_id: v === '__all_stores__' ? undefined : v,
                  }))
                }
              >
                <SelectTrigger className="bg-white h-9 text-sm">
                  <SelectValue placeholder="All stores" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <div className="px-2 pb-2 sticky top-0 bg-white z-10">
                    <Input
                      placeholder="Search stores..."
                      value={filterStoreSearch}
                      onChange={(e) => setFilterStoreSearch(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <SelectItem value="__all_stores__">All stores</SelectItem>
                  {filteredFilterStores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.store_name}
                    </SelectItem>
                  ))}
                  {filteredFilterStores.length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-500">No stores match your search.</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-xs font-medium text-slate-600">Type</label>
              <Select
                value={filters.type || ''}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: v === '__all_types__' ? undefined : v,
                  }))
                }
              >
                <SelectTrigger className="bg-white h-9 text-sm">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all_types__">All types</SelectItem>
                  <SelectItem value="TOP_UP">Top-Up</SelectItem>
                  <SelectItem value="DAILY_SUMMARY">Daily Summary</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm min-h-[260px]">
            {(isLoading || isFetching) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2 text-slate-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isLoading ? 'Loading...' : 'Refreshing...'}</span>
                </div>
              </div>
            )}
            <DataTable
              columns={columns}
              data={sortedRows}
              defaultVisibleColumns={defaultVisibleColumns}
              onSort={(key, direction) => {
                setSortKey(key);
                setSortDir(direction);
              }}
              searchable={false}
              rowClassName="hover:bg-slate-50 transition-colors"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

