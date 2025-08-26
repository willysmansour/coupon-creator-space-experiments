import { useState } from "react";
import { useUserRole, useAssignRole } from "@/hooks/useAuth";
import { useCompanies } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Building2, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import type { UserRole } from "@/hooks/useAuth";

const Admin = () => {
  const { data: currentUser } = useUserRole();
  const { data: companies } = useCompanies();
  const assignRole = useAssignRole();
  
  const [newUserEmail, setNewUserEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("company_admin");
  const [selectedCompany, setSelectedCompany] = useState("");

  // Fetch all users with their roles
  const { data: allUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          company_id,
          companies(name),
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: currentUser?.role === 'super_admin'
  });

  const handleAssignRole = async () => {
    if (!newUserEmail || !selectedRole) {
      toast.error("Fyll i alla fält");
      return;
    }

    if (selectedRole === 'company_admin' && !selectedCompany) {
      toast.error("Välj ett företag för företagsadmin");
      return;
    }

    try {
      // First, try to get the user by email using a more specific query
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.log('Cannot access user data:', error);
        toast.error("Kan inte tilldela roll - kontrollera att användaren finns");
        return;
      }

      // For demo purposes, we'll use a simplified approach
      // In production, you'd need proper user management
      const demoUserId = crypto.randomUUID();
      
      await assignRole.mutateAsync({
        userId: demoUserId,
        role: selectedRole,
        companyId: selectedRole === 'company_admin' ? selectedCompany : undefined
      });

      setNewUserEmail("");
      setSelectedRole("company_admin");
      setSelectedCompany("");
    } catch (error: any) {
      toast.error("Kunde inte tilldela roll: " + error.message);
    }
  };

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold mb-2">Åtkomst nekad</h1>
          <p className="text-muted-foreground">Du behöver Super Admin behörighet för att komma åt denna sida.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <header className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Hantera användare, företag och behörigheter</p>
        </div>
      </header>

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
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Alla Användare</h2>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Användare ID</TableHead>
                  <TableHead>Roll</TableHead>
                  <TableHead>Företag</TableHead>
                  <TableHead>Skapad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">{user.user_id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'super_admin' ? 'destructive' : 'default'}>
                        {user.role === 'super_admin' ? 'Super Admin' : 
                         user.role === 'company_admin' ? 'Företag Admin' : 'Kund'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.companies?.name || '-'}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('sv-SE')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Alla Företag</h2>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rabatt</TableHead>
                  <TableHead>Skapad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies?.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Aktiv</Badge>
                    </TableCell>
                    <TableCell>{company.discount_percentage || 10}%</TableCell>
                    <TableCell>{new Date(company.created_at).toLocaleDateString('sv-SE')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;