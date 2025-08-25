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

  // Get the first active campaign to use for the upload button
  const firstActiveCampaign = activeCampaigns.length > 0 ? activeCampaigns[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 text-center space-y-8">
        {/* Company Logo - Large and centered */}
        <div className="space-y-6">
          <div className="w-48 h-48 mx-auto rounded-full bg-card border shadow-lg flex items-center justify-center">
            {company.logo ? (
              <img
                src={company.logo}
                alt={`${company.name} logotyp`}
                className="w-44 h-44 object-contain rounded-full"
              />
            ) : (
              <Building2 className="h-24 w-24 text-primary" />
            )}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
            <p className="text-xl text-muted-foreground">
              Upload content to receive an offer
            </p>
          </div>
        </div>

        {/* Upload Content Button */}
        <div className="pt-4">
          {firstActiveCampaign ? (
            <Link to={`/c/${firstActiveCampaign.id}`}>
              <Button size="lg" className="h-14 px-8 text-lg">
                <Camera className="h-6 w-6 mr-2" />
                Upload Content
              </Button>
            </Link>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">Inga aktiva kampanjer just nu.</p>
              <Button size="lg" disabled className="h-14 px-8 text-lg">
                <Camera className="h-6 w-6 mr-2" />
                Upload Content
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;