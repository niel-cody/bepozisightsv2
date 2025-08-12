import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  message: string;
  response?: string;
  timestamp: string;
  chart?: any;
}

export default function MessageBubble({ message, response, timestamp, chart }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Now';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Now';
    }
  };

  return (
    <div className="space-y-6">
      {/* User Message */}
      <div className="flex items-start gap-4 justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 max-w-md">
          <p className="text-sm">{message}</p>
        </div>
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-primary-foreground">You</span>
        </div>
      </div>

      {/* AI Response */}
      {response && (
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
            </svg>
          </div>
          <div className="bg-muted/50 rounded-2xl px-4 py-3 max-w-2xl border border-border/50">
            <p className="text-sm text-foreground whitespace-pre-wrap">{response}</p>
            
            {chart && (
              <div className="mt-3 p-3 bg-background/50 rounded-lg border border-border/30">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Chart Data</p>
                <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono">
                  {JSON.stringify(chart, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">{formatTime(timestamp)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
