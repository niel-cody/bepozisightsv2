// Utility functions for POS data formatting and calculations

export function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface DashboardStats {
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
  topProduct: string;
  topOperator: string;
}

export function aggregateStats(data: any[]): DashboardStats {
  if (!data.length) {
    return {
      totalSales: 0,
      transactionCount: 0,
      averageTransaction: 0,
      topProduct: "N/A",
      topOperator: "N/A"
    };
  }

  // This would contain actual aggregation logic based on your data structure
  const totalSales = data.reduce((sum, item) => sum + (parseFloat(item.totalSales) || 0), 0);
  const transactionCount = data.reduce((sum, item) => sum + (item.transactionCount || 0), 0);
  
  return {
    totalSales,
    transactionCount,
    averageTransaction: transactionCount > 0 ? totalSales / transactionCount : 0,
    topProduct: data[0]?.topProduct || "N/A",
    topOperator: data[0]?.topOperator || "N/A"
  };
}
