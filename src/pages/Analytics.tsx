import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { ModernMetricCard } from "@/components/ModernMetricCard";
import { ProjectAnalytics } from "@/components/ProjectAnalytics";
import { ProjectProgress } from "@/components/ProjectProgress";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

const Analytics = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ModernSidebar />
        
        <div className="flex-1">
          <ModernHeader />
          
          <main className="p-6 space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Analytics</h1>
              <p className="text-muted-foreground">
                Djupgående analys av dina kampanjer och kundengagemang.
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ModernMetricCard
                title="Konverteringsgrad"
                value="76.3%"
                change="+5.2% från förra månaden"
                variant="primary"
              />
              <ModernMetricCard
                title="Genomsnittlig rabatt"
                value="22%"
                change="Optimerad nivå"
                variant="secondary"
              />
              <ModernMetricCard
                title="Kundengagemang"
                value="8.4/10"
                change="+0.8 förbättring"
                variant="accent"
              />
              <ModernMetricCard
                title="ROI kampanjer"
                value="340%"
                change="+15% från Q3"
                variant="secondary"
              />
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ProjectAnalytics />
              <ProjectProgress />
            </div>

            {/* Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-accent">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Tillväxttrend</h3>
                    <p className="text-sm text-muted-foreground">Månadsvis utveckling</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Januari</span>
                    <span className="font-medium text-foreground">+12.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Februari</span>
                    <span className="font-medium text-foreground">+18.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mars</span>
                    <span className="font-medium text-success">+24.1%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-accent">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Kunddemografi</h3>
                    <p className="text-sm text-muted-foreground">Åldersfördelning</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">18-25 år</span>
                    <span className="font-medium text-foreground">28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">26-35 år</span>
                    <span className="font-medium text-primary">42%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">36+ år</span>
                    <span className="font-medium text-foreground">30%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-accent">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Intäktspåverkan</h3>
                    <p className="text-sm text-muted-foreground">Kampanjresultat</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Genererad försäljning</span>
                    <span className="font-medium text-success">+€45,230</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rabattkostnad</span>
                    <span className="font-medium text-foreground">-€12,100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nettovinst</span>
                    <span className="font-medium text-primary">€33,130</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Campaign Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Kampanjprestanda</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Kampanj</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Uppladdningar</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Kuponger</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Konvertering</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium text-foreground">Sommardeal 2024</td>
                      <td className="py-3 px-4 text-muted-foreground">156</td>
                      <td className="py-3 px-4 text-muted-foreground">124</td>
                      <td className="py-3 px-4 text-success font-medium">79.5%</td>
                      <td className="py-3 px-4 text-primary font-medium">340%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium text-foreground">Vinter Sale</td>
                      <td className="py-3 px-4 text-muted-foreground">89</td>
                      <td className="py-3 px-4 text-muted-foreground">67</td>
                      <td className="py-3 px-4 text-success font-medium">75.3%</td>
                      <td className="py-3 px-4 text-primary font-medium">285%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-foreground">Black Friday</td>
                      <td className="py-3 px-4 text-muted-foreground">203</td>
                      <td className="py-3 px-4 text-muted-foreground">189</td>
                      <td className="py-3 px-4 text-success font-medium">93.1%</td>
                      <td className="py-3 px-4 text-primary font-medium">420%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Analytics;