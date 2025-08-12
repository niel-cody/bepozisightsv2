import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import MessageBubble from "./message-bubble";
import { MessageSquare, Plus, Calendar, MoreHorizontal, Trash2 } from "lucide-react";
import { useConversations, useCreateConversation, useDeleteConversation, useConversationMessages } from "@/hooks/useConversations";
import type { Conversation, ChatMessage } from "@shared/schema";

const quickQueries = [
  "Show me today's sales summary",
  "Which products are performing best?",
  "How are my operators doing?",
  "What are the busiest hours?"
];

export default function ChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

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
        conversationId
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

  const handleNewChat = async () => {
    const newConv = await createConversation.mutateAsync({ title: "New Chat" });
    setCurrentConversationId(newConv.id);
  };

  const handleDeleteChat = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation.mutate(conversationId);
    
    // If we're deleting the current conversation, switch to another
    if (conversationId === currentConversationId) {
      const remaining = conversations.filter(c => c.id !== conversationId);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : undefined);
    }
  };

  const handleQuickQuery = (query: string) => {
    setInputMessage(query);
  };

  return (
    <div className="flex h-full bg-background" data-testid="chat-interface">
      {/* Chat History Sidebar */}
      <div className="w-80 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col" data-testid="chat-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="font-semibold text-card-foreground">Chat History</span>
            </div>
            <Button 
              onClick={handleNewChat}
              size="sm" 
              variant="outline"
              className="gap-2"
              data-testid="button-new-chat"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1" data-testid="conversations-list">
          {loadingConversations ? (
            <div className="text-muted-foreground text-sm p-4">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="text-muted-foreground text-sm p-4">No conversations yet</div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setCurrentConversationId(conversation.id)}
                className={`flex items-start justify-between p-3 rounded-lg cursor-pointer transition-all group ${
                  currentConversationId === conversation.id
                    ? "bg-primary/20 border border-primary/30 shadow-sm"
                    : "hover:bg-accent/50 border border-transparent"
                }`}
                data-testid={`conversation-${conversation.id}`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-card-foreground truncate leading-tight">
                    {conversation.title}
                  </h4>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={(e) => handleDeleteChat(conversation.id, e)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-destructive/20"
                    data-testid={`button-delete-${conversation.id}`}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Alex - Virtual Manager</h2>
              <p className="text-sm text-muted-foreground">Your AI assistant for POS analytics and insights</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="messages-container">
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            /* Welcome State */
            <div className="flex flex-col items-center justify-center h-full space-y-6 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-card-foreground">Welcome to Alex</h3>
                <p className="text-muted-foreground leading-relaxed">
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
                      className="justify-start text-left h-auto p-3 whitespace-normal"
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
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about your business data..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
              data-testid="input-message"
            />
            <Button 
              type="submit" 
              disabled={sendMessageMutation.isPending || !inputMessage.trim()}
              data-testid="button-send"
            >
              {sendMessageMutation.isPending ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}