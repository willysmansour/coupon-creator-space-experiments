import { useParams, Link } from "react-router-dom";
import { useCompany, useActiveCampaigns } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Camera, ArrowRight } from "lucide-react";

const Landing = () => {
  const { companyId } = useParams();
  const { data: company, isLoading: companyLoading } = useCompany(companyId || '123e4567-e89b-12d3-a456-426614174000');
  const { data: activeCampaigns = [], isLoading: campaignsLoading } = useActiveCampaigns(companyId);
  
  if (companyLoading || campaignsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Företaget kunde inte hittas</h1>
            <p className="text-muted-foreground">Det här företaget existerar inte.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Company Logo and Header */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-card border shadow-lg flex items-center justify-center">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`${company.name} logotyp`}
                  className="w-20 h-20 object-contain rounded-full"
                />
              ) : (
                <Building2 className="h-12 w-12 text-primary" />
              )}
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
              <p className="text-muted-foreground">Välkommen till vår kampanj!</p>
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">Aktiva kampanjer</h2>
            
            {activeCampaigns.length > 0 ? (
              activeCampaigns.map((campaign) => (
                <Card key={campaign.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <CardDescription>
                      {campaign.description || "Ladda upp en bild för att få rabatt!"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {campaign.discount}
                      </div>
                      <Link to={`/c/${campaign.id}`}>
                        <Button className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          Ladda upp bild
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Gäller till: {new Date(campaign.valid_to).toLocaleDateString('sv-SE')}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Inga aktiva kampanjer just nu.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Kom tillbaka senare för nya erbjudanden!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="text-center pt-6">
            <p className="text-xs text-muted-foreground">
              Powered by {company.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;