import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MessageSquare, BarChart3, Settings } from "lucide-react"
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
} from "@/components/ui/sidebar"
import ChatInterface from "@/components/chat/chat-interface"
import CSVUpload from "@/components/import/csv-upload"

// Menu items following official docs pattern
const items = [
  {
    title: "AI Assistant",
    url: "#",
    icon: MessageSquare,
    view: "chat",
  },
  {
    title: "Analytics", 
    url: "#",
    icon: BarChart3,
    view: "analytics",
  },
  {
    title: "Settings",
    url: "#", 
    icon: Settings,
    view: "import",
  },
]

export default function Dashboard() {
  const [currentView, setCurrentView] = useState("chat")

  const { data: todaySummary } = useQuery({
    queryKey: ["/api/summary"],
  })

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-3 px-3 py-4">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-md">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-sidebar-foreground text-lg tracking-tight">Alex</span>
              <p className="text-xs text-sidebar-foreground/70 font-medium">AI Assistant</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      isActive={currentView === item.view}
                      onClick={() => setCurrentView(item.view)}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary-foreground">SM</span>
                  </div>
                  <div className="group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium text-sidebar-foreground">Store Manager</span>
                    <p className="text-xs text-sidebar-foreground/70">admin@store.com</p>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                {currentView === "chat" && "AI Assistant"}
                {currentView === "import" && "Settings"} 
                {currentView === "analytics" && "Analytics"}
              </h1>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground">
                {currentView === "chat" && "Chat with Alex for business insights"}
                {currentView === "import" && "Configure your data sources"}
                {currentView === "analytics" && "Explore your business data"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-accent-foreground">Online</span>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-semibold text-primary-foreground">SM</span>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            {currentView === "chat" && (
              <div className="h-full">
                <ChatInterface />
              </div>
            )}
            
            {currentView === "import" && (
              <div className="h-full overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-3xl font-semibold text-foreground mb-4 tracking-tight">Data Settings</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">Configure your data sources and import CSV files to unlock powerful AI-driven business insights.</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <CSVUpload />
                  </div>
                </div>
              </div>
            )}
            
            {currentView === "analytics" && (
              <div className="h-full overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                      <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground mb-4">Analytics Dashboard</h3>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">Use the AI Assistant to explore your data and generate comprehensive business insights.</p>
                    <button 
                      onClick={() => setCurrentView("chat")}
                      className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Start AI Analysis
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}