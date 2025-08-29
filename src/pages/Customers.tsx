import React, { useState, useMemo } from "react";
import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { ModernMetricCard } from "@/components/ModernMetricCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Eye, Gift } from "lucide-react";
import { useFilteredUploads } from "@/hooks/useFilteredSupabaseData";
import { LoadingSection } from "@/components/ui/loading";

const Customers = React.memo(() => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();
  const { data: uploads = [], isLoading } = useFilteredUploads(selectedCompanyId);
  
  // Memoized customer data processing to prevent recalculation on every render
  const customers = useMemo(() => {
    return uploads.reduce((acc, upload) => {
      if (upload.customer_name && upload.customer_email) {
        const existingCustomer = acc.find(c => c.email === upload.customer_email);
        if (existingCustomer) {
          existingCustomer.totalSubmissions++;
          if (upload.status === 'approved') {
            existingCustomer.totalCoupons++;
          }
        } else {
          acc.push({
            id: upload.id,
            name: upload.customer_name,
            email: upload.customer_email,
            totalSubmissions: 1,
            totalCoupons: upload.status === 'approved' ? 1 : 0,
            status: upload.status === 'approved' ? 'active' : 'inactive',
            joinDate: new Date(upload.created_at).toLocaleDateString('en-GB'),
            lastActivity: new Date(upload.updated_at).toLocaleDateString('en-GB'),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(upload.customer_name)}&background=random`
          });
        }
      }
      return acc;
    }, [] as any[]);
  }, [uploads]);

  // Memoized status color function to prevent recreation
  const getStatusColor = useMemo(() => (status: string) => {
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
  }, []);

  // Memoized status text function to prevent recreation
  const getStatusText = useMemo(() => (status: string) => {
    switch (status) {
      case "vip":
        return "VIP";
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      default:
        return status;
    }
  }, []);

  // Memoized statistics to prevent recalculation
  const stats = useMemo(() => {
    const activeCustomers = customers.filter(c => c.status !== "inactive").length;
    const vipCustomers = customers.filter(c => c.status === "vip").length;
    const totalSubmissions = customers.reduce((sum, c) => sum + c.totalSubmissions, 0);
    const totalCoupons = customers.reduce((sum, c) => sum + c.totalCoupons, 0);
    
    return { activeCustomers, vipCustomers, totalSubmissions, totalCoupons };
  }, [customers]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ModernSidebar />
        
        <div className="flex-1">
          <ModernHeader />
          
          <main className="p-6 space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Customers</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Manage your customers and understand their engagement.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ModernMetricCard
                title="Total customers"
                value={customers.length.toString()}
                change="Registered users"
                variant="primary"
              />
              <ModernMetricCard
                title="Active customers"
                value={stats.activeCustomers.toString()}
                change={`${Math.round((stats.activeCustomers / customers.length) * 100)}% of total`}
                variant="secondary"
              />
              <ModernMetricCard
                title="VIP customers"
                value={stats.vipCustomers.toString()}
                change="Highly engaged"
                variant="accent"
              />
              <ModernMetricCard
                title="Engagement"
                value={customers.length > 0 ? `${Math.round((stats.totalCoupons / stats.totalSubmissions) * 100)}%` : '0%'}
                change="Redemption rate"
                variant="secondary"
              />
            </div>

            {/* Customers List */}
            <div className="space-y-4">
              {isLoading && <LoadingSection message="Loading customers..." />}

              {!isLoading && customers.length === 0 && (
                <Card className="p-8 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-base font-medium text-foreground mb-1">No customers yet</p>
                  <p className="text-sm text-muted-foreground">Customers who participate in campaigns will appear here.</p>
                </Card>
              )}

              {!isLoading && customers.map(customer => (
                <Card key={customer.id} className="p-6">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted ring-1 ring-border flex-shrink-0">
                        <img 
                          src={customer.avatar} 
                          alt={customer.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-[15px] leading-tight text-foreground truncate">
                            {customer.name}
                          </h3>
                          <Badge className={getStatusColor(customer.status)}>
                            {getStatusText(customer.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          Member since {customer.joinDate} • Last active {customer.lastActivity}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-xl font-semibold text-foreground tabular-nums">{customer.totalSubmissions}</p>
                          <p className="text-xs text-muted-foreground">Uploads</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-semibold text-primary tabular-nums">{customer.totalCoupons}</p>
                          <p className="text-xs text-muted-foreground">Coupons</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View profile
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Gift className="h-4 w-4" />
                          Send offer
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
});

Customers.displayName = 'Customers';

export default Customers;