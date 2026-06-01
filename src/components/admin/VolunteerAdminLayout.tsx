import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Briefcase,
  FolderKanban,
  ArrowLeft,
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
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useUserRole } from '@/hooks/useUserRole';
import { NUCLEUS_NAMES } from '@/lib/volunteer-constants';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const baseItems = [
  { title: 'Dashboard', url: '/admin/voluntarios', icon: LayoutDashboard, exact: true },
  { title: 'Cadastros', url: '/admin/voluntarios/cadastros', icon: ClipboardList },
  { title: 'Oportunidades', url: '/admin/voluntarios/oportunidades', icon: Briefcase },
  { title: 'Projetos', url: '/admin/voluntarios/projetos', icon: FolderKanban },
];

function VolunteerSidebar({ isAdmin: _isAdmin }: { isAdmin: boolean }) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { pathname } = useLocation();

  const items = baseItems;

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + '/');

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Voluntariado</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                    <NavLink to={item.url} end={item.exact} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function VolunteerAdminLayout() {
  const { isAdmin, nucleus } = useUserRole();
  const navigate = useNavigate();

  const scope = isAdmin && !nucleus ? 'Visão Global' : nucleus ? NUCLEUS_NAMES[nucleus] || nucleus : 'Visão Global';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <VolunteerSidebar isAdmin={isAdmin} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b px-4 gap-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div>
                <h1 className="text-sm font-semibold">Gestão de Voluntariado</h1>
                <p className="text-xs text-muted-foreground">{scope}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Admin
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
