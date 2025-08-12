import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { MapPin, TrendingUp } from 'lucide-react';

interface VenueData {
  venue: string;
  totalSales: number;
  totalTransactions: number;
  avgDailySales: number;
  days: number;
  percentage: number;
}

export function VenueBreakdown() {
  const { data: venueData, isLoading } = useQuery({
    queryKey: ['/api/sales/venues'],
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

  // Process venue data
  const venues = venueData?.venueComparison || [];
  const totalSales = venues.reduce((sum: number, venue: any) => sum + venue.totalSales, 0);
  
  const processedVenues: VenueData[] = venues.map((venue: any) => ({
    venue: venue.venue,
    totalSales: venue.totalSales,
    totalTransactions: venue.totalTransactions,
    avgDailySales: venue.avgDailySales,
    days: venue.days,
    percentage: totalSales > 0 ? (venue.totalSales / totalSales) * 100 : 0,
  }));

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
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Venue Performance
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sales distribution across all locations
          </p>
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
                    ${venue.totalSales.toLocaleString()}
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

      {/* Monthly Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Analytics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Watch key monthly performance & YoY growth
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
                    ${(venue.totalSales / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-green-600">
                    +{venue.percentage.toFixed(0)}%
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
                    ${(totalSales / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-muted-foreground">Total Sales</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}