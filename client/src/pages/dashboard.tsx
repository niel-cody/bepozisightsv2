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
  ChevronUp,
  LogOut,
  Calendar,
  Trash2,
  TrendingUp,
  Shield,
  User2
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChatInterface from "@/components/chat/chat-interface";
import { CSVUpload } from "@/components/csv-upload";
import { useConversations, useCreateConversation, useDeleteConversation } from "@/hooks/useConversations";
import { SalesOverview } from "@/components/sales/sales-overview";
import { CalendarHeatmap } from "@/components/sales/calendar-heatmap";
import { VenueBreakdown } from "@/components/sales/venue-breakdown";
import { SalesInsightsButton } from "@/components/sales/sales-insights-button";
import { SalesInsightsDisplay } from "@/components/sales/sales-insights-display";
import { OperatorsTradingView } from "@/components/operators/operators-trading-view";

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
    title: "Staff Performance", 
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

const adminItems = [
  { 
    title: "Settings", 
    icon: Settings, 
    view: "settings" as ViewType,
    description: "Configuration" 
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
  const [chatOpen, setChatOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-sidebar-foreground">Bepoz Insights</div>
              <div className="text-xs text-sidebar-muted-foreground">Demo Org AGE 2025</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-2 space-y-1">
          {/* Chat Section */}
          <div>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat history</span>
              <ChevronRight className={`ml-auto w-4 h-4 transition-transform ${chatOpen ? 'rotate-90' : ''}`} />
            </button>
            {chatOpen && (
              <div className="ml-6 mt-1 space-y-0.5">
                {loadingConversations ? (
                  <div className="text-xs text-sidebar-muted-foreground px-3 py-2">Loading...</div>
                ) : conversations.length === 0 ? (
                  <div className="text-xs text-sidebar-muted-foreground px-3 py-2">No conversations</div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm group cursor-pointer ${
                        currentView === "chat" && currentConversationId === conversation.id 
                          ? 'bg-sidebar-accent' 
                          : 'hover:bg-sidebar-accent'
                      }`}
                      onClick={() => {
                        setCurrentView("chat");
                        setCurrentConversationId(conversation.id);
                      }}
                    >
                      <Calendar className="w-3 h-3 text-sidebar-muted-foreground flex-shrink-0" />
                      <span className="text-sidebar-foreground truncate">
                        {new Date(conversation.updatedAt || Date.now()).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => handleDeleteChat(conversation.id, e)}
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 flex-shrink-0 rounded cursor-pointer flex items-center justify-center ml-auto"
                      >
                        <Trash2 className="w-2 h-2 text-destructive" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Insights Section */}
          <div>
            <button
              onClick={() => setInsightsOpen(!insightsOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Insights</span>
              <ChevronRight className={`ml-auto w-4 h-4 transition-transform ${insightsOpen ? 'rotate-90' : ''}`} />
            </button>
            {insightsOpen && (
              <div className="ml-6 mt-1 space-y-0.5">
                {insightsItems.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => setCurrentView(item.view)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                      currentView === item.view ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent'
                    }`}
                  >
                    <BarChart3 className="w-3 h-3" />
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin Section */}
          <div>
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
              <ChevronRight className={`ml-auto w-4 h-4 transition-transform ${adminOpen ? 'rotate-90' : ''}`} />
            </button>
            {adminOpen && (
              <div className="ml-6 mt-1 space-y-0.5">
                {adminItems.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => setCurrentView(item.view)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                      currentView === item.view ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent'
                    }`}
                  >
                    {item.view === 'operators' && <Users className="w-3 h-3" />}
                    {item.view === 'products' && <Package className="w-3 h-3" />}
                    {item.view === 'accounts' && <CreditCard className="w-3 h-3" />}
                    {item.view === 'settings' && <Settings className="w-3 h-3" />}
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent">
                <User2 className="w-4 h-4" />
                <span className="truncate">{user?.username || 'User'}</span>
                <ChevronUp className="ml-auto w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
              <DropdownMenuItem>
                <User2 className="w-4 h-4 mr-2" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>{logoutMutation.isPending ? 'Signing out...' : 'Sign out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 h-14 border-b px-4 flex items-center gap-4 bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur">
          <div className="flex-1 min-w-0">
            {currentView === "chat" ? (
              <div>
                <h2 className="text-lg font-semibold">AI Assisted Chat</h2>
                <p className="text-sm text-muted-foreground">Always available and always ready...</p>
              </div>
            ) : (
              <h2 className="text-lg font-semibold">
                {allNavigationItems.find(item => item.view === currentView)?.title}
              </h2>
            )}
          </div>
          <Button 
            onClick={handleNewChat}
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New AI Chat
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4">
          {currentView === "chat" && (
            <div className="h-full">
              <ChatInterface currentConversationId={currentConversationId} />
            </div>
          )}

          {currentView === "sales" && (
            <SalesPage />
          )}

          {currentView === "operators" && (
            <OperatorsTradingView />
          )}

          {currentView === "products" && (
            <div className="h-full flex items-center justify-center">
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
            <div className="h-full flex items-center justify-center">
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
            <div className="h-full">
              <div className="max-w-3xl mx-auto">
                <div className="space-y-8">
                  <div className="text-center">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h1 className="text-3xl font-semibold mb-2">Settings</h1>
                    <p className="text-muted-foreground text-lg">Manage your POS system configuration</p>
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
