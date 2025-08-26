import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Bell, User, Building2 } from "lucide-react";
import { useUserRole } from "@/hooks/useAuth";

export function ModernHeader() {
  const { data: userRole } = useUserRole();

  const getRoleDisplay = () => {
    switch (userRole?.role) {
      case 'super_admin':
        return { label: 'Super Admin', variant: 'destructive' as const };
      case 'company_admin':
        return { label: 'Företag Admin', variant: 'default' as const };
      default:
        return { label: 'Kund', variant: 'secondary' as const };
    }
  };

  const roleDisplay = getRoleDisplay();

  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
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
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Sök..." 
            className="pl-10 w-64 bg-input border-0 focus:ring-2 focus:ring-primary/20"
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
              <p className="text-sm font-medium">Ingen användare</p>
              <p className="text-xs text-muted-foreground">Logga in för att komma igång</p>
            </div>
          </Button>
        )}
      </div>
    </header>
  );
}