import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import MessageBubble from "./message-bubble";
import { MessageSquare, Plus, Calendar, MoreHorizontal, Trash2 } from "lucide-react";

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

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
}

export default function ChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState("current");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Chat sessions state - manage dynamically
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "current",
      title: "New Chat",
      timestamp: "Now",
      preview: "Start a conversation with Alex..."
    }
  ]);

  // Store messages per session in React Query cache
  const { data: allMessages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/chat/messages"],
  });

  // Filter messages for current session (for now, show all messages for "current" session, empty for new sessions)
  const messages = currentChatId === "current" ? allMessages : [];

  const sendMessageMutation = useMutation<Message, Error, { message: string }>({
    mutationFn: async ({ message }): Promise<Message> => {
      const response = await apiRequest("POST", "/api/chat/send", { message });
      const result = await response.json();
      return result;
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (newMessage) => {
      // Only refresh messages if we're in the current session where new messages are being sent
      if (currentChatId === "current") {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      }
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

  const handleNewChat = () => {
    // Generate a new chat session ID
    const newChatId = "chat-" + Date.now();
    
    // Create a title from the first message if there are messages, otherwise keep as "New Chat"
    let currentTitle = "New Chat";
    if (messages.length > 0) {
      // Update current session with a meaningful title from first message
      const firstMessage = messages[0]?.message || "";
      currentTitle = firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage || "Previous Chat";
      
      // Move current chat to history by updating it with the generated title
      setChatSessions(prev => 
        prev.map(session => 
          session.id === currentChatId 
            ? { ...session, title: currentTitle, timestamp: "Just now", preview: firstMessage }
            : session
        )
      );
    }
    
    // Add new chat session
    setChatSessions(prev => [
      ...prev,
      {
        id: newChatId,
        title: "New Chat",
        timestamp: "Now",
        preview: "Start a conversation with Alex..."
      }
    ]);
    
    // Switch to the new chat
    setCurrentChatId(newChatId);
    
    // Clear messages for the new chat (this will show the welcome screen)
    queryClient.setQueryData(["/api/chat/messages"], []);
  };

  return (
    <div className="h-full w-full flex bg-background">
      {/* Chat History Sidebar */}
      <div className="w-64 h-full border-r border-border/30 bg-muted/20 flex flex-col">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            <div className="px-3 py-4 border-b border-border/30">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Calendar className="w-3 h-3" />
                Chat History
              </div>
            </div>
            
            {chatSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setCurrentChatId(session.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors group cursor-pointer ${
                  currentChatId === session.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {session.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {session.preview}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {session.timestamp}
                    </span>
                  </div>
                  <div 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-border/30 bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Alex</h2>
                <p className="text-sm text-muted-foreground">AI Business Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleNewChat}>
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>
          </div>
        </div>

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
        <div className="border-t border-border/20 bg-background p-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask anything..."
                  className="pr-12 py-3 text-base bg-card border-border hover:border-ring focus:border-ring focus:ring-ring/20 text-foreground placeholder:text-muted-foreground"
                  disabled={sendMessageMutation.isPending}
                />
                {sendMessageMutation.isPending && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse delay-100"></div>
                    <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse delay-200"></div>
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                className="px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {sendMessageMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}