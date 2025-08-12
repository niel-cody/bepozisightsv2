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
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-medium mb-4 text-foreground">Hello! I'm Alex</h2>
            <p className="text-foreground/80 mb-8 leading-relaxed">Your virtual manager assistant. I help analyze POS data and provide business insights.</p>
            <div className="space-y-3">
              {quickQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full max-w-md font-normal justify-start"
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
      <div className="border-t border-border p-6">
        <form onSubmit={handleSubmit} className="flex space-x-4 max-w-4xl mx-auto">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Ask me anything about your business..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sendMessageMutation.isPending}
              className="border-border focus:border-ring focus:ring-1 rounded-lg px-4 py-3 text-base bg-input text-foreground placeholder:text-foreground/50"
              data-testid="input-chat-message"
            />
          </div>
          <Button 
            type="submit"
            disabled={!inputMessage.trim() || sendMessageMutation.isPending}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}