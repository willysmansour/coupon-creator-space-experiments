import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CleanMetricsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning";
}

export function CleanMetricsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant = "default" 
}: CleanMetricsCardProps) {
  const getIconColor = () => {
    switch (variant) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      default:
        return "text-primary";
    }
  };

  return (
    <Card className="p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground">
            {value}
          </p>
          {change && (
            <p className="text-sm text-muted-foreground mt-1">
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-accent ${getIconColor()}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}