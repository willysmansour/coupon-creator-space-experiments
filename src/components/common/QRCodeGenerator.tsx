import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompanyAwareCompanies } from '@/hooks/useCompanyAwareData';

export const QRCodeGenerator = () => {
  const { toast } = useToast();
  const { data: companies = [], isLoading } = useCompanyAwareCompanies();
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  // Use the user's company (filtered by company-aware hook)
  const company = companies[0];
  if (!company) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            You do not have a company linked to your account. Create a company first to get your QR code.
          </div>
        </CardContent>
      </Card>
    );
  }

  const qrUrl = `${window.location.origin}/company/${company.id}`;

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Set high resolution for crisp QR code
    canvas.width = 512;
    canvas.height = 580; // Extra space for company name
    
    img.onload = () => {
      if (!ctx) return;
      
      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR code
      ctx.drawImage(img, 32, 32, 448, 448);
      
      // Add company name
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(company.name, canvas.width / 2, 520);
      
      // Add instruction text
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('Scan to upload images', canvas.width / 2, 550);
      
      // Download
      const link = document.createElement('a');
      link.download = `${company.name}-qr-code.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: "QR code downloaded",
        description: "The QR code has been saved as a PNG file.",
      });
    };
    
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Upload QR code
        </CardTitle>
        <CardDescription>
          Generate and download a QR code customers can scan to upload images directly to your company
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-card rounded-lg border-2 border-border">
              <QRCode
                id="qr-code-svg"
                value={qrUrl}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 256 256"
                bgColor="white"
                fgColor="#111827"
              />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium text-foreground">{company.name}</p>
              <p className="text-sm text-muted-foreground">Scan to upload images</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">QR code URL</h4>
              <div className="p-3 bg-muted rounded-md">
                <code className="text-sm text-muted-foreground break-all">{qrUrl}</code>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button onClick={downloadQRCode} className="flex items-center gap-2 w-full lg:w-auto">
                <Download className="h-4 w-4" />
                Download QR code (PNG)
              </Button>
              
              <div className="p-4 bg-accent/50 rounded-lg border border-accent">
                <h5 className="font-medium text-accent-foreground mb-2">How to use the QR code:</h5>
                <ul className="text-sm text-accent-foreground space-y-1">
                  <li>1. Download the QR code as a PNG file</li>
                  <li>2. Print it or display it digitally</li>
                  <li>3. Customers scan the code with their phone</li>
                  <li>4. They are taken directly to the upload page</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};