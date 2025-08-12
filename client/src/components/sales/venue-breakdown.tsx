import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, TrendingUp, Settings2 } from 'lucide-react';

interface VenueData {
  venue: string;
  totalSales: number;
  totalTransactions: number;
  avgDailySales: number;
  days: number;
  percentage: number;
}

type PeriodType = 'today' | 'week' | 'month' | 'quarter' | 'ytd' | 'year';
type MetricType = 'nettTotal' | 'grossSales' | 'transactionCount' | 'totalDiscount';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'year', label: 'This Year' },
];

const METRIC_OPTIONS = [
  { value: 'nettTotal', label: 'Net Sales', format: 'currency' },
  { value: 'grossSales', label: 'Gross Sales', format: 'currency' },
  { value: 'transactionCount', label: 'Transactions', format: 'number' },
  { value: 'totalDiscount', label: 'Discounts', format: 'currency' },
];

interface VenueBreakdownProps {
  selectedPeriod?: PeriodType;
}

export function VenueBreakdown({ selectedPeriod = 'ytd' }: VenueBreakdownProps) {
  const [localPeriod, setLocalPeriod] = useState<PeriodType>(selectedPeriod);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('nettTotal');
  
  // Use local period if no prop is passed, otherwise use the prop
  const activePeriod = selectedPeriod;
  
  const { data: venueData, isLoading } = useQuery({
    queryKey: ['/api/sales/venues', activePeriod, selectedMetric],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process venue data based on selected metric
  const venues = venueData?.venueComparison || [];
  const selectedMetricOption = METRIC_OPTIONS.find(m => m.value === selectedMetric)!;
  
  // Calculate total based on selected metric
  const getMetricValue = (venue: any) => {
    switch (selectedMetric) {
      case 'nettTotal': return venue.totalSales || 0;
      case 'grossSales': return venue.grossSales || 0;
      case 'transactionCount': return venue.totalTransactions || 0;
      case 'totalDiscount': return venue.totalDiscounts || 0;
      default: return venue.totalSales || 0;
    }
  };
  
  const totalValue = venues.reduce((sum: number, venue: any) => sum + getMetricValue(venue), 0);
  
  const processedVenues: VenueData[] = venues.map((venue: any) => {
    const metricValue = getMetricValue(venue);
    return {
      venue: venue.venue,
      totalSales: metricValue,
      totalTransactions: venue.totalTransactions,
      avgDailySales: venue.avgDailySales,
      days: venue.days,
      percentage: totalValue > 0 ? (metricValue / totalValue) * 100 : 0,
    };
  });

  const getVenueColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Venue Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Venue Performance - {PERIOD_OPTIONS.find(p => p.value === activePeriod)?.label}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedMetricOption.label} distribution across all locations
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedMetric} onValueChange={(value: MetricType) => setSelectedMetric(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRIC_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processedVenues.map((venue, index) => (
              <div key={venue.venue} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${getVenueColor(index)}`} />
                    <span className="font-medium">{venue.venue}</span>
                    <Badge variant="secondary" className="text-xs">
                      {venue.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">
                    {selectedMetricOption.format === 'currency' 
                      ? `$${venue.totalSales.toLocaleString()}`
                      : venue.totalSales.toLocaleString()
                    }
                  </span>
                </div>
                <Progress 
                  value={venue.percentage} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{venue.totalTransactions.toLocaleString()} transactions</span>
                  <span>Avg: ${venue.avgDailySales.toLocaleString()}/day</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Period Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {PERIOD_OPTIONS.find(p => p.value === activePeriod)?.label} Analytics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Key {selectedMetricOption.label.toLowerCase()} performance & growth
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Top Venue Stats */}
            {processedVenues.slice(0, 3).map((venue, index) => (
              <div key={venue.venue} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${getVenueColor(index)}`} />
                  <div>
                    <p className="font-medium text-sm">{venue.venue}</p>
                    <p className="text-xs text-muted-foreground">
                      {venue.days} days active
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {selectedMetricOption.format === 'currency' 
                      ? `$${(venue.totalSales / 1000).toFixed(0)}k`
                      : (venue.totalSales > 1000 ? `${(venue.totalSales / 1000).toFixed(1)}k` : venue.totalSales.toLocaleString())
                    }
                  </p>
                  <p className="text-xs text-green-600">
                    {venue.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}

            {/* Summary Stats */}
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {processedVenues.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Venues</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {selectedMetricOption.format === 'currency' 
                      ? `$${(totalValue / 1000).toFixed(0)}k`
                      : totalValue.toLocaleString()
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Total {selectedMetricOption.label}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}