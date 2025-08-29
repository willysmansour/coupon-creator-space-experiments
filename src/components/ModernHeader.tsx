import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Bell, User, Building2 } from "lucide-react";
import { useUserRole } from "@/hooks/useAuth";
import { CompanySelector } from "@/components/CompanySelector";

interface ModernHeaderProps {
  selectedCompanyId?: string;
  onCompanyChange?: (companyId: string | undefined) => void;
}

export const ModernHeader = React.memo(({ selectedCompanyId, onCompanyChange }: ModernHeaderProps = {}) => {
  const { data: userRole } = useUserRole();

  const getRoleDisplay = () => {
    switch (userRole?.role) {
      case 'super_admin':
        return { label: 'Super Admin', variant: 'destructive' as const };
      case 'company_admin':
        return { label: 'Company Admin', variant: 'default' as const };
      default:
        return { label: 'Customer', variant: 'secondary' as const };
    }
  };

  const roleDisplay = getRoleDisplay();

  return (
    <header className="h-16 sticky top-0 z-30 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          {userRole?.company_name && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {userRole.company_name}
            </p>
          )}
        </div>
        
        {/* Company selector for super admins */}
        {userRole?.role === 'super_admin' && onCompanyChange && (
          <CompanySelector 
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={onCompanyChange}
          />
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-10 w-64 bg-secondary/60 border border-border focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        
        <Button variant="outline" size="sm" className="gap-2">
          <Bell className="h-4 w-4" />
        </Button>
        
        {userRole ? (
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {userRole.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{userRole.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant={roleDisplay.variant} className="text-xs">
                  {roleDisplay.label}
                </Badge>
              </div>
            </div>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
              ?
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">No user</p>
              <p className="text-xs text-muted-foreground">Sign in to get started</p>
            </div>
          </Button>
        )}
      </div>
    </header>
  );
});

ModernHeader.displayName = 'ModernHeader';