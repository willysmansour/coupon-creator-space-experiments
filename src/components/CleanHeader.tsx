import { Button } from "@/components/ui/button";
import { CreateCampaignModal } from "@/components/CreateCampaignModal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, User } from "lucide-react";
import { useState } from "react";

export function CleanHeader() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <header className="border-b bg-card h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Ny kampanj
          </Button>
          
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            Profil
          </Button>
        </div>
      </header>

      <CreateCampaignModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </>
  );
}