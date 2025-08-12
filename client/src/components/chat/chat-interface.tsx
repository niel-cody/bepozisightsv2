import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import MessageBubble from "./message-bubble";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Plus, MessageSquare, Trash2 } from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  userId?: string;
}

interface ChatResponse {
  message: ChatMessage;
  data?: any;
}

export default function ChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
  });

  // Group messages by date for chat history
  const groupedMessages = messages.reduce((groups: { [key: string]: ChatMessage[] }, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  const chatSessions = Object.entries(groupedMessages).map(([date, msgs]) => ({
    id: date,
    title: msgs[0]?.message.slice(0, 30) + (msgs[0]?.message.length > 30 ? '...' : '') || 'New Chat',
    date,
    messageCount: msgs.length,
    lastMessage: msgs[msgs.length - 1]?.timestamp
  }));

  const startNewChat = () => {
    setCurrentSessionId(null);
    setInputMessage("");
  };

  const clearChatHistory = async () => {
    try {
      await apiRequest("DELETE", "/api/chat/messages");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      toast({
        title: "Chat history cleared",
        description: "All conversations have been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive",
      });
    }
  };

  const sendMessageMutation = useMutation<ChatResponse, Error, { message: string }>({
    mutationFn: async ({ message }) => {
      const response = await apiRequest("POST", "/api/chat/message", {
        message,
        userId: null
      });
      return await response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setInputMessage("");
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({ message: inputMessage.trim() });
  };

  const handleQuickQuery = (query: string) => {
    setInputMessage(query);
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
    <div className="flex-1 flex bg-white">
      {/* Chat Sidebar */}
      {showSidebar && (
        <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chat History</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                data-testid="button-hide-sidebar"
              >
                ×
              </Button>
            </div>
            <Button
              onClick={startNewChat}
              className="w-full"
              data-testid="button-new-chat"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatSessions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs">Start a new chat to get insights</p>
              </div>
            ) : (
              chatSessions.map((session) => (
                <Card
                  key={session.id}
                  className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                    currentSessionId === session.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setCurrentSessionId(session.id)}
                  data-testid={`chat-session-${session.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">
                        {session.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {session.messageCount} messages
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(session.lastMessage).toLocaleDateString()}
                      </p>
                    </div>
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                </Card>
              ))
            )}
          </div>
          
          {/* Sidebar Footer */}
          {messages.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={clearChatHistory}
                className="w-full text-red-600 hover:text-red-700"
                data-testid="button-clear-history"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All History
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!showSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(true)}
                  data-testid="button-show-sidebar"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Alex</h2>
                <p className="text-sm text-gray-500">Your virtual manager - Ask me anything about your data</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </div>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Welcome Message */}
        <MessageBubble
          type="ai"
          message="Hi! I'm Alex, your virtual manager. I've been keeping an eye on your operations and I'm here to help with any questions about your business performance. Try asking me 'What happened yesterday?' or 'Show me my top operators this week'."
          timestamp={new Date()}
        />

        {/* Chat History */}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-4">
            <MessageBubble
              type="user"
              message={msg.message}
              timestamp={new Date(msg.timestamp)}
            />
            <MessageBubble
              type="ai"
              message={msg.response}
              timestamp={new Date(msg.timestamp)}
            />
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <Card className="p-4 max-w-md bg-gray-50">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </Card>
            </div>
          </div>
        )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Ask me about your POS data..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sendMessageMutation.isPending}
              data-testid="input-chat-message"
            />
          </div>
          <Button 
            type="submit"
            disabled={!inputMessage.trim() || sendMessageMutation.isPending}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {quickQueries.map((query, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-sm"
              onClick={() => handleQuickQuery(query)}
              data-testid={`button-quick-query-${index}`}
            >
              {query}
            </Button>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
