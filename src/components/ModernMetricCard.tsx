import { Card } from "@/components/ui/card";
import { TrendingUp, ArrowUpRight } from "lucide-react";

interface ModernMetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  variant?: "primary" | "secondary" | "accent" | "warning";
}

export function ModernMetricCard({ 
  title, 
  value, 
  change, 
  trend = "up",
  variant = "secondary" 
}: ModernMetricCardProps) {
  const getCardStyle = () => {
    switch (variant) {
      case "primary":
        return "bg-primary text-primary-foreground";
      case "accent":
        return "bg-accent text-accent-foreground";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-card text-card-foreground";
    }
  };

  const getTrendColor = () => {
    if (variant === "primary") return "text-primary-foreground/80";
    return trend === "up" ? "text-success" : "text-destructive";
  };

  return (
    <Card className={`p-6 transition-all duration-200 hover:shadow-md ${getCardStyle()}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-sm font-medium mb-1 ${
            variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"
          }`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${
            variant === "primary" ? "text-primary-foreground" : "text-foreground"
          }`}>
            {value}
          </p>
        </div>
        <ArrowUpRight className={`h-5 w-5 ${
          variant === "primary" ? "text-primary-foreground/60" : "text-muted-foreground"
        }`} />
      </div>
      
      {change && (
        <div className="flex items-center gap-1">
          <TrendingUp className={`h-3 w-3 ${getTrendColor()}`} />
          <span className={`text-sm ${getTrendColor()}`}>
            {change}
          </span>
        </div>
      )}
    </Card>
  );
}