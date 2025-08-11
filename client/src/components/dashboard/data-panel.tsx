import { useQuery } from "@tanstack/react-query";
import MetricCard from "../ui/metric-card";
import AlertCard from "../ui/alert-card";
import SalesTrendChart from "../charts/sales-trend-chart";
import { TrendingUp, Activity, DollarSign } from "lucide-react";

export default function DataPanel() {
  const { data: todaySummary } = useQuery({
    queryKey: ["/api/summary"],
  });

  // Safely access properties with fallbacks
  const totalSales = (todaySummary as any)?.totalSales || "0.00";
  const transactionCount = (todaySummary as any)?.transactionCount || 0;
  const averageTransaction = (todaySummary as any)?.averageTransaction || "0.00";

  const { data: trends } = useQuery({
    queryKey: ["/api/trends"],
  });

  const alerts = [
    {
      type: "warning" as const,
      title: "Till 3 Running Low",
      description: "Cash drawer needs refill",
      icon: "⚠️"
    },
    {
      type: "success" as const,
      title: "Sales Target Met",
      description: "102% of daily goal achieved",
      icon: "✅"
    },
    {
      type: "info" as const,
      title: "New Product Trending",
      description: "Matcha Latte sales up 45%",
      icon: "ℹ️"
    }
  ];

  return (
    <div className="w-80 bg-secondary-50 border-l border-gray-200 p-6 overflow-y-auto hidden lg:block">
      <div className="space-y-6">
        {/* Today's Overview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Overview</h3>
          <div className="space-y-3">
            <MetricCard
              title="Current Sales"
              value={`$${totalSales}`}
              change="+12.4% vs yesterday"
              changeType="positive"
              icon={<DollarSign className="w-4 h-4" />}
              data-testid="metric-current-sales"
            />

            <MetricCard
              title="Transactions"
              value={transactionCount.toString()}
              change="+8.1% vs yesterday"
              changeType="positive"
              icon={<Activity className="w-4 h-4" />}
              data-testid="metric-transactions"
            />

            <MetricCard
              title="Avg. Transaction"
              value={`$${averageTransaction}`}
              change="+3.8% vs yesterday"
              changeType="positive"
              icon={<TrendingUp className="w-4 h-4" />}
              data-testid="metric-avg-transaction"
            />
          </div>
        </div>

        {/* Quick Alerts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Insights</h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <AlertCard
                key={index}
                type={alert.type}
                title={alert.title}
                description={alert.description}
                data-testid={`alert-${index}`}
              />
            ))}
          </div>
        </div>

        {/* Mini Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (7 days)</h3>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <SalesTrendChart data={(trends as any) || []} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
