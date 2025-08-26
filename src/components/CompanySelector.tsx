import { useState } from "react";
import { useCompanies } from "@/hooks/useSupabaseData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface CompanySelectorProps {
  selectedCompanyId?: string;
  onCompanyChange: (companyId: string | undefined) => void;
  className?: string;
}

export function CompanySelector({ selectedCompanyId, onCompanyChange, className }: CompanySelectorProps) {
  const { data: companies = [], isLoading } = useCompanies();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={selectedCompanyId || "all"} 
        onValueChange={(value) => onCompanyChange(value === "all" ? undefined : value)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-48 bg-input border-0 focus:ring-2 focus:ring-primary/20">
          <SelectValue placeholder={isLoading ? "Laddar..." : "Alla företag"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alla företag</SelectItem>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}