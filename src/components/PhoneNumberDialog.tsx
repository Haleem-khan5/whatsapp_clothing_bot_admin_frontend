import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useStores } from '@/hooks/useStores';
import { useCreateNumber } from '@/hooks/useNumbers';
import { useToast } from '@/hooks/use-toast';

interface PhoneNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStoreId?: string;
}

export function PhoneNumberDialog({ open, onOpenChange, selectedStoreId }: PhoneNumberDialogProps) {
  const { data: storesResp } = useStores();
  const stores = (storesResp?.data || []).map((s: any) => ({ id: s.store_id, name: s.store_name }));

  const [form, setForm] = useState({
    store_id: '',
    phone_e164: '',
    wapp_owner_name: '',
    is_primary: false,
  });

  const createNumber = useCreateNumber();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setForm({ store_id: selectedStoreId || '', phone_e164: '', wapp_owner_name: '', is_primary: false });
    } else if (selectedStoreId) {
      setForm((f) => ({ ...f, store_id: selectedStoreId }));
    }
  }, [open, selectedStoreId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createNumber.mutateAsync(form);
      toast({ title: 'WhatsApp number added', description: 'The number has been registered successfully.' });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Failed to add number', description: err?.message || 'Please try again', variant: 'destructive' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add WhatsApp Number</DialogTitle>
          <DialogDescription>Register a new WhatsApp phone and link it to a store.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store">Store *</Label>
            <Select value={form.store_id} onValueChange={(v) => setForm({ ...form, store_id: v })}>
              <SelectTrigger id="store">
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (E.164) *</Label>
            <Input id="phone" placeholder="e.g. +201234567890" value={form.phone_e164}
              onChange={(e) => setForm({ ...form, phone_e164: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Owner Name (optional)</Label>
            <Input id="owner" value={form.wapp_owner_name}
              onChange={(e) => setForm({ ...form, wapp_owner_name: e.target.value })} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="primary">Set as Primary</Label>
              <p className="text-xs text-muted-foreground">Marks this number as the store's primary WhatsApp.</p>
            </div>
            <Switch id="primary" checked={form.is_primary} onCheckedChange={(v) => setForm({ ...form, is_primary: v })} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createNumber.isPending}>Add Number</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


