import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppUser, useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: AppUser | null;
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const { isAdmin, user: current } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [password, setPassword] = useState('');
  const create = useCreateUser();
  const update = useUpdateUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setEmail(user?.email || '');
    setFullName(user?.full_name || '');
    setRole((user?.role as any) || 'staff');
    setPassword('');
  }, [open, user?.email, user?.full_name, user?.role]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (user?.user_id) {
        const payload: any = { full_name: fullName };
        // Admin can change email/role/active; self can change password/full_name only
        if (isAdmin) {
          payload.email = email;
          payload.role = role;
        }
        if (password) payload.password = password;
        await update.mutateAsync({ id: user.user_id, data: payload });
        toast({ title: 'User updated' });
      } else {
        await create.mutateAsync({ email, full_name: fullName, role, password });
        toast({ title: 'User created' });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.message, variant: 'destructive' });
    }
  }

  const isSelf = current?.id === user?.user_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {user ? (isSelf ? 'Update your profile details' : 'Update user details') : 'Create a new user'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!user && !isAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(val: any) => setRole(val)} disabled={!!user && !isAdmin}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{user ? 'New Password (optional)' : 'Password'}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!user}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {user ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

































