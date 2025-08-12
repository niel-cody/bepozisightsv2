import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  MessageSquare, 
  BarChart3, 
  Users, 
  Package, 
  CreditCard, 
  Settings,
  Plus,
  Search,
  Menu
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

type ViewType = "chat" | "sales" | "operators" | "products" | "accounts" | "settings";

const navigationItems = [
  { 
    title: "Chat", 
    icon: MessageSquare, 
    view: "chat" as ViewType,
    description: "AI Assistant" 
  },
  { 
    title: "Sales", 
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
  { 
    title: "Settings", 
    icon: Settings, 
    view: "settings" as ViewType,
    description: "Configuration" 
  },
];

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<ViewType>("chat");

  return (
    <div className="h-screen w-screen bg-background overflow-hidden">
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-full w-full">
          {/* Left Sidebar */}
          <Sidebar className="w-64 h-full border-r border-border/30 bg-sidebar-background flex-shrink-0">
            <SidebarHeader className="p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-sidebar-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-semibold text-sm text-sidebar-foreground">POS Intelligence</h1>
                  <p className="text-xs text-sidebar-muted-foreground">AI Assistant</p>
                </div>
              </div>
              <Button 
                className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground border-0" 
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </SidebarHeader>

            <SidebarContent className="p-2">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.view}>
                        <SidebarMenuButton
                          isActive={currentView === item.view}
                          onClick={() => setCurrentView(item.view)}
                          className="w-full justify-start p-3 rounded-lg hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent text-sidebar-foreground"
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium">{item.title}</div>
                            <div className="text-xs text-sidebar-muted-foreground">{item.description}</div>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-sidebar-accent-foreground">SM</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-sidebar-foreground">Store Manager</div>
                  <div className="text-xs text-sidebar-muted-foreground">admin@store.com</div>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <SidebarInset className="flex-1 h-full min-w-0">
            <div className="flex h-full flex-col">
              {/* Header */}
              <header className="flex h-14 items-center gap-4 border-b border-border/30 px-4 bg-background/95 backdrop-blur flex-shrink-0">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground">
                    {navigationItems.find(item => item.view === currentView)?.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground font-medium">Online</span>
                </div>
              </header>

              {/* Main Content Area */}
              <main className="flex-1 overflow-auto min-h-0">
                {currentView === "chat" && (
                  <div className="h-full">
                    <ChatInterface />
                  </div>
                )}

                {currentView === "sales" && (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">Sales Reports</h3>
                      <p className="text-muted-foreground mb-4">View detailed sales analytics and performance metrics</p>
                      <Button onClick={() => setCurrentView("chat")}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask AI for Sales Insights
                      </Button>
                    </div>
                  </div>
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
                              <Input value="Alex" className="mt-1" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Response Style</label>
                              <Input value="Professional" className="mt-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}