import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
import { Download, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFilteredUploads } from "@/hooks/useFilteredSupabaseData";
import { useDeleteUpload } from "@/hooks/useSupabaseData";
import { useUserRole } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LoadingSection } from "@/components/ui/loading";

interface FilteredImageGalleryProps {
  selectedCompanyId?: string;
}

export const FilteredImageGallery = ({ selectedCompanyId }: FilteredImageGalleryProps) => {
  const { data: uploads = [], isLoading } = useFilteredUploads(selectedCompanyId);
  const { data: userRole } = useUserRole();
  const deleteUpload = useDeleteUpload();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [brokenMap, setBrokenMap] = useState<Record<string, boolean>>({});
  
  // Filter only approved uploads
  const approvedImages = uploads.filter(upload => upload.status === 'approved');

  const handleDownload = async (imageUrl: string, customerName: string) => {
    try {
      // Fetch image as blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Kunde inte hämta bilden');
      }
      
      const blob = await response.blob();
      
      // Skapa en blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Generera filnamn med datum
      const date = new Date().toISOString().split('T')[0];
      const filename = `${customerName || 'customer'}_${date}.jpg`;
      link.download = filename;
      
      // Ladda ner filen
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Rensa blob URL
      URL.revokeObjectURL(blobUrl);
      
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Nedladdningsfel:', error);
      toast.error('Misslyckades att ladda ner bilden');
    }
  };

  const handleDelete = async (uploadId: string, customerName: string) => {
    try {
      await deleteUpload.mutateAsync(uploadId);
      toast.success(`Image from ${customerName} has been removed`);
    } catch (error) {
      toast.error('Misslyckades att ta bort bilden');
    }
  };

  // Show which company's data is being displayed
  const getHeaderText = () => {
    if (userRole?.role === 'company_admin' && userRole.company_name) {
      return `Customer images - ${userRole.company_name}`;
    } else if (userRole?.role === 'super_admin' && selectedCompanyId) {
      // We could add company name lookup here, but for now just show filtered
      return "Customer images - Filtered";
    }
    return "Customer images";
  };

  const getSubHeaderText = () => {
    if (userRole?.role === 'company_admin') {
      return "Images your customers have shared via QR code scanning";
    } else if (userRole?.role === 'super_admin' && selectedCompanyId) {
      return "Images from the selected company";
    } else if (userRole?.role === 'super_admin') {
      return "Images from all companies – select a company to filter";
    }
    return "Images customers have shared via QR code scanning";
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{getHeaderText()}</h1>
        <p className="text-muted-foreground">
          {getSubHeaderText()}
        </p>
      </div>

      {isLoading ? (
        <LoadingSection message="Loading images..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {approvedImages.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Download className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">No approved images yet</p>
              <p className="text-muted-foreground">Images that customers upload and get approved will appear here.</p>
            </div>
          ) : (
            approvedImages.map((image) => (
              <Card 
                key={image.id} 
                className="overflow-hidden group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    {brokenMap[image.id] ? (
                      <div className="w-full h-80 flex items-center justify-center bg-muted text-muted-foreground text-sm">
                        Image deleted from storage
                      </div>
                    ) : (
                      <img
                        src={image.image_url}
                        alt={`Image from ${image.customer_name || 'customer'}`}
                        className="w-full h-80 object-cover"
                        onError={() => setBrokenMap(prev => ({ ...prev, [image.id]: true }))}
                      />
                    )}
                    
                     {/* Overlay with actions */}
                     <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                       <Dialog>
                         <DialogTrigger asChild>
                           <Button
                             variant="ghost"
                             size="sm"
                             className="text-white/95 hover:bg-white/20 h-10 w-10 p-0"
                             disabled={!!brokenMap[image.id]}
                           >
                             <Eye className="h-5 w-5" />
                           </Button>
                         </DialogTrigger>
                         <DialogContent className="max-w-4xl">
                           <img
                             src={image.image_url}
                             alt={`Image from ${image.customer_name || 'customer'}`}
                             className="w-full h-auto max-h-[80vh] object-contain"
                           />
                         </DialogContent>
                       </Dialog>
                       
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleDownload(image.image_url, image.customer_name || 'customer')}
                         className="text-white/95 hover:bg-white/20 h-10 w-10 p-0"
                         disabled={!!brokenMap[image.id]}
                       >
                         <Download className="h-5 w-5" />
                       </Button>

                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button
                             variant="ghost"
                             size="sm"
                             className="text-white/95 hover:bg-red-500/20 h-10 w-10 p-0"
                           >
                             <Trash2 className="h-5 w-5" />
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>Delete image</AlertDialogTitle>
                             <AlertDialogDescription>
                               Are you sure you want to delete the image from {image.customer_name || 'unknown customer'}? 
                               This will also remove any related coupons. This action cannot be undone.
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction
                               onClick={() => handleDelete(image.id, image.customer_name || 'unknown customer')}
                               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                             >
                               Delete
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     </div>
                  </div>

                  {/* Info sektion */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm mb-1">
                          {image.customer_name || 'Unknown customer'}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(image.submitted_at).toLocaleDateString('en-GB')}
                        </p>
                        {image.message && (
                          <p className="text-xs text-muted-foreground italic">
                            "{image.message}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};