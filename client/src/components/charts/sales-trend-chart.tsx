import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface SalesTrendChartProps {
  data: Array<{
    date: string;
    sales: number;
    transactions?: number;
  }>;
  compact?: boolean;
}

export default function SalesTrendChart({ data, compact = false }: SalesTrendChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const chartData = data.map(item => ({
    ...item,
    displayDate: formatDate(item.date)
  }));

  if (compact) {
    return (
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="displayDate" hide />
          <YAxis hide />
          <Tooltip formatter={(value) => [`$${(value as number / 1000).toFixed(1)}k`, "Sales"]} />
          <Area 
            type="monotone" 
            dataKey="sales" 
            stroke="var(--chart-1)" 
            fill="url(#salesGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="displayDate" />
        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
        <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
        <Line 
          type="monotone" 
          dataKey="sales" 
          stroke="var(--chart-1)" 
          strokeWidth={2}
          dot={{ fill: "var(--chart-1)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}