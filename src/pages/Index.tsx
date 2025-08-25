import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { ImageDownloadTable } from "@/components/ImageDownloadTable";
import { SidebarProvider } from "@/components/ui/sidebar";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ModernSidebar />
        
        <div className="flex-1">
          <ModernHeader />
          
          <main className="p-6">
            <ImageDownloadTable />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;