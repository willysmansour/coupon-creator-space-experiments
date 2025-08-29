import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Image, Video, FileText } from "lucide-react";

const mockImages = [
  {
    id: 1,
    filename: "sommarkampanj-2024.jpg",
    uploadDate: "2024-08-20",
    size: "2.4 MB",
    type: "image/jpeg",
    status: "Approved",
    previewUrl: "/placeholder.svg"
  },
  {
    id: 2,
    filename: "produktbild-kaffebönor.png",
    uploadDate: "2024-08-19",
    size: "1.8 MB",
    type: "image/png",
    status: "Pending",
    previewUrl: "/placeholder.svg"
  },
  {
    id: 3,
    filename: "reklam-video-15sek.mp4",
    uploadDate: "2024-08-18",
    size: "8.7 MB",
    type: "video/mp4",
    status: "Approved",
    previewUrl: "/placeholder.svg"
  },
  {
    id: 4,
    filename: "butik-interiör.jpg",
    uploadDate: "2024-08-17",
    size: "3.2 MB",
    type: "image/jpeg",
    status: "Approved",
    previewUrl: "/placeholder.svg"
  },
  {
    id: 5,
    filename: "meny-höst-2024.pdf",
    uploadDate: "2024-08-16",
    size: "1.1 MB",
    type: "application/pdf",
    status: "Approved",
    previewUrl: "/placeholder.svg"
  },
  {
    id: 6,
    filename: "personal-team-foto.jpg",
    uploadDate: "2024-08-15",
    size: "4.5 MB",
    type: "image/jpeg",
    status: "Rejected",
    previewUrl: "/placeholder.svg"
  }
];

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
};

const getStatusBadge = (status: string) => {
  const variants = {
    "Approved": "default",
    "Pending": "secondary",
    "Rejected": "destructive"
  };
  
  return (
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {status}
    </Badge>
  );
};

const handleDownload = (filename: string) => {
  // Placeholder for download functionality
  // In a real app, this would trigger an actual download
};

export const ImageDownloadTable = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Uploaded Files</CardTitle>
        <p className="text-muted-foreground">
          Manage and download files that customers have uploaded via QR code scanning
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Preview</TableHead>
                <TableHead>Filename</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockImages.map((file) => (
                <TableRow key={file.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                      {getFileIcon(file.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{file.filename}</div>
                    <div className="text-sm text-muted-foreground">{file.type}</div>
                  </TableCell>
                  <TableCell>{file.uploadDate}</TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>{getStatusBadge(file.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file.filename)}
                      disabled={file.status !== "Approved"}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download {file.filename}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};