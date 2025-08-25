import { useState } from "react";
import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { ModernMetricCard } from "@/components/ModernMetricCard";
import { CreateCampaignModal } from "@/components/CreateCampaignModal";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Gift, Users, Calendar, TrendingUp, Plus } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const Campaigns = () => {
  const { campaigns } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Kampanjer</h1>
                <p className="text-muted-foreground">
                  Hantera alla dina marknadsföringskampanjer och följ deras prestanda.
                </p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Skapa kampanj
              </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ModernMetricCard
                title="Totala kampanjer"
                value={campaigns.length.toString()}
                change={`${campaigns.filter(c => c.status === 'active').length} aktiva`}
                variant="primary"
              />
              <ModernMetricCard
                title="Aktiva kampanjer"
                value={campaigns.filter(c => c.status === 'active').length.toString()}
                change={`${Math.round((campaigns.filter(c => c.status === 'active').length / campaigns.length) * 100)}% av totala`}
                variant="secondary"
              />
              <ModernMetricCard
                title="Totala uppladdningar"
                value={campaigns.reduce((sum, c) => sum + c.submissions, 0).toString()}
                change="Från alla kampanjer"
                variant="secondary"
              />
              <ModernMetricCard
                title="Utfärdade kuponger"
                value={campaigns.reduce((sum, c) => sum + c.couponsIssued, 0).toString()}
                change="Totalt utfärdade"
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
                          <p className="font-semibold text-foreground">{new Date(campaign.validUntil).toLocaleDateString('sv-SE')}</p>
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
      
      <CreateCampaignModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
      />
    </SidebarProvider>
  );
};

export default Campaigns;