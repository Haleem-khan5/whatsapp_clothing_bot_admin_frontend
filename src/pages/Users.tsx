import { useMemo, useState } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { UserDialog } from '@/components/UserDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useUsers, useDeleteUser, AppUser } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function Users() {
  const { isAdmin, user: current } = useAuth();
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
  });
  const { data } = useUsers();
  const users = useMemo(() => {
    return (data?.data || []).map((u: any) => ({
      id: u.user_id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      active: u.is_active,
      created_at: u.created_at,
      _raw: u,
    }));
  }, [data?.data]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<AppUser | null>(null);
  const del = useDeleteUser();
  const { toast } = useToast();

  const columns: Column<any>[] = [
    { key: 'email', label: '📧 Email', sortable: true },
    { key: 'full_name', label: '👤 Full Name', sortable: true },
    {
      key: 'role',
      label: '🎯 Role',
      render: (row) => (
        <Badge
          variant={row.role === 'admin' ? 'default' : 'secondary'}
          className={row.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}
        >
          {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'active',
      label: '⚡ Status',
      render: (row) => (
        <Badge
          variant={row.active ? 'default' : 'secondary'}
          className={row.active ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}
        >
          {row.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { key: 'created_at', label: '📅 Created At', sortable: true },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setSelected(row._raw);
                setDialogOpen(true);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            {isAdmin && current?.id !== row.id && (
              <DropdownMenuItem
                className="text-red-600"
                onClick={async () => {
                  try {
                    await del.mutateAsync(row.id);
                    toast({ title: 'User deleted' });
                  } catch (e: any) {
                    toast({ title: 'Delete failed', description: e?.response?.data?.message, variant: 'destructive' });
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-400 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Users</h1>
            <p className="text-sm text-white/80 mt-1">
              Manage admin and staff users within your organization.
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => { setSelected(null); setDialogOpen(true); }}
              className="bg-white text-purple-600 hover:bg-purple-100 font-semibold shadow-md transition-all hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* USERS TABLE CARD */}
      <Card className="shadow-xl border-none bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-purple-700 text-xl font-semibold">User Directory</CardTitle>
          <CardDescription className="text-purple-400 font-medium">
            Below is the list of all system users with their roles and status.
          </CardDescription>
        </CardHeader>

        <Separator className="bg-gradient-to-r from-purple-400 to-pink-400 h-[2px] my-1 rounded" />

        <CardContent>
          <div className="rounded-xl overflow-hidden border border-purple-100 shadow-sm bg-white/70 backdrop-blur-sm">
            <DataTable
              columns={columns}
              data={users}
              currentPage={filters.page}
              totalPages={Math.max(1, Math.ceil(((data?.meta?.total as number) || users.length) / filters.page_size))}
              onPageChange={(page) => setFilters({ ...filters, page })}
              searchable={false}
              rowClassName="hover:bg-purple-50/80 transition-colors"
            />
          </div>
        </CardContent>
      </Card>
      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={selected} />
    </div>
  );
}
