import { useState } from "react";
import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { ModernMetricCard } from "@/components/ModernMetricCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Eye, Upload, Users } from "lucide-react";

const Uploads = () => {
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
    },
    {
      id: "4",
      customerName: "Lars Nilsson",
      email: "lars@example.com", 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      message: "Bra produkter, kommer köpa igen!",
      campaign: "Black Friday",
      submittedAt: "2 dagar sedan",
      status: "rejected" as const
    }
  ]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <Check className="h-3 w-3 mr-1" />
            Godkänd
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <X className="h-3 w-3 mr-1" />
            Avvisad
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <Clock className="h-3 w-3 mr-1" />
            Väntar
          </Badge>
        );
    }
  };

  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const approvedCount = submissions.filter(s => s.status === "approved").length;
  const rejectedCount = submissions.filter(s => s.status === "rejected").length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ModernSidebar />
        
        <div className="flex-1">
          <ModernHeader />
          
          <main className="p-6 space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Uppladdningar</h1>
              <p className="text-muted-foreground">
                Granska och godkänn kunduppladdningar för att utfärda rabattkuponger.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ModernMetricCard
                title="Totala uppladdningar"
                value={submissions.length.toString()}
                change="Senaste veckan"
                variant="primary"
              />
              <ModernMetricCard
                title="Väntande granskning"
                value={pendingCount.toString()}
                change="Behöver åtgärd"
                variant="accent"
              />
              <ModernMetricCard
                title="Godkända"
                value={approvedCount.toString()}
                change={`${Math.round((approvedCount / submissions.length) * 100)}% av totalt`}
                variant="secondary"
              />
              <ModernMetricCard
                title="Avvisade"
                value={rejectedCount.toString()}
                change={`${Math.round((rejectedCount / submissions.length) * 100)}% av totalt`}
                variant="secondary"
              />
            </div>

            {/* Submissions List */}
            <div className="space-y-4">
              {submissions.map(submission => (
                <Card key={submission.id} className="p-4 hover:shadow-sm transition-shadow">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <img 
                        src={submission.image} 
                        alt="Upload submission"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{submission.customerName}</h4>
                          <p className="text-sm text-muted-foreground">{submission.email}</p>
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {submission.campaign} • {submission.submittedAt}
                      </p>
                      
                      {submission.message && (
                        <p className="text-sm text-foreground mb-3 line-clamp-2">
                          "{submission.message}"
                        </p>
                      )}
                      
                      {submission.status === "pending" && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="gap-1 bg-success hover:bg-success/90"
                            onClick={() => handleApprove(submission.id)}
                          >
                            <Check className="h-3 w-3" />
                            Godkänn
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReject(submission.id)}
                          >
                            <X className="h-3 w-3" />
                            Avvisa
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Visa större
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {submissions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">Inga uppladdningar ännu</p>
                  <p className="text-muted-foreground">Uppladdningar från kunder kommer att visas här.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Uploads;