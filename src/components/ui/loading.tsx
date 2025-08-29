import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <Loader2 
      className={cn("animate-spin text-primary", sizeClasses[size], className)} 
    />
  );
}

interface LoadingPageProps {
  message?: string;
  className?: string;
}

export function LoadingPage({ message = "Loading...", className }: LoadingPageProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-background", className)}>
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

interface LoadingSectionProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSection({ 
  message = "Loading...", 
  className,
  size = "md" 
}: LoadingSectionProps) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size={size} />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function LoadingButton({ children, loading = false, className }: LoadingButtonProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </span>
  );
}
