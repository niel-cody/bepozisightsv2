import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface SalesInsightsRequest {
  period: string;
  kpiData: {
    grossSales: number;
    netSales: number;
    transactions: number;
    discounts: number;
    avgTransactionValue: number;
    profitMargin: number;
  };
  venueData: Array<{
    venue: string;
    totalSales: number;
    grossSales: number;
    totalTransactions: number;
    totalDiscounts: number;
    avgDailySales: number;
    avgTransactionValue: number;
  }>;
  trendsData: Array<{
    date: string;
    sales: number;
    transactions: number;
  }>;
}

export interface SalesInsightsResponse {
  summary: string;
  trends: string[];
  suggestions: string[];
}

export function useSalesInsights() {
  return useMutation<SalesInsightsResponse, Error, SalesInsightsRequest>({
    mutationFn: async (data) => {
      const response = await fetch("/api/sales/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to get sales insights");
      }
      
      return response.json();
    },
  });
}