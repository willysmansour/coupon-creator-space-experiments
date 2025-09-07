import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Building, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { enGB } from 'date-fns/locale'

interface CompanyData {
  id: string
  name: string
  owner_email?: string
  is_active: boolean
  created_at: string
}

interface CompanyManagementTableProps {
  companies: CompanyData[]
  isLoading: boolean
  onDeleteCompany: (companyId: string) => void
  onToggleCompanyStatus: (companyId: string, isActive: boolean) => void
}

/**
 * Company management table for admin panel
 * Shows all companies with ability to enable/disable and delete
 */
export const CompanyManagementTable: React.FC<CompanyManagementTableProps> = ({
  companies,
  isLoading,
  onDeleteCompany,
  onToggleCompanyStatus
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading companies...</div>
      </div>
    )
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">No companies found</div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Building className="h-4 w-4 inline mr-2" />
              Company name
            </TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell>{company.owner_email || 'No owner'}</TableCell>
              <TableCell>
                {company.is_active ? (
                  <Badge variant="default" className="flex items-center gap-1 w-fit">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {format(new Date(company.created_at), 'PPP', { locale: enGB })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant={company.is_active ? "outline" : "default"}
                    size="sm"
                    onClick={() => onToggleCompanyStatus(company.id, !company.is_active)}
                  >
                    {company.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${company.name}? This will also remove all related coupons and campaigns.`)) {
                        onDeleteCompany(company.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
