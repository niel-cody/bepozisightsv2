import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronUp,
  ChevronDown
} from "lucide-react";

interface OperatorPerformance {
  name: string;
  currentSales: number;
  previousSales: number;
  changePercent: number;
  changeDirection: 'up' | 'down' | 'flat';
  transactions: number;
  avgTransactionValue: number;
  totalHours: number;
  salesPerHour: number;
  rank: number;
  performance: 'strong' | 'improving' | 'declining' | 'stable';
}

export function OperatorsTradingView() {
  const [sortBy, setSortBy] = useState<'performance' | 'sales' | 'change'>('performance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: operators, isLoading } = useQuery<OperatorPerformance[]>({
    queryKey: ['/api/operators/trading-view'],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading operator performance data...</p>
        </div>
      </div>
    );
  }

  if (!operators || operators.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Operator Data</h3>
          <p className="text-muted-foreground">No operator performance data available</p>
        </div>
      </div>
    );
  }

  const sortedOperators = [...operators].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'sales':
        aValue = a.currentSales;
        bValue = b.currentSales;
        break;
      case 'change':
        aValue = a.changePercent;
        bValue = b.changePercent;
        break;
      case 'performance':
      default:
        aValue = a.rank;
        bValue = b.rank;
        break;
    }
    
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const getPerformanceBadge = (performance: string, changePercent: number) => {
    if (performance === 'strong') {
      return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Strong</Badge>;
    } else if (performance === 'improving') {
      return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">Improving</Badge>;
    } else if (performance === 'declining') {
      return <Badge className="bg-red-500/20 text-red-700 border-red-500/30">Declining</Badge>;
    }
    return <Badge className="bg-gray-500/20 text-gray-700 border-gray-500/30">Stable</Badge>;
  };

  const getChangeIndicator = (changePercent: number, direction: string) => {
    if (direction === 'up') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ArrowUpRight className="w-4 h-4" />
          <span className="font-medium">+{Math.abs(changePercent).toFixed(1)}%</span>
        </div>
      );
    } else if (direction === 'down') {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <ArrowDownRight className="w-4 h-4" />
          <span className="font-medium">-{Math.abs(changePercent).toFixed(1)}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Minus className="w-4 h-4" />
        <span className="font-medium">0.0%</span>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Operator Trading View</h1>
            <p className="text-muted-foreground">
              Track employee performance like stocks - see who's rising and falling
            </p>
          </div>
          
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={sortBy === 'performance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('performance')}
            >
              Performance
            </Button>
            <Button
              variant={sortBy === 'sales' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('sales')}
            >
              Sales
            </Button>
            <Button
              variant={sortBy === 'change' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('change')}
            >
              % Change
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Performer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sortedOperators[0]?.name}</div>
              <p className="text-sm text-muted-foreground">
                ${sortedOperators[0]?.currentSales.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Biggest Gainer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...operators].sort((a, b) => b.changePercent - a.changePercent)[0]?.name}
              </div>
              <div className="text-sm text-green-600 font-medium">
                +{[...operators].sort((a, b) => b.changePercent - a.changePercent)[0]?.changePercent.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Needs Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {operators.filter(op => op.performance === 'declining').length}
              </div>
              <p className="text-sm text-muted-foreground">operators declining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${operators.reduce((sum, op) => sum + op.currentSales, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">combined sales</p>
            </CardContent>
          </Card>
        </div>

        {/* Trading View Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Operator Performance Board
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 pb-3 border-b text-sm font-medium text-muted-foreground">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Operator</div>
                <div className="col-span-2">Current Sales</div>
                <div className="col-span-2">Change</div>
                <div className="col-span-2">Transactions</div>
                <div className="col-span-2">Avg/Transaction</div>
              </div>

              {/* Operator Rows */}
              {sortedOperators.map((operator, index) => (
                <div 
                  key={operator.name}
                  className="grid grid-cols-12 gap-4 py-4 border-b border-border/50 hover:bg-muted/50 transition-colors rounded-lg px-2"
                >
                  <div className="col-span-1 flex items-center">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-semibold">
                      #{operator.rank}
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {operator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{operator.name}</div>
                      <div className="flex items-center gap-2">
                        {getPerformanceBadge(operator.performance, operator.changePercent)}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <div>
                      <div className="font-semibold">${operator.currentSales.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        was ${operator.previousSales.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center">
                    {getChangeIndicator(operator.changePercent, operator.changeDirection)}
                  </div>

                  <div className="col-span-2 flex items-center">
                    <div>
                      <div className="font-medium">{operator.transactions}</div>
                      <div className="text-sm text-muted-foreground">transactions</div>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <div>
                      <div className="font-medium">${operator.avgTransactionValue.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">average</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}