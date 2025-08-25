import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useSupabaseData';

export const QRCodeGenerator = () => {
  const { toast } = useToast();
  const { data: companies = [], isLoading } = useCompanies();
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Laddar...</div>
        </CardContent>
      </Card>
    );
  }

  // Use the first company from the database
  const company = companies[0];
  if (!company) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Inget företag hittades</div>
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
      ctx.fillText('Skanna för att ladda upp bilder', canvas.width / 2, 550);
      
      // Download
      const link = document.createElement('a');
      link.download = `${company.name}-qr-kod.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: "QR-kod nedladdad",
        description: "QR-koden har sparats som PNG-fil.",
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
          QR-kod för uppladdning
        </CardTitle>
        <CardDescription>
          Generera och ladda ner QR-kod som kunder kan skanna för att ladda upp bilder direkt till ditt företag
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
              <p className="text-sm text-muted-foreground">Skanna för att ladda upp bilder</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">QR-kodens URL</h4>
              <div className="p-3 bg-muted rounded-md">
                <code className="text-sm text-muted-foreground break-all">{qrUrl}</code>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button onClick={downloadQRCode} className="flex items-center gap-2 w-full lg:w-auto">
                <Download className="h-4 w-4" />
                Ladda ner QR-kod (PNG)
              </Button>
              
              <div className="p-4 bg-accent/50 rounded-lg border border-accent">
                <h5 className="font-medium text-accent-foreground mb-2">Så här använder du QR-koden:</h5>
                <ul className="text-sm text-accent-foreground space-y-1">
                  <li>1. Ladda ner QR-koden som PNG-fil</li>
                  <li>2. Skriv ut den eller visa den digitalt</li>
                  <li>3. Kunder skannar koden med sin telefon</li>
                  <li>4. De dirigeras direkt till uppladdningssidan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};