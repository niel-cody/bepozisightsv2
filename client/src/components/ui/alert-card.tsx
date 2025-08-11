import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface AlertCardProps {
  type: "warning" | "success" | "info" | "error";
  title: string;
  description: string;
  className?: string;
  "data-testid"?: string;
}

export default function AlertCard({ 
  type, 
  title, 
  description, 
  className,
  "data-testid": testId
}: AlertCardProps) {
  const config = {
    warning: {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      descColor: "text-yellow-700",
      Icon: AlertTriangle
    },
    success: {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      titleColor: "text-green-800",
      descColor: "text-green-700",
      Icon: CheckCircle
    },
    info: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      titleColor: "text-blue-800",
      descColor: "text-blue-700",
      Icon: Info
    },
    error: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
      titleColor: "text-red-800",
      descColor: "text-red-700",
      Icon: AlertTriangle
    }
  }[type];

  const { Icon } = config;

  return (
    <Card 
      className={cn(
        config.bgColor,
        config.borderColor,
        "border",
        className
      )} 
      data-testid={testId}
    >
      <CardContent className="p-3">
        <div className="flex items-start space-x-2">
          <Icon className={cn("w-4 h-4 mt-0.5", config.iconColor)} />
          <div>
            <p className={cn("text-sm font-medium", config.titleColor)}>
              {title}
            </p>
            <p className={cn("text-xs", config.descColor)}>
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}