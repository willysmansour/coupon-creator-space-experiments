import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, MessageSquare } from "lucide-react";

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

interface UploadSubmissionProps {
  submission: Submission;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function UploadSubmission({ submission, onApprove, onReject }: UploadSubmissionProps) {
  const getStatusColor = (status: Submission["status"]) => {
    switch (status) {
      case "approved":
        return "bg-success text-success-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
    }
  };

  const getStatusText = (status: Submission["status"]) => {
    switch (status) {
      case "approved":
        return "Godkänd";
      case "rejected":
        return "Avvisad";
      case "pending":
        return "Väntar";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {/* Image */}
          <div className="w-32 h-32 bg-muted flex-shrink-0">
            <img 
              src={submission.image} 
              alt="Upload submission"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{submission.customerName}</h3>
                <p className="text-sm text-muted-foreground">{submission.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {submission.submittedAt} • {submission.campaign}
                </p>
              </div>
              <Badge className={getStatusColor(submission.status)}>
                {getStatusText(submission.status)}
              </Badge>
            </div>
            
            {submission.message && (
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Meddelande:</span>
                </div>
                <p className="text-sm bg-muted p-2 rounded text-muted-foreground">
                  {submission.message}
                </p>
              </div>
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
                  variant="destructive" 
                  className="gap-1"
                  onClick={() => onReject(submission.id)}
                >
                  <X className="h-3 w-3" />
                  Avvisa
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <Eye className="h-3 w-3" />
                  Visa större
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}