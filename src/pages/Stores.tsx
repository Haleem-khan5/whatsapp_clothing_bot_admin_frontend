import { useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { StoreDialog } from '@/components/StoreDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, MoreHorizontal, Building2, Search } from 'lucide-react';
import { useStores, useUpdateStore, useDeleteStore } from '@/hooks/useStores';
import { useToast } from '@/hooks/use-toast';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Stores() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<'store_name' | 'store_kind' | 'address'>(
    'store_name'
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { data } = useStores();
  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();
  const { toast } = useToast();

  // Map and filter data
  const stores = (data?.data || []).map((s: any) => ({
    id: s.store_id,
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
    image_jobs_count: s.image_jobs_count,
    video_jobs_count: s.video_jobs_count,
    last_active_at: s.last_active_at,
    whatsapp_numbers_count: s.whatsapp_numbers_count,
    refunded_jobs_count: s.refunded_jobs_count,
  }));

  let filteredStores = stores.filter((store) =>
    store[selectedColumn]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply sorting locally
  if (sortKey) {
    filteredStores = [...filteredStores].sort((a: any, b: any) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const dir = sortDir === 'asc' ? 1 : -1;
      // Numeric sort if both numbers or numeric-like strings
      const numA = typeof va === 'number' ? va : (typeof va === 'string' && va.trim() !== '' && !isNaN(Number(va)) ? Number(va) : NaN);
      const numB = typeof vb === 'number' ? vb : (typeof vb === 'string' && vb.trim() !== '' && !isNaN(Number(vb)) ? Number(vb) : NaN);
      if (Number.isFinite(numA) && Number.isFinite(numB)) {
        return (numA - numB) * dir;
      }
      // Boolean: false < true
      if (typeof va === 'boolean' && typeof vb === 'boolean') {
        return ((va === vb ? 0 : va ? 1 : -1) as number) * dir;
      }
      // Date strings: try Date compare
      const da = typeof va === 'string' ? Date.parse(va) : NaN;
      const db = typeof vb === 'string' ? Date.parse(vb) : NaN;
      if (Number.isFinite(da) && Number.isFinite(db)) {
        return (da - db) * dir;
      }
      // Alphabetical (case-insensitive)
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

  const columns: Column<any>[] = [
    { key: 'store_name', label: '🏪 Store Name', sortable: true },
    { key: 'store_kind', label: '🏷️ Type', sortable: true },
    { key: 'address', label: '📍 Address' },
    {
      key: 'registration_date',
      label: '🗓️ Registered On',
      sortable: true,
      render: (row) => {
        const d = row.registration_date ? new Date(row.registration_date) : null;
        return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
      },
    },
    { key: 'max_images_per_hour', label: '⚡ Max/Hr', sortable: true },
    { key: 'max_images_per_msg', label: '🖼️ Max/Msg', sortable: true },
    { key: 'credit_remaining_egp', label: '💳 Credit Remaining (EGP)', sortable: true },
    { key: 'remaining_quota_images', label: '🖼️ Remaining Quota (images)', sortable: true },
    { key: 'total_top_ups_egp', label: '💰 Top Ups (EGP)', sortable: true },
    { key: 'image_jobs_count', label: '🖼️ Image Jobs', sortable: true },
    { key: 'video_jobs_count', label: '🎞️ Video Jobs', sortable: true },
    {
      key: 'last_active_at',
      label: '🕒 Last Active (EG)',
      sortable: true,
      render: (row) =>
        row.last_active_at
          ? new Date(row.last_active_at).toLocaleString('en-EG', {
              timeZone: 'Africa/Cairo',
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
    },
    { key: 'whatsapp_numbers_count', label: '# WhatsApp Numbers', sortable: true },
    { key: 'refunded_jobs_count', label: '↩️ Refunded Jobs', sortable: true },
    {
      key: 'is_paused',
      label: 'Status',
      render: (row) => (
        <Badge
          variant={row.is_paused ? 'secondary' : 'default'}
          className={
            row.is_paused
              ? 'bg-gray-300 text-gray-700'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }
        >
          {row.is_paused ? 'Paused' : 'Active'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-indigo-50">
              <MoreHorizontal className="h-4 w-4 text-indigo-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-white/90 backdrop-blur-md border border-indigo-100 shadow-md"
          >
            <DropdownMenuLabel className="text-indigo-600 font-medium">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(row)} className="hover:bg-indigo-50">
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-indigo-50">View Numbers</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setConfirmTarget(row); setConfirmOpen(true); }} className="hover:bg-indigo-50">
              {row.is_paused ? 'Resume' : 'Pause'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setDeleteTarget(row); setDeleteOpen(true); }} className="text-red-600 hover:bg-red-50">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-white/80" />
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Store Management</h1>
              <p className="text-sm text-white/80 mt-1">
                Manage and monitor all registered stores efficiently.
              </p>
            </div>
          </div>
          <Button
            onClick={handleAddNew}
            className="bg-white text-purple-600 hover:bg-purple-100 font-semibold shadow-md transition-all hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Store
          </Button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl shadow-sm border border-indigo-100 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:max-w-2xl">
          {/* Search Input */}
          <div className="w-full relative">
            <label className="text-sm text-indigo-600 font-medium mb-1 block">
              Search Store
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-indigo-400" />
              <Input
                placeholder="Type to search..."
                className="pl-8 border-indigo-200 focus-visible:ring-indigo-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Column Selector */}
          <div className="w-full sm:w-[200px]">
            <label className="text-sm text-indigo-600 font-medium mb-1 block">
              Search by
            </label>
            <Select
              value={selectedColumn}
              onValueChange={(val: any) => setSelectedColumn(val)}
            >
              <SelectTrigger className="border-indigo-200 focus:ring-indigo-400">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="store_name">Store Name</SelectItem>
                <SelectItem value="store_kind">Type</SelectItem>
                <SelectItem value="address">Address</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* TABLE CARD (no inner search) */}
      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-indigo-50 to-pink-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-indigo-700 text-xl font-semibold">
            Registered Stores
          </CardTitle>
          <CardDescription className="text-indigo-400 font-medium">
            Below is the list of all active and paused stores.
          </CardDescription>
        </CardHeader>

        <Separator className="bg-gradient-to-r from-indigo-400 to-pink-400 h-[2px] my-1 rounded" />

        <CardContent>
          <div className="rounded-xl overflow-hidden border border-indigo-100 shadow-sm bg-white/70 backdrop-blur-sm">
            <DataTable
              columns={columns}
              data={filteredStores}
              searchable={false} // ✅ disables inner search bar
              onSort={(key, direction) => { setSortKey(key); setSortDir(direction); }}
              rowClassName="hover:bg-indigo-50/80 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* DIALOG */}
      <StoreDialog open={dialogOpen} onOpenChange={setDialogOpen} store={selectedStore} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTarget?.is_paused ? 'Resume store?' : 'Pause store?'}
            </AlertDialogTitle>
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete store?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {deleteTarget?.store_name} from the list. You can’t undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
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
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
