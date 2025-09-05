import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Bell, User, Building2, Menu } from "lucide-react";
import { useUserRole } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfileData";
import { useCompanyAwareCompanies } from "@/hooks/useCompanyAwareData";
import { CompanySelector } from "@/components/common/CompanySelector";
import { useMobile } from "@/hooks/use-mobile";

interface ModernHeaderProps {
  selectedCompanyId?: string;
  onCompanyChange?: (companyId: string | undefined) => void;
}

export const ModernHeader = React.memo(({ selectedCompanyId, onCompanyChange }: ModernHeaderProps = {}) => {
  const { data: userRole } = useUserRole();
  const { data: currentProfile } = useCurrentProfile();
  const { data: companies = [] } = useCompanyAwareCompanies();
  const { isMobile, isTablet } = useMobile();
  
  const company = companies[0]; // Get the user's company

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

  // Get user's display name
  const getUserDisplayName = () => {
    if (currentProfile?.first_name && currentProfile?.last_name) {
      return `${currentProfile.first_name} ${currentProfile.last_name}`;
    } else if (currentProfile?.first_name) {
      return currentProfile.first_name;
    } else if (currentProfile?.last_name) {
      return currentProfile.last_name;
    }
    return userRole?.email?.split('@')[0] || 'User';
  };

  // Get user's initials for avatar fallback
  const getUserInitials = () => {
    if (currentProfile?.first_name && currentProfile?.last_name) {
      return `${currentProfile.first_name[0]}${currentProfile.last_name[0]}`.toUpperCase();
    } else if (currentProfile?.first_name) {
      return currentProfile.first_name[0]?.toUpperCase() || 'U';
    } else if (currentProfile?.last_name) {
      return currentProfile.last_name[0]?.toUpperCase() || 'U';
    }
    return userRole?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <header className={`${isMobile ? 'h-14' : 'h-16'} sticky top-0 z-30 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b flex items-center justify-between ${isMobile ? 'px-3' : 'px-6'}`}>
      <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-6'}`}>
        <SidebarTrigger />
        <div className={isMobile ? 'min-w-0' : ''}>
          <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-foreground`}>Dashboard</h1>
          {company?.name && !isMobile && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {company.name}
            </p>
          )}
        </div>
        
        {/* Company selector for super admins - hidden on mobile */}
        {userRole?.role === 'super_admin' && onCompanyChange && !isMobile && (
          <CompanySelector 
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={onCompanyChange}
          />
        )}
      </div>
      
      <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
        {/* Search - hidden on mobile */}
        {!isMobile && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-64 bg-secondary/60 border border-border focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
        )}
        
        {/* Bell button - hidden on mobile */}
        {!isMobile && (
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
          </Button>
        )}
        
        {userRole ? (
          <Button variant="ghost" size={isMobile ? "icon" : "sm"} className={`${isMobile ? 'p-2' : 'gap-2'}`}>
            <Avatar className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
              <AvatarImage src={currentProfile?.avatar_url} alt={getUserDisplayName()} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            {!isMobile && (
              <div className="text-left">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={roleDisplay.variant} className="text-xs">
                    {roleDisplay.label}
                  </Badge>
                </div>
              </div>
            )}
          </Button>
        ) : (
          <Button variant="ghost" size={isMobile ? "icon" : "sm"} className={`${isMobile ? 'p-2' : 'gap-2'}`}>
            <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium`}>
              ?
            </div>
            {!isMobile && (
              <div className="text-left">
                <p className="text-sm font-medium">No user</p>
                <p className="text-xs text-muted-foreground">Sign in to get started</p>
              </div>
            )}
          </Button>
        )}
      </div>
    </header>
  );
});

ModernHeader.displayName = 'ModernHeader';