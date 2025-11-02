import { NavLink, useLocation, matchPath } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Image,
  Video,
  Receipt,
  RotateCcw,
  Download,
  BookOpen,
  Phone,
  Users,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const mainItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Stores', url: '/stores', icon: Store },
  { title: 'Image Jobs', url: '/image-jobs', icon: Image },
  { title: 'Video Jobs', url: '/video-jobs', icon: Video },
  { title: 'Transactions', url: '/transactions', icon: Receipt },
  { title: 'Refunds', url: '/refunds', icon: RotateCcw },
  { title: 'Downloads', url: '/downloads', icon: Download },
  { title: 'Error Logs', url: '/error-logs', icon: AlertTriangle },
];

const catalogItems = [
  { title: 'Credit Catalog', url: '/catalogs/credit', icon: BookOpen },
  { title: 'Payment For', url: '/catalogs/payment-for', icon: BookOpen },
  { title: 'Payment Method', url: '/catalogs/payment-method', icon: BookOpen },
];

const opsItems = [{ title: 'Phones', url: '/phones', icon: Phone }];

export function AppSidebar() {
  const { state } = useSidebar();
  const { isAdmin } = useAuth();
  const collapsed = state === 'collapsed';
  const { pathname } = useLocation();

  // Base classes with active state driven by data-active attribute from SidebarMenuButton
  const baseItemClasses = `relative flex items-center gap-3 px-3 py-2.5 rounded-md
    text-gray-100 transition-all duration-200 ease-in-out transform
    hover:!bg-white hover:!text-black hover:[&>svg]:text-black hover:shadow-md hover:scale-[1.04]
    focus-visible:ring-2 focus-visible:ring-fuchsia-400/60
    data-[active=true]:bg-white data-[active=true]:text-black data-[active=true]:shadow-md data-[active=true]:ring-1 data-[active=true]:ring-purple-400/40
    data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-0 data-[active=true]:before:bottom-0 data-[active=true]:before:w-[6px] data-[active=true]:before:bg-purple-600 data-[active=true]:before:rounded-r data-[active=true]:before:content-['']
    data-[active=true]:[&>svg]:text-black`;

  const sectionLabel = collapsed
    ? 'sr-only'
    : 'px-3 pb-2 text-[15px] font-bold tracking-wide text-white/90 uppercase';

  const sectionWrapper =
    'rounded-xl bg-white/10 backdrop-blur-md p-2 shadow-inner shadow-purple-800/20 border border-white/10';

  return (
    <Sidebar
      className={`border-r border-purple-300/20 bg-gradient-to-b from-purple-800 via-fuchsia-700 to-pink-600 
        ${collapsed ? 'w-14' : 'w-64'} text-white transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="p-4 space-y-6">
        {/* MAIN */}
        <SidebarGroup className={sectionWrapper}>
          <SidebarGroupLabel className={sectionLabel}>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isActive = Boolean(matchPath({ path: item.url, end: true }, pathname));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} className={baseItemClasses}>
                      <NavLink to={item.url} end>
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CATALOGS */}
        <SidebarGroup className={sectionWrapper}>
          <SidebarGroupLabel className={sectionLabel}>Catalogs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {catalogItems.map((item) => {
                const isActive = Boolean(matchPath({ path: item.url, end: true }, pathname));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} className={baseItemClasses}>
                      <NavLink to={item.url} end>
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* OPERATIONS */}
        <SidebarGroup className={sectionWrapper}>
          <SidebarGroupLabel className={sectionLabel}>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {opsItems.map((item) => {
                const isActive = Boolean(matchPath({ path: item.url, end: true }, pathname));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} className={baseItemClasses}>
                      <NavLink to={item.url} end>
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ADMIN */}
        {isAdmin && (
          <SidebarGroup className={sectionWrapper}>
            <SidebarGroupLabel className={sectionLabel}>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={Boolean(matchPath({ path: '/users', end: true }, pathname))}
                    className={baseItemClasses}
                  >
                    <NavLink to="/users" end>
                      <Users className="h-5 w-5" />
                      {!collapsed && <span>Users</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={Boolean(matchPath({ path: '/settings', end: true }, pathname))}
                    className={baseItemClasses}
                  >
                    <NavLink to="/settings" end>
                      <Settings className="h-5 w-5" />
                      {!collapsed && <span>Settings</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
