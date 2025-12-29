import { useMemo, useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { StoreDialog } from '@/components/StoreDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MoreHorizontal, Search } from 'lucide-react';
import { useStores, useUpdateStore, useDeleteStore } from '@/hooks/useStores';
import { useToast } from '@/hooks/use-toast';
import { usePackages } from '@/hooks/usePackages';
import { usePrompts } from '@/hooks/usePrompts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type LastActiveFilter = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'all';

export default function Stores() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Default to showing ALL stores; user can then narrow by "Today/This Week/etc."
  const [lastActiveFilter, setLastActiveFilter] = useState<LastActiveFilter>('all');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<any>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { data } = useStores();
  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();
  const { toast } = useToast();

  const { data: packagesResp } = usePackages();
  const { data: promptsResp } = usePrompts('global');

  const packageList: any[] = packagesResp?.data || [];
  const packageIdToName: Record<string, string> = Object.fromEntries(
    packageList.map((p: any) => [p.package_id, p.name])
  );

  const promptsList: any[] = promptsResp?.data || [];
  const promptIdToName: Record<string, string> = Object.fromEntries(
    promptsList.map((p: any) => [p.prompt_id, p.name])
  );
  const promptTextToName: Record<string, string> = Object.fromEntries(
    promptsList.map((p: any) => [String(p.prompt_text || '').toLowerCase(), p.name])
  );

  function formatDateShort(d: string | Date | null | undefined): string {
    if (!d) return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (!date || isNaN(date.getTime())) return '—';
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const yy = String(date.getFullYear()).slice(-2);
    return `${month}-${day}-${yy}`;
  }

  function formatDateTimeShort(
    d: string | Date | null | undefined,
    tz: string = 'Africa/Cairo'
  ): string {
    if (!d) return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (!date || isNaN(date.getTime())) return '—';
    const datePart = formatDateShort(date);
    const timePart = date.toLocaleString('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart}, ${timePart}`;
  }

  function formatInt(n: any): string {
    const num = Number(n || 0);
    if (!isFinite(num)) return '0';
    return Math.trunc(num).toLocaleString('en-US');
  }

  function isToday(dt: Date) {
    const now = new Date();
    return (
      dt.getFullYear() === now.getFullYear() &&
      dt.getMonth() === now.getMonth() &&
      dt.getDate() === now.getDate()
    );
  }

  function isYesterday(dt: Date) {
    const now = new Date();
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    return (
      dt.getFullYear() === y.getFullYear() &&
      dt.getMonth() === y.getMonth() &&
      dt.getDate() === y.getDate()
    );
  }

  function startOfWeek(d: Date) {
    // Monday start
    const x = new Date(d);
    const day = (x.getDay() + 6) % 7; // 0 = Monday
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - day);
    return x;
  }

  function inThisWeek(dt: Date) {
    const now = new Date();
    const s = startOfWeek(now);
    const e = new Date(s);
    e.setDate(s.getDate() + 7);
    return dt >= s && dt < e;
  }

  function inThisMonth(dt: Date) {
    const now = new Date();
    return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
  }

  const stores = useMemo(() => {
    return (data?.data || []).map((s: any) => {
      const basePackageName =
        s.package_id && packageIdToName[s.package_id]
          ? packageIdToName[s.package_id]
          : 'Trial';

      const imgCost = Number(s.image_jobs_cost_egp || 0);
      const freeTrialLimit = 200; // 200 EGP free trial credit

      // Stay in "Trial" until we've spent at least 200 EGP on image jobs,
      // regardless of top-ups or selected package.
      const effectivePackage =
        imgCost < freeTrialLimit ? 'Trial' : basePackageName || 'Trial';

      return {
        id: s.store_id,
        store_number: s.store_number,
        store_name: s.store_name,
        store_kind: s.store_kind,
        address: s.address,
        registration_date: s.registration_date,
        max_images_per_hour: s.max_images_per_hour,
        max_images_per_msg: s.max_images_per_msg,
        is_paused: s.is_paused,
        credit_remaining_egp: s.credit_remaining_egp,
        remaining_quota_images: s.remaining_quota_images,
        total_top_ups_egp: s.total_top_ups_egp,
        transactions_count: s.transactions_count,
        image_jobs_count: s.image_jobs_count,
        video_jobs_count: s.video_jobs_count,
        image_jobs_cost_egp: s.image_jobs_cost_egp,
        video_jobs_cost_egp: s.video_jobs_cost_egp,
        last_active_at: s.last_active_at,
        whatsapp_numbers_count: s.whatsapp_numbers_count,
        refunded_jobs_count: s.refunded_jobs_count,
        refunds_egp: s.refunds_egp,
        per_image_credit: s.per_image_credit,
        package_id: s.package_id,
        prompt1_id: (s as any).prompt1_id,
        prompt_1: s.prompt_1,
        prompt_name:
          (((s as any).prompt1_id && promptIdToName[(s as any).prompt1_id]) ||
            (s.prompt_1 ? promptTextToName[String(s.prompt_1).toLowerCase()] : null) ||
            '—') ?? '—',
        package: effectivePackage,
      };
    });
  }, [data, packageIdToName, promptIdToName, promptTextToName]);

  // Helper to decide if a date falls into the selected Last Active filter window.
  const inFilterRange = (raw: string | Date | null | undefined, filter: LastActiveFilter): boolean => {
    if (filter === 'all') return true;
    if (!raw) return false;
    const dt = typeof raw === 'string' ? new Date(raw) : raw;
    if (!dt || isNaN(dt.getTime())) return false;

    if (filter === 'today') return isToday(dt);
    if (filter === 'yesterday') return isYesterday(dt);
    if (filter === 'this_week') return inThisWeek(dt);
    if (filter === 'this_month') return inThisMonth(dt);
    return true;
  };

  // Top summary stats:
  // - Total stores registered: stores whose registration_date is in the selected period (or all, if "All").
  // - Total Active stores: stores whose last_active_at is in the selected period AND not paused.
  // - Total inactive (this period): ALL registered stores (overall) - active_in_period.
  const totals = useMemo(() => {
    const totalRegisteredOverall = stores.length;

    const registeredInPeriod = stores.filter((s) =>
      lastActiveFilter === 'all' ? true : inFilterRange(s.registration_date, lastActiveFilter)
    );

    const activeInRange = stores.filter((s) => {
      if (s.is_paused) return false;
      if (lastActiveFilter === 'all') {
        // For "All", treat any store with a last_active_at as active.
        return !!s.last_active_at && !isNaN(new Date(s.last_active_at).getTime());
      }
      return inFilterRange(s.last_active_at, lastActiveFilter);
    });

    const active = activeInRange.length;
    const total = registeredInPeriod.length;
    const inactive = Math.max(0, totalRegisteredOverall - active);
    return { total, active, inactive };
  }, [stores, lastActiveFilter]);

  // Table rows respect the Last Active filter on last_active_at, then search is applied.
  let filteredStores = stores.filter((s) => inFilterRange(s.last_active_at, lastActiveFilter));

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredStores = filteredStores.filter((s) => String(s.store_name || '').toLowerCase().includes(q));
  }

  // Local sorting (kept)
  if (sortKey) {
    filteredStores = [...filteredStores].sort((a: any, b: any) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const dir = sortDir === 'asc' ? 1 : -1;

      const numA =
        typeof va === 'number'
          ? va
          : typeof va === 'string' && va.trim() !== '' && !isNaN(Number(va))
            ? Number(va)
            : NaN;
      const numB =
        typeof vb === 'number'
          ? vb
          : typeof vb === 'string' && vb.trim() !== '' && !isNaN(Number(vb))
            ? Number(vb)
            : NaN;
      if (Number.isFinite(numA) && Number.isFinite(numB)) return (numA - numB) * dir;

      if (typeof va === 'boolean' && typeof vb === 'boolean')
        return ((va === vb ? 0 : va ? 1 : -1) as number) * dir;

      const da = typeof va === 'string' ? Date.parse(va) : NaN;
      const db = typeof vb === 'string' ? Date.parse(vb) : NaN;
      if (Number.isFinite(da) && Number.isFinite(db)) return (da - db) * dir;

      const sa = String(va ?? '').toLowerCase();
      const sb = String(vb ?? '').toLowerCase();
      return sa.localeCompare(sb) * dir;
    });
  }

  const handleEdit = (store: any) => {
    setSelectedStore(store);
    setDialogOpen(true);
  };

  const handleTogglePause = async (store: any) => {
    try {
      await updateStore.mutateAsync({ id: store.id, data: { is_paused: !store.is_paused } });
      toast({
        title: store.is_paused ? 'Store resumed' : 'Store paused',
        description: `${store.store_name} is now ${store.is_paused ? 'Active' : 'Paused'}.`,
      });
    } catch (e: any) {
      toast({
        title: 'Update failed',
        description: e?.response?.data?.message || 'Could not update store status.',
        variant: 'destructive',
      });
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const handleAddNew = () => {
    setSelectedStore(null);
    setDialogOpen(true);
  };

  // Columns order is intentionally aligned with the screenshot so we can style header bands via CSS nth-child.
  const columns: Column<any>[] = [
    { key: 'store_number', label: 'St. #', sortable: true, render: (row) => row.store_number ?? '—' },
    { key: 'store_name', label: 'Store Name', sortable: true },
    {
      key: 'registration_date',
      label: 'Registered',
      sortable: true,
      render: (row) => formatDateShort(row.registration_date),
    },
    {
      key: 'package',
      label: 'Package',
      sortable: true,
      render: (row) => {
        const label = String(row.package || 'Trial');
        const lower = label.toLowerCase();

        let bg = '#e5e7eb'; // Trial (gray)
        let text = '#111827';

        if (lower.includes('basic')) {
          bg = '#bfdbfe'; // light blue
        } else if (lower.includes('pro')) {
          bg = '#bbf7d0'; // light green
        } else if (lower.includes('elite')) {
          bg = '#e9d5ff'; // light purple
        }

        return (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: bg, color: text }}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: 'credit_per_job',
      label: 'Credits/Job',
      sortable: true,
      render: (row) => formatInt(row.per_image_credit),
    },
    {
      key: 'active_status',
      label: 'Active',
      sortable: true,
      render: (row) => {
        if (row.is_paused) {
          return <span className="text-xs font-medium text-slate-500">Paused</span>;
        }
        const dt = row.last_active_at ? new Date(row.last_active_at) : null;
        if (!dt || isNaN(dt.getTime())) {
          return <span className="text-xs font-medium text-slate-400">—</span>;
        }

        const now = new Date();
        const msPerDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.floor((now.getTime() - dt.getTime()) / msPerDay);

        let label: string;
        if (diffDays <= 0 && isToday(dt)) {
          label = 'Today';
        } else if (diffDays === 1 || isYesterday(dt)) {
          label = 'Yesterday';
        } else {
          label = `${diffDays} days ago`;
        }

        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
            {label}
          </span>
        );
      },
    },

    { key: 'image_jobs_count', label: '#Image Jobs', sortable: true, render: (row) => formatInt(row.image_jobs_count) },
    {
      key: 'img_cr_used',
      label: 'Img Cr Used (EGP)',
      sortable: true,
      render: (row) => formatInt(row.image_jobs_cost_egp),
    },
    { key: 'credit_remaining_egp', label: 'Cr Rem (EGP)', sortable: true, render: (row) => formatInt(row.credit_remaining_egp) },
    { key: 'transactions_count', label: '#Top Ups', sortable: true, render: (row) => formatInt(row.transactions_count) },
    { key: 'total_top_ups_egp', label: 'Top Ups (EGP)', sortable: true, render: (row) => formatInt(row.total_top_ups_egp) },
    { key: 'video_jobs_cost_egp', label: 'Vid Cr Used (EGP)', sortable: true, render: (row) => formatInt(row.video_jobs_cost_egp) },
    { key: 'refunds_egp', label: 'Ref Cr (EGP)', sortable: true, render: (row) => formatInt(row.refunds_egp) },

    { key: 'prompt_name', label: 'Prompt', sortable: true, render: (row) => row.prompt_name || '—' },
    {
      key: 'actions',
      label: 'Edit',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
              <MoreHorizontal className="h-4 w-4 text-slate-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-md">
            <DropdownMenuLabel className="text-slate-700 font-medium">Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(row)} className="hover:bg-slate-50">
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-slate-50">View Numbers</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setConfirmTarget(row);
                setConfirmOpen(true);
              }}
              className="hover:bg-slate-50"
            >
              {row.is_paused ? 'Resume' : 'Pause'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setDeleteTarget(row);
                setDeleteConfirmText('');
                setDeleteOpen(true);
              }}
              className="text-red-600 hover:bg-red-50"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const lastActivePill = (key: LastActiveFilter, label: string) => {
    const active = lastActiveFilter === key;
    return (
      <button
        type="button"
        onClick={() => setLastActiveFilter(key)}
        className={[
          'px-3 py-1 rounded-full text-xs font-medium border transition',
          active
            ? 'bg-slate-200 border-slate-300 text-slate-800 shadow-inner'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
        ].join(' ')}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="w-full">
      {/* Page background + tighter, screenshot-like spacing */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-sm p-4 sm:p-5">
        {/* Top stats pills (centered) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <div className="px-5 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-sm">
            <span className="text-slate-700">Total stores registered - </span>
            <span className="font-semibold text-slate-900">{formatInt(totals.total)}</span>
          </div>
          <div className="px-5 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-sm">
            <span className="text-slate-700">Total Active stores - </span>
            <span className="font-semibold text-slate-900">{formatInt(totals.active)}</span>
          </div>
          <div className="px-5 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-sm">
            <span className="text-slate-700">Total inactive stores (this period) - </span>
            <span className="font-semibold text-slate-900">{formatInt(totals.inactive)}</span>
          </div>
        </div>

        {/* Title row + Add Store */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="text-2xl font-bold text-slate-900">Store Management</h1>

          <Button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Store
          </Button>
        </div>

        {/* Search + Last Active pills */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
          <div className="relative w-full lg:max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search Store Name..."
              className="pl-9 bg-white border-slate-200 focus-visible:ring-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-2 flex-wrap w-full">
            <div className="text-sm font-medium text-slate-700 mr-1">Last Active</div>
            <div className="flex items-center gap-2 flex-wrap">
              {lastActivePill('today', 'Today')}
              {lastActivePill('yesterday', 'Yesterday')}
              {lastActivePill('this_week', 'This Week')}
              {lastActivePill('this_month', 'This Month')}
              {lastActivePill('all', 'All')}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md overflow-hidden border border-slate-200 bg-white stores-table">
          <DataTable
            columns={columns}
            data={filteredStores}
            searchable={false}
            onSort={(key, direction) => {
              setSortKey(key);
              setSortDir(direction);
            }}
            defaultVisibleColumns={columns.map((c) => c.key)}
            rowClassName="hover:bg-slate-50 transition-colors"
          />
        </div>
      </div>

      {/* Scoped styling to match screenshot (banded header colors + thin grid) */}
      <style jsx global>{`
        .stores-table table {
          width: 100%;
          border-collapse: collapse;
        }
        .stores-table thead th {
          font-weight: 600;
          font-size: 12px;
          line-height: 1.2;
          padding: 10px 8px;
          border-bottom: 1px solid #d7dde6;
          border-right: 1px solid #e3e8ef;
          color: #1f2a37;
          white-space: nowrap;
        }
        .stores-table tbody td {
          font-size: 12px;
          padding: 10px 8px;
          border-bottom: 1px solid #eef2f7;
          border-right: 1px solid #f0f3f8;
          color: #111827;
          white-space: nowrap;
        }
        .stores-table thead th:last-child,
        .stores-table tbody td:last-child {
          border-right: none;
        }

        /* Header band colors (Overview = first 6 columns, Activity = next 7 columns, then Prompt/Edit) */
        .stores-table thead th:nth-child(-n + 6) {
          background: linear-gradient(180deg, #b9d7f5 0%, #9ec6ef 100%);
        }
        .stores-table thead th:nth-child(n + 7):nth-child(-n + 13) {
          background: linear-gradient(180deg, #bfe6c6 0%, #a7dbb1 100%);
        }
        .stores-table thead th:nth-child(n + 14) {
          background: linear-gradient(180deg, #eef2f7 0%, #e6ebf2 100%);
        }

        /* Compact sort icons / controls (if your DataTable injects them) */
        .stores-table thead th button,
        .stores-table thead th .sort-btn {
          color: inherit;
        }
      `}</style>

      {/* DIALOG */}
      <StoreDialog open={dialogOpen} onOpenChange={setDialogOpen} store={selectedStore} />

      {/* Pause/Resume confirm */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTarget?.is_paused ? 'Resume store?' : 'Pause store?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTarget?.is_paused
                ? `Resuming ${confirmTarget?.store_name} will allow processing pictures again.`
                : `Pausing ${confirmTarget?.store_name} will immediately stop processing any new pictures.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmTarget && handleTogglePause(confirmTarget)}>
              {confirmTarget?.is_paused ? 'Resume' : 'Pause'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete store?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-semibold">{deleteTarget?.store_name}</span> and all of its
              WhatsApp numbers, phones, jobs, transactions and logs. This action cannot be undone.
              <br />
              <br />
              To confirm, type the store name exactly as shown:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-2">
            <Input
              placeholder={deleteTarget?.store_name || 'Store name'}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!deleteTarget || deleteConfirmText !== (deleteTarget?.store_name || '')}
              onClick={async () => {
                if (!deleteTarget) return;
                try {
                  await deleteStore.mutateAsync(deleteTarget.id);
                  toast({ title: 'Store deleted', description: `${deleteTarget.store_name} was deleted.` });
                } catch (e: any) {
                  toast({
                    title: 'Delete failed',
                    description: e?.response?.data?.message || 'Could not delete store.',
                    variant: 'destructive',
                  });
                } finally {
                  setDeleteOpen(false);
                  setDeleteTarget(null);
                  setDeleteConfirmText('');
                }
              }}
            >
              Permanently delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
