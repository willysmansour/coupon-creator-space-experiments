import { 
  BarChart3, 
  Gift, 
  Upload, 
  CheckCircle,
  Settings,
  Calendar,
  Users,
  HelpCircle,
  LogOut,
  Home,
  Shield
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useAuth";

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
} from "@/components/ui/sidebar";

// Define menu items with role restrictions
const getMenuItems = (userRole?: string) => {
  const mainItems = [
    { title: "Dashboard", url: "/", icon: Home, roles: ['super_admin', 'company_admin'] },
    { title: "Rabattinställningar", url: "/campaigns", icon: Gift, roles: ['super_admin', 'company_admin'] },
    { title: "Uppladdningar", url: "/uploads", icon: Upload, roles: ['super_admin', 'company_admin'] },
    { title: "Kuponger", url: "/coupons", icon: CheckCircle, roles: ['super_admin', 'company_admin'] },
    { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ['super_admin', 'company_admin'] },
    { title: "Kunder", url: "/customers", icon: Users, roles: ['super_admin', 'company_admin'] },
    { title: "Admin Panel", url: "/admin", icon: Shield, roles: ['super_admin'] },
  ];

  const generalItems = [
    { title: "Inställningar", url: "/settings", icon: Settings, roles: ['super_admin', 'company_admin'] },
    { title: "Hjälp", url: "/help", icon: HelpCircle, roles: ['super_admin', 'company_admin'] },
    { title: "Logga ut", url: "/logout", icon: LogOut, roles: ['super_admin', 'company_admin'] },
  ];

  return {
    main: mainItems.filter(item => !userRole || item.roles.includes(userRole)),
    general: generalItems.filter(item => !userRole || item.roles.includes(userRole))
  };
};

export function ModernSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { data: userRole } = useUserRole();

  const menuItems = getMenuItems(userRole?.role);
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium shadow-sm" : "hover:bg-accent text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="px-4 py-6 bg-card border-r">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Gift className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <h2 className="font-bold text-lg text-foreground">Donezo</h2>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : 'text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3'}>
            MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className={collapsed ? 'sr-only' : 'text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3'}>
            GENERAL
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.general.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-5 w-5" />
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