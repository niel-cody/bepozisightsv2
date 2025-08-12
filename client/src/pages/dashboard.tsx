import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  MessageSquare, 
  BarChart3, 
  Users, 
  Package, 
  CreditCard, 
  Settings,
  Plus,
  Search,
  Menu,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  LogOut,
  Calendar,
  Trash2
} from "lucide-react";
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatInterface from "@/components/chat/chat-interface";
import CSVUpload from "@/components/import/csv-upload";
import { useConversations, useCreateConversation, useDeleteConversation } from "@/hooks/useConversations";
import { SalesOverview } from "@/components/sales/sales-overview";
import { CalendarHeatmap } from "@/components/sales/calendar-heatmap";
import { VenueBreakdown } from "@/components/sales/venue-breakdown";
import { SalesInsightsButton } from "@/components/sales/sales-insights-button";
import { SalesInsightsDisplay } from "@/components/sales/sales-insights-display";

// Create a separate sales page component to manage shared state
function SalesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'ytd' | 'year'>('ytd');
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightsData, setInsightsData] = useState<any>(null);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* AI Insights Button at Top */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive sales performance and venue analysis
            </p>
          </div>
          <SalesInsightsButton 
            selectedPeriod={selectedPeriod}
            onInsightsReceived={(insights) => {
              setInsightsData(insights);
              setInsightsOpen(true);
            }}
          />
        </div>

        {/* AI Insights Modal */}
        <SalesInsightsDisplay 
          insights={insightsData} 
          open={insightsOpen && !!insightsData}
          onClose={() => setInsightsOpen(false)}
        />

        <SalesOverview 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={setSelectedPeriod}
        />
        <CalendarHeatmap />
        <VenueBreakdown selectedPeriod={selectedPeriod} />
      </div>
    </div>
  );
}

type ViewType = "chat" | "sales" | "operators" | "products" | "accounts" | "settings";

const mainNavigationItems = [
  { 
    title: "Chat", 
    icon: MessageSquare, 
    view: "chat" as ViewType,
    description: "AI Assistant" 
  },
];

const insightsItems = [
  { 
    title: "Sales Trends", 
    icon: BarChart3, 
    view: "sales" as ViewType,
    description: "Sales Reports" 
  },
  { 
    title: "Operators", 
    icon: Users, 
    view: "operators" as ViewType,
    description: "Staff Performance" 
  },
  { 
    title: "Products", 
    icon: Package, 
    view: "products" as ViewType,
    description: "Product Analytics" 
  },
  { 
    title: "Accounts", 
    icon: CreditCard, 
    view: "accounts" as ViewType,
    description: "Customer Accounts" 
  },
];

const settingsItem = { 
  title: "Settings", 
  icon: Settings, 
  view: "settings" as ViewType,
  description: "Configuration" 
};

