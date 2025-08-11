import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon,
  className,
  "data-testid": testId
}: MetricCardProps) {
  const changeColor = {
    positive: "text-green-600",
    negative: "text-red-600", 
    neutral: "text-gray-600"
  }[changeType];

  return (
    <Card className={cn("border border-gray-200", className)} data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          {icon && (
            <div className={cn(
              "text-gray-500",
              changeType === "positive" && "text-green-500",
              changeType === "negative" && "text-red-500"
            )}>
              {icon}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900" data-testid={`${testId}-value`}>
          {value}
        </p>
        {change && (
          <p className={cn("text-sm", changeColor)} data-testid={`${testId}-change`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}