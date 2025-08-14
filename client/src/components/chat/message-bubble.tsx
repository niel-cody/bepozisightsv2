import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ChartDisplay } from "@/components/charts/chart-display";

// Function to format response text with Markdown-like formatting and sentiment colors
function formatResponseText(text: string) {
  // Split text by double asterisks for bold formatting
  const parts = text.split(/(\*\*.*?\*\*)/);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the asterisks and determine sentiment
      const boldText = part.slice(2, -2);
      const sentiment = getSentimentColor(boldText);
      
      return (
        <span 
          key={index} 
          className={`font-semibold ${sentiment}`}
        >
          {boldText}
        </span>
      );
    }
    return part;
  });
}

// Function to determine color based on sentiment context
function getSentimentColor(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Positive indicators (green)
  const positivePatterns = [
    /increase/i, /growth/i, /rise/i, /improvement/i, /profit/i, /gain/i,
    /higher/i, /better/i, /more/i, /up/i, /boost/i, /surge/i,
    /\+\d+%/, /\d+% increase/, /\d+% growth/, /\d+% improvement/
  ];
  
  // Negative indicators (red)
  const negativePatterns = [
    /decrease/i, /decline/i, /drop/i, /fall/i, /loss/i, /lower/i,
    /worse/i, /less/i, /down/i, /reduction/i, /shrink/i,
    /\-\d+%/, /\d+% decrease/, /\d+% decline/, /\d+% drop/
  ];
  
  // Check for positive sentiment
  if (positivePatterns.some(pattern => pattern.test(text))) {
    return "text-green-600 dark:text-green-400";
  }
  
  // Check for negative sentiment
  if (negativePatterns.some(pattern => pattern.test(text))) {
    return "text-red-600 dark:text-red-400";
  }
  
  // Default to Bepoz accent color for neutral/unclear sentiment
  return "text-[#303F9F]";
}

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
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {formatResponseText(response)}
            </div>
            
            {chart && (
              <div className="mt-4">
                {chart.error ? (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400">{chart.error}</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className="border border-border rounded-lg bg-card p-4">
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-foreground">{chart.title}</h4>
                        {chart.description && (
                          <p className="text-xs text-muted-foreground mt-1">{chart.description}</p>
                        )}
                      </div>
                      <ChartDisplay chartData={chart} />
                    </div>
                  </div>
                )}
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