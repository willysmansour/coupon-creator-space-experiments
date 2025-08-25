import { useParams, Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Camera, ArrowRight } from "lucide-react";

const Landing = () => {
  const { companyId } = useParams();
  const { company, campaigns } = useApp();
  
  // In a real app, you'd fetch company data by ID
  // For now, we'll use the single company from context
  const activeCampaigns = campaigns.filter(c => c.status === "active");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Company Logo and Header */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-card border shadow-lg flex items-center justify-center">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
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
                        {campaign.discount}% rabatt
                      </div>
                      <Button className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Ladda upp bild
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Gäller till: {new Date(campaign.validUntil).toLocaleDateString('sv-SE')}
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