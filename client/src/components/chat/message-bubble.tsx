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
      "flex items-start space-x-3",
      isUser ? "justify-end" : ""
    )}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
          </svg>
        </div>
      )}

      <div className={cn("flex-1", isUser ? "flex justify-end" : "max-w-2xl")}>
        <div>
          <Card className={cn(
            "p-4 max-w-lg shadow-sm rounded-xl border-2 transition-colors",
            isUser 
              ? "bg-primary text-primary-foreground border-primary/30 shadow-primary/10" 
              : "bg-card border-border hover:border-border/60"
          )}>
            <p className={cn(
              "text-base leading-relaxed",
              isUser ? "text-primary-foreground" : "text-card-foreground"
            )}>
              {message}
            </p>

            {/* Display chart if available (for AI responses) */}
            {chart && (
              <div className="mt-4">
                {chart}
              </div>
            )}
          </Card>
          <p className="text-xs text-foreground/60 mt-2 font-light">
            {timestamp && !isNaN(timestamp.getTime()) ? formatDistanceToNow(timestamp, { addSuffix: true }) : ""}
          </p>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-muted-foreground">SM</span>
        </div>
      )}
    </div>
  );
}
