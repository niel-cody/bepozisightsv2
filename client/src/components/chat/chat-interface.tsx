import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MessageBubble from "./message-bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
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
    "Till performance"
  ];

  return (
    <div className="flex h-full min-h-0">
      {/* Chat History Sidebar */}
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Chat History</h3>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => {/* TODO: Start new chat */}}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mb-2">Today</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            <div className="p-3 rounded-lg bg-accent/50 border border-accent cursor-pointer hover:bg-accent/70 transition-colors">
              <div className="text-sm font-medium text-foreground truncate">Current Chat</div>
              <div className="text-xs text-muted-foreground mt-1 truncate">Business insights discussion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Alex</h2>
                <p className="text-xs text-muted-foreground">AI Business Assistant • Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-md text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Start a conversation</h3>
                <p className="text-sm text-muted-foreground mb-6">Ask me anything about your business data and I'll help you find insights.</p>
                <div className="space-y-2">
                  {quickQueries.slice(0, 3).map((query, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full text-left justify-start text-xs h-auto py-2 px-3 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      onClick={() => setInputMessage(query)}
                      data-testid={`button-quick-query-${index}`}
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages - Only show when there are messages */}
          {messages.length > 0 && (
            <div className="p-4 space-y-6 pb-6">
              {messages.flatMap((message) => [
                // User message
                <MessageBubble
                  key={`${message.id}-user`}
                  message={message.message}
                  isUser={true}
                  timestamp={new Date(message.timestamp)}
                  chart={undefined}
                />,
                // AI response
                <MessageBubble
                  key={`${message.id}-ai`}
                  message={message.response}
                  isUser={false}
                  timestamp={new Date(message.timestamp)}
                  chart={message.chart}
                />
              ])}
              
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846-.813a4.5 4.5 0 00-3.09 3.09z"></path>
                    </svg>
                  </div>
                  <div className="bg-accent/30 border border-border rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">Alex is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background/95 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Message Alex..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={sendMessageMutation.isPending}
                className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl px-4 py-3 text-sm bg-input text-foreground placeholder:text-muted-foreground shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="input-chat-message"
              />
            </div>
            <Button 
              type="submit"
              disabled={!inputMessage.trim() || sendMessageMutation.isPending}
              size="sm"
              className="px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-send-message"
            >
              {sendMessageMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}