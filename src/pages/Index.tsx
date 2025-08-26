import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { FilteredImageGallery } from "@/components/FilteredImageGallery";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardAuth } from "@/components/auth/DashboardAuth";
import { useState } from "react";

const Index = () => {
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
            
            <main className="p-6">
              <FilteredImageGallery selectedCompanyId={selectedCompanyId} />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DashboardAuth>
  );
};

export default Index;