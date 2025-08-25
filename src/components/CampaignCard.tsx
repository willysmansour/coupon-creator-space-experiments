import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Users, Gift, Calendar } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  discount: number;
  validUntil: string;
  submissions: number;
  couponsIssued: number;
  status: "active" | "inactive" | "expired";
}

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "expired":
        return "bg-destructive text-destructive-foreground";
    }
  };

  const getStatusText = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return "Aktiv";
      case "inactive":
        return "Inaktiv";
      case "expired":
        return "Utgången";
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{campaign.title}</CardTitle>
            <Badge className={getStatusColor(campaign.status)}>
              {getStatusText(campaign.status)}
            </Badge>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Rabatt:</span>
            <span className="font-semibold">{campaign.discount}%</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Giltig till:</span>
            <span className="font-semibold">{campaign.validUntil}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Uppladdningar:</span>
            <span className="font-semibold">{campaign.submissions}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Kuponger:</span>
            <span className="font-semibold">{campaign.couponsIssued}</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            Redigera
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Se uppladdningar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}