import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { ModernMetricCard } from "@/components/ModernMetricCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Clock, Eye, Upload, Users } from "lucide-react";
import { useUploads, useUpdateUploadStatus } from "@/hooks/useSupabaseData";
import { toast } from 'sonner';

const Uploads = () => {
  const { data: uploads = [], isLoading } = useUploads();
  const updateUploadStatus = useUpdateUploadStatus();

  const handleApprove = async (id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (upload) {
      try {
        await updateUploadStatus.mutateAsync({ id, status: 'approved' });
        toast.success(`${upload.customer_name || 'Uppladdning'} har godkänts och en kupong har skapats.`);
      } catch (error) {
        toast.error('Misslyckades att godkänna uppladdningen');
      }
    }
  };

  const handleReject = async (id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (upload) {
      try {
        await updateUploadStatus.mutateAsync({ id, status: 'rejected' });
        toast.success(`${upload.customer_name || 'Uppladdning'} har avvisats.`);
      } catch (error) {
        toast.error('Misslyckades att avvisa uppladdningen');
      }
    }
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

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <ModernSidebar />
          <div className="flex-1">
            <ModernHeader />
            <main className="p-6">
              <div className="text-center">Loading...</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const pendingCount = uploads.filter(s => s.status === "pending").length;
  const approvedCount = uploads.filter(s => s.status === "approved").length;
  const rejectedCount = uploads.filter(s => s.status === "rejected").length;

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
                value={uploads.length.toString()}
                change="Från alla kampanjer"
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
                change={`${uploads.length > 0 ? Math.round((approvedCount / uploads.length) * 100) : 0}% av totalt`}
                variant="secondary"
              />
              <ModernMetricCard
                title="Avvisade"
                value={rejectedCount.toString()}
                change={`${uploads.length > 0 ? Math.round((rejectedCount / uploads.length) * 100) : 0}% av totalt`}
                variant="secondary"
              />
            </div>

            {/* Submissions List */}
            <div className="space-y-4">
              {uploads.map(submission => (
                <Card key={submission.id} className="p-4 hover:shadow-sm transition-shadow">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <img 
                        src={submission.image_url} 
                        alt="Upload submission"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">
                            {submission.customer_name || 'Okänd kund'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {submission.customer_email || 'Ingen e-post'}
                          </p>
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(submission.submitted_at).toLocaleDateString('sv-SE')}
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
                            disabled={updateUploadStatus.isPending}
                          >
                            <Check className="h-3 w-3" />
                            Godkänn
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReject(submission.id)}
                            disabled={updateUploadStatus.isPending}
                          >
                            <X className="h-3 w-3" />
                            Avvisa
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Visa större
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <img
                                src={submission.image_url}
                                alt={`Bild från ${submission.customer_name || 'kund'}`}
                                className="w-full h-auto max-h-[80vh] object-contain"
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {uploads.length === 0 && (
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