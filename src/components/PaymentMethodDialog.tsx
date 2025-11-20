import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePaymentMethod, useUpdatePaymentMethod } from '@/hooks/useLookups';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: { payment_method_id: string; payment_method_name: string } | null;
}

export function PaymentMethodDialog({ open, onOpenChange, item }: PaymentMethodDialogProps) {
  const [name, setName] = useState('');
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setName(item?.payment_method_name || '');
  }, [open, item?.payment_method_name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (item?.payment_method_id) {
        await updateMutation.mutateAsync({ id: item.payment_method_id, data: { payment_method_name: name } });
        toast({ title: 'Payment method updated' });
      } else {
        await createMutation.mutateAsync({ payment_method_name: name });
        toast({ title: 'Payment method created' });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.message, variant: 'destructive' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
          <DialogDescription>Enter the name of the payment method.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
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

































