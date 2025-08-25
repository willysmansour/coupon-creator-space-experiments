import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";

interface Submission {
  id: string;
  customerName: string;
  email: string;
  image: string;
  message: string;
  campaign: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface CleanUploadItemProps {
  submission: Submission;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function CleanUploadItem({ submission, onApprove, onReject }: CleanUploadItemProps) {
  const getStatusBadge = (status: Submission["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <Check className="h-3 w-3 mr-1" />
            Godkänd
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <X className="h-3 w-3 mr-1" />
            Avvisad
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <Clock className="h-3 w-3 mr-1" />
            Väntar
          </Badge>
        );
    }
  };

  return (
    <Card className="p-4 hover:shadow-sm transition-shadow">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <img 
            src={submission.image} 
            alt="Upload submission"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-medium text-foreground">{submission.customerName}</h4>
              <p className="text-sm text-muted-foreground">{submission.email}</p>
            </div>
            {getStatusBadge(submission.status)}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            {submission.campaign} • {submission.submittedAt}
          </p>
          
          {submission.message && (
            <p className="text-sm text-foreground mb-3 line-clamp-2">
              "{submission.message}"
            </p>
          )}
          
          {submission.status === "pending" && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="gap-1 bg-success hover:bg-success/90"
                onClick={() => onApprove(submission.id)}
              >
                <Check className="h-3 w-3" />
                Godkänn
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onReject(submission.id)}
              >
                <X className="h-3 w-3" />
                Avvisa
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}