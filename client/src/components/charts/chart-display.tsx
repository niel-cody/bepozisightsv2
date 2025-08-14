import React from 'react';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  chartType: 'area' | 'bar' | 'line' | 'pie';
  dataType: string;
  metric: string;
  title: string;
  description: string;
  data: Array<{
    name: string;
    value: number;
    [key: string]: any;
  }>;
  config: {
    xAxisKey: string;
    yAxisKey: string;
    colors: string[];
  };
}

interface ChartDisplayProps {
  chartData: ChartData;
}

const COLORS = [
  '#3B82F6',  // Blue-500 - Primary blue
  '#60A5FA',  // Blue-400 - Lighter blue  
  '#1D4ED8',  // Blue-700 - Deeper blue
  '#06B6D4',  // Cyan-500 - Cyan accent
  '#8B5CF6',  // Violet-500 - Purple accent
];

export function ChartDisplay({ chartData }: ChartDisplayProps) {
  if (!chartData) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No chart data available</p>
      </div>
    );
  }
  
  const { chartType, title, description, data, config } = chartData;
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No data available for visualization</p>
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="1 4" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey={config.xAxisKey} 
              stroke="#9CA3AF"
              fontSize={11}
              fontWeight={300}
              tickLine={false}
              axisLine={false}
              tickMargin={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={11}
              fontWeight={300}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={60}
              tickFormatter={(value) => `$${(value / 1000)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
                fontSize: '12px',
                fontWeight: '400',
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
            />
            <Area
              type="monotone"
              dataKey={config.yAxisKey}
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.12}
              strokeWidth={1.5}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="1 4" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey={config.xAxisKey} 
              stroke="#9CA3AF"
              fontSize={11}
              fontWeight={300}
              tickLine={false}
              axisLine={false}
              tickMargin={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={11}
              fontWeight={300}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={60}
              tickFormatter={(value) => `$${(value / 1000)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
                fontSize: '12px',
                fontWeight: '400',
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
            />
            <Bar 
              dataKey={config.yAxisKey} 
              fill="#3B82F6"
              radius={[2, 2, 0, 0]}
              stroke="#3B82F6"
              strokeWidth={0}
            />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="1 4" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey={config.xAxisKey} 
              stroke="#9CA3AF"
              fontSize={11}
              fontWeight={300}
              tickLine={false}
              axisLine={false}
              tickMargin={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={11}
              fontWeight={300}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={60}
              tickFormatter={(value) => `$${(value / 1000)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
                fontSize: '12px',
                fontWeight: '400',
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
            />
            <Line
              type="monotone"
              dataKey={config.yAxisKey}
              stroke="#3B82F6"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2, fill: "hsl(var(--background))" }}
            />
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={110}
              innerRadius={40}
              fill="#8884d8"
              dataKey={config.yAxisKey}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
                fontSize: '12px',
                fontWeight: '400',
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
            />
          </PieChart>
        );

      default:
        return <div className="text-muted-foreground">Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <div className="w-full">
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-muted-foreground/60 font-light">{data.length} data points</span>
        <span className="text-xs text-muted-foreground/60 font-light capitalize">{chartType} chart</span>
      </div>
    </div>
  );
}