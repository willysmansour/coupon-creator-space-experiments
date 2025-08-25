import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  discount: number;
  validUntil: string;
  submissions: number;
  couponsIssued: number;
  status: "active" | "inactive" | "expired";
}

interface CleanCampaignCardProps {
  campaign: Campaign;
}

export function CleanCampaignCard({ campaign }: CleanCampaignCardProps) {
  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "expired":
        return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  const getStatusText = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return "Aktiv";
      case "inactive":
        return "Pausad";
      case "expired":
        return "Utgången";
    }
  };

  return (
    <Card className="p-6 hover:shadow-sm transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              {campaign.title}
            </h3>
            <Badge className={getStatusColor(campaign.status)}>
              {getStatusText(campaign.status)}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{campaign.discount}%</p>
            <p className="text-sm text-muted-foreground">rabatt</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Uppladdningar</p>
            <p className="font-semibold text-foreground">{campaign.submissions}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Kuponger</p>
            <p className="font-semibold text-foreground">{campaign.couponsIssued}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Giltig till</p>
            <p className="font-semibold text-foreground">{campaign.validUntil}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Inlösning</p>
            <p className="font-semibold text-success">
              {Math.round((campaign.couponsIssued / campaign.submissions) * 100) || 0}%
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <Eye className="h-4 w-4" />
            Visa
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <Edit className="h-4 w-4" />
            Redigera
          </Button>
        </div>
      </div>
    </Card>
  );
}