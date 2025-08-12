import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import MessageBubble from "./message-bubble";
import { MessageSquare, Plus, Calendar, MoreHorizontal, Trash2, Brain } from "lucide-react";
import { useConversations, useCreateConversation, useDeleteConversation, useConversationMessages } from "@/hooks/useConversations";
import type { Conversation, ChatMessage } from "@shared/schema";

const quickQueries = [
  "What were my top-selling items last week?",
  "How did my revenue this month compare to last month?",
  "Which customers spent the most in the past 30 days?",
  "Which staff members had the highest sales last week?"
];

type ModelType = "gpt-3.5-turbo" | "gpt-4o-mini" | "gpt-4o";

interface ChatInterfaceProps {
  currentConversationId?: string;
}

export default function ChatInterface({ currentConversationId: propConversationId }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(propConversationId);
  const [selectedModel, setSelectedModel] = useState<ModelType>("gpt-4o-mini");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Update local state when prop changes
  useEffect(() => {
    setCurrentConversationId(propConversationId);
  }, [propConversationId]);

  // Use conversation hooks
  const { data: conversations = [], isLoading: loadingConversations } = useConversations();
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const { data: messages = [], isLoading: loadingMessages } = useConversationMessages(currentConversationId);

  // Set default conversation if none selected
  useEffect(() => {
    if (!currentConversationId && conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  const sendMessageMutation = useMutation<ChatMessage, Error, { message: string }>({
    mutationFn: async ({ message }): Promise<ChatMessage> => {
      let conversationId = currentConversationId;
      
      // Create conversation if none exists
      if (!conversationId) {
        const newConv = await createConversation.mutateAsync({ title: "New Chat" });
        conversationId = newConv.id;
        setCurrentConversationId(conversationId);
      }

      const response = await apiRequest("POST", "/api/chat/send", { 
        message,
        conversationId,
        model: selectedModel
      });
      const result = await response.json();
      return result;
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      // Invalidate and refetch messages for current conversation
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/messages", currentConversationId] 
      });
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

  // These handlers are now managed by the parent Dashboard component

  const handleQuickQuery = (query: string) => {
    setInputMessage(query);
  };

  return (
    <div className="h-full flex flex-col bg-background" data-testid="chat-interface">
      {/* Chat Header */}
      <div className="p-3 sm:p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full">
          {/* Model Selection - Far Left */}
          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={(value: ModelType) => setSelectedModel(value)}>
              <SelectTrigger className="w-28 sm:w-32 gap-1 sm:gap-2 text-xs sm:text-sm" data-testid="select-model">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo" data-testid="model-standard">
                  <div className="flex flex-col">
                    <span>Standard</span>
                    <span className="text-xs text-muted-foreground">Fast on the fly answers</span>
                  </div>
                </SelectItem>
                <SelectItem value="gpt-4o-mini" data-testid="model-detailed">
                  <div className="flex flex-col">
                    <span>Detailed</span>
                    <span className="text-xs text-muted-foreground">Balanced analysis and insights</span>
                  </div>
                </SelectItem>
                <SelectItem value="gpt-4o" data-testid="model-scientific">
                  <div className="flex flex-col">
                    <span>Scientific</span>
                    <span className="text-xs text-muted-foreground">Deep reasoning and analysis</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4" data-testid="messages-container">
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            /* Welcome State */
            <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6 text-center max-w-sm sm:max-w-md mx-auto px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-semibold text-card-foreground">Welcome to Alex</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  I'm your virtual manager assistant. I can analyze your POS data, provide insights about sales trends, operator performance, and help you make data-driven decisions.
                </p>
              </div>

              <div className="w-full space-y-2">
                <p className="text-sm font-medium text-card-foreground mb-3">Try asking me:</p>
                <div className="grid gap-2">
                  {quickQueries.map((query, index) => (
                    <Button
                      key={index}
                      onClick={() => handleQuickQuery(query)}
                      variant="outline"
                      className="justify-start text-left h-auto p-3 sm:p-4 whitespace-normal text-sm min-h-[48px]"
                      data-testid={`quick-query-${index}`}
                    >
                      <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages */
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message.message}
                response={message.response || ""}
                timestamp={message.timestamp}
              />
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-accent rounded-lg px-4 py-2 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about your business data..."
            disabled={sendMessageMutation.isPending}
            className="flex-1 text-base sm:text-sm min-h-[44px] sm:min-h-auto"
            data-testid="input-message"
          />
          <Button 
            type="submit" 
            disabled={sendMessageMutation.isPending || !inputMessage.trim()}
            className="min-h-[44px] sm:min-h-auto px-4 sm:px-3"
            data-testid="button-send"
          >
            <span className="hidden sm:inline">
              {sendMessageMutation.isPending ? "Sending..." : "Send"}
            </span>
            <span className="sm:hidden">
              {sendMessageMutation.isPending ? "..." : "→"}
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}