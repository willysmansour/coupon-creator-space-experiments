import { useState, useEffect } from "react";
import { useAssignRole } from "@/hooks/useAuth";
import { useCompanies } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAdminSession } from "@/domains/auth/hooks/useSecureAdminSession";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Building2, Users, UserPlus, LogOut, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserRole } from "@/hooks/useAuth";
import { SuperAdminLogin } from "@/components/SuperAdminLogin";

const Admin = () => {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("company_admin");
  const [selectedCompany, setSelectedCompany] = useState("");

  // ALL HOOKS MUST BE CALLED AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const queryClient = useQueryClient();
  const { isAuthenticated, logout: secureLogout, userEmail } = useSecureAdminSession();
  const { data: companies, refetch: refetchCompanies, isLoading: companiesLoading } = useCompanies();
  const assignRole = useAssignRole();
  
  // Fetch all users with their roles - ALWAYS call this hook
  const { data: allUsers, refetch: refetchUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        // 1) Hämta alla profiler (alla användare bör ha profil via trigger)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, email, first_name, last_name, company_id, created_at')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        // 2) Hämta roller separat (kan saknas för vissa användare)
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role, company_id');

        if (rolesError) {
          console.warn('Could not fetch user roles:', rolesError);
        }

        // 3) Hämta företag separat för att visa namn
        const { data: companiesList, error: companiesError } = await supabase
          .from('companies')
          .select('id, name');

        if (companiesError) {
          console.warn('Could not fetch companies:', companiesError);
        }

        // 4) Kombinera: basera på profiler (så att användare utan roll också syns)
        const combined = (profiles || []).map((profile) => {
          const roleMatch = userRoles?.find((r) => r.user_id === profile.user_id);
          const resolvedCompanyId = roleMatch?.company_id || profile.company_id || null;
          const company = companiesList?.find((c) => c.id === resolvedCompanyId);

          return {
            id: profile.user_id,
            user_id: profile.user_id,
            email: profile.email || 'Ingen email',
            first_name: profile.first_name || undefined,
            last_name: profile.last_name || undefined,
            role: roleMatch?.role || 'Saknar roll',
            company_id: resolvedCompanyId || undefined,
            company_name: company?.name || undefined,
            created_at: profile.created_at,
          };
        });

        return combined;
      } catch (error) {
        console.error('Error fetching admin users:', error);
        return [];
      }
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: 1,
    refetchOnWindowFocus: false
  });

  const handleLogout = async () => {
    await secureLogout();
    toast.success("Utloggad från Super Admin");
  };

  const handleLoginSuccess = () => {
    // Clear all cache when admin logs in to ensure fresh data
    queryClient.clear();
    toast.success("Inloggad som Super Admin - data uppdaterad");
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <SuperAdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const handleAssignRole = async () => {
    if (!newUserEmail || !selectedRole) {
      toast.error("Fyll i alla fält");
      return;
    }

    try {
      // Hämta användarens profil via e-post (case-insensitive om kolumnen är CITEXT)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, company_id')
        .eq('email', newUserEmail)
        .maybeSingle();

      if (profileError || !profile) {
        toast.error("Kunde inte hitta användare med den e-posten");
        return;
      }

      // Bestäm company_id
      const resolvedCompanyId = selectedRole === 'company_admin'
        ? (selectedCompany || profile.company_id || undefined)
        : undefined;

      if (!profile.user_id) {
        toast.error('Profil saknar user_id');
        return;
      }

      await assignRole.mutateAsync({
        userId: profile.user_id as string,
        role: selectedRole,
        companyId: resolvedCompanyId
      });

      toast.success('Roll tilldelad');
      setNewUserEmail("");
      setSelectedRole("company_admin");
      setSelectedCompany("");
      refetchUsers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Could not assign role";
      toast.error(errorMessage);
    }
  };

  // Main admin dashboard content
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Super Admin Panel</h1>
              <p className="text-muted-foreground">Hantera användare och företag i systemet</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Logga ut
          </Button>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Användare & Roller</TabsTrigger>
            <TabsTrigger value="companies">Företag</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Tilldela Roll till Användare</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="user-email">Användarens E-post</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role-select">Roll</Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                    <SelectTrigger id="role-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="company_admin">Företag Admin</SelectItem>
                      <SelectItem value="customer">Kund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedRole === 'company_admin' && (
                  <div className="space-y-2">
                    <Label htmlFor="company-select">Företag</Label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger id="company-select">
                        <SelectValue placeholder="Välj företag" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-end">
                  <Button onClick={handleAssignRole} disabled={assignRole.isPending}>
                    {assignRole.isPending ? "Tilldelar..." : "Tilldela Roll"}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Alla Användare ({allUsers?.length || 0})</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetchUsers();
                    toast.success("Användardata uppdaterad");
                  }}
                  disabled={usersLoading}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} />
                  {usersLoading ? 'Laddar...' : 'Uppdatera'}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Namn</TableHead>
                    <TableHead>Roll</TableHead>
                    <TableHead>Företag</TableHead>
                    <TableHead>Skapad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers && allUsers.length > 0 ? (
                    allUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '-'}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'super_admin' ? 'destructive' : 'default'}>
                            {user.role === 'super_admin' ? 'Super Admin' : 
                             user.role === 'company_admin' ? 'Företag Admin' : 'Kund'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.company_name || '-'}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString('sv-SE')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {usersLoading ? 'Laddar användare...' : 'Inga användare hittades'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Alla Företag ({companies?.length || 0})</h2>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      refetchCompanies();
                      toast.success("Data uppdaterad från databasen");
                    }}
                    disabled={companiesLoading}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${companiesLoading ? 'animate-spin' : ''}`} />
                    {companiesLoading ? 'Laddar...' : 'Uppdatera'}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Visar alla företag i systemet
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namn</TableHead>
                    <TableHead>Ägare</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rabatt</TableHead>
                    <TableHead>Skapad</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies?.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        {company.name}
                        {companies?.filter(c => c.name === company.name).length > 1 && (
                          <Badge variant="destructive" className="ml-2 text-xs">DUBLETT</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {company.owner_user_id ? company.owner_user_id.slice(0, 8) + '...' : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {company.is_active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </TableCell>
                      <TableCell>{company.discount_percentage || 10}%</TableCell>
                      <TableCell>{new Date(company.created_at).toLocaleDateString('sv-SE')}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => {
                            if (confirm(`Är du säker på att du vill ta bort företaget "${company.name}"?`)) {
                              toast.error("Delete-funktionen är inte implementerad ännu");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;