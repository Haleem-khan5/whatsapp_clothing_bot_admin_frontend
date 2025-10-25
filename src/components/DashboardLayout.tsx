import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function DashboardLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden bg-gradient-to-br from-white via-indigo-50 to-pink-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 sticky top-0 z-20 px-6 flex items-center justify-between border-b border-indigo-100/70 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-white hover:bg-white/15" />
              <div className="font-extrabold text-lg tracking-tight">Dress Bot Dashboard</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white/90">{user.full_name}</span>
                <Badge className="bg-white text-purple-700 font-semibold">{user.role}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-white/15">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 min-w-0 overflow-x-auto p-6 bg-gradient-to-br from-white/70 via-indigo-50/60 to-pink-50/60">
            <div className="rounded-2xl border border-indigo-100/70 bg-white/70 backdrop-blur-sm shadow-sm p-4 sm:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
