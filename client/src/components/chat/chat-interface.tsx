import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MessageBubble from "./message-bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  userId?: string | null;
  chart?: any;
}

export default function ChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/chat/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("/api/chat/message", "POST", { message: content });
      return response;
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setInputMessage("");
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessageMutation.mutate(inputMessage.trim());
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const quickQueries = [
    "What happened yesterday?",
    "Show me top products", 
    "Till performance summary"
  ];

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Chat History */}
      <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Chat History</h2>
            <Button variant="outline" size="sm" className="gap-2 h-8 px-3">
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">Today</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-accent/50 border border-border/50 cursor-pointer hover:bg-accent/70 transition-colors">
              <div className="text-sm font-medium text-foreground">Current Chat</div>
              <div className="text-xs text-muted-foreground mt-1">Business insights discussion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Alex</h2>
              <p className="text-sm text-muted-foreground">AI Business Assistant • Online</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Welcome State */
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-lg text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Welcome to Alex</h3>
                <p className="text-muted-foreground mb-8 text-lg">Your AI business assistant is ready to help you analyze your POS data and provide insights.</p>
                
                <div className="grid gap-3 max-w-sm mx-auto">
                  <p className="text-sm font-medium text-foreground mb-2">Try asking:</p>
                  {quickQueries.map((query, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4 text-muted-foreground hover:text-foreground"
                      onClick={() => setInputMessage(query)}
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="p-6 space-y-6">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message.message}
                  response={message.response}
                  timestamp={message.timestamp}
                  chart={message.chart}
                />
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                    </svg>
                  </div>
                  <div className="bg-muted/50 rounded-2xl p-4 max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Alex about your business data..."
                className="pr-12 h-12 text-base bg-background border-border focus:border-primary transition-colors"
                disabled={sendMessageMutation.isPending}
                data-testid="input-message"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0"
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                data-testid="button-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Alex can make mistakes. Check important information.
          </p>
        </div>
      </div>
    </div>
  );
}