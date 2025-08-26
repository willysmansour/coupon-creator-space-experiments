import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";
import { useState } from "react";
import { useUploads } from "@/hooks/useSupabaseData";

export const ImageGallery = () => {
  const { data: uploads = [], isLoading } = useUploads();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Filter only approved uploads
  const approvedImages = uploads.filter(upload => upload.status === 'approved');

  const handleDownload = (imageUrl: string, customerName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${customerName || 'bild'}.jpg`;
    link.click();
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Kundbilder</h1>
        <p className="text-muted-foreground">
          Bilder som kunder har delat via QR-kod scanning
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Laddar bilder...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {approvedImages.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Download className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">Inga godkända bilder ännu</p>
              <p className="text-muted-foreground">Bilder som kunder laddar upp och godkänns kommer att visas här.</p>
            </div>
          ) : (
            approvedImages.map((image) => (
              <Card 
                key={image.id} 
                className="overflow-hidden group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={image.image_url}
                      alt={`Bild från ${image.customer_name || 'kund'}`}
                      className="w-full h-80 object-cover"
                    />
                    
                    {/* Overlay med åtgärder */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 h-10 w-10 p-0"
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <img
                            src={image.image_url}
                            alt={`Bild från ${image.customer_name || 'kund'}`}
                            className="w-full h-auto max-h-[80vh] object-contain"
                          />
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(image.image_url, image.customer_name || 'kund')}
                        className="text-white hover:bg-white/20 h-10 w-10 p-0"
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Info sektion */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm mb-1">
                          {image.customer_name || 'Okänd kund'}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(image.submitted_at).toLocaleDateString('sv-SE')}
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