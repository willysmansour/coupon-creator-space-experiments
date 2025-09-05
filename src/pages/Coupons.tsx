import { ModernSidebar } from "@/components/layout/ModernSidebar";
import { ModernHeader } from "@/components/layout/ModernHeader";
import { ModernMetricCard } from "@/components/dashboard/ModernMetricCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, CheckCircle, Clock, Eye, Download } from "lucide-react";
import { useFilteredCoupons } from "@/hooks/useFilteredSupabaseData";
import { DashboardAuth } from "@/components/auth/DashboardAuth";
import { useState } from "react";
import { LoadingSection } from "@/components/ui/loading";

const Coupons = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();
  const { data: coupons = [], isLoading } = useFilteredCoupons(selectedCompanyId);
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
        return "Active";
      case "used":
        return "Used";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  };

  const activeCoupons = coupons.filter(c => !c.is_used).length;
  const usedCoupons = coupons.filter(c => c.is_used).length;
  const expiredCoupons = coupons.filter(c => new Date(c.expires_at) < new Date()).length;
  const totalCoupons = coupons.length;

  return (
    <DashboardAuth>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <ModernSidebar />
          
          <div className="flex-1">
            <ModernHeader 
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
            
            <main className="p-6 space-y-6">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Coupons</h1>
                <p className="text-sm text-muted-foreground">
                  Monitor issued discount coupons and their usage.
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <ModernMetricCard
                  title="Total coupons"
                  value={totalCoupons.toString()}
                  change="All issued"
                  variant="primary"
                />
                <ModernMetricCard
                  title="Active coupons"
                  value={activeCoupons.toString()}
                  change="Can be used"
                  variant="secondary"
                />
                <ModernMetricCard
                  title="Used coupons"
                  value={usedCoupons.toString()}
                  change={totalCoupons > 0 ? `${Math.round((usedCoupons / totalCoupons) * 100)}% redemption rate` : "0% redemption rate"}
                  variant="accent"
                />
                <ModernMetricCard
                  title="Expired"
                  value={expiredCoupons.toString()}
                  change="Not used"
                  variant="secondary"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Export coupons
                </Button>
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View stats
                </Button>
              </div>

              {/* Coupons List */}
              <div className="space-y-4">
                {isLoading && <LoadingSection message="Loading coupons..." />}
                {coupons.map(coupon => {
                  const isExpired = new Date(coupon.expires_at) < new Date();
                  const isUsed = coupon.is_used;
                  const status = isUsed ? 'used' : (isExpired ? 'expired' : 'active');
                  
                  return (
                    <Card key={coupon.id} className="p-6 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-accent">
                            <Gift className="h-6 w-6 text-primary" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-lg text-foreground">
                                {coupon.code}
                              </h3>
                              <Badge className={getStatusColor(status)}>
                                {getStatusText(status)}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              Issued {new Date(coupon.created_at).toLocaleDateString('en-GB')}
                            </p>
                            
                            {isUsed && coupon.used_at && (
                              <p className="text-sm text-success font-medium mt-1">
                                ✓ Used {new Date(coupon.used_at).toLocaleDateString('sv-SE')}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary mb-1">
                            {coupon.discount}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Expires: {new Date(coupon.expires_at).toLocaleDateString('en-GB')}
                          </div>
                          {status === "active" && (
                            <div className="flex items-center gap-1 text-xs text-success mt-1">
                              <CheckCircle className="h-3 w-3" />
                              Valid
                            </div>
                          )}
                          {status === "expired" && (
                            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                              <Clock className="h-3 w-3" />
                              Expired
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
                
                {!isLoading && coupons.length === 0 && (
                  <Card className="p-8 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Gift className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="text-base font-medium text-foreground mb-1">No coupons issued</p>
                    <p className="text-sm text-muted-foreground">Coupons will appear here once they are issued.</p>
                  </Card>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DashboardAuth>
  );
};

export default Coupons;