import React from "react";
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
  Shield,
  Building2
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useAuth";
import { useCompanyAwareCompanies } from "@/hooks/useCompanyAwareData";
import { useMobile } from "@/hooks/use-mobile";

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
    { title: "Discount Settings", url: "/campaigns", icon: Gift, roles: ['super_admin', 'company_admin'] },
    { title: "Uploads", url: "/uploads", icon: Upload, roles: ['super_admin', 'company_admin'] },
    { title: "Coupons", url: "/coupons", icon: CheckCircle, roles: ['super_admin', 'company_admin'] },
    { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ['super_admin', 'company_admin'] },
    { title: "Customers", url: "/customers", icon: Users, roles: ['super_admin', 'company_admin'] },
    // Admin Panel is hidden from navigation - only accessible via direct URL for super admins
  ];

  const generalItems = [
    { title: "Settings", url: "/settings", icon: Settings, roles: ['super_admin', 'company_admin'] },
    { title: "Help", url: "/help", icon: HelpCircle, roles: ['super_admin', 'company_admin'] },
    { title: "Log out", url: "/logout", icon: LogOut, roles: ['super_admin', 'company_admin'] },
  ];

  return {
    main: mainItems.filter(item => !userRole || item.roles.includes(userRole)),
    general: generalItems.filter(item => !userRole || item.roles.includes(userRole))
  };
};

export const ModernSidebar = React.memo(() => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { data: userRole } = useUserRole();
  const { data: companies = [] } = useCompanyAwareCompanies();
  const { isMobile } = useMobile();
  
  const company = companies[0]; // Get the user's company

  const menuItems = getMenuItems(userRole?.role);
  const isActive = (path: string) => currentPath === path;
  const getNavCls = (isActive: boolean) =>
    isActive ? "bg-primary text-primary-foreground font-medium shadow-sm" : "hover:bg-accent text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={`${collapsed ? "w-16" : isMobile ? "w-72" : "w-64"} ${isMobile ? 'fixed inset-y-0 left-0 z-50' : ''}`} collapsible="icon">
      <SidebarContent className={`${isMobile ? 'px-3 py-4' : 'px-4 py-6'} bg-card border-r shadow-[inset_-1px_0_0_hsl(var(--border))]`}>
        <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
          <div className={`flex flex-col items-center ${isMobile ? 'gap-2' : 'gap-3'} ${isMobile ? 'mb-4' : 'mb-6'}`}>
            {company?.logo ? (
              <img 
                src={company.logo} 
                alt={company.name} 
                className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg object-cover mx-auto`}
              />
            ) : (
              <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg bg-primary flex items-center justify-center mx-auto`}>
                <Gift className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary-foreground`} />
              </div>
            )}
            {!collapsed && (
              <div className="text-center">
                <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-foreground`}>{company?.name || 'Donezo'}</h2>
                {company?.name && (
                  <p className="text-xs text-muted-foreground mt-1">Company</p>
                )}
              </div>
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
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${getNavCls(isActive)}`
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
                      end 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${getNavCls(isActive)}`
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
});

ModernSidebar.displayName = 'ModernSidebar';