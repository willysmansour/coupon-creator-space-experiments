import { useState } from "react";
import { ModernSidebar } from "@/components/ModernSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Gift, Save, Settings, Image, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";

const DiscountSettings = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();
  const { data: companies = [], refetch } = useCompanies();
  const company = companies[0]; // Get first company
  const { toast } = useToast();

  const [discountPercentage, setDiscountPercentage] = useState(
    (company as any)?.discount_percentage?.toString() || '10'
  );
  const [contentDescription, setContentDescription] = useState(
    (company as any)?.content_description || ''
  );
  const [discountActive, setDiscountActive] = useState(
    (company as any)?.discount_active !== false
  );
  const [acceptPhotos, setAcceptPhotos] = useState(
    !(company as any)?.content_types || (company as any)?.content_types?.includes('photo')
  );
  const [acceptVideos, setAcceptVideos] = useState(
    !(company as any)?.content_types || (company as any)?.content_types?.includes('video')
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!company) {
      toast({
        title: "Fel",
        description: "Du måste skapa ett företag först i Inställningar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const contentTypes = [];
      if (acceptPhotos) contentTypes.push('photo');
      if (acceptVideos) contentTypes.push('video');

      const { error } = await supabase
        .from('companies')
        .update({
          discount_percentage: parseInt(discountPercentage),
          content_types: contentTypes,
          content_description: contentDescription,
          discount_active: discountActive
        })
        .eq('id', company.id);

      if (error) throw error;

      // Refetch the companies data
      await refetch();

      toast({
        title: "Sparad!",
        description: "Dina rabattinställningar har uppdaterats."
      });
    } catch (error) {
      console.error('Error saving discount settings:', error);
      toast({
        title: "Fel",
        description: "Kunde inte spara inställningarna.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!company) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <ModernSidebar />
          <div className="flex-1">
            <ModernHeader />
            <main className="p-6">
              <Card className="max-w-md mx-auto">
                <CardContent className="p-6 text-center">
                  <h1 className="text-xl font-semibold mb-2">Inget företag hittat</h1>
                  <p className="text-muted-foreground mb-4">
                    Du måste skapa ett företag först i Inställningar.
                  </p>
                  <Button onClick={() => window.location.href = '/settings'}>
                    Gå till Inställningar
                  </Button>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ModernSidebar />
        
        <div className="flex-1">
          <ModernHeader 
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={setSelectedCompanyId}
          />
          
          <main className="p-6 space-y-6 max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Rabattinställningar</h1>
              </div>
              <p className="text-muted-foreground">
                Hantera hur kunder kan få rabattkuponger genom att ladda upp innehåll.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Rabattinställningar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Active Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Aktivt erbjudande</Label>
                      <p className="text-xs text-muted-foreground">
                        Tillåt kunder att ladda upp innehåll för rabatt
                      </p>
                    </div>
                    <Switch
                      checked={discountActive}
                      onCheckedChange={setDiscountActive}
                    />
                  </div>

                  {/* Discount Percentage */}
                  <div className="space-y-2">
                    <Label htmlFor="discount">Rabatt (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="1"
                      max="100"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      disabled={!discountActive}
                    />
                    <p className="text-xs text-muted-foreground">
                      Procent rabatt som kunder får när deras innehåll godkänns
                    </p>
                  </div>

                  {/* Content Types */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Accepterat innehåll</Label>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Foton</span>
                      </div>
                      <Switch
                        checked={acceptPhotos}
                        onCheckedChange={setAcceptPhotos}
                        disabled={!discountActive}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Videos</span>
                      </div>
                      <Switch
                        checked={acceptVideos}
                        onCheckedChange={setAcceptVideos}
                        disabled={!discountActive}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Instruktioner (valfritt)</Label>
                    <Textarea
                      id="description"
                      value={contentDescription}
                      onChange={(e) => setContentDescription(e.target.value)}
                      placeholder="Beskriv vilken typ av innehåll du vill ha..."
                      disabled={!discountActive}
                    />
                  </div>

                  <Button 
                    onClick={handleSave} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Sparar...' : 'Spara inställningar'}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Förhandsvisning</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Så här ser ditt erbjudande ut för kunder
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 space-y-4">
                    {/* Company Header */}
                    <div className="flex items-center gap-3 pb-3 border-b">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="w-8 h-8 rounded" />
                      ) : (
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                          <span className="text-primary-foreground text-sm font-bold">
                            {company.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        <p className="text-xs text-muted-foreground">Dela ditt bidrag</p>
                      </div>
                    </div>

                    {/* Offer Card */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Gift className="w-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">
                            {discountActive ? 'Få en rabattkupong' : 'Erbjudandet är pausat'}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {discountActive 
                              ? `Ladda upp innehåll och få ${discountPercentage}% rabatt`
                              : 'Erbjudandet är för tillfället inte aktivt'
                            }
                          </p>
                          {contentDescription && discountActive && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {contentDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Content types */}
                      {discountActive && (
                        <div className="flex gap-2">
                          {acceptPhotos && (
                            <Badge variant="secondary" className="text-xs">
                              <Image className="w-3 h-3 mr-1" />
                              Foton
                            </Badge>
                          )}
                          {acceptVideos && (
                            <Badge variant="secondary" className="text-xs">
                              <Video className="w-3 h-3 mr-1" />
                              Videos
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DiscountSettings;