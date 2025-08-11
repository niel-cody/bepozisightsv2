import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface OperatorChartProps {
  data: Array<{
    name: string;
    sales: number;
  }>;
  compact?: boolean;
}

export default function OperatorChart({ data, compact = false }: OperatorChartProps) {
  return (
    <ResponsiveContainer width="100%" height={compact ? 200 : 300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `$${value}`} />
        <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
        <Bar dataKey="sales" fill="hsl(203.8863, 88.2845%, 53.1373%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
