import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStores } from '@/hooks/useStores';
import { useCreditCatalog } from '@/hooks/useCreditCatalog';
import { useUsers } from '@/hooks/useUsers';
import { useCreateRefund } from '@/hooks/useRefunds';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefundDialog({ open, onOpenChange }: RefundDialogProps) {
  const { data: storesResp } = useStores();
  const stores = (storesResp?.data || []).map((s: any) => ({ id: s.store_id, name: s.store_name }));
  const { data: ccResp } = useCreditCatalog();
  const creditItems = (ccResp?.data || []) as Array<{ job_type: string; job_name: string; credits_per_job: number }>;

  // Restrict job type dropdown to exactly two options
  const jobTypes = ['image', 'video'];
  const jobNamesByType = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const item of creditItems) {
      if (!map[item.job_type]) map[item.job_type] = [];
      map[item.job_type].push(item.job_name);
    }
    for (const key of Object.keys(map)) {
      map[key] = Array.from(new Set(map[key]));
    }
    return map;
  }, [creditItems]);

  const [form, setForm] = useState({
    refund_date: new Date().toISOString().slice(0, 10),
    store_id: '',
    job_type: '',
    job_name: '',
    num_of_jobs: '',
    reason: '',
    received_by: '',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const createRefund = useCreateRefund();
  const { toast } = useToast();
  const { data: usersResp } = useUsers();
  const users = (usersResp?.data || []).map((u: any) => ({ id: u.user_id, name: u.full_name }));
  const { user } = useAuth();

  useEffect(() => {
    if (!open) return;
    setForm((f) => ({ ...f, received_by: f.received_by || (user?.id || '') }));
  }, [open, user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      let payment_reference_url: string | undefined = undefined;
      if (receiptFile) {
        const signRes = await api.post('/uploads/sign', {
          filename: `${Date.now()}_${receiptFile.name}`,
          content_type: receiptFile.type || 'application/octet-stream',
          folder: `refunds/${form.store_id || 'general'}`,
        });
        const { put_url, public_url } = signRes.data.data || signRes.data;
        await fetch(put_url, {
          method: 'PUT',
          headers: { 'Content-Type': receiptFile.type || 'application/octet-stream' },
          body: receiptFile,
        });
        payment_reference_url = public_url;
      }

      await createRefund.mutateAsync({
        refund_date: form.refund_date,
        store_id: form.store_id,
        job_type: form.job_type,
        job_name: form.job_name,
        num_of_jobs: Number(form.num_of_jobs || 0),
        reason: form.reason || undefined,
        payment_reference_url,
        received_by: form.received_by || undefined,
      });
      toast({ title: 'Refund created', description: 'The refund has been added.' });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Failed to create refund', description: err?.message || 'Please try again', variant: 'destructive' });
    }
  }

  const jobNames = jobNamesByType[form.job_type] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Refund</DialogTitle>
          <DialogDescription>Record a manual refund entry.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" value={form.refund_date} onChange={(e) => setForm({ ...form, refund_date: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="store">Store *</Label>
              <Select value={form.store_id} onValueChange={(v) => setForm({ ...form, store_id: v })}>
                <SelectTrigger id="store"><SelectValue placeholder="Select store" /></SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="jobType">Job Type *</Label>
              <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v, job_name: '' })}>
                <SelectTrigger id="jobType"><SelectValue placeholder="Select job type" /></SelectTrigger>
                <SelectContent>
                  {jobTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="jobName">Job Name *</Label>
              <Select value={form.job_name} onValueChange={(v) => setForm({ ...form, job_name: v })} disabled={!form.job_type}>
                <SelectTrigger id="jobName"><SelectValue placeholder="Select job name" /></SelectTrigger>
                <SelectContent>
                  {jobNames.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="jobs"># Jobs *</Label>
              <Input id="jobs" type="number" min="0" step="1" value={form.num_of_jobs} onChange={(e) => setForm({ ...form, num_of_jobs: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="receivedBy">Refund by</Label>
              <Select value={form.received_by} onValueChange={(v) => setForm({ ...form, received_by: v })}>
                <SelectTrigger id="receivedBy"><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  {users.map((u) => (<SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Optional" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="receipt">Receipt Image</Label>
            <Input id="receipt" type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createRefund.isPending}>Add Refund</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


