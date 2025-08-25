import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { ModernMetricCard } from "@/components/ModernMetricCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Gift, Users, Calendar, TrendingUp } from "lucide-react";

const campaigns = [
  {
    id: "1",
    title: "Ladda upp bild → få 20% rabatt",
    discount: 20,
    validUntil: "31 Dec 2024",
    submissions: 47,
    couponsIssued: 32,
    status: "active" as const
  },
  {
    id: "2",
    title: "Vinterkampanj - Visa din style",
    discount: 15,
    validUntil: "15 Jan 2025", 
    submissions: 23,
    couponsIssued: 18,
    status: "active" as const
  },
  {
    id: "3",
    title: "Sommarerbjudande 2024",
    discount: 25,
    validUntil: "30 Aug 2024",
    submissions: 89,
    couponsIssued: 67,
    status: "expired" as const
  },
  {
    id: "4",
    title: "Black Friday Special",
    discount: 30,
    validUntil: "30 Nov 2024",
    submissions: 156,
    couponsIssued: 124,
    status: "active" as const
  }
];

const Campaigns = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "inactive":
        return "bg-muted text-muted-foreground";
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
      case "inactive":
        return "Pausad";
      case "expired":
        return "Utgången";
      default:
        return status;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ModernSidebar />
        
        <div className="flex-1">
          <ModernHeader />
          
          <main className="p-6 space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Kampanjer</h1>
              <p className="text-muted-foreground">
                Hantera alla dina marknadsföringskampanjer och följ deras prestanda.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ModernMetricCard
                title="Totala kampanjer"
                value="4"
                change="+1 denna månad"
                variant="primary"
              />
              <ModernMetricCard
                title="Aktiva kampanjer"
                value="3"
                change="75% av totala"
                variant="secondary"
              />
              <ModernMetricCard
                title="Totala uppladdningar"
                value="315"
                change="+45 denna vecka"
                variant="secondary"
              />
              <ModernMetricCard
                title="Inlösningsgrad"
                value="76%"
                change="Över genomsnitt"
                variant="accent"
              />
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map(campaign => (
                <Card key={campaign.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-2">
                          {campaign.title}
                        </h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusText(campaign.status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{campaign.discount}%</p>
                        <p className="text-sm text-muted-foreground">rabatt</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Uppladdningar</p>
                          <p className="font-semibold text-foreground">{campaign.submissions}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Kuponger</p>
                          <p className="font-semibold text-foreground">{campaign.couponsIssued}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Giltig till</p>
                          <p className="font-semibold text-foreground">{campaign.validUntil}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Inlösning</p>
                          <p className="font-semibold text-success">
                            {Math.round((campaign.couponsIssued / campaign.submissions) * 100) || 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-2">
                        <Eye className="h-4 w-4" />
                        Visa
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 gap-2">
                        <Edit className="h-4 w-4" />
                        Redigera
                      </Button>
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
};

export default Campaigns;