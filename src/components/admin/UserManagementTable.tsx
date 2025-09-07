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
import { enGB } from 'date-fns/locale'

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
 * User management table for admin panel
 * Shows all users with ability to delete and manage roles
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
            Company Admin
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Customer
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">No users found</div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>{user.company_name || '-'}</TableCell>
              <TableCell>
                {format(new Date(user.created_at), 'PPP', { locale: enGB })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {user.role !== 'super_admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleSuperAdmin(user.id, false)}
                      title="Make Super Admin"
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  )}
                  {user.role === 'super_admin' && user.email !== 'admin@test.com' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleSuperAdmin(user.id, true)}
                      title="Remove Super Admin"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  )}
                  {user.email !== 'admin@test.com' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${user.email}?`)) {
                          onDeleteUser(user.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {user.email === 'admin@test.com' && (
                    <span className="text-xs text-muted-foreground">Protected</span>
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
