import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

type PeriodType = 'today' | 'week' | 'month' | 'quarter' | 'ytd' | 'year';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'year', label: 'This Year' },
];

export function SalesOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('ytd');

  const { data: periodStats, isLoading: periodLoading } = useQuery({
    queryKey: ['/api/sales/period', selectedPeriod],
    refetchInterval: 30000,
  });

  const { data: salesTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/trends'],
    refetchInterval: 30000,
  });

  // Calculate metrics based on selected period
  const periodData = periodStats || { 
    current: { grossSales: 0, nettTotal: 0, transactionCount: 0, discounts: 0 },
    previous: { grossSales: 0, nettTotal: 0, transactionCount: 0, discounts: 0 },
    changes: { grossSalesChange: 0, netSalesChange: 0, transactionChange: 0, avgSaleChange: 0 }
  };

  const currentData = periodData.current || { grossSales: 0, nettTotal: 0, transactionCount: 0, discounts: 0 };
  const changes = periodData.changes || { grossSalesChange: 0, netSalesChange: 0, transactionChange: 0, avgSaleChange: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Key Business Stats - {PERIOD_OPTIONS.find(p => p.value === selectedPeriod)?.label}
          </h2>
          <p className="text-muted-foreground">Performance metrics with period-over-period comparison</p>
        </div>
        <Select value={selectedPeriod} onValueChange={(value: PeriodType) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Gross Sales"
          value={`$${parseFloat(currentData.grossSales || '0').toLocaleString()}`}
          change={changes.grossSalesChange}
          icon={<DollarSign className="h-4 w-4" />}
          loading={periodLoading}
        />
        
        <MetricCard
          title="Net Sales"
          value={`$${parseFloat(currentData.nettTotal || '0').toLocaleString()}`}
          change={changes.netSalesChange}
          icon={<TrendingUp className="h-4 w-4" />}
          loading={periodLoading}
        />
        
        <MetricCard
          title="Average Sale"
          value={`$${currentData.transactionCount ? (parseFloat(currentData.nettTotal || '0') / currentData.transactionCount).toFixed(2) : '0.00'}`}
          change={changes.avgSaleChange}
          icon={<ShoppingCart className="h-4 w-4" />}
          loading={periodLoading}
        />
        
        <MetricCard
          title="Transactions"
          value={(currentData.transactionCount || 0).toLocaleString()}
          change={changes.transactionChange}
          icon={<Users className="h-4 w-4" />}
          loading={periodLoading}
        />
      </div>
    </div>
  );
}