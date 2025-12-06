import { useEffect, useState } from 'react';
import { Users, CreditCard, DollarSign, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAction } from '@/services/adminService';
import { formatCurrency } from '@/lib/formatCurrency';

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  pendingPayments: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminAction('get_stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'text-blue-500' 
    },
    { 
      title: 'Active Subscriptions', 
      value: stats?.activeSubscriptions || 0, 
      icon: Zap, 
      color: 'text-green-500' 
    },
    { 
      title: 'Pending Payments', 
      value: stats?.pendingPayments || 0, 
      icon: CreditCard, 
      color: 'text-yellow-500' 
    },
    { 
      title: 'Total Revenue', 
      value: formatCurrency(stats?.totalRevenue || 0), 
      icon: DollarSign, 
      color: 'text-primary',
      isRevenue: true
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.isRevenue ? stat.value : stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
