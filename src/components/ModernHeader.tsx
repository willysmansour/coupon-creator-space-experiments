import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateCampaignModal } from "@/components/CreateCampaignModal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Search, Bell, User } from "lucide-react";
import { useState } from "react";

export function ModernHeader() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <header className="h-16 bg-card border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Plan, prioritize, and accomplish your tasks with ease.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search task" 
              className="pl-10 w-64 bg-input border-0 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="gap-2 bg-primary hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
          
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              TM
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Totok Michael</p>
              <p className="text-xs text-muted-foreground">tmichael@gmail.com</p>
            </div>
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