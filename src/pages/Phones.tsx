import { useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Trash } from 'lucide-react';
import { PhoneNumberDialog } from '@/components/PhoneNumberDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStores } from '@/hooks/useStores';
import { useNumbers, useDeleteNumber } from '@/hooks/useNumbers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

export default function Phones() {
  const { isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ page: 1, page_size: 20 });
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(undefined);
  const [storeNameQuery, setStoreNameQuery] = useState<string>('');
  const [q, setQ] = useState<string>('');

  const { data: storesResp } = useStores();
  const stores = (storesResp?.data || []).map((s: any) => ({ id: s.store_id, name: s.store_name }));
  const { data: numbersResp, refetch } = useNumbers(selectedStoreId, storeNameQuery || undefined, q || undefined);
  const deleteNumber = useDeleteNumber();

  const rows = (numbersResp?.data || []).map((n: any) => ({
    id: n.number_id,
    phone: n.phone_e164,
    assigned_store: n.store_name_cache,
    total_jobs: n.total_jobs,
    is_primary: n.is_primary,
    last_active_at: n.last_active_at || n.updated_at || n.created_at,
  }));

  function formatDateShort(d: string | Date | null | undefined): string {
    if (!d) return '-';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (!date || isNaN(date.getTime())) return '-';
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const yy = String(date.getFullYear()).slice(-2);
    return `${month}-${day}-${yy}`;
  }

  function formatDateTimeShort(d: string | Date | null | undefined, tz: string = 'Africa/Cairo'): string {
    if (!d) return '-';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (!date || isNaN(date.getTime())) return '-';
    const datePart = formatDateShort(date);
    const timePart = date.toLocaleString('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart}, ${timePart}`;
  }

  const columns: Column<any>[] = [
    { key: 'phone', label: '📞 Phone', sortable: true },
    { key: 'assigned_store', label: '🏪 Assigned Store' },
    { key: 'total_jobs', label: '📊 Total Jobs', sortable: true },
    {
      key: 'is_primary',
      label: '⭐ Primary',
      render: (row) => (
        <Badge
          variant={row.is_primary ? 'default' : 'secondary'}
          className={row.is_primary ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 text-gray-700'}
        >
          {row.is_primary ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'last_active_at',
      label: '🕒 Last active',
      sortable: true,
      render: (row) => formatDateTimeShort(row.last_active_at),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        isAdmin ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
                <Trash className="h-4 w-4 mr-1" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this number?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this number and all related jobs and messages. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await deleteNumber.mutateAsync(row.id);
                      toast({ title: 'Number deleted', description: `${row.phone} was removed.` });
                      refetch();
                    } catch (e: any) {
                      toast({ title: 'Failed to delete', description: e?.message || 'Please try again.' });
                    }
                  }}
                >
                  Confirm Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER WITH GRADIENT */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Phone Management</h1>
            <p className="text-sm text-white/80 mt-1">
              Monitor and manage WhatsApp phone numbers efficiently.
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-white text-purple-600 hover:bg-purple-100 font-semibold shadow-md transition-all hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Number
            </Button>
          )}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl shadow-sm border border-indigo-100 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <label className="text-sm text-indigo-600 font-medium mb-1 block">
            Search by phone or store
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-indigo-400" />
            <Input
              className="pl-8 border-indigo-200 focus-visible:ring-indigo-400"
              placeholder="Type phone (+201...) or store name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full sm:w-[260px]">
          <label className="text-sm text-indigo-600 font-medium mb-1 block">Filter by Store</label>
          <Select
            value={selectedStoreId ?? '__ALL__'}
            onValueChange={(v) => {
              if (v === '__ALL__') {
                setSelectedStoreId(undefined);
              } else {
                setSelectedStoreId(v);
                setStoreNameQuery('');
              }
            }}
          >
            <SelectTrigger className="border-indigo-200 focus:ring-indigo-400">
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
      </div>

      {/* MAIN CARD */}
      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-indigo-50 to-pink-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-indigo-700 text-xl font-semibold">Active Numbers</CardTitle>
          <CardDescription className="text-indigo-400 font-medium">
            Below is the list of WhatsApp-enabled numbers linked to your stores.
          </CardDescription>
        </CardHeader>
        <Separator className="bg-gradient-to-r from-indigo-400 to-pink-400 h-[2px] my-1 rounded" />
        <CardContent>
          <div className="rounded-xl overflow-hidden border border-indigo-100 shadow-sm bg-white/70 backdrop-blur-sm">
            <DataTable
              columns={columns}
              data={rows}
              currentPage={filters.page}
              totalPages={1}
              onPageChange={(page) => setFilters({ ...filters, page })}
              searchable={false}
              rowClassName="hover:bg-indigo-50/80 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* DIALOG */}
      <PhoneNumberDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) refetch();
        }}
        selectedStoreId={selectedStoreId}
      />
    </div>
  );
}
