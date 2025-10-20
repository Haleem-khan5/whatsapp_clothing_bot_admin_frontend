import { useMemo, useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useStores } from '@/hooks/useStores';
import { usePaymentFor, usePaymentMethod } from '@/hooks/useLookups';
import { useUsers } from '@/hooks/useUsers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TransactionDialog } from '@/components/TransactionDialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Transactions() {
  const [filters, setFilters] = useState({ page: 1, page_size: 20 });
  const [storeId, setStoreId] = useState<string | undefined>(undefined);
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { isAdmin } = useAuth();
  const { data: storesResp } = useStores();
  const { data: pfResp } = usePaymentFor();
  const { data: pmResp } = usePaymentMethod();
  const { data: usersResp } = useUsers();
  const stores = (storesResp?.data || []).map((s: any) => ({ id: s.store_id, name: s.store_name }));
  const storeIdToName = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of stores) m.set(s.id, s.name);
    return m;
  }, [stores]);
  const pfIdToName = useMemo(() => {
    const list = (pfResp?.data || []).map((p: any) => ({ id: p.payment_for_id, name: p.payment_for_name }));
    const m = new Map<string, string>();
    for (const p of list) m.set(p.id, p.name);
    return m;
  }, [pfResp]);
  const pmIdToName = useMemo(() => {
    const list = (pmResp?.data || []).map((mth: any) => ({ id: mth.payment_method_id, name: mth.payment_method_name }));
    const m = new Map<string, string>();
    for (const it of list) m.set(it.id, it.name);
    return m;
  }, [pmResp]);
  const userIdToName = useMemo(() => {
    const list = (usersResp?.data || []).map((u: any) => ({ id: u.user_id, name: u.full_name }));
    const m = new Map<string, string>();
    for (const u of list) m.set(u.id, u.name);
    return m;
  }, [usersResp]);
  const params = useMemo(() => ({ store_id: storeId, from, to }), [storeId, from, to]);
  const { data, refetch } = useTransactions(params);

  const rows = (data?.data || []).map((t: any) => ({
    id: t.txn_id,
    txn_date: t.txn_date,
    store_name: storeIdToName.get(t.store_id) || t.store_id,
    payment_for: pfIdToName.get(t.payment_for_id) || t.payment_for_id,
    amount_egp: t.amount_egp,
    payment_method: pmIdToName.get(t.payment_method_id) || t.payment_method_id,
    payment_reference_url: t.payment_reference_url,
    received_by: userIdToName.get(t.received_by) || t.received_by,
  }));

  const filteredRows = rows.filter((r: any) =>
    (r.store_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<any>[] = [
    { key: 'txn_date', label: '📅 Date', sortable: true },
    { key: 'id', label: '🧾 Txn ID', sortable: true },
    { key: 'store_name', label: '🏪 Store', sortable: true },
    { key: 'payment_for', label: '💳 Payment For' },
    { key: 'amount_egp', label: '💰 Amount (EGP)', sortable: true },
    { key: 'payment_method', label: '💼 Method' },
    {
      key: 'payment_reference_url',
      label: '🧾 Receipt',
      render: (row) =>
        row.payment_reference_url ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all"
            asChild
          >
            <a href={row.payment_reference_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ) : (
          '-'
        ),
    },
    { key: 'received_by', label: '👤 Received By' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-400 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Transactions</h1>
            <p className="text-sm text-white/80 mt-1">
              View, filter, and manage all transaction history across stores.
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-white text-purple-600 hover:bg-purple-100 font-semibold shadow-md transition-all hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <Card className="bg-gradient-to-br from-white via-purple-50 to-pink-50 border-none shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-purple-700 text-lg font-semibold">Filters</CardTitle>
          <CardDescription className="text-purple-400 font-medium">
            Filter transactions by store, date, or search keyword.
          </CardDescription>
        </CardHeader>
        <Separator className="bg-gradient-to-r from-purple-400 to-pink-400 h-[2px] my-1 rounded" />
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-700 font-medium">Store</label>
              <Select
                value={storeId ?? '__ALL__'}
                onValueChange={(v) => setStoreId(v === '__ALL__' ? undefined : v)}
              >
                <SelectTrigger className="w-[220px] bg-white shadow-sm">
                  <SelectValue placeholder="All stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ALL__">All stores</SelectItem>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-700 font-medium">From</label>
              <Input
                type="date"
                className="h-9 bg-white shadow-sm"
                value={from || ''}
                onChange={(e) => setFrom(e.target.value || undefined)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-700 font-medium">To</label>
              <Input
                type="date"
                className="h-9 bg-white shadow-sm"
                value={to || ''}
                onChange={(e) => setTo(e.target.value || undefined)}
              />
            </div>

            <div className="space-y-1 w-[220px]">
              <label className="text-sm text-gray-700 font-medium">Search Store</label>
              <Input
                type="text"
                placeholder="Type store name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 bg-white shadow-sm"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => refetch()}
              className="border-purple-400 text-purple-700 hover:bg-purple-100 hover:text-purple-800 transition-all"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TRANSACTION TABLE */}
      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-purple-700 text-xl font-semibold">
            Transaction Records
          </CardTitle>
          <CardDescription className="text-purple-400 font-medium">
            Below is the list of transactions recorded in the system.
          </CardDescription>
        </CardHeader>
        <Separator className="bg-gradient-to-r from-purple-400 to-pink-400 h-[2px] my-1 rounded" />

        <CardContent>
          <div className="rounded-xl overflow-hidden border border-purple-100 shadow-sm bg-white/70 backdrop-blur-sm">
            <DataTable
              columns={columns}
              data={filteredRows}
              currentPage={filters.page}
              totalPages={1}
              onPageChange={(page) => setFilters({ ...filters, page })}
              searchable={false}
              rowClassName="hover:bg-purple-50/80 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) refetch();
        }}
      />
    </div>
  );
}
