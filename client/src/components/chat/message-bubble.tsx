import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  chart?: any;
}

export default function MessageBubble({ message, isUser, timestamp, chart }: MessageBubbleProps) {
  return (
    <div className={cn(
      "flex items-start space-x-3 w-full max-w-4xl",
      isUser ? "justify-end ml-auto" : "justify-start mr-auto"
    )}>
      {/* Avatar - Only show for AI messages */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
          </svg>
        </div>
      )}

      <div className={cn("flex-1", isUser ? "flex justify-end" : "max-w-2xl")}>
        <div className="w-full">
          <div className={cn(
            "px-4 py-3 rounded-md shadow-sm transition-all max-w-2xl",
            isUser 
              ? "bg-primary text-primary-foreground ml-auto" 
              : "bg-accent/50 border border-border text-foreground"
          )}>
            <p className={cn(
              "text-sm leading-relaxed whitespace-pre-wrap",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}>
              {message}
            </p>
            
            {chart && (
              <div className="mt-3 p-3 bg-background/10 rounded-lg">
                <p className="text-xs text-foreground/70 mb-2">Chart Data:</p>
                <pre className="text-xs text-foreground/80 whitespace-pre-wrap">
                  {JSON.stringify(chart, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className={cn(
            "flex items-center mt-1 px-2 text-xs text-muted-foreground",
            isUser ? "justify-end" : "justify-start"
          )}>
            <span>
              {timestamp && !isNaN(timestamp.getTime()) 
                ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Now'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Avatar - Only show for user messages */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-xs font-semibold text-accent-foreground">You</span>
        </div>
      )}
    </div>
  );
}
