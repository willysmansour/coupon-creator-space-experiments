import { useState } from "react";
import { CleanHeader } from "@/components/CleanHeader";
import { CleanMetricsCard } from "@/components/CleanMetricsCard";
import { CleanCampaignCard } from "@/components/CleanCampaignCard";
import { CleanUploadItem } from "@/components/CleanUploadItem";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Users, 
  Gift, 
  Upload
} from "lucide-react";

const Index = () => {
  // Mock data
  const [submissions, setSubmissions] = useState<Array<{
    id: string;
    customerName: string;
    email: string;
    image: string;
    message: string;
    campaign: string;
    submittedAt: string;
    status: "pending" | "approved" | "rejected";
  }>>([
    {
      id: "1",
      customerName: "Anna Andersson",
      email: "anna@example.com",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face",
      message: "Älskar er nya kollektion! Här är min favorit look.",
      campaign: "Sommardeal 2024",
      submittedAt: "2 tim sedan",
      status: "pending" as const
    },
    {
      id: "2", 
      customerName: "Erik Svensson",
      email: "erik@example.com",
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=300&h=300&fit=crop&crop=face",
      message: "Fantastisk service och snabb leverans!",
      campaign: "Vinter Sale",
      submittedAt: "5 tim sedan",
      status: "approved" as const
    },
    {
      id: "3",
      customerName: "Maria Johansson", 
      email: "maria@example.com",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b977?w=300&h=300&fit=crop&crop=face",
      message: "Perfekt kvalitet och snabb leverans!",
      campaign: "Höstrea",
      submittedAt: "1 dag sedan", 
      status: "pending" as const
    }
  ]);

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
    }
  ];

  const handleApprove = (id: string) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === id ? { ...sub, status: "approved" as const } : sub
      )
    );
  };

  const handleReject = (id: string) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === id ? { ...sub, status: "rejected" as const } : sub
      )
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1">
          <CleanHeader />
          
          <main className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Översikt</h1>
              <p className="text-muted-foreground">
                Få en snabb överblick över dina kampanjer och aktivitet.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <CleanMetricsCard
                title="Totala kampanjer"
                value="12"
                change="+3 denna månad"
                icon={BarChart3}
                variant="default"
              />
              <CleanMetricsCard
                title="Aktiva uppladdningar"
                value="156"
                change="+23 denna vecka"
                icon={Upload}
                variant="success"
              />
              <CleanMetricsCard
                title="Utdelade kuponger"
                value="89"
                change="+15 idag"
                icon={Gift}
                variant="success"
              />
              <CleanMetricsCard
                title="Totala kunder"
                value="1,247"
                change="+12% från förra månaden"
                icon={Users}
                variant="warning"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Recent Campaigns */}
              <div className="xl:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Senaste kampanjer</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {campaigns.slice(0, 4).map(campaign => (
                    <CleanCampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              </div>
              
              {/* Pending Uploads */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Väntande granskning</h2>
                  <span className="text-sm text-muted-foreground">
                    {submissions.filter(s => s.status === "pending").length} väntande
                  </span>
                </div>
                <div className="space-y-4">
                  {submissions.filter(s => s.status === "pending").map(submission => (
                    <CleanUploadItem 
                      key={submission.id}
                      submission={submission}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                  {submissions.filter(s => s.status === "pending").length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">Inga väntande uppladdningar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;