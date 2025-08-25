import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Edit, Percent, Zap } from "lucide-react";
import { useApp, Campaign } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/use-toast";

interface EditCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}

export function EditCampaignModal({ open, onOpenChange, campaign }: EditCampaignModalProps) {
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "expired">("active");
  const [autoApproval, setAutoApproval] = useState(false);
  const { updateCampaign } = useApp();
  const { toast } = useToast();

  useEffect(() => {
    if (campaign) {
      setTitle(campaign.title);
      setDiscount(campaign.discount.toString());
      setValidUntil(campaign.validUntil);
      setDescription(campaign.description || "");
      setStatus(campaign.status);
      setAutoApproval(campaign.auto_approval || false);
    }
  }, [campaign]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaign) return;

    // Update campaign in global state
    updateCampaign(campaign.id, {
      title,
      discount: parseInt(discount),
      validUntil,
      description,
      status,
      auto_approval: autoApproval
    });

    toast({
      title: "Kampanj uppdaterad!",
      description: `${title} har uppdaterats.`
    });

    onOpenChange(false);
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Redigera kampanj
          </DialogTitle>
          <DialogDescription>
            Uppdatera kampanjdetaljer och inställningar.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Kampanjtitel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="t.ex. Ladda upp bild → få 20% rabatt"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Rabatt (%)
              </Label>
              <Input
                id="discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="20"
                min="1"
                max="100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Giltig till
              </Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: "active" | "inactive" | "expired") => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Pausad</SelectItem>
                <SelectItem value="expired">Utgången</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning (valfritt)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lägg till en beskrivning av kampanjen..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-approval"
              checked={autoApproval}
              onCheckedChange={(checked) => setAutoApproval(checked as boolean)}
            />
            <Label htmlFor="auto-approval" className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              Automatiskt godkännande av uploads
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-primary-hover">
              Spara ändringar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}