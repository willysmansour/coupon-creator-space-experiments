import { Button } from "@/components/ui/button";
import { CreateCampaignModal } from "@/components/CreateCampaignModal";
import { Plus, Bell, Settings } from "lucide-react";
import { useState } from "react";

export function DashboardHeader() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Kampanjhantering
              </h1>
              <p className="text-muted-foreground">
                Hantera dina marknadsföringskampanjer och rabattkuponger
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="h-4 w-4" />
                Notiser
              </Button>
              
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Inställningar  
              </Button>
              
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="gap-2 bg-gradient-to-r from-primary to-primary-hover"
              >
                <Plus className="h-4 w-4" />
                Ny kampanj
              </Button>
            </div>
          </div>
        </div>
      </header>

      <CreateCampaignModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </>
  );
}