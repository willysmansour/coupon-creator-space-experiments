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
import { Trash2, Shield, User, Building } from 'lucide-react'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'

interface UserData {
  id: string
  email: string
  role: string
  company_name?: string
  created_at: string
}

interface UserManagementTableProps {
  users: UserData[]
  isLoading: boolean
  onDeleteUser: (userId: string) => void
  onToggleSuperAdmin: (userId: string, isSuperAdmin: boolean) => void
}

/**
 * Tabell för användarhantering i admin-panelen
 * Visar alla användare med möjlighet att ta bort och hantera roller
 */
export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  isLoading,
  onDeleteUser,
  onToggleSuperAdmin
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Super Admin
          </Badge>
        )
      case 'company_admin':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            Företagsadmin
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Kund
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Laddar användare...</div>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Inga användare hittades</div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>E-post</TableHead>
            <TableHead>Roll</TableHead>
            <TableHead>Företag</TableHead>
            <TableHead>Registrerad</TableHead>
            <TableHead className="text-right">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>{user.company_name || '-'}</TableCell>
              <TableCell>
                {format(new Date(user.created_at), 'PPP', { locale: sv })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {user.role !== 'super_admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleSuperAdmin(user.id, false)}
                      title="Gör till Super Admin"
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  )}
                  {user.role === 'super_admin' && user.email !== 'admin@test.com' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleSuperAdmin(user.id, true)}
                      title="Ta bort Super Admin"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  )}
                  {user.email !== 'admin@test.com' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Är du säker på att du vill ta bort ${user.email}?`)) {
                          onDeleteUser(user.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {user.email === 'admin@test.com' && (
                    <span className="text-xs text-muted-foreground">Skyddad</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
