import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCreditItem, useUpdateCreditItem, CreditCatalogItem } from '@/hooks/useCreditCatalog';
import { useToast } from '@/hooks/use-toast';

interface CreditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: CreditCatalogItem | null;
}

export function CreditItemDialog({ open, onOpenChange, item }: CreditItemDialogProps) {
  const [form, setForm] = useState<Partial<CreditCatalogItem>>({
    job_type: 'image',
    job_name: '',
    credits_per_job: 1,
  });

  const createMutation = useCreateCreditItem();
  const updateMutation = useUpdateCreditItem();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          job_type: item.job_type,
          job_name: item.job_name,
          credits_per_job: item.credits_per_job,
        });
      } else {
        setForm({ job_type: 'image', job_name: '', credits_per_job: 1 });
      }
    }
  }, [open, item?.job_type, item?.job_name, item?.credits_per_job]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (item?.credit_id) {
        await updateMutation.mutateAsync({ id: item.credit_id, data: form });
        toast({ title: 'Credit item updated' });
      } else {
        await createMutation.mutateAsync(form);
        toast({ title: 'Credit item created' });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to save',
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Credit Item' : 'Add Credit Item'}</DialogTitle>
          <DialogDescription>Set job type, job name, and credits per job.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job_type">Job Type</Label>
            <Input
              id="job_type"
              value={form.job_type || ''}
              onChange={(e) => setForm({ ...form, job_type: e.target.value })}
              placeholder="image or video"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job_name">Job Name</Label>
            <Input
              id="job_name"
              value={form.job_name || ''}
              onChange={(e) => setForm({ ...form, job_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="credits_per_job">Credits Per Job</Label>
            <Input
              id="credits_per_job"
              type="number"
              min={0}
              value={form.credits_per_job ?? 0}
              onChange={(e) => setForm({ ...form, credits_per_job: Number(e.target.value) })}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {item ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

























