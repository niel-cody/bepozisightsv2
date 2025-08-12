import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  type: "user" | "ai";
  message: string;
  timestamp: Date;
  data?: any;
}

export default function MessageBubble({ type, message, timestamp, data }: MessageBubbleProps) {
  const isUser = type === "user";

  return (
    <div className={cn(
      "flex items-start space-x-3",
      isUser ? "justify-end" : ""
    )}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
          </svg>
        </div>
      )}

      <div className={cn("flex-1", isUser ? "flex justify-end" : "max-w-2xl")}>
        <div>
          <Card className={cn(
            "p-6 max-w-lg border-0 shadow-none rounded-2xl",
            isUser 
              ? "bg-gray-900 text-white" 
              : "bg-gray-50"
          )}>
            <p className={cn(
              "text-base leading-relaxed",
              isUser ? "text-white" : "text-gray-900"
            )}>
              {message}
            </p>

            {/* Display data if available (for AI responses) */}
            {data && data.metrics && (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {data.metrics.slice(0, 4).map((metric: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{metric.label}</p>
                      <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                      {metric.change && (
                        <p className="text-xs text-green-600">{metric.change}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          <p className="text-xs text-gray-400 mt-2 font-light">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">SM</span>
        </div>
      )}
    </div>
  );
}
