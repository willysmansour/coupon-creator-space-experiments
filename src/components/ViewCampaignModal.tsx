import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, Gift, Users, TrendingUp } from "lucide-react";
import { Campaign } from "@/contexts/AppContext";

interface ViewCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}

export function ViewCampaignModal({ open, onOpenChange, campaign }: ViewCampaignModalProps) {
  if (!campaign) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "expired":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Aktiv";
      case "inactive":
        return "Pausad";
      case "expired":
        return "Utgången";
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            {campaign.title}
          </DialogTitle>
          <DialogDescription>
            Kampanjdetaljer och statistik
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Discount */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(campaign.status)}>
              {getStatusText(campaign.status)}
            </Badge>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{campaign.discount}%</p>
              <p className="text-sm text-muted-foreground">rabatt</p>
            </div>
          </div>

          {/* Description */}
          {campaign.description && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Beskrivning</h4>
              <p className="text-muted-foreground">{campaign.description}</p>
            </div>
          )}

          {/* Campaign Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Giltig till</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {new Date(campaign.validUntil).toLocaleDateString('sv-SE')}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Skapad</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {new Date(campaign.createdAt).toLocaleDateString('sv-SE')}
              </p>
            </Card>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">{campaign.submissions}</p>
              <p className="text-sm text-muted-foreground">Uppladdningar</p>
            </Card>

            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">{campaign.couponsIssued}</p>
              <p className="text-sm text-muted-foreground">Kuponger</p>
            </Card>

            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-success">
                {campaign.submissions > 0 ? Math.round((campaign.couponsIssued / campaign.submissions) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Inlösning</p>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}