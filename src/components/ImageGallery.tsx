import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Heart } from "lucide-react";
import { useState } from "react";

const mockImages: any[] = [];

export const ImageGallery = () => {
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());

  const handleLike = (imageId: number) => {
    setLikedImages(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(imageId)) {
        newLiked.delete(imageId);
      } else {
        newLiked.add(imageId);
      }
      return newLiked;
    });
  };

  const handleDownload = (filename: string) => {
    console.log(`Laddar ner: ${filename}`);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Kundbilder</h1>
        <p className="text-muted-foreground">
          Bilder som kunder har delat via QR-kod scanning
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockImages.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Inga bilder ännu</p>
            <p className="text-muted-foreground">Bilder som kunder laddar upp via kampanjer kommer att visas här.</p>
          </div>
        ) : (
          mockImages.map((image) => (
            <Card 
              key={image.id} 
              className="overflow-hidden group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={image.imageUrl}
                    alt={image.filename}
                    className="w-full h-80 object-cover"
                  />
                  
                  {/* Overlay med åtgärder */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(image.id)}
                      className="text-white hover:bg-white/20 h-10 w-10 p-0"
                    >
                      <Heart 
                        className={`h-5 w-5 ${
                          likedImages.has(image.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-white'
                        }`} 
                      />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(image.filename)}
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
                        {image.userName}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {image.uploadDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{image.likes + (likedImages.has(image.id) ? 1 : 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};