import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricsCard } from "@/components/MetricsCard";
import { CampaignCard } from "@/components/CampaignCard";
import { UploadSubmission } from "@/components/UploadSubmission";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  Gift, 
  Upload,
  TrendingUp,
  Eye,
  CheckCircle
} from "lucide-react";
import dashboardHero from "@/assets/dashboard-hero.jpg";

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
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8 relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary-hover text-primary-foreground">
          <div className="absolute inset-0 opacity-10">
            <img 
              src={dashboardHero} 
              alt="Dashboard overview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative p-8">
            <h2 className="text-3xl font-bold mb-2">Välkommen till din dashboard</h2>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl">
              Hantera dina marknadsföringskampanjer, följ upp kundengagemang och få detaljerad statistik över dina rabattkampanjer.
            </p>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Totala kampanjer"
            value="12"
            change="+3 denna månad"
            icon={BarChart3}
            variant="default"
          />
          <MetricsCard
            title="Aktiva uppladdningar"
            value="156"
            change="+23 denna vecka"
            icon={Upload}
            variant="success"
          />
          <MetricsCard
            title="Utdelade kuponger"
            value="89"
            change="+15 idag"
            icon={Gift}
            variant="success"
          />
          <MetricsCard
            title="Inlösta rabatter"
            value="67"
            change="75% inlösningsgrad"
            icon={TrendingUp}
            variant="warning"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Översikt
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <Gift className="h-4 w-4" />
              Kampanjer
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <Eye className="h-4 w-4" />
              Uppladdningar
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Kuponger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Senaste kampanjer</h3>
                <div className="space-y-4">
                  {campaigns.slice(0, 2).map(campaign => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Väntande uppladdningar</h3>
                <div className="space-y-4">
                  {submissions.filter(s => s.status === "pending").map(submission => (
                    <UploadSubmission 
                      key={submission.id}
                      submission={submission}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Alla kampanjer</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Kunduppladdningar</h3>
            </div>
            <div className="space-y-4">
              {submissions.map(submission => (
                <UploadSubmission 
                  key={submission.id}
                  submission={submission}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Kupongöversikt</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricsCard
                title="Skapade kuponger"
                value="89"
                change="Totalt antal"
                icon={Gift}
                variant="default"
              />
              <MetricsCard
                title="Inlösta kuponger"
                value="67"
                change="75% av utfärdade"
                icon={CheckCircle}
                variant="success"
              />
              <MetricsCard
                title="Aktivt värde"
                value="€2,340"
                change="Totalt rabattvärde"
                icon={TrendingUp}
                variant="warning"
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;