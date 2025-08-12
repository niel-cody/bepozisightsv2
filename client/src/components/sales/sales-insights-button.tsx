import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSalesInsights, SalesInsightsResponse } from "@/hooks/useSalesInsights";

interface SalesInsightsButtonProps {
  selectedPeriod: 'today' | 'week' | 'month' | 'quarter' | 'ytd' | 'year';
  onInsightsReceived: (insights: SalesInsightsResponse) => void;
}

interface KpiData {
  current: {
    grossSales: number;
    nettTotal: number;
    transactionCount: number;
    totalDiscount: number;
    avgTransactionValue: number;
    profitMargin: number;
  };
}

interface VenueData {
  venueComparison: Array<{
    venue: string;
    totalSales: number;
    grossSales: number;
    totalTransactions: number;
    totalDiscounts: number;
    avgDailySales: number;
    avgTransactionValue: number;
  }>;
}

interface TrendsData {
  date: string;
  sales: number;
  transactions: number;
}

export function SalesInsightsButton({ selectedPeriod, onInsightsReceived }: SalesInsightsButtonProps) {
  const salesInsightsMutation = useSalesInsights();

  // Fetch current sales data
  const { data: kpiData } = useQuery<KpiData>({
    queryKey: ['/api/sales/period', selectedPeriod],
    refetchInterval: 30000,
  });

  const { data: venueData } = useQuery<VenueData>({
    queryKey: ['/api/sales/venues', selectedPeriod, 'nettTotal'],
    refetchInterval: 30000,
  });

  const { data: trendsData } = useQuery<TrendsData[]>({
    queryKey: ['/api/trends'],
    refetchInterval: 30000,
  });

  const handleGetInsights = async () => {
    if (!kpiData?.current || !venueData?.venueComparison || !trendsData) {
      return;
    }

    try {
      const insightsRequest = {
        period: selectedPeriod,
        kpiData: {
          grossSales: kpiData.current.grossSales || 0,
          netSales: kpiData.current.nettTotal || 0,
          transactions: kpiData.current.transactionCount || 0,
          discounts: kpiData.current.totalDiscount || 0,
          avgTransactionValue: kpiData.current.avgTransactionValue || 0,
          profitMargin: kpiData.current.profitMargin || 0,
        },
        venueData: venueData.venueComparison,
        trendsData: trendsData,
      };

      const insights = await salesInsightsMutation.mutateAsync(insightsRequest);
      onInsightsReceived(insights);
    } catch (error) {
      console.error('Failed to get insights:', error);
    }
  };

  const isLoading = salesInsightsMutation.isPending;
  const hasData = kpiData?.current && venueData?.venueComparison && trendsData;

  return (
    <Button 
      onClick={handleGetInsights}
      size="lg"
      className="bg-primary hover:bg-primary/90"
      disabled={isLoading || !hasData}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <MessageSquare className="w-4 h-4 mr-2" />
      )}
      {isLoading ? 'Analyzing Data...' : 'Ask AI for Detailed Insights'}
    </Button>
  );
}