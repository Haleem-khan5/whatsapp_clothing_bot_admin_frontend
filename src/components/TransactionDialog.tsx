import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStores } from '@/hooks/useStores';
import { usePaymentFor, usePaymentMethod } from '@/hooks/useLookups';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useUsers } from '@/hooks/useUsers';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDialog({ open, onOpenChange }: TransactionDialogProps) {
  const { user } = useAuth();
  const { data: storesResp } = useStores();
  const stores = (storesResp?.data || []).map((s: any) => ({ id: s.store_id, name: s.store_name }));
  const { data: pfResp } = usePaymentFor();
  const paymentFors = (pfResp?.data || []).map((p: any) => ({ id: p.payment_for_id, name: p.payment_for_name }));
  const { data: pmResp } = usePaymentMethod();
  const paymentMethods = (pmResp?.data || []).map((m: any) => ({ id: m.payment_method_id, name: m.payment_method_name }));
  const { data: usersResp } = useUsers();
  const users = (usersResp?.data || []).map((u: any) => ({ id: u.user_id, name: u.full_name }));

  const [form, setForm] = useState({
    txn_date: new Date().toISOString().slice(0, 10),
    store_id: '',
    payment_for_id: '',
    amount_egp: '',
    payment_method_id: '',
    received_by: '',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const createTxn = useCreateTransaction();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, received_by: user?.id || '' }));
    }
  }, [open, user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      let payment_reference_url: string | undefined = undefined;
      if (receiptFile) {
        // 1) Get presigned PUT URL
        const signRes = await api.post('/uploads/sign', {
          filename: `${Date.now()}_${receiptFile.name}`,
          content_type: receiptFile.type || 'application/octet-stream',
          folder: `transactions/${form.store_id || 'general'}`,
        });
        const { put_url, public_url } = signRes.data.data || signRes.data;
        // 2) Upload to S3
        await fetch(put_url, {
          method: 'PUT',
          headers: {
            'Content-Type': receiptFile.type || 'application/octet-stream',
          },
          body: receiptFile,
        });
        payment_reference_url = public_url;
      }
      await createTxn.mutateAsync({
        txn_date: form.txn_date,
        store_id: form.store_id,
        payment_for_id: form.payment_for_id,
        amount_egp: Number(form.amount_egp),
        payment_method_id: form.payment_method_id,
        payment_reference_url,
        received_by: form.received_by,
      });
      toast({ title: 'Transaction created', description: 'The transaction has been added.' });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Failed to create transaction', description: err?.message || 'Please try again', variant: 'destructive' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Record a new payment transaction.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" value={form.txn_date} onChange={(e) => setForm({ ...form, txn_date: e.target.value })} required />
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
              <Label htmlFor="pf">Payment For *</Label>
              <Select value={form.payment_for_id} onValueChange={(v) => setForm({ ...form, payment_for_id: v })}>
                <SelectTrigger id="pf"><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  {paymentFors.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="pm">Method *</Label>
              <Select value={form.payment_method_id} onValueChange={(v) => setForm({ ...form, payment_method_id: v })}>
                <SelectTrigger id="pm"><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount">Amount (EGP) *</Label>
              <Input id="amount" type="number" min="0" step="0.01" value={form.amount_egp} onChange={(e) => setForm({ ...form, amount_egp: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="received_by">Received By</Label>
              <Select value={form.received_by} onValueChange={(v) => setForm({ ...form, received_by: v })}>
                <SelectTrigger id="received_by"><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  {users.map((u) => (<SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            
          </div>
          <div className="space-y-1">
            <Label htmlFor="receipt">Receipt Image</Label>
            <Input id="receipt" type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createTxn.isPending}>Add Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


