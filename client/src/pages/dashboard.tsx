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
import CSVUpload from "@/components/import/csv-upload";
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
    <SidebarProvider className="flex min-h-svh [--header-height:theme(spacing.12)] md:[--header-height:theme(spacing.14)] lg:[--header-height:theme(spacing.16)]">
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="h-svh">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full h-auto p-3">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-sidebar-primary-foreground" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-sm text-sidebar-foreground">Bepoz Insights</div>
                          <div className="text-xs text-sidebar-muted-foreground">Demo Org AGE 2025</div>
                        </div>
                        <ChevronDown className="ml-auto w-4 h-4 text-sidebar-muted-foreground" />
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                    <DropdownMenuItem>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-sidebar-primary rounded flex items-center justify-center">
                          <MessageSquare className="w-3 h-3 text-sidebar-primary-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Bepoz Insights</div>
                          <div className="text-xs text-muted-foreground">Demo Org AGE 2025</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                          <BarChart3 className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Analytics Pro</div>
                          <div className="text-xs text-muted-foreground">Production</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                          <TrendingUp className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Sales Dashboard</div>
                          <div className="text-xs text-muted-foreground">Staging</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent className="p-2">
              <SidebarGroup>
                <SidebarGroupLabel>AI Assistant</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {/* Chat Navigation with Conversations - Collapsible */}
                    <Collapsible defaultOpen={chatOpen} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            onClick={() => setChatOpen(!chatOpen)}
                            className="w-full justify-start px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="ml-2">Chat history</span>
                            <ChevronRight className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {/* Existing Conversations */}
                            {loadingConversations ? (
                              <SidebarMenuSubItem>
                                <div className="text-xs text-sidebar-muted-foreground px-3 py-2">Loading...</div>
                              </SidebarMenuSubItem>
                            ) : conversations.length === 0 ? (
                              <SidebarMenuSubItem>
                                <div className="text-xs text-sidebar-muted-foreground px-3 py-2">No conversations</div>
                              </SidebarMenuSubItem>
                            ) : (
                              conversations.map((conversation) => (
                                <SidebarMenuSubItem key={conversation.id}>
                                  <SidebarMenuSubButton
                                    isActive={currentView === "chat" && currentConversationId === conversation.id}
                                    onClick={() => {
                                      setCurrentView("chat");
                                      setCurrentConversationId(conversation.id);
                                    }}
                                    className="group w-full"
                                  >
                                    <Calendar className="w-3 h-3 text-sidebar-muted-foreground flex-shrink-0" />
                                    <span className="text-sm text-sidebar-foreground truncate">
                                      {new Date(conversation.updatedAt || Date.now()).toLocaleDateString()}
                                    </span>
                                    <div
                                      onClick={(e) => handleDeleteChat(conversation.id, e)}
                                      className="h-4 w-4 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 flex-shrink-0 rounded cursor-pointer flex items-center justify-center ml-auto"
                                    >
                                      <Trash2 className="w-2 h-2 text-destructive" />
                                    </div>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))
                            )}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                    
                    <SidebarGroupLabel className="mt-2">Insights</SidebarGroupLabel>
                    {/* Insights Menu - Collapsible */}
                    <Collapsible defaultOpen={insightsOpen} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            onClick={() => setInsightsOpen(!insightsOpen)}
                            className="w-full justify-start px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
                          >
                            <TrendingUp className="w-4 h-4" />
                            <span className="ml-2">Insights</span>
                            <ChevronRight className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {insightsItems.map((item) => (
                              <SidebarMenuSubItem key={item.view}>
                                <SidebarMenuSubButton
                                  isActive={currentView === item.view}
                                  onClick={() => setCurrentView(item.view)}
                                >
                                  <BarChart3 className="w-3 h-3" />
                                  <span>{item.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                    
                    <SidebarGroupLabel className="mt-2">Admin</SidebarGroupLabel>
                    {/* Admin Menu - Collapsible */}
                    <Collapsible defaultOpen={adminOpen} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            onClick={() => setAdminOpen(!adminOpen)}
                            className="w-full justify-start px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
                          >
                            <Shield className="w-4 h-4" />
                            <span className="ml-2">Admin</span>
                            <ChevronRight className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {adminItems.map((item) => (
                              <SidebarMenuSubItem key={item.view}>
                                <SidebarMenuSubButton
                                  isActive={currentView === item.view}
                                  onClick={() => setCurrentView(item.view)}
                                >
                                  {item.view === 'operators' && <Users className="w-3 h-3" />}
                                  {item.view === 'products' && <Package className="w-3 h-3" />}
                                  {item.view === 'accounts' && <CreditCard className="w-3 h-3" />}
                                  {item.view === 'settings' && <Settings className="w-3 h-3" />}
                                  <span>{item.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton>
                        <User2 className="w-4 h-4" />
                        <span className="truncate">{user?.username || 'User'}</span>
                        <ChevronUp className="ml-auto w-4 h-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      className="w-[--radix-popper-anchor-width]"
                    >
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
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-[--header-height] shrink-0 items-center gap-2 border-b px-3 md:px-4 lg:px-6 bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-[--header-height]">
          <div className="flex items-center gap-2 w-full">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border mr-2" />
            <div className="flex-1 min-w-0">
              <div>
                {currentView === "chat" ? (
                  <div>
                    <h2 className="text-base md:text-lg font-semibold text-foreground truncate">AI Assisted Chat</h2>
                    <p className="text-xs text-muted-foreground truncate hidden md:block">Always available and always ready...</p>
                  </div>
                ) : (
                  <h2 className="text-base md:text-lg font-semibold text-foreground truncate">
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
              className="gap-2 hidden md:flex h-8"
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
              className="md:hidden p-2 h-8 w-8"
              data-testid="button-new-ai-chat-mobile"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}