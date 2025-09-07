import { ModernSidebar } from "@/components/layout/ModernSidebar";
import { ModernHeader } from "@/components/layout/ModernHeader";
import { ModernMetricCard } from "@/components/dashboard/ModernMetricCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Clock, Eye, Trash2, Upload, Users } from "lucide-react";
import { DashboardAuth } from "@/components/auth/DashboardAuth";
import { useFilteredUploads } from "@/hooks/useFilteredSupabaseData";
import { useUpdateUploadStatus, useDeleteUpload } from "@/hooks/useSupabaseData";
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { notify } from '@/lib/notify';
import { useState } from 'react';
import { LoadingSection } from "@/components/ui/loading";

const Uploads = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();
  const { data: uploads = [], isLoading } = useFilteredUploads(selectedCompanyId);
  const updateUploadStatus = useUpdateUploadStatus();
  const deleteUpload = useDeleteUpload();

  const handleApprove = async (id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (upload) {
      try {
        await updateUploadStatus.mutateAsync({ id, status: 'approved' });
        
        // Send coupon email if customer details exist
        if (upload.customer_name && upload.customer_email) {
          try {
            const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-coupon-email', {
              body: {
                uploadId: id,
                customerName: upload.customer_name,
                customerEmail: upload.customer_email
              },
              headers: {
                'x-app-origin': window.location.origin,
              }
            });
            
            if (emailError || !emailResult?.success) {
              console.error('Email error:', emailError || emailResult);
              notify.success(`${upload.customer_name} was approved but the email failed to send.`);
            } else {
              notify.success(`${upload.customer_name} was approved and the coupon email was sent!`);
            }
          } catch (emailError) {
            console.error('Email error:', emailError);
            notify.success(`${upload.customer_name} was approved but the email failed to send.`);
          }
        } else {
          notify.success(`Upload approved. A coupon will be created when the customer provides details.`);
        }
      } catch (error) {
        notify.error('Failed to approve upload');
      }
    }
  };

  const handleReject = async (id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (upload) {
      try {
        await updateUploadStatus.mutateAsync({ id, status: 'rejected' });
        notify.success(`${upload.customer_name || 'Upload'} was rejected.`);
      } catch (error) {
        notify.error('Failed to reject upload');
      }
    }
  };

  const handleDelete = async (id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (upload) {
      try {
        await deleteUpload.mutateAsync(id);
        notify.success(`Upload from ${upload.customer_name || 'unknown customer'} was removed`);
      } catch (error) {
        notify.error('Failed to delete upload');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <ModernSidebar />
          <div className="flex-1">
            <ModernHeader 
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
            <main className="p-6">
              <LoadingSection message="Loading uploads..." />
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
    <DashboardAuth>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <ModernSidebar />
          
          <div className="flex-1">
            <ModernHeader 
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
            
            <main className="p-6 space-y-6">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Uploads</h1>
                <p className="text-sm text-muted-foreground">
                  Review and approve customer uploads to issue discount coupons.
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <ModernMetricCard
                  title="Total uploads"
                  value={uploads.length.toString()}
                  change="From all campaigns"
                  variant="primary"
                />
                <ModernMetricCard
                  title="Pending review"
                  value={pendingCount.toString()}
                  change="Needs attention"
                  variant="accent"
                />
                <ModernMetricCard
                  title="Approved"
                  value={approvedCount.toString()}
                  change={`${uploads.length > 0 ? Math.round((approvedCount / uploads.length) * 100) : 0}% of total`}
                  variant="secondary"
                />
                <ModernMetricCard
                  title="Rejected"
                  value={rejectedCount.toString()}
                  change={`${uploads.length > 0 ? Math.round((rejectedCount / uploads.length) * 100) : 0}% of total`}
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
                              {submission.customer_name || 'Unknown customer'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {submission.customer_email || 'No email'}
                            </p>
                          </div>
                          {getStatusBadge(submission.status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(submission.submitted_at).toLocaleDateString('en-GB')}
                        </p>
                        
                        {submission.message && submission.message.trim() !== 'Uploaded content' && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1">Customer Review:</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              "{submission.message}"
                            </p>
                          </div>
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
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleReject(submission.id)}
                              disabled={updateUploadStatus.isPending}
                            >
                              <X className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                        
                        {/* Action buttons for all uploads */}
                        <div className="flex gap-2 mt-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View larger
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <img
                                src={submission.image_url}
                                alt={`Image from ${submission.customer_name || 'customer'}`}
                                className="w-full h-auto max-h-[80vh] object-contain"
                              />
                              {submission.message && submission.message.trim() !== 'Uploaded content' && (
                                <div className="mt-4">
                                  <p className="text-xs text-muted-foreground mb-1">Customer Review:</p>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">
                                    "{submission.message}"
                                  </p>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="gap-1 text-destructive hover:text-destructive"
                                disabled={deleteUpload.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete upload</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the upload from {submission.customer_name || 'unknown customer'}? 
                                  This will also delete any related coupons. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(submission.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {uploads.length === 0 && (
                  <Card className="p-8 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="text-base font-medium text-foreground mb-1">No uploads yet</p>
                    <p className="text-sm text-muted-foreground">Uploads from customers will appear here.</p>
                  </Card>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DashboardAuth>
  );
};

export default Uploads;
