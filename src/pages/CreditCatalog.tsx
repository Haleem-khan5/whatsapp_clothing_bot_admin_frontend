import { useMemo, useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { CreditItemDialog } from '@/components/CreditItemDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MoreHorizontal, Plus, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreditCatalog, useDeleteCreditItem, CreditCatalogItem } from '@/hooks/useCreditCatalog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function CreditCatalog() {
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
  });
  const { data } = useCreditCatalog();
  const items: Array<CreditCatalogItem & { id: string; created_at?: string }> = useMemo(() => {
    const list = (data?.data || []) as CreditCatalogItem[];
    return list.map((i) => ({
      id: i.credit_id,
      credit_id: i.credit_id,
      job_type: i.job_type,
      job_name: i.job_name,
      credits_per_job: i.credits_per_job,
      created_at: (i as any).created_at,
    }));
  }, [data?.data]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<CreditCatalogItem | null>(null);
  const delMutation = useDeleteCreditItem();
  const { toast } = useToast();

  const columns: Column<any>[] = [
    { key: 'job_type', label: '🧩 Job Type', sortable: true },
    { key: 'job_name', label: '🎞️ Job Name', sortable: true },
    { key: 'credits_per_job', label: '💳 Credits/Job', sortable: true },
    { key: 'created_at', label: '📅 Created At', sortable: true },
    ...(isAdmin
      ? ([
          {
            key: 'actions',
            label: '',
            render: (row: any) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelected(row as CreditCatalogItem);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={async () => {
                      try {
                        await delMutation.mutateAsync(row.credit_id || row.id);
                        toast({ title: 'Deleted' });
                      } catch (e: any) {
                        toast({ title: 'Delete failed', description: e?.response?.data?.message, variant: 'destructive' });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ] as Column<any>[]) : []),
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-400 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Credit Catalog</h1>
            <p className="text-sm text-white/80 mt-1">
              Manage and configure credit prices for job types.
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => { setSelected(null); setDialogOpen(true); }}
              className="bg-white text-purple-600 hover:bg-purple-100 font-semibold shadow-md transition-all hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Credit Item
            </Button>
          )}
        </div>
      </div>

      {/* TABLE CARD */}
      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-purple-700 text-xl font-semibold">Credit Items</CardTitle>
          <CardDescription className="text-purple-400 font-medium">
            Below is the list of all credit-based job pricing items.
          </CardDescription>
        </CardHeader>

        <Separator className="bg-gradient-to-r from-purple-400 to-pink-400 h-[2px] my-1 rounded" />

        <CardContent>
          <div className="rounded-xl overflow-hidden border border-purple-100 shadow-sm bg-white/70 backdrop-blur-sm">
            <DataTable
              columns={columns}
              data={items}
              currentPage={filters.page}
              totalPages={Math.max(1, Math.ceil(((data?.meta?.total as number) || items.length) / filters.page_size))}
              onPageChange={(page) => setFilters({ ...filters, page })}
              searchable={false}
              rowClassName="hover:bg-purple-50/80 transition-colors"
            />
          </div>
        </CardContent>
      </Card>
      <CreditItemDialog open={dialogOpen} onOpenChange={setDialogOpen} item={selected} />
    </div>
  );
}