const allNavigationItems = [...mainNavigationItems, ...insightsItems, settingsItem];

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<ViewType>("chat");
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [chatOpen, setChatOpen] = useState(true);
  const { user, logout } = useAuth();

  // Listen for custom events from sales page
  React.useEffect(() => {
    const handleSwitchToChat = () => {
      setCurrentView("chat");
    };
    
    window.addEventListener('switchToChat', handleSwitchToChat);
    return () => window.removeEventListener('switchToChat', handleSwitchToChat);
  }, []);

  // Chat-related hooks
  const { data: conversations = [], isLoading: loadingConversations } = useConversations();
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies for session
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      return response.json();
    },
    onSuccess: () => {
      logout();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleNewChat = async () => {
    try {
      const newConv = await createConversation.mutateAsync({ title: "New Chat" });
      setCurrentConversationId(newConv.id);
      setCurrentView("chat");
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const handleDeleteChat = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation.mutateAsync(conversationId);
      if (currentConversationId === conversationId) {
        setCurrentConversationId(undefined);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const [insightsOpen, setInsightsOpen] = useState(true);

  return (
    <div className="h-screen w-screen bg-background overflow-hidden">
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full">
          {/* Left Sidebar */}
          <Sidebar className="w-64 h-screen border-r border-border/30 bg-sidebar-background flex-shrink-0 flex flex-col">
            <SidebarHeader className="p-4 border-b border-sidebar-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-sidebar-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-semibold text-sm text-sidebar-foreground">Bepoz Insights</h1>
                  <p className="text-xs text-sidebar-muted-foreground">Demo Org AGE 2025</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-2 flex-1 overflow-y-auto">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {/* Chat Navigation with Conversations */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setChatOpen(!chatOpen)}
                        className="w-full justify-start px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        <div className="text-sm font-normal">Chat history</div>
                        {chatOpen ? (
                          <ChevronDown className="w-4 h-4 text-sidebar-muted-foreground ml-auto" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-sidebar-muted-foreground ml-auto" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    {/* Chat Conversations Submenu */}
                    {chatOpen && (
                      <div className="ml-4 space-y-0.5 max-h-60 overflow-y-auto">
                        {/* Existing Conversations */}
                        {loadingConversations ? (
                          <div className="text-xs text-sidebar-muted-foreground px-3 py-2">Loading...</div>
                        ) : conversations.length === 0 ? (
                          <div className="text-xs text-sidebar-muted-foreground px-3 py-2">No conversations</div>
                        ) : (
                          conversations.map((conversation) => (
                            <SidebarMenuItem key={conversation.id}>
                              <SidebarMenuButton
                                isActive={currentView === "chat" && currentConversationId === conversation.id}
                                onClick={() => {
                                  setCurrentView("chat");
                                  setCurrentConversationId(conversation.id);
                                }}
                                className="w-full justify-start px-3 py-1.5 rounded-lg hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent text-sidebar-foreground group"
                              >
                                <div className="flex-1 min-w-0 pr-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-sidebar-muted-foreground flex-shrink-0" />
                                    <span className="text-sm text-sidebar-foreground">
                                      {new Date(conversation.updatedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  onClick={(e) => handleDeleteChat(conversation.id, e)}
                                  className="h-4 w-4 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 flex-shrink-0 rounded cursor-pointer flex items-center justify-center"
                                >
                                  <Trash2 className="w-2 h-2 text-destructive" />
                                </div>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))
                        )}
                      </div>
                    )}
                    
                    {/* Insights Menu */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setInsightsOpen(!insightsOpen)}
                        className="w-full justify-start px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
                      >
                        <div className="text-sm font-normal">Insights</div>
                        {insightsOpen ? (
                          <ChevronDown className="w-4 h-4 text-sidebar-muted-foreground ml-auto" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-sidebar-muted-foreground ml-auto" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    {/* Insights Submenu */}
                    {insightsOpen && (
                      <div className="ml-6 space-y-0.5">
                        {insightsItems.map((item) => (
                          <SidebarMenuItem key={item.view}>
                            <SidebarMenuButton
                              isActive={currentView === item.view}
                              onClick={() => setCurrentView(item.view)}
                              className="w-full justify-start px-3 py-1.5 rounded-lg hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent text-sidebar-foreground"
                            >
                              <div className="text-sm font-normal">{item.title}</div>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </div>
                    )}
                    
                    {/* Settings */}
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={currentView === settingsItem.view}
                        onClick={() => setCurrentView(settingsItem.view)}
                        className="w-full justify-start px-3 py-2 rounded-lg hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent text-sidebar-foreground"
                      >
                        <div className="text-sm font-normal">{settingsItem.title}</div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-sidebar-border flex-shrink-0">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-sidebar-accent-foreground">
                      {user?.username?.slice(0, 2).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-sidebar-foreground truncate">
                      {user?.username || 'User'}
                    </div>
                    <div className="text-xs text-sidebar-muted-foreground">
                      Authenticated
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-muted-foreground hover:text-destructive h-8"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-3 h-3 mr-2" />
                  {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <SidebarInset className="flex-1 h-screen min-w-0 flex flex-col">
            {/* Header */}
            <header className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b border-border/30 px-3 sm:px-4 bg-background/95 backdrop-blur flex-shrink-0">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex-1 min-w-0">
                <div>
                  {currentView === "chat" ? (
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">AI Assisted Chat</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">Always available and always ready...</p>
                    </div>
                  ) : (
                    <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
                      {allNavigationItems.find(item => item.view === currentView)?.title}
                    </h2>
                  )}
                </div>
              </div>

              {/* New AI Chat Button */}
              <Button 
                onClick={handleNewChat}
                size="sm" 
                variant="outline"
                className="gap-2 hidden sm:flex"
                data-testid="button-new-ai-chat"
              >
                <Plus className="w-4 h-4" />
                New AI Chat
              </Button>

              {/* Mobile New Chat Button */}
              <Button 
                onClick={handleNewChat}
                size="sm" 
                variant="outline"
                className="sm:hidden p-2"
                data-testid="button-new-ai-chat-mobile"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden min-h-0">
                {currentView === "chat" && (
                  <div className="h-full">
                    <ChatInterface currentConversationId={currentConversationId} />
                  </div>
                )}

                {currentView === "sales" && (
                  <SalesPage />
                )}

                {currentView === "operators" && (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">Operator Reports</h3>
                      <p className="text-muted-foreground mb-4">Monitor staff performance and productivity</p>
                      <Button onClick={() => setCurrentView("chat")}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask AI for Staff Insights
                      </Button>
                    </div>
                  </div>
                )}

                {currentView === "products" && (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">Product Reports</h3>
                      <p className="text-muted-foreground mb-4">Analyze product performance and inventory</p>
                      <Button onClick={() => setCurrentView("chat")}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask AI for Product Insights
                      </Button>
                    </div>
                  </div>
                )}

                {currentView === "accounts" && (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">Account Reports</h3>
                      <p className="text-muted-foreground mb-4">Customer accounts and transaction history</p>
                      <Button onClick={() => setCurrentView("chat")}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask AI for Account Insights
                      </Button>
                    </div>
                  </div>
                )}

                {currentView === "settings" && (
                  <div className="h-full overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto">
                      <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-2">Settings</h2>
                        <p className="text-muted-foreground">Configure your POS intelligence system</p>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-card border rounded-lg p-6">
                          <h3 className="text-lg font-semibold mb-4">Data Import</h3>
                          <p className="text-muted-foreground mb-4">Upload CSV files to import your POS data</p>
                          <CSVUpload />
                        </div>

                        <div className="bg-card border rounded-lg p-6">
                          <h3 className="text-lg font-semibold mb-4">AI Configuration</h3>
                          <p className="text-muted-foreground mb-4">Configure AI assistant behavior and preferences</p>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Assistant Name</label>
                              <Input defaultValue="Alex" className="mt-1" readOnly />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Response Style</label>
                              <Input defaultValue="Professional" className="mt-1" readOnly />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}