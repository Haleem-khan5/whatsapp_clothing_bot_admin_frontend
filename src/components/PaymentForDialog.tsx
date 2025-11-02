import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePaymentFor, useUpdatePaymentFor } from '@/hooks/useLookups';
import { useToast } from '@/hooks/use-toast';

interface PaymentForDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: { payment_for_id: string; payment_for_name: string } | null;
}

export function PaymentForDialog({ open, onOpenChange, item }: PaymentForDialogProps) {
  const [name, setName] = useState('');
  const createMutation = useCreatePaymentFor();
  const updateMutation = useUpdatePaymentFor();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setName(item?.payment_for_name || '');
  }, [open, item?.payment_for_name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (item?.payment_for_id) {
        await updateMutation.mutateAsync({ id: item.payment_for_id, data: { payment_for_name: name } });
        toast({ title: 'Payment purpose updated' });
      } else {
        await createMutation.mutateAsync({ payment_for_name: name });
        toast({ title: 'Payment purpose created' });
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
          <DialogTitle>{item ? 'Edit Payment Purpose' : 'Add Payment Purpose'}</DialogTitle>
          <DialogDescription>Enter the name of the payment purpose.</DialogDescription>
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















