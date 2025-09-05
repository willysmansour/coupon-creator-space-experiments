import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building, ShoppingBag, TrendingUp } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalCompanies: number
  totalCoupons: number
  activeCompanies: number
}

interface AdminDashboardStatsProps {
  stats: AdminStats
}

/**
 * Statistik-kort för admin-dashboard
 * Visar översikt över användare, företag och kuponger
 */
export const AdminDashboardStats: React.FC<AdminDashboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Totalt antal användare',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Registrerade företag',
      value: stats.totalCompanies,
      icon: Building,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Aktiva företag',
      value: stats.activeCompanies,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Totalt antal kuponger',
      value: stats.totalCoupons,
      icon: ShoppingBag,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
