import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { ModernMetricCard } from "@/components/ModernMetricCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Eye, Gift } from "lucide-react";

const customers: any[] = [];

const Customers = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "vip":
        return "bg-primary/10 text-primary border-primary/20";
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "vip":
        return "VIP";
      case "active":
        return "Aktiv";
      case "inactive":
        return "Inaktiv";
      default:
        return status;
    }
  };

  const activeCustomers = customers.filter(c => c.status !== "inactive").length;
  const vipCustomers = customers.filter(c => c.status === "vip").length;
  const totalSubmissions = customers.reduce((sum, c) => sum + c.totalSubmissions, 0);
  const totalCoupons = customers.reduce((sum, c) => sum + c.totalCoupons, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ModernSidebar />
        
        <div className="flex-1">
          <ModernHeader />
          
          <main className="p-6 space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Kunder</h1>
              <p className="text-muted-foreground">
                Hantera dina kunder och få insikt i deras engagemang.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ModernMetricCard
                title="Totala kunder"
                value={customers.length.toString()}
                change="Registrerade användare"
                variant="primary"
              />
              <ModernMetricCard
                title="Aktiva kunder"
                value={activeCustomers.toString()}
                change={`${Math.round((activeCustomers / customers.length) * 100)}% av totalt`}
                variant="secondary"
              />
              <ModernMetricCard
                title="VIP kunder"
                value={vipCustomers.toString()}
                change="Högengagerade"
                variant="accent"
              />
              <ModernMetricCard
                title="Engagemang"
                value={`${Math.round((totalCoupons / totalSubmissions) * 100)}%`}
                change="Inlösningsgrad"
                variant="secondary"
              />
            </div>

            {/* Customers List */}
            <div className="space-y-4">
              {customers.map(customer => (
                <Card key={customer.id} className="p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={customer.avatar} 
                          alt={customer.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg text-foreground">
                            {customer.name}
                          </h3>
                          <Badge className={getStatusColor(customer.status)}>
                            {getStatusText(customer.status)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          Medlem sedan {customer.joinDate} • Senast aktiv {customer.lastActivity}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{customer.totalSubmissions}</p>
                          <p className="text-xs text-muted-foreground">Uppladdningar</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{customer.totalCoupons}</p>
                          <p className="text-xs text-muted-foreground">Kuponger</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Visa profil
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Gift className="h-4 w-4" />
                          Skicka erbjudande
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {customers.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">Inga kunder ännu</p>
                  <p className="text-muted-foreground">Kunder som deltar i kampanjer kommer att visas här.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Customers;