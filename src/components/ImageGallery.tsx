import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Heart } from "lucide-react";
import { useState } from "react";

const mockImages = [
  {
    id: 1,
    filename: "sommarkampanj-2024.jpg",
    uploadDate: "2024-08-20",
    userName: "Anna Andersson",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop&crop=center",
    likes: 24
  },
  {
    id: 2,
    filename: "produktbild-kaffebönor.png",
    uploadDate: "2024-08-19",
    userName: "Erik Johansson",
    imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop&crop=center",
    likes: 18
  },
  {
    id: 3,
    filename: "butik-interiör.jpg",
    uploadDate: "2024-08-17",
    userName: "Maria Lindström",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center",
    likes: 32
  },
  {
    id: 4,
    filename: "personal-team-foto.jpg",
    uploadDate: "2024-08-15",
    userName: "Johan Bergström",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop&crop=center",
    likes: 45
  },
  {
    id: 5,
    filename: "kaffe-latte-art.jpg",
    uploadDate: "2024-08-14",
    userName: "Lisa Karlsson",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&crop=center",
    likes: 28
  },
  {
    id: 6,
    filename: "bageri-sortiment.jpg",
    uploadDate: "2024-08-13",
    userName: "Peter Nilsson",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center",
    likes: 21
  },
  {
    id: 7,
    filename: "utsikt-från-café.jpg",
    uploadDate: "2024-08-12",
    userName: "Sara Olsson",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop&crop=center",
    likes: 37
  },
  {
    id: 8,
    filename: "specialkaffe-blend.jpg",
    uploadDate: "2024-08-11",
    userName: "Gustav Svensson",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&crop=center",
    likes: 19
  }
];

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
        {mockImages.map((image) => (
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
        ))}
      </div>
    </div>
  );
};