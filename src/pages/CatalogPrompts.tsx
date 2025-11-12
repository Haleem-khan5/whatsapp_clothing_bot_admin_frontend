import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DataTable, Column } from '@/components/DataTable';
import { usePrompts, useCreatePrompt, useUpdatePrompt, useDeletePrompt, Prompt } from '@/hooks/usePrompts';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function CatalogPrompts() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [form, setForm] = useState<Partial<Prompt>>({ name: '', prompt_text: '', scope: 'global' });
  const { data, refetch } = usePrompts('global');
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const deletePrompt = useDeletePrompt();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({ name: editing.name, prompt_text: editing.prompt_text, scope: 'global' });
    } else {
      setForm({ name: '', prompt_text: '', scope: 'global' });
    }
  }, [open, editing]);

  const columns: Column<Prompt>[] = [
    { key: 'name', header: 'Name', label: 'Name', sortable: true, render: (row) => row.name },
    { key: 'prompt_text', header: 'Prompt Text', label: 'Prompt Text', render: (row) => <div className="truncate max-w-[600px] whitespace-pre-line">{row.prompt_text}</div> },
    { key: 'store_count', header: '# of stores', label: '# of stores', sortable: true, render: (row: any) => row.store_count ?? 0 },
    {
      key: 'actions',
      header: '',
      label: '',
      width: 60,
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => { setEditing(row); setOpen(true); }}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={async () => {
                try {
                  await deletePrompt.mutateAsync(row.prompt_id);
                  toast({ title: 'Deleted', description: 'Prompt deleted.' });
                } catch (e: any) {
                  toast({ title: 'Error', description: e.response?.data?.message || 'Failed to delete', variant: 'destructive' });
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!form.name || !form.prompt_text) {
        toast({ title: 'Validation', description: 'Name and Prompt Text are required.', variant: 'destructive' });
        return;
      }
      if (editing) {
        await updatePrompt.mutateAsync({ id: editing.prompt_id, data: { name: form.name, prompt_text: form.prompt_text, scope: 'global' } });
        toast({ title: 'Updated', description: 'Prompt updated.' });
      } else {
        await createPrompt.mutateAsync({ name: form.name, prompt_text: form.prompt_text, scope: 'global' });
        toast({ title: 'Created', description: 'Prompt created.' });
      }
      setOpen(false);
      setEditing(null);
      await refetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to save', variant: 'destructive' });
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Prompts Catalog</CardTitle>
            <CardDescription>Manage reusable prompts (global) for Image 2 and 3.</CardDescription>
          </div>
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Prompt
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={(data?.data || []) as Prompt[]} />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Prompt' : 'Add Prompt'}</DialogTitle>
            <DialogDescription>These prompts are global and selectable on store setup as Prompt 2 and 3.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt_text">Prompt Text *</Label>
              <Textarea
                id="prompt_text"
                placeholder="Write the prompt (you can use multiple paragraphs)"
                className="min-h-[160px]"
                value={form.prompt_text || ''}
                onChange={(e) => setForm({ ...form, prompt_text: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createPrompt.isPending || updatePrompt.isPending}>{editing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


