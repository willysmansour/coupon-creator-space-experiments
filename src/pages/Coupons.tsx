import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { ModernMetricCard } from "@/components/ModernMetricCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, CheckCircle, Clock, Eye, Download } from "lucide-react";

const coupons = [
  {
    id: "SAVE20-ABC123",
    customerName: "Anna Andersson",
    email: "anna@example.com",
    campaign: "Sommardeal 2024",
    discount: 20,
    issuedAt: "2024-12-20 14:30",
    expiresAt: "2024-12-31 23:59",
    status: "active",
    used: false
  },
  {
    id: "WINTER15-DEF456",
    customerName: "Erik Svensson",
    email: "erik@example.com", 
    campaign: "Vinter Sale",
    discount: 15,
    issuedAt: "2024-12-19 10:15",
    expiresAt: "2025-01-15 23:59",
    status: "used",
    used: true,
    usedAt: "2024-12-20 16:45"
  },
  {
    id: "AUTUMN25-GHI789",
    customerName: "Maria Johansson",
    email: "maria@example.com",
    campaign: "Höstrea", 
    discount: 25,
    issuedAt: "2024-12-18 09:20",
    expiresAt: "2024-12-25 23:59",
    status: "active",
    used: false
  },
  {
    id: "BLACK30-JKL012",
    customerName: "Lars Nilsson",
    email: "lars@example.com",
    campaign: "Black Friday",
    discount: 30,
    issuedAt: "2024-11-25 12:00",
    expiresAt: "2024-11-30 23:59", 
    status: "expired",
    used: false
  }
];

const Coupons = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "used":
        return "bg-primary/10 text-primary border-primary/20";
      case "expired":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Aktiv";
      case "used":
        return "Använd";
      case "expired":
        return "Utgången";
      default:
        return status;
    }
  };

  const activeCoupons = coupons.filter(c => c.status === "active").length;
  const usedCoupons = coupons.filter(c => c.used).length;
  const expiredCoupons = coupons.filter(c => c.status === "expired").length;
  const totalValue = coupons.reduce((sum, coupon) => sum + coupon.discount, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ModernSidebar />
        
        <div className="flex-1">
          <ModernHeader />
          
          <main className="p-6 space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Kuponger</h1>
              <p className="text-muted-foreground">
                Övervaka utfärdade rabattkuponger och deras användning.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ModernMetricCard
                title="Totala kuponger"
                value={coupons.length.toString()}
                change="Alla utfärdade"
                variant="primary"
              />
              <ModernMetricCard
                title="Aktiva kuponger"
                value={activeCoupons.toString()}
                change="Kan användas"
                variant="secondary"
              />
              <ModernMetricCard
                title="Använda kuponger"
                value={usedCoupons.toString()}
                change={`${Math.round((usedCoupons / coupons.length) * 100)}% inlösningsgrad`}
                variant="accent"
              />
              <ModernMetricCard
                title="Utgångna"
                value={expiredCoupons.toString()}
                change="Ej använda"
                variant="secondary"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Exportera kuponger
              </Button>
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                Visa statistik
              </Button>
            </div>

            {/* Coupons List */}
            <div className="space-y-4">
              {coupons.map(coupon => (
                <Card key={coupon.id} className="p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-accent">
                        <Gift className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg text-foreground">
                            {coupon.id}
                          </h3>
                          <Badge className={getStatusColor(coupon.status)}>
                            {getStatusText(coupon.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-1">
                          <span className="font-medium">{coupon.customerName}</span> • {coupon.email}
                        </p>
                        
                        <p className="text-sm text-muted-foreground">
                          {coupon.campaign} • Utfärdad {coupon.issuedAt}
                        </p>
                        
                        {coupon.used && coupon.usedAt && (
                          <p className="text-sm text-success font-medium mt-1">
                            ✓ Använd {coupon.usedAt}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {coupon.discount}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Utgår: {coupon.expiresAt.split(' ')[0]}
                      </div>
                      {coupon.status === "active" && (
                        <div className="flex items-center gap-1 text-xs text-success mt-1">
                          <CheckCircle className="h-3 w-3" />
                          Giltig
                        </div>
                      )}
                      {coupon.status === "expired" && (
                        <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                          <Clock className="h-3 w-3" />
                          Utgången
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {coupons.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Gift className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">Inga kuponger utfärdade</p>
                  <p className="text-muted-foreground">Kuponger kommer att visas här när de utfärdas.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Coupons;