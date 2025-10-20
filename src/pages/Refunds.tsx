import { useMemo, useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { RefundDialog } from '@/components/RefundDialog';
import { useRefunds } from '@/hooks/useRefunds';
import { useStores } from '@/hooks/useStores';
import { useUsers } from '@/hooks/useUsers';

export default function Refunds() {
  const [filters, setFilters] = useState({ page: 1, page_size: 20 });
  const [open, setOpen] = useState(false);
  const { data, refetch } = useRefunds({ page: filters.page, page_size: filters.page_size });
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
  const rows = useMemo(() => (data?.data || []).map((r: any) => ({
    id: r.refund_id,
    refund_date: r.refund_date,
    store_name: storeIdToName.get(r.store_id) || r.store_id,
    job_type: r.job_type,
    job_name: r.job_name,
    num_of_jobs: r.num_of_jobs,
    credit_per_job: r.credit_per_job,
    amount_egp: r.amount_egp,
    reason: r.reason,
    received_by: userIdToName.get(r.received_by) || r.received_by,
  })), [data?.data, storeIdToName, userIdToName]);
  const total = data?.meta?.total || 0;

  const columns: Column<any>[] = [
    { key: 'refund_date', label: '📅 Date', sortable: true },
    { key: 'id', label: '💸 Refund ID', sortable: true },
    { key: 'store_name', label: '🏪 Store', sortable: true },
    { key: 'job_type', label: '🧰 Job Type' },
    { key: 'job_name', label: '🎞️ Job Name' },
    { key: 'num_of_jobs', label: '🔢 # Jobs', sortable: true },
    { key: 'credit_per_job', label: '💳 Credit/Job' },
    { key: 'amount_egp', label: '💰 Amount (EGP)', sortable: true },
    { key: 'reason', label: '📝 Reason' },
    { key: 'received_by', label: '👤 Issued By' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-400 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Refunds</h1>
            <p className="text-sm text-white/80 mt-1">
              Process, review, and manage all refund requests efficiently.
            </p>
          </div>
          <Button
            className="bg-white text-purple-600 hover:bg-purple-100 font-semibold shadow-md transition-all hover:scale-105"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Refund
          </Button>
        </div>
      </div>

      {/* DATA CARD */}
      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-purple-700 text-xl font-semibold">Refund Records</CardTitle>
          <CardDescription className="text-purple-400 font-medium">
            Below is the list of all processed and pending refunds.
          </CardDescription>
        </CardHeader>

        <Separator className="bg-gradient-to-r from-purple-400 to-pink-400 h-[2px] my-1 rounded" />

        <CardContent>
          <div className="rounded-xl overflow-hidden border border-purple-100 shadow-sm bg-white/70 backdrop-blur-sm">
            <DataTable
              columns={columns}
              data={rows}
              currentPage={filters.page}
              totalPages={Math.max(1, Math.ceil(total / filters.page_size))}
              onPageChange={(page) => setFilters({ ...filters, page })}
              searchable={false}
            />
          </div>
        </CardContent>
      </Card>
      <RefundDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) refetch();
        }}
      />
    </div>
  );
}
