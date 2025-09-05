import React, { useState, useMemo, useCallback } from "react";
import { useFilteredUploads } from "@/hooks/useFilteredSupabaseData";
import { useUserRole } from "@/hooks/useAuth";
import { useDeleteUpload } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, Eye, User, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { LoadingSection } from "@/components/ui/loading";

interface FilteredImageGalleryProps {
  selectedCompanyId?: string;
}

export const FilteredImageGallery = React.memo(({ selectedCompanyId }: FilteredImageGalleryProps) => {
  const { data: uploads = [], isLoading } = useFilteredUploads(selectedCompanyId);
  const { data: userRole } = useUserRole();
  const deleteUpload = useDeleteUpload();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [brokenMap, setBrokenMap] = useState<Record<string, boolean>>({});
  
  // Memoized filtered images to prevent recalculation on every render
  const approvedImages = useMemo(() => 
    uploads.filter(upload => upload.status === 'approved'), 
    [uploads]
  );

  // Memoized header text to prevent recalculation
  const headerText = useMemo(() => {
    if (userRole?.role === 'super_admin' && selectedCompanyId) {
      return 'Selected Company';
    }
    return userRole?.company_name || 'Your Company';
  }, [userRole, selectedCompanyId]);

  // Memoized download handler to prevent recreation on every render
  const handleDownload = useCallback(async (imageUrl: string, customerName: string) => {
    try {
      // Fetch image as blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Could not fetch image');
      }
      
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `${customerName || 'customer'}_${date}.jpg`;
      link.download = filename;
      
      // Download the file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);
      
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  }, []);

  // Memoized delete handler to prevent recreation on every render
  const handleDelete = useCallback(async (uploadId: string, customerName: string) => {
    try {
      await deleteUpload.mutateAsync(uploadId);
      toast.success(`Image from ${customerName} has been removed`);
    } catch (error) {
      toast.error('Failed to remove image');
    }
  }, [deleteUpload]);

  // Memoized image click handler
  const handleImageClick = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
  }, []);

  // Memoized broken image handler
  const handleImageError = useCallback((uploadId: string) => {
    setBrokenMap(prev => ({ ...prev, [uploadId]: true }));
  }, []);

  if (isLoading) {
    return <LoadingSection message="Loading images..." />;
  }

  if (approvedImages.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No approved images yet</h3>
          <p className="text-muted-foreground">
            Images will appear here once customers upload receipts and they are approved.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customer Images</h2>
          <p className="text-muted-foreground">
            Showing approved images from {headerText}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {approvedImages.length} images
        </Badge>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {approvedImages.map((upload) => (
          <Card key={upload.id} className="overflow-hidden group">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium truncate">
                    {upload.customer_name || 'Anonymous'}
                  </span>
                </div>
                <Badge variant="default" className="text-xs">
                  Approved
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-0">
              {/* Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                {!brokenMap[upload.id] ? (
                  <img
                    src={upload.image_url}
                    alt={`Receipt from ${upload.customer_name || 'customer'}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => handleImageClick(upload.image_url)}
                    onError={() => handleImageError(upload.id)}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Eye className="h-8 w-8" />
                  </div>
                )}
                
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(upload.image_url, upload.customer_name || 'customer')}
                    className="bg-white/90 text-black hover:bg-white"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {userRole?.role === 'super_admin' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(upload.id, upload.customer_name || 'customer')}
                      className="bg-red-600/90 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(upload.submitted_at).toLocaleDateString('en-GB')}</span>
                </div>
                
                {upload.message && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <p className="line-clamp-2" title="Customer Review">{upload.message}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedImage(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

FilteredImageGallery.displayName = 'FilteredImageGallery';