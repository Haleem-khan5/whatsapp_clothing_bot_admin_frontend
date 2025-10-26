import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateStore, useUpdateStore, Store } from '@/hooks/useStores';
import { useToast } from '@/hooks/use-toast';

interface StoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store?: Store;
}

export function StoreDialog({ open, onOpenChange, store }: StoreDialogProps) {
  const [formData, setFormData] = useState<Partial<Store>>(
    store || {
      store_name: '',
      store_kind: 'Market',
      max_images_per_hour: 100,
      max_images_per_msg: 10,
      is_paused: false,
      credit_remaining_egp: 0,
    }
  );

  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    if (store) {
      setFormData({
        id: store.id,
        store_name: store.store_name,
        store_kind: store.store_kind,
        address: store.address,
        max_images_per_hour: store.max_images_per_hour,
        max_images_per_msg: store.max_images_per_msg,
        is_paused: !!store.is_paused,
        credit_remaining_egp: store.credit_remaining_egp ?? 0,
      });
    } else {
      setFormData({
        store_name: '',
        store_kind: 'Market',
        address: '',
        max_images_per_hour: 100,
        max_images_per_msg: 10,
        is_paused: false,
        credit_remaining_egp: 0,
      });
    }
  }, [open, store?.id, store?.store_name, store?.store_kind, store?.address, store?.max_images_per_hour, store?.max_images_per_msg, store?.is_paused, store?.credit_remaining_egp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (store?.id) {
        await updateStore.mutateAsync({ id: store.id, data: formData });
        toast({
          title: 'Store updated',
          description: 'The store has been updated successfully.',
        });
      } else {
        await createStore.mutateAsync(formData);
        toast({
          title: 'Store created',
          description: 'The store has been created successfully.',
        });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save store',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{store ? 'Edit Store' : 'Add New Store'}</DialogTitle>
          <DialogDescription>
            {store ? 'Update store information' : 'Create a new store'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="store_name">Store Name *</Label>
              <Input
                id="store_name"
                value={formData.store_name}
                onChange={(e) =>
                  setFormData({ ...formData, store_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_kind">Type *</Label>
              <Select
                value={formData.store_kind}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, store_kind: value })
                }
              >
                <SelectTrigger id="store_kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Market">Market</SelectItem>
                  <SelectItem value="Mall">Mall</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credit_remaining_egp">Remaining Credit (EGP)</Label>
              <Input
                id="credit_remaining_egp"
                type="number"
                min={0}
                step="0.01"
                value={formData.credit_remaining_egp ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credit_remaining_egp: Number(e.target.value),
                  })
                }
              />
            </div>
            {typeof store?.remaining_quota_images !== 'undefined' && (
              <div className="space-y-2">
                <Label htmlFor="remaining_quota_images">Remaining Quota (images)</Label>
                <Input id="remaining_quota_images" value={store?.remaining_quota_images ?? 0} readOnly />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_images_per_hour">Max Images/Hour *</Label>
              <Input
                id="max_images_per_hour"
                type="number"
                value={formData.max_images_per_hour}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_images_per_hour: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_images_per_msg">Max Images/Message *</Label>
              <Input
                id="max_images_per_msg"
                type="number"
                value={formData.max_images_per_msg}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_images_per_msg: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_paused"
              checked={formData.is_paused}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_paused: checked })
              }
            />
            <Label htmlFor="is_paused">Paused</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createStore.isPending || updateStore.isPending}>
              {store ? 'Update' : 'Create'} Store
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
