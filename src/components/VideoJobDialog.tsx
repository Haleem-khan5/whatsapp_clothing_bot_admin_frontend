import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStores } from '@/hooks/useStores';
import { useCreateVideoJob } from '@/hooks/useVideoJobs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface VideoJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoJobDialog({ open, onOpenChange }: VideoJobDialogProps) {
  const { user } = useAuth();
  const { data: storesResp } = useStores();
  const stores = (storesResp?.data || []).map((s: any) => ({ id: s.store_id, name: s.store_name }));

  const [form, setForm] = useState({
    job_date: new Date().toISOString().slice(0, 10),
    store_id: '',
    uploaded_by: '',
    video_type: '',
    duration_sec: '',
    credits_per_job: '',
    my_cost_egp: '',
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const createVideoJob = useCreateVideoJob();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, uploaded_by: user?.id || '' }));
    }
  }, [open, user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      let source_url: string | undefined = undefined;
      if (attachmentFile) {
        const signRes = await api.post('/uploads/sign', {
          filename: `${Date.now()}_${attachmentFile.name}`,
          content_type: attachmentFile.type || 'application/octet-stream',
          folder: `video-jobs/${form.store_id || 'general'}`,
        });
        const { put_url, public_url } = signRes.data.data || signRes.data;
        await fetch(put_url, {
          method: 'PUT',
          headers: {
            'Content-Type': attachmentFile.type || 'application/octet-stream',
          },
          body: attachmentFile,
        });
        source_url = public_url;
      }

      await createVideoJob.mutateAsync({
        job_date: form.job_date,
        store_id: form.store_id,
        uploaded_by: form.uploaded_by || undefined,
        video_type: form.video_type || undefined,
        duration_sec: Number(form.duration_sec),
        credits_per_job: Number(form.credits_per_job),
        my_cost_egp: Number(form.my_cost_egp),
        source_url,
      });
      toast({ title: 'Video job created', description: 'The video job has been added.' });
      onOpenChange(false);
      setAttachmentFile(null);
    } catch (err: any) {
      toast({ title: 'Failed to create video job', description: err?.message || 'Please try again', variant: 'destructive' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Video Job</DialogTitle>
          <DialogDescription>Enter video job details to track processing and costs.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="job_date">Job Date *</Label>
              <Input id="job_date" type="date" value={form.job_date} onChange={(e) => setForm({ ...form, job_date: e.target.value })} required />
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
              <Label htmlFor="video_type">Video Type</Label>
              <Input id="video_type" value={form.video_type} onChange={(e) => setForm({ ...form, video_type: e.target.value })} placeholder="e.g. Product, Promo" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="duration_sec">Duration (sec) *</Label>
              <Input id="duration_sec" type="number" min="0" step="1" value={form.duration_sec} onChange={(e) => setForm({ ...form, duration_sec: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="credits_per_job">Credits/Job *</Label>
              <Input id="credits_per_job" type="number" min="0" step="0.01" value={form.credits_per_job} onChange={(e) => setForm({ ...form, credits_per_job: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="my_cost_egp">My Cost (EGP) *</Label>
              <Input id="my_cost_egp" type="number" min="0" step="0.01" value={form.my_cost_egp} onChange={(e) => setForm({ ...form, my_cost_egp: e.target.value })} required />
            </div>
          <div className="space-y-1">
            <Label htmlFor="attachment">Upload Picture (optional)</Label>
            <Input id="attachment" type="file" accept="image/*" onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)} />
          </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createVideoJob.isPending}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


