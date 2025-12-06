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
import { useCreateStore, useUpdateStore, Store, useStore } from '@/hooks/useStores';
import { usePrompts } from '@/hooks/usePrompts';
import { usePackages } from '@/hooks/usePackages';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Minus, Plus, ImagePlus, Eye, X } from 'lucide-react';

interface StoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store?: Store;
}

/**
 * Extra UI fields for the card.
 * Make sure your backend / Store type has these if you want them persisted.
 */
type ExtendedStore = Store & {
  credits_per_dress?: number;
  logo_image_url?: string;
  model_image_url?: string;
  output_format?: '9:16' | '1:1';
  output_resolution?: '1K' | '2K' | '4K';
};

export function StoreDialog({ open, onOpenChange, store }: StoreDialogProps) {
  const [formData, setFormData] = useState<Partial<ExtendedStore>>(
    (store as ExtendedStore) || {
      store_name: '',
      store_kind: 'Market',
      prompt_1: '',
      prompt1_id: undefined as any,
      max_images_per_hour: 100,
      max_images_per_msg: 10,
      is_paused: false,
      credit_remaining_egp: 0,
      credits_per_dress: 10,
      output_format: '9:16',
      output_resolution: '2K',
      model_height_pct: 88,
      model_bottom_offset_px: 40,
    }
  );

  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | null>(null);
  const [largePreviewUrl, setLargePreviewUrl] = useState<string | null>(null);
  const [largePreviewTitle, setLargePreviewTitle] = useState<string>('');
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

  // Ensure "Basic", "Pro", "Elite" ordering in the UI
  const packagesOrder = ['Basic', 'Pro', 'Elite'];
  const packagesRaw = (packagesData?.data || []) as any[];
  const packages = [...packagesRaw].sort((a, b) => {
    const ia = packagesOrder.indexOf(a.name);
    const ib = packagesOrder.indexOf(b.name);
    if (ia === -1 && ib === -1) {
      return String(a.name || '').localeCompare(String(b.name || ''));
    }
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  useEffect(() => {
    if (!open) return;

    const raw: any = (storeDetails?.data as any)?.data || store;
    const s: ExtendedStore | undefined = raw
      ? {
          ...raw,
          id: raw.id || raw.store_id,
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
        logo_image_url: (s as any).logo_image_url,
        model_image_url: (s as any).model_image_url,
        model_height_pct: s.model_height_pct ?? 88,
        model_bottom_offset_px: s.model_bottom_offset_px ?? 40,
        max_images_per_hour: s.max_images_per_hour,
        max_images_per_msg: s.max_images_per_msg,
        is_paused: !!s.is_paused,
        credit_remaining_egp: s.credit_remaining_egp ?? 0,
        credits_per_dress: (s as any).credits_per_dress ?? 10,
        output_format: (s as any).output_format ?? '9:16',
        output_resolution: (s as any).output_resolution ?? '2K',
      });
    } else {
      setFormData({
        store_name: '',
        store_kind: 'Market',
        address: '',
        prompt2_id: undefined,
        prompt3_id: undefined,
        package_id: undefined,
        background_image_url: '',
        logo_image_url: '',
        model_image_url: '',
        model_height_pct: 88,
        model_bottom_offset_px: 40,
        max_images_per_hour: 100,
        max_images_per_msg: 10,
        is_paused: false,
        credit_remaining_egp: 0,
        credits_per_dress: 10,
        output_format: '9:16',
        output_resolution: '2K',
      });
    }

    setBackgroundFile(null);
    setLogoFile(null);
    setModelFile(null);
    setBackgroundPreviewUrl(null);
    setLogoPreviewUrl(null);
    setModelPreviewUrl(null);
    setLargePreviewUrl(null);
    setLargePreviewTitle('');
  }, [open, store?.id, storeDetails?.data, store]);

  // Local object URLs for immediate preview of newly selected files
  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    if (!backgroundFile) {
      setBackgroundPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(backgroundFile);
    setBackgroundPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [backgroundFile]);

  useEffect(() => {
    if (!modelFile) {
      setModelPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(modelFile);
    setModelPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [modelFile]);

  // Ensure a package is always selected; prefer "Basic", otherwise first package
  useEffect(() => {
    if (!open) return;
    if (!packagesRaw.length) return;

    setFormData((prev) => {
      if (prev.package_id) {
        // keep current selection if it still exists
        const stillExists = packagesRaw.some(
          (p: any) => p.package_id === prev.package_id
        );
        if (stillExists) return prev;
      }

      const basic = packagesRaw.find((p: any) => p.name === 'Basic');
      const fallback = basic || packagesRaw[0];
      if (!fallback) return prev;

      return { ...prev, package_id: fallback.package_id };
    });
  }, [open, packagesRaw]);

  const uploadIfNeeded = async (
    currentUrl: string | undefined,
    file: File | null,
    folder: string
  ): Promise<string> => {
    if (!file) return currentUrl || '';

    const signRes = await api.post('/uploads/sign', {
      filename: `${Date.now()}_${file.name}`,
      content_type: file.type || 'application/octet-stream',
      folder,
    });

    const { put_url, public_url } = (signRes.data as any).data || signRes.data;

    await fetch(put_url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    return public_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Enforce business rule: for Pro package, a logo is mandatory
      const selectedPkg = packages.find(
        (p: any) => p.package_id === formData.package_id
      );
      const isProPackage =
        selectedPkg && String(selectedPkg.name || '').toLowerCase() === 'pro';
      const hasLogo = !!logoFile || !!formData.logo_image_url;
      if (isProPackage && !hasLogo) {
        toast({
          title: 'Logo required for Pro package',
          description:
            'Please upload a store logo before saving. For Pro stores the logo must appear on every image.',
          variant: 'destructive',
        });
        return;
      }

      setIsUploading(true);
      const folderBase = `stores/${(formData.id as string) || 'general'}`;

      const backgroundUrl = await uploadIfNeeded(
        formData.background_image_url,
        backgroundFile,
        `${folderBase}/background`
      );
      const logoUrl = await uploadIfNeeded(
        formData.logo_image_url,
        logoFile,
        `${folderBase}/logo`
      );
      const modelUrl = await uploadIfNeeded(
        formData.model_image_url,
        modelFile,
        `${folderBase}/model`
      );

      const { prompt_1, ...cleanForm } = formData as any;

      const payload = {
        ...cleanForm,
        background_image_url: backgroundUrl,
        logo_image_url: logoUrl,
        model_image_url: modelUrl,
      };

      if (store?.id) {
        await updateStore.mutateAsync({ id: store.id, data: payload });
        toast({
          title: 'Store updated',
          description: 'The store has been updated successfully.',
        });
      } else {
        await createStore.mutateAsync(payload);
        toast({
          title: 'Store created',
          description: 'The store has been created successfully.',
        });
      }

      setIsUploading(false);
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

  const adjustNumber = (
    key: keyof ExtendedStore,
    delta: number,
    min?: number,
    max?: number
  ) => {
    setFormData((prev) => {
      const current = Number(prev[key] ?? 0);
      let next = current + delta;
      if (typeof min === 'number') next = Math.max(min, next);
      if (typeof max === 'number') next = Math.min(max, next);
      return { ...prev, [key]: next };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-white via-indigo-50 to-pink-50 border border-indigo-100/70 shadow-lg">
        <DialogHeader className="mb-3 border-b border-indigo-100/70 pb-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl -mx-4 -mt-4 px-4 pt-4 text-white shadow-sm">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Store Registration
          </DialogTitle>
          <DialogDescription className="text-indigo-50/90">
            {store ? 'Update store information' : 'Create a new store for your account.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* STORE DETAILS */}
          <section className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm border border-indigo-100/70">
            <p className="mb-3 text-xs font-semibold tracking-wide text-indigo-600">
              STORE DETAILS
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr,1fr,2fr]">
              <div className="space-y-1.5">
                <Label htmlFor="store_name">Store Name *</Label>
                <Input
                  id="store_name"
                  value={formData.store_name || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, store_name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="store_kind">Type *</Label>
                <Select
                  value={formData.store_kind}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, store_kind: value }))
                  }
                >
                  <SelectTrigger id="store_kind">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Market">Market</SelectItem>
                    <SelectItem value="Mall">Mall</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Address (optional)</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>
            </div>
          </section>

          {/* PACKAGE & CREDITS */}
          <section className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm border border-indigo-100/70">
            <p className="mb-3 text-xs font-semibold tracking-wide text-indigo-600">
              PACKAGE AND CREDITS
            </p>

            {/* dynamic tier bar from packages table */}
            <div className="mb-4 flex rounded-full bg-indigo-50 text-xs font-medium overflow-hidden border border-indigo-100/80">
              {packages.length === 0 ? (
                <div className="w-full py-2 text-center text-xs text-muted-foreground">
                  No packages found
                </div>
              ) : (
                packages.map((pkg) => (
                  <button
                    key={pkg.package_id}
                    type="button"
                    className={`flex-1 py-1.5 text-center transition ${
                      formData.package_id === pkg.package_id
                        ? 'bg-indigo-500 text-white'
                        : 'text-slate-700 hover:bg-indigo-100/70'
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        package_id: pkg.package_id,
                        // optionally sync credits per dress with package
                        credits_per_dress:
                          prev.credits_per_dress ??
                          (pkg.price_per_dress as number | undefined) ??
                          10,
                      }))
                    }
                  >
                    {pkg.name}
                  </button>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* credits per dress */}
              <div className="space-y-1.5">
                <Label>Credits per dress</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustNumber('credits_per_dress', -1, 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    className="text-center"
                    value={formData.credits_per_dress ?? 10}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        credits_per_dress: Number(e.target.value),
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustNumber('credits_per_dress', 1, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* credit remaining */}
              <div className="space-y-1.5">
                <Label>Credit Remaining</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustNumber('credit_remaining_egp', -50, 0)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                <Input
                  type="number"
                  className="text-center"
                  value={formData.credit_remaining_egp ?? 0}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      credit_remaining_egp: Number(e.target.value),
                    }))
                  }
                />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustNumber('credit_remaining_egp', 50, 0)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* PROMPTS — now in one row */}
          <section className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm border border-indigo-100/70">
            <p className="mb-3 text-xs font-semibold tracking-wide text-indigo-600">
              PROMPTS
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Prompt 1 */}
              <div className="space-y-2">
                <Label htmlFor="prompt1_id">Prompt 1</Label>
                <Select
                  value={formData.prompt1_id || ''}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, prompt1_id: value || undefined }))
                  }
                >
                  <SelectTrigger id="prompt1_id" className="w-full">
                    <SelectValue placeholder="Select Prompt 1" />
                  </SelectTrigger>
                  <SelectContent className="w-[min(90vw,24rem)] max-h-[60vh] overflow-y-auto">
                    <div className="px-2 py-1">
                      <Input
                        placeholder="Search…"
                        value={promptsSearch}
                        onChange={(e) => setPromptsSearch(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    {((promptsData?.data || []) as any[])
                      .filter(
                        (p: any) =>
                          !promptsSearch ||
                          String(p.name || '')
                            .toLowerCase()
                            .includes(promptsSearch.toLowerCase())
                      )
                      .map((p: any) => (
                        <SelectItem key={p.prompt_id} value={p.prompt_id}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt 2 */}
              <div className="space-y-2">
                <Label htmlFor="prompt2_id">Prompt 2</Label>
                <Select
                  value={formData.prompt2_id || ''}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({
                      ...prev,
                      prompt2_id: value || undefined,
                    }))
                  }
                >
                  <SelectTrigger id="prompt2_id" className="w-full">
                    <SelectValue placeholder="Select Prompt 2" />
                  </SelectTrigger>
                  <SelectContent className="w-[min(90vw,24rem)] max-h-[60vh] overflow-y-auto">
                    <div className="px-2 py-1">
                      <Input
                        placeholder="Search…"
                        value={promptsSearch2}
                        onChange={(e) => setPromptsSearch2(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    {((promptsData?.data || []) as any[])
                      .filter(
                        (p: any) =>
                          !promptsSearch2 ||
                          String(p.name || '')
                            .toLowerCase()
                            .includes(promptsSearch2.toLowerCase())
                      )
                      .map((p: any) => (
                        <SelectItem key={p.prompt_id} value={p.prompt_id}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt 3 */}
              <div className="space-y-2">
                <Label htmlFor="prompt3_id">Prompt 3</Label>
                <Select
                  value={formData.prompt3_id || ''}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({
                      ...prev,
                      prompt3_id: value || undefined,
                    }))
                  }
                >
                  <SelectTrigger id="prompt3_id" className="w-full">
                    <SelectValue placeholder="Select Prompt 3" />
                  </SelectTrigger>
                  <SelectContent className="w-[min(90vw,24rem)] max-h-[60vh] overflow-y-auto">
                    <div className="px-2 py-1">
                      <Input
                        placeholder="Search…"
                        value={promptsSearch3}
                        onChange={(e) => setPromptsSearch3(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    {((promptsData?.data || []) as any[])
                      .filter(
                        (p: any) =>
                          !promptsSearch3 ||
                          String(p.name || '')
                            .toLowerCase()
                            .includes(promptsSearch3.toLowerCase())
                      )
                      .map((p: any) => (
                        <SelectItem key={p.prompt_id} value={p.prompt_id}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* IMAGES with upload icons */}
          <section className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm border border-indigo-100/70">
            <p className="mb-4 text-xs font-semibold tracking-wide text-indigo-600">
              IMAGES
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Logo */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 text-center">
                  Logo Image
                </p>
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <div className="flex h-24 w-full items-center justify-center rounded-md border border-dashed border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 transition">
                    <ImagePlus className="h-6 w-6 text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-500">Click to upload</span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                </label>
                {(logoPreviewUrl || formData.logo_image_url) && (
                  <div className="mt-2 relative w-full">
                    <div className="h-24 w-full rounded border bg-slate-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={logoPreviewUrl || (formData.logo_image_url as string)}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow-sm hover:bg-slate-100"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreviewUrl(null);
                          setFormData((prev) => ({ ...prev, logo_image_url: '' }));
                        }}
                      >
                        <X className="h-3 w-3 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow-sm hover:bg-slate-100"
                        onClick={() => {
                          const url = logoPreviewUrl || (formData.logo_image_url as string);
                          if (!url) return;
                          setLargePreviewUrl(url);
                          setLargePreviewTitle('Logo Image');
                        }}
                      >
                        <Eye className="h-3 w-3 text-slate-700" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Background */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 text-center">
                  Background Image
                </p>
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <div className="flex h-24 w-full items-center justify-center rounded-md border border-dashed border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 transition">
                    <ImagePlus className="h-6 w-6 text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-500">Click to upload</span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setBackgroundFile(e.target.files?.[0] || null)}
                  />
                </label>
                {(backgroundPreviewUrl || formData.background_image_url) && (
                  <div className="mt-2 relative w-full">
                    <div className="h-24 w-full rounded border bg-slate-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={backgroundPreviewUrl || (formData.background_image_url as string)}
                        alt="Background"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow-sm hover:bg-slate-100"
                        onClick={() => {
                          setBackgroundFile(null);
                          setBackgroundPreviewUrl(null);
                          setFormData((prev) => ({ ...prev, background_image_url: '' }));
                        }}
                      >
                        <X className="h-3 w-3 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow-sm hover:bg-slate-100"
                        onClick={() => {
                          const url = backgroundPreviewUrl || (formData.background_image_url as string);
                          if (!url) return;
                          setLargePreviewUrl(url);
                          setLargePreviewTitle('Background Image');
                        }}
                      >
                        <Eye className="h-3 w-3 text-slate-700" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Model */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 text-center">
                  Model Image
                </p>
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <div className="flex h-24 w-full items-center justify-center rounded-md border border-dashed border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 transition">
                    <ImagePlus className="h-6 w-6 text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-500">Click to upload</span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setModelFile(e.target.files?.[0] || null)}
                  />
                </label>
                {(modelPreviewUrl || formData.model_image_url) && (
                  <div className="mt-2 relative w-full">
                    <div className="h-24 w-full rounded border bg-slate-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={modelPreviewUrl || (formData.model_image_url as string)}
                        alt="Model"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow-sm hover:bg-slate-100"
                        onClick={() => {
                          setModelFile(null);
                          setModelPreviewUrl(null);
                          setFormData((prev) => ({ ...prev, model_image_url: '' }));
                        }}
                      >
                        <X className="h-3 w-3 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 border border-slate-200 shadow-sm hover:bg-slate-100"
                        onClick={() => {
                          const url = modelPreviewUrl || (formData.model_image_url as string);
                          if (!url) return;
                          setLargePreviewUrl(url);
                          setLargePreviewTitle('Model Image');
                        }}
                      >
                        <Eye className="h-3 w-3 text-slate-700" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ELITE PACKAGE OPTIONS + MODEL SETTINGS */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr,1fr]">
            {/* Elite options */}
            <div className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm border border-indigo-100/70">
              <p className="mb-3 text-xs font-semibold tracking-wide text-indigo-600">
                ELITE PACKAGE OPTIONS
              </p>

              <div className="mb-3 space-y-1.5">
                <Label>Output Format</Label>
                <div className="flex rounded-full bg-indigo-50 text-xs font-medium overflow-hidden border border-indigo-100/80">
                  {(['9:16', '1:1'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      className={`flex-1 py-1.5 text-center transition ${
                        formData.output_format === fmt
                          ? 'bg-indigo-500 text-white'
                          : 'text-slate-600 hover:bg-indigo-100/70'
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, output_format: fmt }))
                      }
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Resolution</Label>
                <div className="flex rounded-full bg-indigo-50 text-xs font-medium overflow-hidden border border-indigo-100/80">
                  {(['1K', '2K', '4K'] as const).map((res) => (
                    <button
                      key={res}
                      type="button"
                      className={`flex-1 py-1.5 text-center transition ${
                        formData.output_resolution === res
                          ? 'bg-indigo-500 text-white'
                          : 'text-slate-600 hover:bg-indigo-100/70'
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          output_resolution: res,
                        }))
                      }
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Model settings */}
            <div className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm border border-indigo-100/70">
              <p className="mb-3 text-xs font-semibold tracking-wide text-indigo-600">
                MODEL SETTINGS
              </p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Model Height (%)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => adjustNumber('model_height_pct', -1, 10, 100)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      className="text-center"
                      min={10}
                      max={100}
                      value={formData.model_height_pct ?? 88}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          model_height_pct: Number(e.target.value),
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => adjustNumber('model_height_pct', 1, 10, 100)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Bottom Offset (px)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        adjustNumber('model_bottom_offset_px', -2, 0, 400)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      className="text-center"
                      min={0}
                      max={400}
                      value={formData.model_bottom_offset_px ?? 40}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          model_bottom_offset_px: Number(e.target.value),
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        adjustNumber('model_bottom_offset_px', 2, 0, 400)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LIMITS + PAUSED */}
          <section className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-sm border border-indigo-100/70">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="max_images_per_hour">Max Images / Hour *</Label>
                <Input
                  id="max_images_per_hour"
                  type="number"
                  value={formData.max_images_per_hour ?? 0}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      max_images_per_hour: Number(e.target.value || 0),
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="max_images_per_msg">Max Images / Message *</Label>
                <Input
                  id="max_images_per_msg"
                  type="number"
                  value={formData.max_images_per_msg ?? 0}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      max_images_per_msg: Number(e.target.value || 0),
                    }))
                  }
                  required
                />
              </div>
            </div>

            {typeof store?.remaining_quota_images !== 'undefined' && (
              <div className="mt-3 space-y-1.5">
                <Label htmlFor="remaining_quota_images">
                  Remaining quota (images)
                </Label>
                <Input
                  id="remaining_quota_images"
                  value={store?.remaining_quota_images ?? 0}
                  readOnly
                />
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <Switch
                id="is_paused"
                checked={!!formData.is_paused}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_paused: checked }))
                }
              />
              <Label htmlFor="is_paused">Paused</Label>
            </div>
          </section>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              disabled={createStore.isPending || updateStore.isPending || isUploading}
            >
              {store ? 'Complete Update' : 'Complete Registration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      {/* Nested dialog for large image preview */}
      <Dialog
        open={!!largePreviewUrl}
        onOpenChange={(openPreview) => {
          if (!openPreview) {
            setLargePreviewUrl(null);
            setLargePreviewTitle('');
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{largePreviewTitle || 'Image preview'}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex items-center justify-center">
            {largePreviewUrl && (
              <img
                src={largePreviewUrl}
                alt={largePreviewTitle || 'Preview'}
                className="max-h-[70vh] w-full object-contain rounded-md"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
