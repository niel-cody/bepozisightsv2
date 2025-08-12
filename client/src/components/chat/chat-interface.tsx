import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import MessageBubble from "./message-bubble";

const quickQueries = [
  "Show me today's sales summary",
  "Which products are performing best?",
  "How are my operators doing?",
  "What are the busiest hours?"
];

interface Message {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  chart?: any;
}

export default function ChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/chat/messages"],
  });

  const sendMessageMutation = useMutation<Message, Error, { message: string }>({
    mutationFn: async ({ message }): Promise<Message> => {
      const response = await apiRequest("/api/chat/send", "POST", { message });
      return response as Message;
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessageMutation.mutate({ message: inputMessage.trim() });
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-auto">
        {messages.length === 0 ? (
          /* Welcome State */
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-lg text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Ready when you are.</h3>
              <p className="text-muted-foreground mb-8 text-base">Ask me anything about your business data and I'll provide insights and analysis.</p>
              
              <div className="grid gap-2 max-w-md mx-auto">
                {quickQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="justify-start text-left h-auto py-2 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50"
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
            {messages.map((message: Message) => (
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
      <div className="border-t border-border bg-background p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask anything..."
                className="pr-12 py-3 text-base bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                disabled={sendMessageMutation.isPending}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
                <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
                <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={!inputMessage.trim() || sendMessageMutation.isPending}
              className="px-4 py-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}