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
import { Textarea } from '@/components/ui/textarea';
import { useCreateStore, useUpdateStore, Store, useStore } from '@/hooks/useStores';
import { usePrompts } from '@/hooks/usePrompts';
import { usePackages } from '@/hooks/usePackages';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

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
      prompt_1: '',
      prompt1_id: undefined as any,
      max_images_per_hour: 100,
      max_images_per_msg: 10,
      is_paused: false,
      credit_remaining_egp: 0,
    }
  );
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const { toast } = useToast();
  const [promptsSearch, setPromptsSearch] = useState<string>('');
  const [promptsSearch2, setPromptsSearch2] = useState<string>('');
  const [promptsSearch3, setPromptsSearch3] = useState<string>('');
  const { data: promptsData } = usePrompts('global', promptsSearch);
  const { data: packagesData } = usePackages();
  const storeDetails = useStore(store?.id || '');

  useEffect(() => {
    if (!open) return;
    // Prefer fresh store details when editing
    const raw: any = (storeDetails?.data as any)?.data || store;
    const s = raw
      ? {
          ...raw,
          id: raw.id || raw.store_id, // normalize API payload
        }
      : raw;
    if (s && s.id) {
      setFormData({
        id: s.id,
        store_name: s.store_name,
        store_kind: s.store_kind,
        address: s.address,
        prompt_1: s.prompt_1,
        prompt1_id: (s as any).prompt1_id,
        prompt2_id: s.prompt2_id,
        prompt3_id: s.prompt3_id,
        package_id: s.package_id,
        background_image_url: s.background_image_url,
        max_images_per_hour: s.max_images_per_hour,
        max_images_per_msg: s.max_images_per_msg,
        is_paused: !!s.is_paused,
        credit_remaining_egp: s.credit_remaining_egp ?? 0,
      });
      setBackgroundFile(null);
    } else {
      setFormData({
        store_name: '',
        store_kind: 'Market',
        address: '',
        prompt_1: '',
        prompt2_id: undefined,
        prompt3_id: undefined,
        package_id: undefined,
        background_image_url: '',
        max_images_per_hour: 100,
        max_images_per_msg: 10,
        is_paused: false,
        credit_remaining_egp: 0,
      });
      setBackgroundFile(null);
    }
  }, [open, store?.id, storeDetails?.data, store?.store_name, store?.store_kind, store?.address, store?.prompt_1, store?.prompt2_id, store?.prompt3_id, store?.package_id, store?.background_image_url, store?.max_images_per_hour, store?.max_images_per_msg, store?.is_paused, store?.credit_remaining_egp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let backgroundUrl = formData.background_image_url || '';
      if (backgroundFile) {
        setIsUploading(true);
        const signRes = await api.post('/uploads/sign', {
          filename: `${Date.now()}_${backgroundFile.name}`,
          content_type: backgroundFile.type || 'application/octet-stream',
          folder: `stores/${(formData.id as string) || 'general'}`,
        });
        const { put_url, public_url } = (signRes.data as any).data || signRes.data;
        await fetch(put_url, {
          method: 'PUT',
          headers: {
            'Content-Type': backgroundFile.type || 'application/octet-stream',
          },
          body: backgroundFile,
        });
        backgroundUrl = public_url;
        setFormData((prev) => ({ ...prev, background_image_url: backgroundUrl }));
        setIsUploading(false);
      }

      if (store?.id) {
        await updateStore.mutateAsync({ id: store.id, data: { ...formData, background_image_url: backgroundUrl } });
        toast({
          title: 'Store updated',
          description: 'The store has been updated successfully.',
        });
      } else {
        await createStore.mutateAsync({ ...formData, background_image_url: backgroundUrl });
        toast({
          title: 'Store created',
          description: 'The store has been created successfully.',
        });
      }
      onOpenChange(false);
    } catch (error: any) {
      setIsUploading(false);
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

          <div className="space-y-2">
            <Label htmlFor="prompt1_id">Prompt 1 (select predefined)</Label>
            <Select
              value={formData.prompt1_id || ''}
              onValueChange={(value: any) => {
                const p = (promptsData?.data || []).find((pp: any) => pp.prompt_id === value);
                setFormData({ ...formData, prompt1_id: value || undefined, prompt_1: p ? p.prompt_text : '' });
              }}
            >
              <SelectTrigger id="prompt1_id" className="w-full">
                <SelectValue placeholder="Select Prompt 1" />
              </SelectTrigger>
              <SelectContent className="w-[min(90vw,40rem)] max-h-[60vh] overflow-y-auto">
                <div className="px-2 py-1">
                  <Input
                    placeholder="Search prompts…"
                    value={promptsSearch}
                    onChange={(e) => setPromptsSearch(e.target.value)}
                    className="h-8"
                  />
                </div>
                {((promptsData?.data || []) as any[])
                  .filter((p: any) => !promptsSearch || String(p.name || '').toLowerCase().includes(promptsSearch.toLowerCase()))
                  .map((p: any) => (
                  <SelectItem key={p.prompt_id} value={p.prompt_id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prompt2_id">Prompt 2 (pick a predefined prompt)</Label>
              <Select
                value={formData.prompt2_id || ''}
                onValueChange={(value: any) => setFormData({ ...formData, prompt2_id: value || undefined })}
              >
                <SelectTrigger id="prompt2_id" className="w-full">
                  <SelectValue placeholder="Select Prompt 2" />
                </SelectTrigger>
                <SelectContent className="w-[min(90vw,40rem)] max-h-[60vh] overflow-y-auto">
                  <div className="px-2 py-1">
                    <Input
                      placeholder="Search prompts…"
                      value={promptsSearch2}
                      onChange={(e) => setPromptsSearch2(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  {((promptsData?.data || []) as any[])
                    .filter((p: any) => !promptsSearch2 || String(p.name || '').toLowerCase().includes(promptsSearch2.toLowerCase()))
                    .map((p: any) => (
                    <SelectItem key={p.prompt_id} value={p.prompt_id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt3_id">Prompt 3 (pick a predefined prompt)</Label>
              <Select
                value={formData.prompt3_id || ''}
                onValueChange={(value: any) => setFormData({ ...formData, prompt3_id: value || undefined })}
              >
                <SelectTrigger id="prompt3_id" className="w-full">
                  <SelectValue placeholder="Select Prompt 3" />
                </SelectTrigger>
                <SelectContent className="w-[min(90vw,40rem)] max-h-[60vh] overflow-y-auto">
                  <div className="px-2 py-1">
                    <Input
                      placeholder="Search prompts…"
                      value={promptsSearch3}
                      onChange={(e) => setPromptsSearch3(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  {((promptsData?.data || []) as any[])
                    .filter((p: any) => !promptsSearch3 || String(p.name || '').toLowerCase().includes(promptsSearch3.toLowerCase()))
                    .map((p: any) => (
                    <SelectItem key={p.prompt_id} value={p.prompt_id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="package_id">Default Package</Label>
            <Select
              value={formData.package_id || ''}
              onValueChange={(value: any) => setFormData({ ...formData, package_id: value || undefined })}
            >
              <SelectTrigger id="package_id">
                <SelectValue placeholder="Select package" />
              </SelectTrigger>
              <SelectContent>
                {(packagesData?.data || []).map((pkg: any) => (
                  <SelectItem key={pkg.package_id} value={pkg.package_id}>
                    {pkg.name} — {pkg.price_per_dress} {pkg.currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background_image">Background Image</Label>
            <Input
              id="background_image"
              type="file"
              accept="image/*"
              onChange={(e) => setBackgroundFile(e.target.files?.[0] || null)}
            />
            {formData.background_image_url && !backgroundFile && (
              <div className="flex items-center gap-3">
                <img
                  src={formData.background_image_url}
                  alt="Current background"
                  className="w-16 h-10 object-cover rounded border"
                />
                <div className="text-xs text-muted-foreground truncate">
                  Current: {formData.background_image_url}
                </div>
              </div>
            )}
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
            <Button type="submit" disabled={createStore.isPending || updateStore.isPending || isUploading}>
              {store ? 'Update' : 'Create'} Store
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
