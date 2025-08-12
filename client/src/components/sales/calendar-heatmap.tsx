import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface DayData {
  date: string;
  sales: number;
  transactions: number;
  intensity: number;
}

interface CalendarHeatmapProps {
  className?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarHeatmap({ className }: CalendarHeatmapProps) {
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['/api/sales/daily'],
    refetchInterval: 30000,
  });

  const heatmapData = useMemo(() => {
    if (!salesData) return [];

    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);

    // Create a map of date to sales data
    const dataMap = new Map();
    salesData.forEach((item: any) => {
      dataMap.set(item.date, {
        sales: parseFloat(item.nettTotal || '0'),
        transactions: item.transactionCount || 0,
      });
    });

    // Get max sales for intensity calculation
    const maxSales = Math.max(...Array.from(dataMap.values()).map((d: any) => d.sales));

    // Generate all days for the past 12 months
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const data = dataMap.get(dateStr) || { sales: 0, transactions: 0 };
      
      days.push({
        date: dateStr,
        sales: data.sales,
        transactions: data.transactions,
        intensity: maxSales > 0 ? Math.min(4, Math.floor((data.sales / maxSales) * 4)) : 0,
        dayOfWeek: currentDate.getDay(),
        day: currentDate.getDate(),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [salesData]);

  const totalSales = useMemo(() => {
    return heatmapData.reduce((sum, day) => sum + day.sales, 0);
  }, [heatmapData]);

  const totalTransactions = useMemo(() => {
    return heatmapData.reduce((sum, day) => sum + day.transactions, 0);
  }, [heatmapData]);

  const activeDays = useMemo(() => {
    return heatmapData.filter(day => day.sales > 0).length;
  }, [heatmapData]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Group days by week
  const weeks = [];
  let currentWeek: any[] = [];
  
  heatmapData.forEach((day, index) => {
    if (index === 0) {
      // Fill empty days at the beginning of the first week
      for (let i = 0; i < day.dayOfWeek; i++) {
        currentWeek.push(null);
      }
    }
    
    currentWeek.push(day);
    
    if (day.dayOfWeek === 6 || index === heatmapData.length - 1) {
      // Fill empty days at the end if needed
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-muted/30';
      case 1: return 'bg-green-200';
      case 2: return 'bg-green-400';
      case 3: return 'bg-green-600';
      case 4: return 'bg-green-800';
      default: return 'bg-muted/30';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Sales Activity - Last 12 Months</CardTitle>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{activeDays} active days</span>
            <span>${totalSales.toLocaleString()} total</span>
            <span>{totalTransactions.toLocaleString()} transactions</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="inline-flex flex-col gap-1 min-w-fit">
              {/* Month Labels */}
              <div className="flex ml-8 gap-1">
                {Array.from({ length: 12 }, (_, i) => {
                  const monthDate = new Date();
                  monthDate.setMonth(monthDate.getMonth() - 11 + i);
                  return (
                    <div 
                      key={i} 
                      className="text-xs text-muted-foreground w-12 text-center"
                    >
                      {MONTHS[monthDate.getMonth()]}
                    </div>
                  );
                })}
              </div>
              
              {/* Calendar Grid */}
              <div className="flex gap-1">
                {/* Day Labels */}
                <div className="flex flex-col gap-1 w-6">
                  {DAYS.map((day, i) => (
                    <div key={i} className="text-xs text-muted-foreground h-3 flex items-center">
                      {i % 2 === 1 ? day.slice(0, 3) : ''}
                    </div>
                  ))}
                </div>
                
                {/* Weeks */}
                <div className="flex gap-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`w-3 h-3 rounded-sm border border-border/50 ${
                            day ? getIntensityClass(day.intensity) : 'bg-transparent'
                          }`}
                          title={day ? `${day.date}: $${day.sales.toLocaleString()} (${day.transactions} transactions)` : ''}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm border border-border/50 ${getIntensityClass(level)}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                Rolling 12 months
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}