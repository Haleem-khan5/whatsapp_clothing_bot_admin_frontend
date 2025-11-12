import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/DataTable';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePackages, useCreatePackage, useUpdatePackage, PackageDef } from '@/hooks/usePackages';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

export default function CatalogPackages() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<PackageDef | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [form, setForm] = useState<Partial<PackageDef>>({
    name: '',
    price_per_dress: 0,
    currency: 'EGP',
    images_per_dress: 2,
    use_consistent_background: true,
    prompts_order: ['P1', 'P2'],
  });
  const { toast } = useToast();
  const { data, refetch } = usePackages(q);
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();

  useEffect(() => {
    refetch();
  }, [q, refetch]);

  function formatInt(n: any): string {
    const num = Number(n || 0);
    if (!isFinite(num)) return '0';
    return Math.trunc(num).toLocaleString('en-US');
  }

  const columns: Column<any>[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'price_per_dress',
      label: 'Price/Dress',
      sortable: true,
      render: (row) => formatInt(row.price_per_dress),
    },
    { key: 'currency', label: 'Currency', sortable: true },
    { key: 'images_per_dress', label: 'Images/Dress', sortable: true, render: (row) => formatInt(row.images_per_dress) },
    {
      key: 'use_consistent_background',
      label: 'Consistent BG',
      render: (row) => (row.use_consistent_background ? 'Yes' : 'No'),
      sortable: true,
    },
    {
      key: 'prompts_order',
      label: 'Prompts Order',
      render: (row) => Array.isArray(row.prompts_order) ? row.prompts_order.join(', ') : String(row.prompts_order || ''),
    },
    { key: 'created_at', label: 'Created', render: (row) => (row.created_at ? new Date(row.created_at).toLocaleString() : '-'), sortable: true },
    { key: 'updated_at', label: 'Updated', render: (row) => (row.updated_at ? new Date(row.updated_at).toLocaleString() : '-'), sortable: true },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(row);
              setForm({
                name: row.name,
                price_per_dress: row.price_per_dress,
                currency: row.currency,
                images_per_dress: row.images_per_dress,
                use_consistent_background: !!row.use_consistent_background,
                prompts_order: Array.isArray(row.prompts_order) ? row.prompts_order : ['P1','P2'],
              });
              setOpen(true);
            }}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing?.package_id) {
        await updatePackage.mutateAsync({
          id: editing.package_id,
          data: {
            name: form.name,
            price_per_dress: Number(form.price_per_dress),
            currency: form.currency || 'EGP',
            images_per_dress: Number(form.images_per_dress || 2),
            use_consistent_background: !!form.use_consistent_background,
            prompts_order: Array.isArray(form.prompts_order) ? form.prompts_order : ['P1', 'P2'],
          } as any,
        });
        toast({ title: 'Package updated', description: 'The package has been updated.' });
      } else {
        await createPackage.mutateAsync({
          name: form.name,
          price_per_dress: Number(form.price_per_dress),
          currency: form.currency || 'EGP',
          images_per_dress: Number(form.images_per_dress || 2),
          use_consistent_background: !!form.use_consistent_background,
          prompts_order: Array.isArray(form.prompts_order) ? form.prompts_order : ['P1', 'P2'],
        } as any);
        toast({ title: 'Package added', description: 'The package has been created.' });
      }
      setOpen(false);
      setEditing(null);
      setForm({
        name: '',
        price_per_dress: 0,
        currency: 'EGP',
        images_per_dress: 2,
        use_consistent_background: true,
        prompts_order: ['P1', 'P2'],
      });
      refetch();
    } catch (err: any) {
      toast({ title: 'Failed to save package', description: err?.message || 'Please try again', variant: 'destructive' });
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Packages</CardTitle>
            <CardDescription>Manage pricing packages and defaults for image generation.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by package name..."
              className="w-56"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button onClick={() => { setEditing(null); setForm({ name: '', price_per_dress: 0, currency: 'EGP', images_per_dress: 2, use_consistent_background: true, prompts_order: ['P1','P2'] }); setOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={(() => {
              const list = (data?.data || []) as PackageDef[];
              if (!sortKey) return list;
              const arr = [...list];
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
                const sa = String(va ?? '').toLowerCase();
                const sb = String(vb ?? '').toLowerCase();
                return sa.localeCompare(sb) * dir;
              });
              return arr;
            })()}
            searchable={false}
            onSort={(key, direction) => { setSortKey(key); setSortDir(direction); }}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Package' : 'Add Package'}</DialogTitle>
            <DialogDescription>{editing ? 'Update the package details.' : 'Define pricing and behavior for this package.'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="price">Price/Dress *</Label>
                <Input id="price" type="number" min="0" step="0.01" value={form.price_per_dress as any} onChange={(e) => setForm({ ...form, price_per_dress: e.target.value as any })} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" value={form.currency || 'EGP'} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="images_per_dress">Images per dress</Label>
                <Input id="images_per_dress" type="number" min="1" step="1" value={form.images_per_dress as any} onChange={(e) => setForm({ ...form, images_per_dress: e.target.value as any })} />
              </div>
              <div className="space-y-1 col-span-1 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <Switch id="use_bg" checked={!!form.use_consistent_background} onCheckedChange={(v) => setForm({ ...form, use_consistent_background: v })} />
                  <Label htmlFor="use_bg">Use consistent background</Label>
                </div>
              </div>
              <div className="space-y-1 col-span-1 sm:col-span-2">
                <Label htmlFor="prompts_order">Prompts order (comma-separated)</Label>
                <Input
                  id="prompts_order"
                  placeholder="e.g. P1,P2"
                  value={Array.isArray(form.prompts_order) ? form.prompts_order.join(',') : ''}
                  onChange={(e) => setForm({ ...form, prompts_order: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createPackage.isPending || updatePackage.isPending}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


