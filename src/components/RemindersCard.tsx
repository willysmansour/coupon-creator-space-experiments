import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

export function RemindersCard() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Reminders</h3>
      
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-accent border border-accent/50">
          <h4 className="font-medium text-foreground mb-2">Meeting with Arc Company</h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>02:00 pm - 04:00 pm</span>
            </div>
          </div>
          <Button size="sm" className="bg-primary hover:bg-primary-hover">
            Start Meeting
          </Button>
        </div>
        
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No more reminders today</p>
        </div>
      </div>
    </Card>
  );
}