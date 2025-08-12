import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpIcon, ArrowDownIcon, DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  loading?: boolean;
}

function MetricCard({ title, value, change, icon, loading }: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <div className="mt-2">
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="mt-2">
            <Skeleton className="h-4 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="mt-2 flex items-center gap-1">
          {isPositive ? (
            <ArrowUpIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground">vs previous</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function SalesOverview() {
  const { data: todayStats, isLoading: todayLoading } = useQuery({
    queryKey: ['/api/sales/today'],
    refetchInterval: 30000,
  });

  const { data: salesTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/trends'],
    refetchInterval: 30000,
  });

  // Calculate metrics
  const todayData = todayStats || { grossSales: 0, nettTotal: 0, transactionCount: 0, discounts: 0 };
  const trendsData = salesTrends || [];
  
  // Get yesterday's data for comparison
  const yesterday = trendsData[trendsData.length - 2];
  const today = trendsData[trendsData.length - 1];
  
  const calculateChange = (current: number, previous: number) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const grossSalesChange = calculateChange(
    parseFloat(todayData.grossSales || '0'),
    parseFloat(yesterday?.sales || '0')
  );

  const netSalesChange = calculateChange(
    parseFloat(todayData.nettTotal || '0'),
    parseFloat(yesterday?.sales || '0')
  );

  const transactionChange = calculateChange(
    todayData.transactionCount || 0,
    yesterday?.transactions || 0
  );

  const avgSaleChange = calculateChange(
    todayData.transactionCount ? parseFloat(todayData.nettTotal || '0') / todayData.transactionCount : 0,
    yesterday?.transactions ? yesterday.sales / yesterday.transactions : 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Key Business Stats - Today</h2>
          <p className="text-muted-foreground">Rolling 7-day view with last week & vs last year</p>
        </div>
        <Badge variant="outline">Today</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Gross Sales"
          value={`$${parseFloat(todayData.grossSales || '0').toLocaleString()}`}
          change={grossSalesChange}
          icon={<DollarSign className="h-4 w-4" />}
          loading={todayLoading}
        />
        
        <MetricCard
          title="Net Sales"
          value={`$${parseFloat(todayData.nettTotal || '0').toLocaleString()}`}
          change={netSalesChange}
          icon={<TrendingUp className="h-4 w-4" />}
          loading={todayLoading}
        />
        
        <MetricCard
          title="Average Sale"
          value={`$${todayData.transactionCount ? (parseFloat(todayData.nettTotal || '0') / todayData.transactionCount).toFixed(2) : '0.00'}`}
          change={avgSaleChange}
          icon={<ShoppingCart className="h-4 w-4" />}
          loading={todayLoading}
        />
        
        <MetricCard
          title="Transactions"
          value={(todayData.transactionCount || 0).toLocaleString()}
          change={transactionChange}
          icon={<Users className="h-4 w-4" />}
          loading={todayLoading}
        />
      </div>
    </div>
  );
}