import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MessageBubble from "./message-bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
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
      const response = await apiRequest("/api/chat/messages", {
        method: "POST",
        body: { content },
      });
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
    <div className="flex flex-col h-full">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-semibold mb-6 text-foreground">Hello! I'm Alex</h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">Your virtual manager assistant. I help analyze POS data and provide business insights.</p>
            <div className="space-y-4">
              {quickQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  className="w-full max-w-md font-medium justify-start text-left border-2 hover:bg-accent hover:text-accent-foreground transition-all"
                  onClick={() => setInputMessage(query)}
                  data-testid={`button-quick-query-${index}`}
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message.content}
              isUser={message.role === "user"}
              timestamp={new Date(message.created_at)}
              chart={message.chart}
            />
          ))}
          
          {isTyping && (
            <MessageBubble
              message="Thinking..."
              isUser={false}
              timestamp={new Date()}
            />
          )}
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background/95 backdrop-blur-sm p-6">
        <form onSubmit={handleSubmit} className="flex space-x-3 max-w-4xl mx-auto">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Ask me anything about your business..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sendMessageMutation.isPending}
              className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-5 py-4 text-base bg-input text-foreground placeholder:text-muted-foreground shadow-sm transition-all"
              data-testid="input-chat-message"
            />
          </div>
          <Button 
            type="submit"
            disabled={!inputMessage.trim() || sendMessageMutation.isPending}
            className="px-6 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all"
            data-testid="button-send-message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}