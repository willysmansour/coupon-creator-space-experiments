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
import { useCompanyAwareCompanies } from "@/hooks/useCompanyAwareData";
import { supabase } from "@/integrations/supabase/client";

const DiscountSettings = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();
  const { data: companies = [], refetch, isLoading: companiesLoading, error: companiesError } = useCompanyAwareCompanies();
  const company = companies[0]; // Get first company
  const { toast } = useToast();

  // ✅ Fix: Debug logging för att se vad som händer med företagsdata
  console.log('🔍 DiscountSettings - companies:', companies);
  console.log('🔍 DiscountSettings - selected company:', company);
  console.log('🔍 DiscountSettings - company name:', company?.name);
  console.log('🔍 DiscountSettings - company logo:', company?.logo);
  console.log('🔍 DiscountSettings - loading:', companiesLoading);
  console.log('🔍 DiscountSettings - error:', companiesError);

  const [discountPercentage, setDiscountPercentage] = useState(
    company?.discount_percentage?.toString() || '10'
  );
  const [contentDescription, setContentDescription] = useState(
    company?.content_description || ''
  );
  const [discountActive, setDiscountActive] = useState(
    company?.discount_active !== false
  );
  const [photoEnabled, setPhotoEnabled] = useState(
    !company?.content_types || company?.content_types?.includes('photo')
  );
  const [videoEnabled, setVideoEnabled] = useState(
    !company?.content_types || company?.content_types?.includes('video')
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!company) {
      toast({
        title: "Error",
        description: "You must create a company first in Settings.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const contentTypes = [];
      if (photoEnabled) contentTypes.push('photo');
      if (videoEnabled) contentTypes.push('video');

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
        title: "Saved!",
        description: "Your discount settings have been updated."
      });
    } catch (error) {
      console.error('Error saving discount settings:', error);
      toast({
        title: "Error",
        description: "Could not save settings.",
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
                  {companiesLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <h1 className="text-xl font-semibold mb-2">Loading company...</h1>
                      <p className="text-muted-foreground">Please wait while we load your company information.</p>
                    </>
                  ) : companiesError ? (
                    <>
                      <h1 className="text-xl font-semibold mb-2">Error loading company</h1>
                      <p className="text-muted-foreground mb-4">
                        {companiesError.message || 'Could not load company information.'}
                      </p>
                      <Button onClick={() => refetch()} className="w-full">
                        Try Again
                      </Button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-xl font-semibold mb-2">No company found</h1>
                      <p className="text-muted-foreground mb-4">
                        You must create a company first in Settings.
                      </p>
                      <Button onClick={() => window.location.href = '/settings'} className="w-full">
                        Go to Settings
                      </Button>
                    </>
                  )}
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
                <h1 className="text-2xl font-bold text-foreground">Discount settings</h1>
              </div>
              <p className="text-muted-foreground">
                Manage how customers can receive discount coupons by uploading content.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Discount settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Active Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Active offer</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow customers to upload content for a discount
                      </p>
                    </div>
                    <Switch
                      checked={discountActive}
                      onCheckedChange={setDiscountActive}
                    />
                  </div>

                  {/* Discount Percentage */}
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
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
                      Percentage off when customer content is approved
                    </p>
                  </div>

                  {/* Content Types */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Accepted content</Label>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Photos</span>
                      </div>
                      <Switch
                        checked={photoEnabled}
                        onCheckedChange={setPhotoEnabled}
                        disabled={!discountActive}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Videos</span>
                      </div>
                      <Switch
                        checked={videoEnabled}
                        onCheckedChange={setVideoEnabled}
                        disabled={!discountActive}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Instructions (optional)</Label>
                    <Textarea
                      id="description"
                      value={contentDescription}
                      onChange={(e) => setContentDescription(e.target.value)}
                      placeholder="Describe what type of content you want..."
                      disabled={!discountActive}
                    />
                  </div>

                  <Button 
                    onClick={handleSave} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save settings'}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    What your offer looks like to customers
                  </p>
                </CardHeader>
                <CardContent>
                  {/* ✅ Fix: Debug info för preview */}
                  <div className="mb-4 p-2 bg-muted rounded text-xs">
                    <p><strong>Debug Info:</strong></p>
                    <p>Company: {company?.name || 'undefined'}</p>
                    <p>Logo: {company?.logo ? 'Yes' : 'No'}</p>
                    <p>Discount: {discountPercentage}%</p>
                    <p>Active: {discountActive ? 'Yes' : 'No'}</p>
                  </div>
                  
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
                        <p className="text-xs text-muted-foreground">Share your contribution</p>
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
                            {discountActive ? 'Get a discount coupon' : 'Offer is paused'}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {discountActive 
                              ? `Upload content and get ${discountPercentage}% off`
                              : 'The offer is currently not active'
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
                          {photoEnabled && (
                            <Badge variant="secondary" className="text-xs">
                              <Image className="w-3 h-3 mr-1" />
                              Photos
                            </Badge>
                          )}
                          {videoEnabled && (
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