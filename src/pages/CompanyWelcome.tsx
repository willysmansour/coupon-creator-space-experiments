import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompany } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Upload, Camera, Video } from 'lucide-react';

const CompanyWelcome = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  
  const { data: company, isLoading: companyLoading } = useCompany(companyId || '');

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Laddar...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Företaget kunde inte hittas</h1>
            <p className="text-muted-foreground">Det här företaget existerar inte.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!company.discount_active) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Ingen aktiv rabatt</h1>
            <p className="text-muted-foreground">Det finns ingen aktiv rabatt för detta företag just nu.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleContinue = () => {
    navigate(`/company/${companyId}/upload`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="max-w-md mx-auto p-4 space-y-8 pt-16">
        {/* Company Header with Logo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {company.logo ? (
              <img 
                src={company.logo} 
                alt={company.name} 
                className="w-24 h-24 rounded-2xl shadow-lg object-contain bg-card"
              />
            ) : (
              <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground text-2xl font-bold">
                  {company.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
            <p className="text-muted-foreground">Välkommen till vår kampanj!</p>
          </div>
        </div>

        {/* Discount Information */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Rabatterbjudande</CardTitle>
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                Aktiv
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.content_description && (
              <p className="text-sm text-muted-foreground">
                {company.content_description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-primary">
                <Gift className="h-4 w-4" />
                <span className="font-semibold">{company.discount_percentage}% rabatt</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                {company.content_types?.includes('photo') && (
                  <div className="flex items-center gap-1">
                    <Camera className="h-4 w-4" />
                    <span>Foto</span>
                  </div>
                )}
                {company.content_types?.includes('video') && (
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span>Video</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-accent/30 border-accent">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Så här gör du:</h3>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary min-w-[1rem]">1.</span>
                <span>Klicka på "Fortsätt" nedan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary min-w-[1rem]">2.</span>
                <span>Ladda upp din bild eller video</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary min-w-[1rem]">3.</span>
                <span>Få din rabattkupong direkt!</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <Button 
          onClick={handleContinue}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          <Upload className="h-5 w-5 mr-2" />
          Fortsätt till uppladdning
        </Button>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Genom att fortsätta godkänner du villkoren för kampanjen
        </p>
      </div>
    </div>
  );
};

export default CompanyWelcome;