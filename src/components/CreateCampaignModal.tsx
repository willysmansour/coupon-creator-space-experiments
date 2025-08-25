import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Gift, Percent } from "lucide-react";

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignModal({ open, onOpenChange }: CreateCampaignModalProps) {
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle campaign creation
    console.log({ title, discount, validUntil, description });
    onOpenChange(false);
    // Reset form
    setTitle("");
    setDiscount("");
    setValidUntil("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Skapa ny kampanj
          </DialogTitle>
          <DialogDescription>
            Skapa en ny marknadsföringskampanj där kunder kan ladda upp bilder för rabatt.
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
            <Label htmlFor="description">Beskrivning (valfritt)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lägg till en beskrivning av kampanjen..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-primary-hover">
              Skapa kampanj
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}