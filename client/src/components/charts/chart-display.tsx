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
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function ChartDisplay({ chartData }: ChartDisplayProps) {
  const { chartType, title, description, data, config } = chartData;

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
            <XAxis 
              dataKey={config.xAxisKey} 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
            />
            <Area
              type="monotone"
              dataKey={config.yAxisKey}
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
            <XAxis 
              dataKey={config.xAxisKey} 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
            />
            <Bar 
              dataKey={config.yAxisKey} 
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
            <XAxis 
              dataKey={config.xAxisKey} 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
            />
            <Line
              type="monotone"
              dataKey={config.yAxisKey}
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--chart-1))', strokeWidth: 2 }}
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
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey={config.yAxisKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
            />
          </PieChart>
        );

      default:
        return <div className="text-muted-foreground">Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Data points: {data.length} | Chart type: {chartType}
        </div>
      </CardContent>
    </Card>
  );
}