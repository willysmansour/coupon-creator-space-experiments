import { ModernSidebar } from "@/components/layout/ModernSidebar";
import { ModernHeader } from "@/components/layout/ModernHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import { DashboardAuth } from "@/components/auth/DashboardAuth";
import { useState } from "react";

const Analytics = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();

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
                <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Analytics</h1>
                <p className="text-sm text-muted-foreground">
                  View analytics and insights for your campaigns.
                </p>
              </div>

              {/* Empty State */}
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-6 rounded-full bg-muted/30 mb-6">
                  <BarChart3 className="h-12 w-12 text-muted-foreground" />
                </div>
                
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No data to show yet
                </h2>
                
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Create your first campaign and start collecting customer content to see analytics here.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl">
                  <Card className="p-6 text-center">
                    <div className="p-3 rounded-lg bg-muted/30 mx-auto mb-4 w-fit">
                      <TrendingUp className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Conversion rate</h3>
                    <p className="text-2xl font-bold text-muted-foreground">--%</p>
                    <p className="text-sm text-muted-foreground mt-1">Waiting for data</p>
                  </Card>
                  
                  <Card className="p-6 text-center">
                    <div className="p-3 rounded-lg bg-muted/30 mx-auto mb-4 w-fit">
                      <DollarSign className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Campaign ROI</h3>
                    <p className="text-2xl font-bold text-muted-foreground">--%</p>
                    <p className="text-sm text-muted-foreground mt-1">Waiting for data</p>
                  </Card>
                  
                  <Card className="p-6 text-center">
                    <div className="p-3 rounded-lg bg-muted/30 mx-auto mb-4 w-fit">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Active customers</h3>
                    <p className="text-2xl font-bold text-muted-foreground">0</p>
                    <p className="text-sm text-muted-foreground mt-1">Waiting for data</p>
                  </Card>
                  
                  <Card className="p-6 text-center">
                    <div className="p-3 rounded-lg bg-muted/30 mx-auto mb-4 w-fit">
                      <BarChart3 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Total uploads</h3>
                    <p className="text-2xl font-bold text-muted-foreground">0</p>
                    <p className="text-sm text-muted-foreground mt-1">Waiting for data</p>
                  </Card>
                </div>
              </div>

              {/* Empty Campaign Performance */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Campaign performance</h3>
                
                <div className="text-center py-8">
                  <div className="p-4 rounded-full bg-muted/30 mx-auto mb-4 w-fit">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No campaigns yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first campaign to see performance here
                  </p>
                </div>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DashboardAuth>
  );
};

export default Analytics;